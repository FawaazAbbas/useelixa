import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code_file_url, entry_function, requirements, message, user_id, context, agent_id } = await req.json();

    if (!code_file_url) {
      throw new Error("code_file_url is required");
    }

    const executorUrl = Deno.env.get("PYTHON_EXECUTOR_URL");
    if (!executorUrl) {
      throw new Error("PYTHON_EXECUTOR_URL is not configured. Please set up a Python execution service.");
    }

    const executorApiKey = Deno.env.get("PYTHON_EXECUTOR_API_KEY") || "";

    // Download the developer's code from storage
    const codeResponse = await fetch(code_file_url);
    if (!codeResponse.ok) {
      throw new Error(`Failed to download code file: ${codeResponse.status}`);
    }
    const developerCode = await codeResponse.text();

    // Build the input JSON for the developer's function
    const inputPayload = JSON.stringify({
      message: message || "",
      user_id: user_id || "",
      context: context || {},
    });

    // Escape single quotes in the input for safe embedding in Python string
    const escapedInput = inputPayload.replace(/'/g, "\\'");

    // Build the runner wrapper that calls the developer's entry function
    const entryFn = entry_function || "handle";
    const wrappedCode = `${developerCode}

# --- Platform Runner ---
import json as _json
_input = _json.loads('${escapedInput}')
_result = ${entryFn}(_input)
if isinstance(_result, dict):
    print(_json.dumps(_result))
elif isinstance(_result, str):
    print(_json.dumps({"response": _result, "tools_used": []}))
else:
    print(_json.dumps({"response": str(_result), "tools_used": []}))
`;

    // Send to the execution service
    // This supports Piston API format, but is flexible for other runners
    const executionHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (executorApiKey) {
      executionHeaders["Authorization"] = `Bearer ${executorApiKey}`;
    }

    const executionPayload = {
      language: "python3",
      version: "3.10",
      files: [{ name: "main.py", content: wrappedCode }],
      args: [],
      stdin: "",
      compile_timeout: 10000,
      run_timeout: 30000,
      compile_memory_limit: -1,
      run_memory_limit: -1,
    };

    // If requirements are specified, prepend a pip install step
    if (requirements && requirements.trim()) {
      const pipInstallCode = requirements
        .trim()
        .split("\n")
        .filter((line: string) => line.trim() && !line.trim().startsWith("#"))
        .map((pkg: string) => pkg.trim())
        .join(" ");

      if (pipInstallCode) {
        // For Piston-compatible APIs, we add a setup script
        executionPayload.files.unshift({
          name: "setup.py",
          content: `import subprocess; subprocess.check_call(["pip", "install", ${pipInstallCode.split(" ").map((p: string) => `"${p}"`).join(", ")}])`,
        });
      }
    }

    const execResponse = await fetch(`${executorUrl}/api/v2/execute`, {
      method: "POST",
      headers: executionHeaders,
      body: JSON.stringify(executionPayload),
    });

    if (!execResponse.ok) {
      const errorText = await execResponse.text();
      // Update execution status in DB
      if (agent_id) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await supabase
          .from("agent_submissions")
          .update({ execution_status: "error", execution_error: `Execution service error: ${execResponse.status} - ${errorText}` })
          .eq("id", agent_id);
      }
      throw new Error(`Execution service returned ${execResponse.status}: ${errorText}`);
    }

    const execResult = await execResponse.json();

    // Piston returns { run: { stdout, stderr, code, signal, output } }
    const stdout = execResult.run?.stdout || execResult.stdout || "";
    const stderr = execResult.run?.stderr || execResult.stderr || "";
    const exitCode = execResult.run?.code ?? execResult.code ?? 0;

    if (exitCode !== 0 || (!stdout.trim() && stderr.trim())) {
      if (agent_id) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await supabase
          .from("agent_submissions")
          .update({ execution_status: "error", execution_error: stderr || `Exit code: ${exitCode}` })
          .eq("id", agent_id);
      }
      throw new Error(`Python execution failed: ${stderr || `Exit code: ${exitCode}`}`);
    }

    // Parse the last line of stdout as JSON (the developer's response)
    const outputLines = stdout.trim().split("\n");
    const lastLine = outputLines[outputLines.length - 1];

    let responseData: { response: string; tools_used?: string[] };
    try {
      responseData = JSON.parse(lastLine);
    } catch {
      // If output isn't JSON, treat the entire stdout as the response
      responseData = { response: stdout.trim(), tools_used: [] };
    }

    // Update status to ready on success
    if (agent_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase
        .from("agent_submissions")
        .update({ execution_status: "ready", execution_error: null })
        .eq("id", agent_id);
    }

    return new Response(JSON.stringify(responseData), {
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
