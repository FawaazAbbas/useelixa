import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Download, Shield, Zap, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, fetch based on id
  const agent = {
    id,
    name: "Customer Support Pro",
    description: "Handle customer inquiries with intelligent responses and ticket routing",
    longDescription: "Customer Support Pro is an advanced AI agent designed to revolutionize your customer service operations. It uses state-of-the-art natural language processing to understand customer inquiries, provide accurate responses, and intelligently route complex issues to the right team members.",
    price: 49,
    rating: 4.8,
    reviews: 1240,
    category: "Customer Service",
    publisher: "AI Solutions Inc.",
    features: [
      "24/7 automated support",
      "Multi-language support",
      "Smart ticket routing",
      "Integration with major CRMs",
      "Custom response training",
      "Analytics dashboard",
    ],
    capabilities: [
      { icon: Zap, title: "Instant Responses", desc: "Reply to customer queries in milliseconds" },
      { icon: Shield, title: "Secure & Compliant", desc: "Enterprise-grade security and privacy" },
      { icon: Settings, title: "Easy Integration", desc: "Works with Slack, Email, and more" },
    ],
  };

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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Image */}
          <div>
            <Card className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <div className="text-9xl opacity-30">
                  {agent.name.charAt(0)}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div>
            <Badge variant="secondary" className="mb-4">
              {agent.category}
            </Badge>
            <h1 className="text-4xl font-bold mb-4">{agent.name}</h1>
            <p className="text-xl text-muted-foreground mb-6">
              {agent.description}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <Star className="h-5 w-5 fill-muted text-muted" />
                </div>
                <span className="font-semibold">{agent.rating}</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-muted-foreground">
                {agent.reviews.toLocaleString()} reviews
              </span>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-5xl font-bold">${agent.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Button size="lg" className="w-full mb-3">
                <Download className="mr-2 h-5 w-5" />
                Get Agent
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                7-day free trial • Cancel anytime
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Publisher</span>
                <span className="font-medium">{agent.publisher}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="font-medium">Dec 2024</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-medium">2.1.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities */}
        <div className="grid md:grid-cols-3 gap-6 my-12">
          {agent.capabilities.map((capability, index) => (
            <Card key={index} className="p-6">
              <capability.icon className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{capability.title}</h3>
              <p className="text-sm text-muted-foreground">{capability.desc}</p>
            </Card>
          ))}
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">About This Agent</h2>
              <p className="text-muted-foreground leading-relaxed">
                {agent.longDescription}
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Key Features</h2>
              <ul className="space-y-3">
                {agent.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
              <p className="text-muted-foreground">
                {agent.reviews.toLocaleString()} verified reviews from real users
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentDetail;
