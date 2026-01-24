import { useState, useEffect } from "react";
import { CreditCard, Coins, TrendingUp, Tag, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditSlider } from "@/components/billing/CreditSlider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [promoCode, setPromoCode] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);

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
      // Reset promo code when dialog opens
      setPromoCode("");
      setPromoOpen(false);
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
      const body: { type: string; creditAmount: number; promoCode?: string } = {
        type: "credits",
        creditAmount: selectedCredits,
      };

      // Only include promo code if user entered one
      if (promoCode.trim()) {
        body.promoCode = promoCode.trim();
      }

      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body,
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

              {/* Promo Code Section */}
              <Collapsible open={promoOpen} onOpenChange={setPromoOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground p-0 h-auto">
                    <Tag className="h-4 w-4" />
                    Have a promo code?
                    {promoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Discount will be applied at checkout
                  </p>
                </CollapsibleContent>
              </Collapsible>

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
