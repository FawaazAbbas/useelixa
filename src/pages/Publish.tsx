import { useState, useEffect } from "react";
import { ArrowLeft, Upload, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [workflowJson, setWorkflowJson] = useState<any>(null);
  const [validationScore, setValidationScore] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    long_description: "",
    category_id: "",
    price: "0",
    capabilities: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      sessionStorage.setItem('redirectAfterAuth', '/publish');
      navigate("/auth");
      return;
    }

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
  }, [user, navigate]);

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
          setValidationScore(data?.validation || null);
          toast({
            variant: "destructive",
            title: "Workflow validation failed",
            description: data?.validation?.blockers?.[0] || "Your workflow has issues that need to be fixed"
          });
        } else {
          setValidationScore(data.validation);
          const grade = data.validation.grade;
          const canPublish = data.validation.canPublish;
          
          toast({
            title: canPublish ? "Workflow validated" : "Validation warning",
            description: canPublish 
              ? `Grade ${grade} - Your workflow is ready to publish!`
              : `Grade ${grade} - ${data.validation.warnings[0] || 'Check validation details'}`,
            variant: canPublish ? "default" : "destructive"
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
        setValidationScore(null);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      sessionStorage.setItem('redirectAfterAuth', '/publish');
      navigate("/auth");
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
          status: "active"
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
            description: `Your ${validationScore?.grade || 'workflow-based'} grade agent has been published!`
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
                    validationScore?.canPublish ? 'border-green-500 hover:border-green-600' :
                    validationScore && !validationScore.canPublish ? 'border-destructive hover:border-destructive' :
                    'border-border hover:border-primary'
                  }`}
                >
                  {validating ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Validating workflow...</span>
                    </div>
                  ) : workflowJson && validationScore ? (
                    <div className="text-left space-y-3">
                      {/* Grade Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold px-3 py-1 rounded ${
                            validationScore.grade === 'A' ? 'bg-green-100 text-green-700' :
                            validationScore.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                            validationScore.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                            validationScore.grade === 'D' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {validationScore.grade}
                          </div>
                          <div>
                            <p className="font-semibold">{validationScore.overall}% Compatible</p>
                            <p className="text-xs text-muted-foreground">{workflowFile?.name}</p>
                          </div>
                        </div>
                        {validationScore.canPublish ? (
                          <span className="text-green-600 text-sm font-medium">✓ Ready to publish</span>
                        ) : (
                          <span className="text-destructive text-sm font-medium">✗ Cannot publish</span>
                        )}
                      </div>

                      {/* Node Stats */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted p-2 rounded">
                          <span className="text-muted-foreground">Total Nodes:</span>
                          <span className="ml-1 font-medium">{validationScore.details.totalNodes}</span>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <span className="text-muted-foreground">Executable:</span>
                          <span className="ml-1 font-medium text-green-600">{validationScore.details.executableNodes}</span>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <span className="text-muted-foreground">Supported:</span>
                          <span className="ml-1 font-medium">{validationScore.details.supportedNodes}</span>
                        </div>
                        <div className="bg-muted p-2 rounded">
                          <span className="text-muted-foreground">Unsupported:</span>
                          <span className="ml-1 font-medium text-destructive">{validationScore.details.unknownNodes}</span>
                        </div>
                      </div>

                      {/* Blockers */}
                      {validationScore.blockers.length > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                          <p className="text-xs font-semibold text-destructive mb-1">Critical Issues:</p>
                          {validationScore.blockers.map((blocker: string, i: number) => (
                            <p key={i} className="text-xs text-destructive">• {blocker}</p>
                          ))}
                        </div>
                      )}

                      {/* Warnings */}
                      {validationScore.warnings.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                          <p className="text-xs font-semibold text-yellow-700 mb-1">Warnings:</p>
                          {validationScore.warnings.slice(0, 3).map((warning: string, i: number) => (
                            <p key={i} className="text-xs text-yellow-700">• {warning}</p>
                          ))}
                        </div>
                      )}

                      {/* What Works */}
                      {validationScore.details.nodeBreakdown.supported.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <p className="text-xs font-semibold text-green-700 mb-1">✓ What Works:</p>
                          {validationScore.details.nodeBreakdown.supported.slice(0, 3).map((node: any, i: number) => (
                            <p key={i} className="text-xs text-green-700">• {node.name}</p>
                          ))}
                          {validationScore.details.nodeBreakdown.supported.length > 3 && (
                            <p className="text-xs text-green-600 mt-1">
                              + {validationScore.details.nodeBreakdown.supported.length - 3} more
                            </p>
                          )}
                        </div>
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
                disabled={loading || (validationScore && !validationScore.canPublish)} 
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {validationScore && !validationScore.canPublish ? 'Cannot Publish - Fix Issues' : 'Publish Agent'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Publish;
