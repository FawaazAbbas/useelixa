import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, CheckCircle, XCircle, Zap, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AgentSelector } from "./AgentSelector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Agent {
  id: string;
  name: string;
  description: string | null;
  capabilities: string[] | null;
}

interface SuggestedAutomation {
  name: string;
  description: string;
  instruction: string;
  trigger: string;
  agentId: string;
  agentName: string;
  assignmentReason: string;
}

interface TaskSummary {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  due_date?: string;
  is_asap: boolean;
  automations: SuggestedAutomation[];
}

interface BrianChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: () => void;
}

export const BrianChatDialog = ({ open, onOpenChange, onTaskCreated }: BrianChatDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState<"chat" | "summary">("chat");
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null);
  const [creating, setCreating] = useState(false);
  const [changingAgentIndex, setChangingAgentIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (messages.length === 0) {
        setMessages([{
          role: "assistant",
          content: "Hi! I'm Brian, your AI task assistant. Let's create a task together. What would you like to accomplish?"
        }]);
      }
      fetchAgents();
    }
  }, [open]);

  const fetchAgents = async () => {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name, description, capabilities")
      .eq("status", "active")
      .order("name");

    if (error) {
      console.error("Error fetching agents:", error);
      return;
    }

    setAgents(data || []);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("brian-task-assistant", {
        body: {
          messages: [...messages, { role: "user", content: userMessage }],
          phase,
          agents: agents.map(a => ({
            id: a.id,
            name: a.name,
            description: a.description,
            capabilities: a.capabilities
          }))
        }
      });

      if (error) throw error;

      if (data.summary) {
        setTaskSummary(data.summary);
        setPhase("summary");
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Perfect! Here's a summary of your task. Review and confirm when ready."
        }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      console.error("Error communicating with Brian:", error);
      toast({
        title: "Error",
        description: "Failed to communicate with Brian. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskSummary || !user) return;

    setCreating(true);
    try {
      const { data: task, error: taskError } = await supabase
        .from("tasks")
        .insert({
          title: taskSummary.title,
          description: taskSummary.description,
          priority: taskSummary.priority,
          due_date: taskSummary.due_date || null,
          is_asap: taskSummary.is_asap,
          user_id: user.id,
          status: "pending"
        })
        .select()
        .single();

      if (taskError) throw taskError;

      if (taskSummary.automations.length > 0) {
        const automationsToInsert = taskSummary.automations.map(auto => ({
          name: auto.name,
          action: auto.instruction,
          trigger: auto.trigger,
          task_id: task.id,
          workspace_id: user.id,
          created_by: user.id,
          agent_id: auto.agentId,
          status: "active"
        }));

        const { error: autoError } = await supabase
          .from("automations")
          .insert(automationsToInsert);

        if (autoError) throw autoError;
      }

      toast({
        title: "Success",
        description: "Task created successfully with automations!"
      });

      onTaskCreated();
      onOpenChange(false);
      
      setMessages([]);
      setPhase("chat");
      setTaskSummary(null);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleAutomation = (index: number) => {
    if (!taskSummary) return;
    setTaskSummary({
      ...taskSummary,
      automations: taskSummary.automations.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[600px] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <DialogTitle>Brian - AI Task Assistant</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {phase === "summary" && taskSummary && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{taskSummary.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{taskSummary.description}</p>
                  </div>

                  <div className="flex gap-2">
                    <Badge variant="outline">{taskSummary.priority} priority</Badge>
                    {taskSummary.is_asap && (
                      <Badge variant="destructive" className="gap-1">
                        <Zap className="h-3 w-3" />
                        ASAP
                      </Badge>
                    )}
                    {taskSummary.due_date && (
                      <Badge variant="secondary">
                        Due: {new Date(taskSummary.due_date).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  {taskSummary.automations.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Suggested Automations:</h4>
                      {taskSummary.automations.map((auto, idx) => (
                        <div
                          key={idx}
                          className="space-y-2 p-3 rounded-lg bg-accent/50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{auto.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">{auto.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">Trigger: {auto.trigger}</p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => toggleAutomation(idx)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2 pt-2 border-t">
                            <div className="flex items-center gap-2">
                              <Bot className="h-4 w-4 text-primary" />
                              <span className="text-xs font-medium">{auto.agentName}</span>
                              {auto.assignmentReason && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Info className="h-3 w-3" />
                                  <span className="italic">{auto.assignmentReason}</span>
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setChangingAgentIndex(idx)}
                              className="text-xs h-7"
                            >
                              Change
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleCreateTask}
                      disabled={creating}
                      className="flex-1"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Create Task
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPhase("chat");
                        setTaskSummary(null);
                        setMessages(prev => [...prev, {
                          role: "assistant",
                          content: "No problem! Let's make some changes. What would you like to adjust?"
                        }]);
                      }}
                    >
                      Modify
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {phase === "chat" && (
          <div className="flex gap-2 pt-4 border-t">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        <AlertDialog open={changingAgentIndex !== null} onOpenChange={() => setChangingAgentIndex(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Change Agent Assignment</AlertDialogTitle>
              <AlertDialogDescription>
                Select a different agent to handle this automation
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {changingAgentIndex !== null && taskSummary && (
              <AgentSelector
                agents={agents}
                selectedAgentId={taskSummary.automations[changingAgentIndex].agentId}
                onSelect={(agentId) => {
                  const selectedAgent = agents.find(a => a.id === agentId);
                  if (selectedAgent) {
                    const updatedAutomations = [...taskSummary.automations];
                    updatedAutomations[changingAgentIndex] = {
                      ...updatedAutomations[changingAgentIndex],
                      agentId: selectedAgent.id,
                      agentName: selectedAgent.name,
                      assignmentReason: "Manually selected by user"
                    };
                    setTaskSummary({
                      ...taskSummary,
                      automations: updatedAutomations
                    });
                  }
                }}
                label="Select New Agent"
              />
            )}
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setChangingAgentIndex(null)}>
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};
