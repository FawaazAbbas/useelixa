import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function categorizedError(error_type: string, error_details: string, user_message: string) {
  return { error: user_message, error_type, error_details };
}

function stripImportsExports(code: string): { cleaned: string; hadImports: boolean } {
  let hadImports = false;
  // Strip import statements
  let cleaned = code.replace(/^\s*import\s+.*?from\s+['"].*?['"];?\s*$/gm, (m) => {
    hadImports = true;
    return `// [stripped] ${m.trim()}`;
  });
  cleaned = cleaned.replace(/^\s*import\s+['"].*?['"];?\s*$/gm, (m) => {
    hadImports = true;
    return `// [stripped] ${m.trim()}`;
  });
  // Strip export keywords but keep the declarations
  cleaned = cleaned.replace(/^\s*export\s+(default\s+)?/gm, (m) => {
    hadImports = true;
    return "";
  });
  return { cleaned, hadImports };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentication required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { agent_id, message } = await req.json();
    if (!agent_id) {
      throw new Error("agent_id is required");
    }

    const { data: agent, error: agentError } = await supabase
      .from("agent_submissions")
      .select("*, developer_profiles!inner(user_id)")
      .eq("id", agent_id)
      .single();

    if (agentError || !agent) {
      throw new Error("Agent not found");
    }

    const runtime = agent.runtime || "python";

    // --- TypeScript agents: execute directly in Deno ---
    if (runtime === "typescript") {
      if (!agent.code_file_url) {
        return new Response(JSON.stringify(categorizedError(
          "missing_code", "No code_file_url set on agent record",
          "No code file uploaded for this agent. Please upload a .ts or .zip file."
        )), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Download the code file
      let codeResponse: Response;
      try {
        codeResponse = await fetch(agent.code_file_url);
      } catch (e) {
        return new Response(JSON.stringify(categorizedError(
          "download_error", `Fetch error: ${e instanceof Error ? e.message : String(e)}`,
          "Could not download your code file. Please re-upload."
        )), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (!codeResponse.ok) {
        return new Response(JSON.stringify(categorizedError(
          "download_error", `HTTP ${codeResponse.status} from storage`,
          `Could not download your code file (HTTP ${codeResponse.status}). Please re-upload.`
        )), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      let code: string;
      const isZip = agent.code_file_url.toLowerCase().endsWith(".zip");

      if (isZip) {
        try {
          const zipBuffer = await codeResponse.arrayBuffer();
          const zip = await JSZip.loadAsync(zipBuffer);

          const entryFnName = agent.entry_function || "handle";
          const candidates = [
            "index.ts", "index.js", "main.ts", "main.js",
            `${entryFnName}.ts`, `${entryFnName}.js`,
          ];

          let entryFile: JSZip.JSZipObject | null = null;

          for (const name of candidates) {
            const f = zip.file(name);
            if (f) { entryFile = f; break; }
          }

          if (!entryFile) {
            zip.forEach((relativePath, file) => {
              if (entryFile) return;
              const fileName = relativePath.split("/").pop() || "";
              if (candidates.includes(fileName)) {
                entryFile = file;
              }
            });
          }

          if (!entryFile) {
            zip.forEach((relativePath, file) => {
              if (entryFile) return;
              if (/\.(ts|js)$/.test(relativePath) && !file.dir) {
                entryFile = file;
              }
            });
          }

          if (!entryFile) {
            return new Response(JSON.stringify(categorizedError(
              "zip_error", "No .ts or .js file found in archive",
              "No TypeScript/JavaScript file found in your ZIP. Include an index.ts or main.ts."
            )), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }

          code = await entryFile.async("string");
        } catch (e) {
          if ((e as any)?.error_type) throw e;
          return new Response(JSON.stringify(categorizedError(
            "zip_error", `ZIP parsing failed: ${e instanceof Error ? e.message : String(e)}`,
            "Failed to extract your ZIP file. Make sure it's a valid ZIP archive."
          )), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } else {
        code = await codeResponse.text();
      }

      // Strip imports/exports
      const { cleaned, hadImports } = stripImportsExports(code);
      const warnings: string[] = [];
      if (hadImports) {
        warnings.push("Import/export statements were stripped. Your agent should be self-contained or use only Deno globals.");
      }

      const entryFn = agent.entry_function || "handle";

      // Construct the async function
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const wrappedCode = `
        ${cleaned}
        ;
        if (typeof ${entryFn} === "function") {
          return await ${entryFn}(__input__);
        } else {
          throw new Error('__MISSING_ENTRY__');
        }
      `;

      const input = {
        message: message || "",
        user_id: user.id,
        context: {},
      };

      let fn: any;
      try {
        fn = new AsyncFunction("__input__", wrappedCode);
      } catch (e) {
        return new Response(JSON.stringify(categorizedError(
          "syntax_error", `${e instanceof Error ? e.message : String(e)}`,
          `Your code has a syntax error: ${e instanceof Error ? e.message : String(e)}`
        )), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Execute with timeout
      let result: any;
      try {
        const timeoutMs = 10000;
        result = await Promise.race([
          fn(input),
          new Promise((_, reject) => setTimeout(() => reject(new Error("__TIMEOUT__")), timeoutMs)),
        ]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "__TIMEOUT__") {
          return new Response(JSON.stringify(categorizedError(
            "timeout", "Execution exceeded 10s",
            "Your agent took too long to respond (>10s). Optimize your code or reduce processing."
          )), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (msg === "__MISSING_ENTRY__") {
          return new Response(JSON.stringify(categorizedError(
            "missing_entry", `Function '${entryFn}' not found after code execution`,
            `Entry function '${entryFn}' not found in your code. Make sure you define a function called '${entryFn}'.`
          )), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify(categorizedError(
          "runtime_error", msg,
          `Your agent threw an error: ${msg}`
        )), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Normalize response
      let responseData: { response: string; tools_used?: string[]; warnings?: string[] };
      if (typeof result === "string") {
        responseData = { response: result, tools_used: [], warnings };
      } else if (result && typeof result === "object") {
        responseData = {
          response: result.response ?? JSON.stringify(result),
          tools_used: result.tools_used ?? [],
          warnings,
        };
      } else {
        responseData = { response: String(result), tools_used: [], warnings };
      }

      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Python agents: proxy to execute-python-agent ---
    const execResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/execute-python-agent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          code_file_url: agent.code_file_url,
          entry_function: agent.entry_function || "handle",
          requirements: agent.requirements,
          message: message || "",
          user_id: user.id,
          context: {},
          agent_id: agent.id,
        }),
      }
    );

    const result = await execResponse.json();

    if (!execResponse.ok) {
      return new Response(JSON.stringify({ error: result.error || "Execution failed", error_type: "runtime_error", error_details: result.error || "Python execution failed" }), {
        status: execResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage, error_type: "unknown", error_details: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
