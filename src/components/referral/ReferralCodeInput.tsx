import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Loader2, Gift, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ReferralCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidChange?: (isValid: boolean, referrerName?: string) => void;
}

export const ReferralCodeInput = ({ value, onChange, onValidChange }: ReferralCodeInputProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    referrerName?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    if (!value.trim()) {
      setValidationResult(null);
      onValidChange?.(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const { data, error } = await supabase
          .from("waitlist_signups")
          .select("name, referral_count")
          .eq("referral_code", value.toUpperCase().trim())
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Check if code has reached max uses (3)
          if (data.referral_count >= 3) {
            setValidationResult({
              isValid: false,
              error: "This code has reached its maximum uses",
            });
            onValidChange?.(false);
          } else {
            setValidationResult({
              isValid: true,
              referrerName: data.name,
            });
            onValidChange?.(true, data.name);
          }
        } else {
          setValidationResult({
            isValid: false,
            error: "Invalid referral code",
          });
          onValidChange?.(false);
        }
      } catch (err) {
        console.error("Validation error:", err);
        setValidationResult({
          isValid: false,
          error: "Could not validate code",
        });
        onValidChange?.(false);
      } finally {
        setIsValidating(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [value, onValidChange]);

  // Auto-expand if URL has ref param
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setIsExpanded(true);
      onChange(refCode);
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Gift className="w-3.5 h-3.5 text-violet-500" />
        <span>Have an invite code?</span>
        {isExpanded ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
          <Label htmlFor="referral-code" className="text-xs font-medium">
            Referral Code
          </Label>
          <div className="relative">
            <Input
              id="referral-code"
              placeholder="Enter code (e.g. ABC123XY)"
              value={value}
              onChange={(e) => onChange(e.target.value.toUpperCase())}
              className={cn(
                "h-10 rounded-lg border-border bg-background text-sm uppercase tracking-wider pr-10",
                validationResult?.isValid && "border-green-500 focus:border-green-500",
                validationResult?.isValid === false && value && "border-red-400 focus:border-red-400"
              )}
              maxLength={8}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isValidating && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              {!isValidating && validationResult?.isValid && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              {!isValidating && validationResult?.isValid === false && value && (
                <X className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
          
          {validationResult?.isValid && validationResult.referrerName && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" />
              Referred by {validationResult.referrerName}
            </p>
          )}
          
          {validationResult?.error && value && (
            <p className="text-xs text-red-500">{validationResult.error}</p>
          )}
        </div>
      )}
    </div>
  );
};
