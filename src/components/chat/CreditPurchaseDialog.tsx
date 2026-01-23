import { useState, useEffect } from "react";
import { CreditCard, Check, Sparkles, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_cents: number;
  popular: boolean;
}

interface CreditPurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentCredits?: number;
  requiredCredits?: number;
}

export function CreditPurchaseDialog({
  open,
  onOpenChange,
  currentCredits = 0,
  requiredCredits,
}: CreditPurchaseDialogProps) {
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data, error } = await supabase
          .from("credit_packages")
          .select("*")
          .order("credits", { ascending: true });

        if (error) throw error;
        setPackages(data || []);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPackages();
    }
  }, [open]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    // TODO: Integrate with Stripe checkout
    toast.info("Stripe integration coming soon!", {
      description: "Credit purchases will be available in the next update.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Buy Credits
          </DialogTitle>
          <DialogDescription>
            {requiredCredits
              ? `You need ${requiredCredits} credits but only have ${currentCredits}. Purchase more to continue.`
              : "Purchase credits to use premium AI models and features."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            packages.map((pkg) => {
              const isSelected = selectedPackage === pkg.id;
              const pricePerCredit = (pkg.price_cents / pkg.credits / 100).toFixed(4);

              return (
                <Card
                  key={pkg.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    isSelected && "border-primary ring-2 ring-primary/20",
                    pkg.popular && "border-primary/30"
                  )}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            pkg.popular
                              ? "bg-primary/10 text-primary"
                              : "bg-muted"
                          )}
                        >
                          {pkg.popular ? (
                            <Sparkles className="h-5 w-5" />
                          ) : (
                            <Zap className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{pkg.name}</span>
                            {pkg.popular && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                POPULAR
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pkg.credits.toLocaleString()} credits • ${pricePerCredit}/credit
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">
                          {formatPrice(pkg.price_cents)}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={!selectedPackage}>
            <CreditCard className="h-4 w-4 mr-2" />
            Purchase Credits
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
