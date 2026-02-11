import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import JSZip from "https://esm.sh/jszip@3.10.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Fetch agent with runtime info
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
        throw new Error("No code file uploaded for this agent");
      }

      // Download the code file
      const codeResponse = await fetch(agent.code_file_url);
      if (!codeResponse.ok) {
        throw new Error(`Failed to download code file: ${codeResponse.status}`);
      }

      let code: string;
      const isZip = agent.code_file_url.toLowerCase().endsWith(".zip");

      if (isZip) {
        // Extract code from ZIP archive
        const zipBuffer = await codeResponse.arrayBuffer();
        const zip = await JSZip.loadAsync(zipBuffer);

        const entryFnName = agent.entry_function || "handle";
        // Look for common entry files
        const candidates = [
          "index.ts", "index.js", "main.ts", "main.js",
          `${entryFnName}.ts`, `${entryFnName}.js`,
        ];

        let entryFile: JSZip.JSZipObject | null = null;

        // First try exact matches at root level
        for (const name of candidates) {
          const f = zip.file(name);
          if (f) { entryFile = f; break; }
        }

        // If not found, search recursively for any .ts/.js file matching candidates
        if (!entryFile) {
          zip.forEach((relativePath, file) => {
            if (entryFile) return;
            const fileName = relativePath.split("/").pop() || "";
            if (candidates.includes(fileName)) {
              entryFile = file;
            }
          });
        }

        // Last resort: first .ts or .js file found
        if (!entryFile) {
          zip.forEach((relativePath, file) => {
            if (entryFile) return;
            if (/\.(ts|js)$/.test(relativePath) && !file.dir) {
              entryFile = file;
            }
          });
        }

        if (!entryFile) {
          throw new Error("No TypeScript/JavaScript entry file found in ZIP archive");
        }

        code = await entryFile.async("string");
      } else {
        code = await codeResponse.text();
      }

      const entryFn = agent.entry_function || "handle";

      // Execute via AsyncFunction to run the agent code in-process
      // Wrap the code so we can extract the entry function
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const wrappedCode = `
        ${code}
        ;
        if (typeof ${entryFn} === "function") {
          return await ${entryFn}(__input__);
        } else {
          throw new Error('Entry function "${entryFn}" not found in agent code.');
        }
      `;

      const input = {
        message: message || "",
        user_id: user.id,
        context: {},
      };

      const fn = new AsyncFunction("__input__", wrappedCode);
      const result = await fn(input);

      // Normalize response
      let responseData: { response: string; tools_used?: string[] };
      if (typeof result === "string") {
        responseData = { response: result, tools_used: [] };
      } else if (result && typeof result === "object") {
        responseData = {
          response: result.response ?? JSON.stringify(result),
          tools_used: result.tools_used ?? [],
        };
      } else {
        responseData = { response: String(result), tools_used: [] };
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
      return new Response(JSON.stringify({ error: result.error || "Execution failed" }), {
        status: execResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
