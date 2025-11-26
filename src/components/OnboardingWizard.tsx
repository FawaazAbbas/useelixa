import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
}

export const OnboardingWizard = ({ open, onComplete }: OnboardingWizardProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = (route: string) => {
    onComplete();
    navigate(route);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onComplete()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to ELIXA</DialogTitle>
        </DialogHeader>

        <Progress value={progress} className="mb-6" />

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">👋</div>
              <h3 className="text-xl font-semibold mb-2">Let's Get You Set Up</h3>
              <p className="text-muted-foreground">
                Three quick steps to start working with your AI team
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Connect Your Tools</h4>
                  <p className="text-sm text-muted-foreground">
                    Link Gmail, Slack, Drive—whatever you use. One-time setup for all agents.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Add Specialists</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse the marketplace and install agents for tasks you need help with.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Start Chatting</h4>
                  <p className="text-sm text-muted-foreground">
                    Message agents like colleagues. They'll remember context and get things done.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Connect Your Tools</h3>
              <p className="text-muted-foreground">
                Link your accounts once, and every agent can use them
              </p>
            </div>

            <div className="bg-accent/50 rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <span className="text-2xl">📧</span>
                </div>
                <div>
                  <h4 className="font-semibold">Google Workspace</h4>
                  <p className="text-sm text-muted-foreground">Gmail, Drive, Calendar, Sheets</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <span className="text-2xl">💬</span>
                </div>
                <div>
                  <h4 className="font-semibold">Slack</h4>
                  <p className="text-sm text-muted-foreground">Team messaging</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h4 className="font-semibold">And More</h4>
                  <p className="text-sm text-muted-foreground">HubSpot, Notion, QuickBooks, Stripe...</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-center text-muted-foreground">
              You can set this up now or skip and do it later
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">You're All Set!</h3>
              <p className="text-muted-foreground">
                Choose where you'd like to start
              </p>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => handleComplete('/connections')}
                className="p-4 border-2 rounded-lg hover:border-primary hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-1 group-hover:text-primary">Connect Tools First</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up your integrations so agents work instantly
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
              </button>

              <button
                onClick={() => handleComplete('/marketplace')}
                className="p-4 border-2 rounded-lg hover:border-primary hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-1 group-hover:text-primary">Browse Agents</h4>
                    <p className="text-sm text-muted-foreground">
                      Explore the marketplace and add specialists
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
              </button>

              <button
                onClick={() => handleComplete('/workspace')}
                className="p-4 border-2 rounded-lg hover:border-primary hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold mb-1 group-hover:text-primary">Jump Right In</h4>
                    <p className="text-sm text-muted-foreground">
                      Start exploring and set things up as you go
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button variant="ghost" onClick={onComplete}>
              <Check className="h-4 w-4 mr-2" />
              Skip for Now
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
