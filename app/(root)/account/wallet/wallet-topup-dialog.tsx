"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { initializeWalletTopup } from "@/lib/actions/wallet.actions";
import { PlusCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function WalletTopupDialog() {
  const router = useRouter();
  const [amount, setAmount] = useState<string>("1000");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const onSuccess = (reference: any) => {
    setLoading(true);
    fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: reference.reference }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          toast.success("Wallet topped up successfully!");
          setOpen(false);
          router.refresh();
        } else {
          toast.error(data.message || "Failed to verify top-up");
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("An error occurred while verifying payment");
      })
      .finally(() => setLoading(false));
  };

  const handlePayment = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const res = await initializeWalletTopup(numAmount);
      if (res.success) {
        const config = {
          reference: res.data.reference,
          amount: Math.round(numAmount * 100),
          publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email: res.data.email,
        };

        if (!(window as any).PaystackPop) {
           toast.error("Paystack script not loaded. Please refresh the page.");
           setLoading(false);
           return;
        }

        const handler = (window as any).PaystackPop.setup({
          key: config.publicKey,
          email: config.email,
          amount: config.amount,
          ref: config.reference,
          onClose: () => {
              setLoading(false);
          },
          callback: (response: any) => {
              onSuccess(response);
          }
        });
        handler.openIframe();

      } else {
        toast.error(res.message);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to initialize payment");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Top up Wallet</DialogTitle>
          <DialogDescription>
            Enter the amount you want to add to your wallet balance.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePayment} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay with Paystack"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
