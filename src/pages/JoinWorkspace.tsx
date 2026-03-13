import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LogIn, Plus, Copy, Check } from "lucide-react";
import { ElixaMascot } from "@/components/ElixaMascot";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const JoinWorkspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Check if user already has a workspace
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .limit(1);
      if (data && data.length > 0) {
        navigate("/chat");
      }
    };
    check();
  }, [user, navigate]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setLoading(true);

    const { data, error } = await supabase.rpc("join_workspace_by_code", {
      p_code: joinCode.trim().toLowerCase(),
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not join workspace",
        description: error.message.includes("Invalid") 
          ? "That code doesn't match any workspace. Check the code and try again."
          : error.message,
      });
    } else {
      toast({ title: "Welcome!", description: "You've joined the workspace." });
      navigate("/chat");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    setLoading(true);

    const { data, error } = await supabase.rpc("create_workspace_with_code", {
      p_name: workspaceName.trim(),
      p_description: workspaceDescription.trim(),
    });

    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Could not create workspace",
        description: error.message,
      });
    } else {
      const result = typeof data === "string" ? JSON.parse(data) : data;
      setCreatedCode(result.join_code);
      toast({ title: "Workspace created!" });
    }
  };

  const handleCopyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show the created code screen
  if (createdCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="space-y-4 pt-8 text-center">
            <ElixaMascot pose="celebrating" size="xl" animation="bounce" />
            <CardTitle>Workspace Created!</CardTitle>
            <CardDescription>
              Share this code with your team so they can join your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-2 p-4 rounded-lg bg-muted border-2 border-dashed border-primary/30">
              <code className="flex-1 text-center text-2xl font-mono font-bold tracking-wider text-primary">
                {createdCode}
              </code>
              <Button variant="ghost" size="icon" onClick={handleCopyCode}>
                {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
              </Button>
            </div>
            <Button className="w-full" onClick={() => navigate("/chat")}>
              Go to Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="space-y-4 pt-8">
          <div className="flex justify-center">
            <ElixaMascot pose="waving" size="xl" animation="wave" />
          </div>
          <CardTitle className="text-center">Join a Workspace</CardTitle>
          <CardDescription className="text-center text-base">
            Enter a workspace code to join your team, or create a new workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="join" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="join">
                <LogIn className="h-4 w-4 mr-2" />
                Join
              </TabsTrigger>
              <TabsTrigger value="create">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </TabsTrigger>
            </TabsList>

            <TabsContent value="join">
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="join-code">Workspace Code</Label>
                  <Input
                    id="join-code"
                    type="text"
                    placeholder="e.g. brave-falcon-42"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    required
                    className="font-mono text-center text-lg tracking-wider"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Ask your team admin for the workspace code
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading || !joinCode.trim()}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Join Workspace
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="create">
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ws-name">Workspace Name</Label>
                  <Input
                    id="ws-name"
                    type="text"
                    placeholder="My Team"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    required
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ws-desc">
                    Description <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="ws-desc"
                    type="text"
                    placeholder="What does this team work on?"
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                    maxLength={300}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !workspaceName.trim()}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Workspace
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinWorkspace;
