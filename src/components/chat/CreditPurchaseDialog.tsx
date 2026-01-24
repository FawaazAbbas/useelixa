import { useState, useEffect } from "react";
import { CreditCard, Coins, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditSlider } from "@/components/billing/CreditSlider";

interface CreditPricing {
  price_per_credit_pence: number;
  min_credits: number;
  credit_increment: number;
  max_credits: number;
  currency: string;
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
  const [pricing, setPricing] = useState<CreditPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCredits, setSelectedCredits] = useState(500);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const { data, error } = await supabase
          .from("credit_pricing")
          .select("*")
          .limit(1)
          .single();

        if (error) throw error;
        
        setPricing(data);
        // Set initial value to minimum or required amount
        const initialValue = requiredCredits 
          ? Math.max(data.min_credits, Math.ceil(requiredCredits / data.credit_increment) * data.credit_increment)
          : data.min_credits;
        setSelectedCredits(initialValue);
      } catch (error) {
        console.error("Error fetching pricing:", error);
        // Fallback pricing
        setPricing({
          price_per_credit_pence: 6,
          min_credits: 100,
          credit_increment: 100,
          max_credits: 10000,
          currency: "GBP",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchPricing();
    }
  }, [open, requiredCredits]);

  const formatPrice = (pence: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(pence / 100);
  };

  const handlePurchase = async () => {
    if (!pricing) return;
    
    setPurchasing(true);

    try {
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: { type: "credits", creditAmount: selectedCredits },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("[CreditPurchase] Checkout error:", error);
      toast.error("Failed to start checkout", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setPurchasing(false);
    }
  };

  const totalPrice = pricing ? selectedCredits * pricing.price_per_credit_pence : 0;
  const afterPurchase = currentCredits + selectedCredits;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-primary" />
            Buy Credits
          </DialogTitle>
          <DialogDescription>
            {requiredCredits
              ? `You need ${requiredCredits} credits but only have ${currentCredits}. Purchase more to continue.`
              : "Purchase credits to use AI models and features."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : pricing ? (
            <div className="space-y-6">
              <CreditSlider
                min={pricing.min_credits}
                max={pricing.max_credits}
                step={pricing.credit_increment}
                value={selectedCredits}
                onChange={setSelectedCredits}
                pricePerCredit={pricing.price_per_credit_pence}
              />

              {/* Balance info */}
              <div className="flex items-center justify-between text-sm border-t pt-4">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Current balance</div>
                  <div className="font-medium">{currentCredits.toLocaleString()} credits</div>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1 text-right">
                  <div className="text-muted-foreground">After purchase</div>
                  <div className="font-medium text-primary">{afterPurchase.toLocaleString()} credits</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={!pricing || purchasing}>
            <CreditCard className="h-4 w-4 mr-2" />
            {purchasing ? "Processing..." : `Purchase ${formatPrice(totalPrice)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
