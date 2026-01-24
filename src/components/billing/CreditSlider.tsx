import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CreditSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  pricePerCredit: number; // in pence
  className?: string;
}

const QUICK_SELECT_OPTIONS = [100, 500, 1000, 2000];

export function CreditSlider({
  min,
  max,
  step,
  value,
  onChange,
  pricePerCredit,
  className,
}: CreditSliderProps) {
  const formatPrice = (pence: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(pence / 100);
  };

  const totalPrice = value * pricePerCredit;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Slider */}
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{min.toLocaleString()}</span>
          <span className="font-semibold text-foreground text-lg">
            {value.toLocaleString()} credits
          </span>
          <span>{max.toLocaleString()}</span>
        </div>
        <Slider
          value={[value]}
          onValueChange={(vals) => onChange(vals[0])}
          min={min}
          max={max}
          step={step}
          className="w-full"
        />
      </div>

      {/* Quick select buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground mr-2 self-center">Quick select:</span>
        {QUICK_SELECT_OPTIONS.filter((opt) => opt >= min && opt <= max).map((option) => (
          <Button
            key={option}
            variant={value === option ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option)}
            className="min-w-[70px]"
          >
            {option.toLocaleString()}
          </Button>
        ))}
      </div>

      {/* Price display */}
      <div className="bg-muted/50 rounded-lg p-4 text-center space-y-1">
        <div className="text-3xl font-bold">{formatPrice(totalPrice)}</div>
        <div className="text-sm text-muted-foreground">
          {formatPrice(pricePerCredit)} per credit
        </div>
      </div>
    </div>
  );
}
