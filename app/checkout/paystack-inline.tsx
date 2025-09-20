interface PaystackInlineProps {
  email: string;
  amount: number; // amount in kobo
  publicKey: string;
  orderId: string;
  onSuccessUrl?: string; // redirect after success
  onCancelUrl?: string; // redirect after cancel
}

// Extend the window object so TypeScript knows about PaystackPop
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export function PaystackInline({
  email,
  amount,
  publicKey,
  orderId,
  onSuccessUrl = "/account/orders",
  onCancelUrl = "/account/orders",
}: PaystackInlineProps) {
  const handler = () => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      if (window.PaystackPop) {
        const paystackHandler = window.PaystackPop.setup({
          key: publicKey,
          email,
          amount,
          ref: "order_" + orderId + "_" + Date.now(),
          onClose: () => {
            window.location.href = onCancelUrl;
          },
          callback: () => {
            window.location.href = onSuccessUrl;
          },
        });
        paystackHandler.openIframe();
      } else {
        console.error("PaystackPop is not available on window");
      }
    };
    document.body.appendChild(script);
  };

  handler();
}
