import { ArrowLeft, Upload, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Publish = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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

      {/* Content */}
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
          <form className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base">Agent Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Customer Support Pro"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="tagline" className="text-base">Tagline</Label>
                <Input
                  id="tagline"
                  placeholder="Brief description in one line"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-base">Full Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what your agent does and how it helps users..."
                  className="mt-2 min-h-32"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-base">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Customer Service, Marketing, Analytics"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="price" className="text-base">Price (USD/month)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="49"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-6">
              <div>
                <Label className="text-base">Icon/Screenshot</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG or WebP (max. 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Agent Configuration */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="api" className="text-base">Agent API Endpoint</Label>
                <Input
                  id="api"
                  placeholder="https://api.yourdomain.com/agent"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  The endpoint where your agent receives and processes requests
                </p>
              </div>

              <div>
                <Label htmlFor="capabilities" className="text-base">Key Capabilities</Label>
                <Textarea
                  id="capabilities"
                  placeholder="List the main features and capabilities of your agent..."
                  className="mt-2 min-h-24"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6">
              <Button type="button" variant="outline" className="flex-1">
                Save Draft
              </Button>
              <Button type="submit" className="flex-1">
                Publish Agent
              </Button>
            </div>
          </form>
        </Card>

        {/* Guidelines */}
        <Card className="mt-8 p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">Publishing Guidelines</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Ensure your agent has been thoroughly tested</li>
            <li>• Provide clear documentation and examples</li>
            <li>• Set fair pricing based on your agent's capabilities</li>
            <li>• Respond promptly to user reviews and feedback</li>
            <li>• Keep your agent updated and secure</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Publish;
