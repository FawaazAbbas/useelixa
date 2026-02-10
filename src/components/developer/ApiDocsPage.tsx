import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Cloud, Server, BookOpen, Code, Terminal } from "lucide-react";

const CodeBlock = ({ code, language = "python" }: { code: string; language?: string }) => (
  <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre">{code}</pre>
);

export const ApiDocsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Getting Started */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Getting Started</CardTitle>
          </div>
          <CardDescription>
            Build and deploy custom AI agents on Elixa. Choose between two hosting models based on your needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Platform-Hosted</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Upload your Python code and we run it in a secure sandbox. No infrastructure to manage.
              </CardContent>
            </Card>
            <Card className="border-2">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">Self-Hosted</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Run your agent on your own infrastructure. We call your HTTP endpoint when users invoke your agent.
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Platform-Hosted */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            <CardTitle>Platform-Hosted Agents</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Function Signature</h4>
            <CodeBlock code={`def handle(input: dict) -> dict:
    """
    Entry point for your agent.
    
    Args:
        input: {
            "message": str,       # User's message
            "user_id": str,       # ID of the user invoking the agent
            "context": dict       # Additional context (empty by default)
        }
    
    Returns:
        {
            "response": str,      # Your agent's response text
            "tools_used": list    # Optional: list of tool names used
        }
    """
    message = input["message"]
    return {"response": f"You said: {message}"}`} />
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">Requirements File</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Specify pip dependencies in the requirements field (one per line, like a requirements.txt):
            </p>
            <CodeBlock code={`requests==2.31.0
beautifulsoup4>=4.12
openai`} />
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">Full Example</h4>
            <CodeBlock code={`import json

def handle(input: dict) -> dict:
    message = input.get("message", "")
    user_id = input.get("user_id", "")
    
    # Your agent logic here
    if "weather" in message.lower():
        response = "I'd check the weather API for you!"
        tools = ["weather_api"]
    else:
        response = f"Hello! You said: {message}"
        tools = []
    
    return {
        "response": response,
        "tools_used": tools
    }`} />
          </div>
        </CardContent>
      </Card>

      {/* Self-Hosted */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            <CardTitle>Self-Hosted Agents</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">API Contract</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Your endpoint must accept <Badge variant="secondary" className="text-xs">POST</Badge> requests with this JSON body:
            </p>
            <CodeBlock language="json" code={`// Request (POST to your endpoint)
{
    "message": "User's message text",
    "user_id": "uuid-of-the-user",
    "context": {}
}

// Expected Response (200 OK)
{
    "response": "Your agent's reply",
    "tools_used": ["optional", "tool", "names"]
}`} />
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">Flask Example</h4>
            <CodeBlock code={`from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/agent", methods=["POST"])
def agent():
    data = request.json
    message = data.get("message", "")
    
    return jsonify({
        "response": f"Received: {message}",
        "tools_used": []
    })

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=8080)`} />
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">FastAPI Example</h4>
            <CodeBlock code={`from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class AgentRequest(BaseModel):
    message: str
    user_id: str
    context: dict = {}

class AgentResponse(BaseModel):
    response: str
    tools_used: list[str] = []

@app.post("/agent")
async def agent(req: AgentRequest) -> AgentResponse:
    return AgentResponse(
        response=f"Received: {req.message}",
        tools_used=[]
    )

@app.get("/health")
async def health():
    return {"status": "ok"}`} />
          </div>

          <Separator />

          <div>
            <h4 className="font-semibold text-sm mb-2">Authentication</h4>
            <p className="text-sm text-muted-foreground">
              When submitting your agent, you can specify an authentication header and token. 
              We'll include this header in every request to your endpoint. Common patterns:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li><code className="text-xs bg-muted px-1 rounded">Authorization: Bearer your-secret-token</code></li>
              <li><code className="text-xs bg-muted px-1 rounded">X-API-Key: your-api-key</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Testing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>Testing Your Agent</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Before submitting, test your agent locally to make sure it handles requests correctly:
          </p>
          <CodeBlock language="bash" code={`# Test with curl
curl -X POST http://localhost:8080/agent \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello!", "user_id": "test-user", "context": {}}'

# Expected response:
# {"response": "...", "tools_used": [...]}`} />
          <p className="text-sm text-muted-foreground">
            Ensure your endpoint always returns a JSON object with at least a <code className="text-xs bg-muted px-1 rounded">response</code> field 
            containing a string. The <code className="text-xs bg-muted px-1 rounded">tools_used</code> field is optional.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
