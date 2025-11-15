import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, fetch based on id
  const agent = {
    id,
    name: "Customer Support Pro",
    tagline: "Handle customer inquiries with intelligent responses and ticket routing",
    description: "Customer Support Pro is the fastest and easiest way to automate customer service across multiple channels. A single integration to provide intelligent responses, route tickets, and manage customer interactions from one place.",
    price: "Free to install",
    pricingDetails: "First 100 messages/month free, $0.10 per additional message, capped at $49/month",
    rating: 4.3,
    reviews: 1829,
    category: "Customer Service",
    publisher: "AI Solutions Inc.",
    publisherLocation: "San Francisco, CA, United States",
    launched: "January 15, 2023",
    version: "2.1.0",
    popularWith: "Based in United States",
    highlights: [
      "Use directly in your support dashboard",
      "Multi-channel integration (Email, Chat, Slack)",
      "Custom AI training on your data",
      "Real-time analytics and reporting",
    ],
    features: [
      "Respond to customer inquiries across email, chat, and Slack with seamless integration",
      "Manage tickets, responses, and analytics in your dashboard with real-time integration",
      "Flexible routing options to support integrated channel strategies",
      "Unlimited customer account connections for supported platforms",
      "Support all regions and languages with built-in translation",
    ],
    ratingBreakdown: {
      5: { count: 1500, percentage: 82 },
      4: { count: 67, percentage: 4 },
      3: { count: 31, percentage: 2 },
      2: { count: 39, percentage: 2 },
      1: { count: 227, percentage: 12 },
    },
    sampleReview: {
      author: "Sarah Johnson",
      location: "United States",
      tenure: "Almost 2 years using the agent",
      date: "November 10, 2025",
      rating: 4,
      text: "We use this agent for email and chat support. The responses are fast and can be mapped to our knowledge base making it easier to maintain consistency. The customer service team has been quick to help and my issues are always resolved quickly. There are occasional issues with context not being preserved correctly across messages. This is solved with a simple re-training.",
    },
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

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[320px,1fr] gap-8">
          {/* Left Sidebar */}
          <aside className="space-y-6">
            {/* Agent Icon & Name */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center text-2xl font-bold">
                {agent.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold">{agent.name}</h2>
              </div>
            </div>

            <Separator />

            {/* Pricing */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Pricing</h3>
              <p className="text-sm text-muted-foreground">{agent.price}. Additional charges may apply.</p>
            </div>

            {/* Popular With */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Popular with stores like yours</h3>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{agent.popularWith}</p>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Highlights</h3>
              <ul className="space-y-2">
                {agent.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rating */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Rating</h3>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold">{agent.rating}</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.floor(agent.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : star === Math.ceil(agent.rating)
                          ? "fill-yellow-400/50 text-yellow-400"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">({agent.reviews.toLocaleString()})</p>
            </div>

            {/* Developer */}
            <div>
              <h3 className="font-semibold text-sm mb-2">Developer</h3>
              <p className="text-sm text-muted-foreground">{agent.publisher}</p>
            </div>

            {/* Install Button */}
            <Button size="lg" className="w-full">
              Install
            </Button>
          </aside>

          {/* Main Content */}
          <main className="space-y-12">
            {/* Hero Image */}
            <Card className="overflow-hidden">
              <div className="aspect-[16/9] bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <div className="text-8xl opacity-30">
                  {agent.name.charAt(0)}
                </div>
              </div>
            </Card>

            {/* Description */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{agent.tagline}</h1>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {agent.description}
              </p>
              <ul className="space-y-2">
                {agent.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing Details */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Pricing</h2>
              <Card className="p-6">
                <div className="mb-4">
                  <Badge variant="secondary" className="mb-3">
                    Free
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">{agent.price}</h3>
                  <p className="text-sm text-muted-foreground">{agent.pricingDetails}</p>
                </div>
              </Card>
              <p className="text-sm text-muted-foreground mt-4">
                All charges are billed in USD.{" "}
                <button className="underline">See all pricing options</button>
              </p>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <span className="text-muted-foreground">({agent.reviews.toLocaleString()})</span>
              </div>

              {/* Overall Rating */}
              <div className="mb-8">
                <h3 className="font-semibold mb-4">Overall rating</h3>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl font-bold">{agent.rating}</span>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.floor(agent.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : star === Math.ceil(agent.rating)
                            ? "fill-yellow-400/50 text-yellow-400"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Rating Breakdown */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm">{stars}</span>
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                      <Progress
                        value={agent.ratingBreakdown[stars].percentage}
                        className="h-2 flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {agent.ratingBreakdown[stars].count}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline">Write a review</Button>
                  <Button variant="outline">All reviews</Button>
                </div>
              </div>

              {/* Sample Review */}
              <Card className="p-6">
                <div className="mb-4">
                  <h4 className="font-semibold mb-1">{agent.sampleReview.author}</h4>
                  <p className="text-sm text-muted-foreground mb-1">
                    {agent.sampleReview.location}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {agent.sampleReview.tenure}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= agent.sampleReview.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {agent.sampleReview.date}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{agent.sampleReview.text}</p>
              </Card>
            </div>

            {/* Support */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Support</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Agent support provided by {agent.publisher}.
              </p>
              <Button variant="outline">Get support</Button>

              <div className="grid md:grid-cols-2 gap-8 mt-8">
                <div>
                  <h3 className="font-semibold mb-2">Developer</h3>
                  <p className="text-sm font-medium mb-1">{agent.publisher}</p>
                  <p className="text-sm text-muted-foreground">
                    {agent.publisherLocation}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Launched</h3>
                  <p className="text-sm text-muted-foreground">{agent.launched}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
