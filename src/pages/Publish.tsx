import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Sparkles, Loader2, AlertCircle, CheckCircle2, XCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthDialog } from "@/components/AuthDialog";
import { z } from "zod";

const agentSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(100, "Name must be less than 100 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(200, "Description must be less than 200 characters"),
  long_description: z.string().trim().min(50, "Full description must be at least 50 characters").max(2000, "Full description must be less than 2000 characters"),
  category_id: z.string().uuid("Please select a category"),
  price: z.number().min(0, "Price must be 0 or greater").max(999, "Price must be less than 1000"),
  capabilities: z.string().trim().min(10, "Please list at least one capability")
});

const Publish = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [workflowJson, setWorkflowJson] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    long_description: "",
    category_id: "",
    price: "0",
    capabilities: "",
    ai_personality: "",
    ai_instructions: ""
  });
  const [guardRails, setGuardRails] = useState({
    content_filter: true,
    max_tokens: 2000,
    allowed_topics: [] as string[],
    blocked_topics: [] as string[],
    tone: "professional",
    refuse_harmful_requests: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Don't redirect, just show auth dialog if not logged in
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("agent_categories")
        .select("id, name")
        .order("name");

      if (data) {
        setCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Image must be less than 5MB"
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an image file"
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleWorkflowChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Workflow JSON must be less than 5MB"
      });
      return;
    }

    if (!file.name.endsWith('.json')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a JSON file"
      });
      return;
    }

    setWorkflowFile(file);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const json = JSON.parse(reader.result as string);
        setWorkflowJson(json);
        
        // Validate workflow immediately
        setValidating(true);
        const { data, error } = await supabase.functions.invoke('process-workflow', {
          body: {
            workflowJson: json,
            agentId: 'validation-only' // Special ID for validation-only mode
          }
        });

        setValidating(false);

        if (error || !data?.success) {
          setValidationResult(data?.validation || null);
          toast({
            variant: "destructive",
            title: "Workflow validation failed",
            description: data?.validation?.errors?.[0]?.message || "Your workflow has issues that need to be fixed"
          });
        } else {
          setValidationResult(data.validation);
          
          toast({
            title: data.validation.canPublish ? "Workflow validated successfully" : "Validation warnings",
            description: data.validation.canPublish 
              ? `Your workflow is ready to publish!`
              : `${data.validation.errors.length} issues need to be fixed before publishing`,
            variant: data.validation.canPublish ? "default" : "destructive"
          });
        }
      } catch (error) {
        setValidating(false);
        toast({
          variant: "destructive",
          title: "Invalid JSON",
          description: "The file does not contain valid JSON"
        });
        setWorkflowFile(null);
        setValidationResult(null);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const validatedData = agentSchema.parse({
        ...formData,
        price: parseFloat(formData.price)
      });

      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("agent-images")
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("agent-images")
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      const capabilitiesArray = validatedData.capabilities
        .split("\n")
        .map(cap => cap.trim())
        .filter(cap => cap.length > 0);

      const { data: insertedAgent, error: insertError } = await supabase
        .from("agents")
        .insert({
          name: validatedData.name,
          description: validatedData.description,
          long_description: validatedData.long_description,
          category_id: validatedData.category_id,
          price: validatedData.price,
          capabilities: capabilitiesArray,
          image_url: imageUrl,
          publisher_id: user.id,
          status: "active",
          ai_personality: formData.ai_personality || null,
          ai_instructions: formData.ai_instructions || null,
          guard_rails: guardRails
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // If workflow JSON is provided, process it (skip if validation-only already ran)
      if (workflowJson && insertedAgent) {
        // Re-run processing to save to database with actual agent ID
        const { error: workflowError } = await supabase.functions.invoke('process-workflow', {
          body: {
            workflowJson,
            agentId: insertedAgent.id
          }
        });

        if (workflowError) {
          console.error('Workflow processing error:', workflowError);
          toast({
            variant: "destructive",
            title: "Warning",
            description: "Agent published but workflow processing failed. You can update it later."
          });
        } else {
          toast({
            title: "Success!",
            description: `Your agent has been published successfully!`
          });
        }
      } else {
        toast({
          title: "Success!",
          description: "Your agent has been published successfully."
        });
      }

      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to publish agent. Please try again."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Publish Your AI Agent</h1>
          <p className="text-xl text-muted-foreground">
            Share your creation with thousands of users worldwide
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base">Agent Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Customer Support Pro"
                  className="mt-2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-base">Short Description *</Label>
                <Input
                  id="description"
                  placeholder="Brief one-line description"
                  className="mt-2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="long_description" className="text-base">Full Description *</Label>
                <Textarea
                  id="long_description"
                  placeholder="Describe what your agent does and how it helps users..."
                  className="mt-2 min-h-32"
                  value={formData.long_description}
                  onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
                />
                {errors.long_description && <p className="text-sm text-destructive mt-1">{errors.long_description}</p>}
              </div>

              <div>
                <Label htmlFor="category_id" className="text-base">Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category_id && <p className="text-sm text-destructive mt-1">{errors.category_id}</p>}
              </div>

              <div>
                <Label htmlFor="price" className="text-base">Price (USD/month) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="49"
                  className="mt-2"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="capabilities" className="text-base">Key Features *</Label>
                <Textarea
                  id="capabilities"
                  placeholder="Enter one feature per line"
                  className="mt-2 min-h-24"
                  value={formData.capabilities}
                  onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
                />
                {errors.capabilities && <p className="text-sm text-destructive mt-1">{errors.capabilities}</p>}
                <p className="text-xs text-muted-foreground mt-1">Enter one feature per line</p>
              </div>
            </div>

            {/* AI Personality Section */}
            <div className="space-y-4 p-6 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Personality & Behavior
              </h3>
              
              <div>
                <Label htmlFor="ai_personality">Personality Type</Label>
                <Input 
                  id="ai_personality"
                  placeholder="e.g., Professional assistant, Creative helper, Technical expert"
                  className="mt-2"
                  value={formData.ai_personality}
                  onChange={(e) => setFormData({...formData, ai_personality: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Define the personality type for your agent
                </p>
              </div>
              
              <div>
                <Label htmlFor="ai_instructions">Behavioral Instructions</Label>
                <Textarea 
                  id="ai_instructions"
                  placeholder="Describe how your agent should behave, respond to users, and handle different scenarios. This will guide the AI wrapper."
                  className="mt-2 min-h-32"
                  value={formData.ai_instructions}
                  onChange={(e) => setFormData({...formData, ai_instructions: e.target.value})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  These instructions will be injected into the system prompt to control agent behavior
                </p>
              </div>
            </div>

            {/* Guard Rails Section */}
            <div className="space-y-4 p-6 border rounded-lg bg-muted/30">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Safety & Guard Rails
              </h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Content Filter</Label>
                  <p className="text-xs text-muted-foreground">Block harmful or inappropriate content</p>
                </div>
                <Switch 
                  checked={guardRails.content_filter}
                  onCheckedChange={(checked) => setGuardRails({...guardRails, content_filter: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Refuse Harmful Requests</Label>
                  <p className="text-xs text-muted-foreground">Reject unethical or dangerous requests</p>
                </div>
                <Switch 
                  checked={guardRails.refuse_harmful_requests}
                  onCheckedChange={(checked) => setGuardRails({...guardRails, refuse_harmful_requests: checked})}
                />
              </div>
              
              <div>
                <Label htmlFor="tone">Response Tone</Label>
                <Select value={guardRails.tone} onValueChange={(value) => setGuardRails({...guardRails, tone: value})}>
                  <SelectTrigger id="tone" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="blocked_topics">Blocked Topics (comma-separated)</Label>
                <Input 
                  id="blocked_topics"
                  placeholder="politics, medical advice, financial advice"
                  className="mt-2"
                  value={guardRails.blocked_topics.join(', ')}
                  onChange={(e) => setGuardRails({
                    ...guardRails, 
                    blocked_topics: e.target.value.split(',').map(t => t.trim()).filter(t => t.length > 0)
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="max_tokens">Max Response Tokens</Label>
                <Input 
                  id="max_tokens"
                  type="number"
                  className="mt-2"
                  value={guardRails.max_tokens}
                  onChange={(e) => setGuardRails({...guardRails, max_tokens: parseInt(e.target.value) || 2000})}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum length of agent responses (default: 2000)
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-base">Agent Image</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="mt-2 border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer block"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                  ) : (
                    <>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG or WebP (max. 5MB)
                      </p>
                    </>
                  )}
                </label>
              </div>

              <div>
                <Label className="text-base">AI Workflow (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload your n8n workflow JSON - Real-time validation will check compatibility
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleWorkflowChange}
                  className="hidden"
                  id="workflow-upload"
                  disabled={validating}
                />
                <label
                  htmlFor="workflow-upload"
                  className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer block ${
                    validating ? 'border-muted cursor-not-allowed' : 
                    validationResult?.canPublish ? 'border-green-500 hover:border-green-600' :
                    validationResult && !validationResult.canPublish ? 'border-destructive hover:border-destructive' :
                    'border-border hover:border-primary'
                  }`}
                >
                  {validating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Validating workflow...</span>
                    </div>
                  ) : workflowJson && validationResult ? (
                    <div className="text-left space-y-4">
                      {/* Status Header */}
                      <div className="flex items-center justify-between pb-3 border-b">
                        <div className="flex items-center gap-2">
                          {validationResult.canPublish ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                          <div>
                            <p className="font-semibold">
                              {validationResult.canPublish ? 'Ready to Publish' : 'Cannot Publish'}
                            </p>
                            <p className="text-xs text-muted-foreground">{workflowFile?.name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Chat Compatibility Status - Prominent */}
                      <div className={`p-3 rounded-lg ${validationResult.isChatCompatible ? 'bg-green-50 border border-green-200' : 'bg-destructive/10 border border-destructive/20'}`}>
                        <div className="flex items-center gap-2">
                          {validationResult.isChatCompatible ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                          <div>
                            <p className="font-semibold text-sm">
                              Chat Compatibility: {validationResult.isChatCompatible ? 'PASS' : 'FAIL'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {validationResult.isChatCompatible 
                                ? 'This agent can be used in chat conversations' 
                                : 'Missing required chat trigger node - cannot be used in conversations'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-2 bg-muted rounded text-center">
                          <p className="font-semibold">{validationResult.stats?.totalNodes || 0}</p>
                          <p className="text-xs text-muted-foreground">Total Nodes</p>
                        </div>
                        <div className="p-2 bg-muted rounded text-center">
                          <p className="font-semibold">{validationResult.stats?.executableNodes || 0}</p>
                          <p className="text-xs text-muted-foreground">Executable Tools</p>
                        </div>
                      </div>

                      {/* Personality/Guard Rails Warnings */}
                      {(!formData.ai_personality || !formData.ai_instructions) && (
                        <Alert className="mb-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Recommendation</AlertTitle>
                          <AlertDescription className="text-xs">
                            Configure AI personality and behavioral instructions to control how your agent responds
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Node Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted p-2 rounded">
                          <span className="text-muted-foreground">Total Nodes:</span>
                          <span className="ml-1 font-medium">{validationResult.stats.totalNodes}</span>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <span className="text-muted-foreground">Executable:</span>
                          <span className="ml-1 font-medium text-green-600">{validationResult.stats.executableNodes}</span>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <span className="text-muted-foreground">Supported:</span>
                          <span className="ml-1 font-medium">{validationResult.stats.supportedNodes}</span>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <span className="text-muted-foreground">Unsupported:</span>
                          <span className="ml-1 font-medium text-destructive">{validationResult.stats.unsupportedNodes}</span>
                        </div>
                      </div>

                      {/* Required Credentials */}
                      {validationResult.requiredCredentials.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded p-2">
                          <p className="text-xs font-semibold text-blue-700 mb-1">
                            Required Connections:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {validationResult.requiredCredentials.map((cred: string, i: number) => (
                              <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                {cred}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Errors */}
                      {validationResult.errors.length > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            <p className="text-xs font-semibold text-destructive">
                              Critical Issues ({validationResult.errors.length}):
                            </p>
                          </div>
                          {validationResult.errors.slice(0, 3).map((error: any, i: number) => (
                            <div key={i} className="text-xs text-destructive mb-1">
                              <span className="font-medium">{error.nodeName}:</span> {error.message}
                            </div>
                          ))}
                          {validationResult.errors.length > 3 && (
                            <p className="text-xs text-destructive/70 mt-1">
                              + {validationResult.errors.length - 3} more issues
                            </p>
                          )}
                        </div>
                      )}

                      {/* Warnings */}
                      {validationResult.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-yellow-700" />
                            <p className="text-xs font-semibold text-yellow-700">
                              Warnings ({validationResult.warnings.length}):
                            </p>
                          </div>
                          {validationResult.warnings.slice(0, 2).map((warning: any, i: number) => (
                            <div key={i} className="text-xs text-yellow-700 mb-1">
                              <span className="font-medium">{warning.nodeName}:</span> {warning.message}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Success State */}
                      {validationResult.canPublish && validationResult.errors.length === 0 && (
                        <Alert className="border-green-200 bg-green-50">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-700">Workflow Validated</AlertTitle>
                          <AlertDescription className="text-xs text-green-600">
                            Your workflow is compatible and ready to publish. Users will be able to install and use this agent immediately.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : workflowJson ? (
                    <div className="text-left">
                      <p className="font-medium mb-2">✓ Workflow loaded</p>
                      <p className="text-xs text-muted-foreground">
                        Nodes: {workflowJson.nodes?.length || 0} | File: {workflowFile?.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Sparkles className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Click to upload workflow JSON
                      </p>
                      <p className="text-xs text-muted-foreground">
                        n8n workflow format (max. 5MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || (validationResult && !validationResult.canPublish)} 
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {validationResult && !validationResult.canPublish ? 'Fix Issues Before Publishing' : 'Publish Agent'}
              </Button>
            </div>
          </form>
        </Card>

        {/* Auth Dialog */}
        <AuthDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog}
          onSuccess={() => {
            setShowAuthDialog(false);
            // Retry submit after auth
            if (user) handleSubmit(new Event('submit') as any);
          }}
        />
      </div>
    </div>
  );
};

export default Publish;
