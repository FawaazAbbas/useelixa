import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Store } from "lucide-react";
import { OAUTH_CLIENT_IDS } from "@/config/oauth";

interface ShopifyConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CANONICAL_SITE_URL = "https://workspace.elixa.app";
const REDIRECT_URI = `${CANONICAL_SITE_URL}/oauth/callback`;

// Shopify scopes for AI assistant integration
const SHOPIFY_SCOPES = [
  "read_products",
  "read_orders",
  "read_customers",
  "read_inventory",
].join(",");

function normalizeShopDomain(input: string): string {
  // Remove protocol if present
  let domain = input.replace(/^https?:\/\//, "");
  // Remove trailing slashes
  domain = domain.replace(/\/+$/, "");
  // Add .myshopify.com if not present
  if (!domain.includes(".myshopify.com")) {
    domain = `${domain}.myshopify.com`;
  }
  return domain;
}

function validateShopDomain(domain: string): boolean {
  // Basic validation - should match pattern: store-name.myshopify.com
  const pattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;
  return pattern.test(domain);
}

export function ShopifyConnectDialog({ open, onOpenChange }: ShopifyConnectDialogProps) {
  const [shopInput, setShopInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setError(null);
    
    if (!shopInput.trim()) {
      setError("Please enter your Shopify store domain");
      return;
    }

    const normalizedDomain = normalizeShopDomain(shopInput.trim());
    
    if (!validateShopDomain(normalizedDomain)) {
      setError("Invalid store domain. Please enter a valid Shopify store (e.g., my-store or my-store.myshopify.com)");
      return;
    }

    setConnecting(true);

    // Build state with shop domain included
    const state = JSON.stringify({
      provider: "shopify",
      shopDomain: normalizedDomain,
      returnTo: window.location.pathname,
    });
    const encodedState = encodeURIComponent(btoa(state));

    // Build Shopify OAuth URL
    const clientId = OAUTH_CLIENT_IDS.SHOPIFY;
    const oauthUrl = `https://${normalizedDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(SHOPIFY_SCOPES)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${encodedState}`;

    // Redirect to Shopify
    window.location.href = oauthUrl;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConnect();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Connect Shopify Store
          </DialogTitle>
          <DialogDescription>
            Enter your Shopify store domain to connect your store.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="shop-domain">Store Domain</Label>
            <Input
              id="shop-domain"
              placeholder="my-store or my-store.myshopify.com"
              value={shopInput}
              onChange={(e) => {
                setShopInput(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              disabled={connecting}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              You can find this in your Shopify admin URL: https://<strong>your-store</strong>.myshopify.com
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={connecting}>
            Cancel
          </Button>
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
