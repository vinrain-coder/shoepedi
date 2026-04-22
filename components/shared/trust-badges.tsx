import { RotateCcw, Truck, Wallet } from "lucide-react";

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-3 border-t border-b">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Truck className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-tight">Fast Delivery</span>
          <span className="text-[10px] text-muted-foreground">Across Kenya</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <RotateCcw className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-tight">Easy Returns</span>
          <span className="text-[10px] text-muted-foreground">7-day policy</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-tight">Secure Payment</span>
          <span className="text-[10px] text-muted-foreground">Safe & Encrypted</span>
        </div>
      </div>
    </div>
  );
}
