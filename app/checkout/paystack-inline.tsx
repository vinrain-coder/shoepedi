interface PaystackInlineProps {
  email: string;
  amount: number; // amount in kobo
  publicKey: string;
  orderId: string;
  onSuccessUrl?: string; // redirect after success
  onCancelUrl?: string; // redirect after cancel
}

export default function PaystackInline({
  email,
  amount,
  publicKey,
  orderId,
  onSuccessUrl = "/account/orders",
  onCancelUrl = "/account/orders",
}: PaystackInlineProps) {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            const script = document.createElement('script');
            script.src = "https://js.paystack.co/v1/inline.js";
            script.async = true;
            script.onload = function() {
              var handler = window.PaystackPop.setup({
                key: "${publicKey}",
                email: "${email}",
                amount: ${amount},
                ref: "order_${orderId}_" + Date.now(),
                onClose: function() {
                  window.location.href = "${onCancelUrl}";
                },
                callback: function(response) {
                  window.location.href = "${onSuccessUrl}";
                }
              });
              handler.openIframe();
            };
            document.body.appendChild(script);
          })();
        `,
      }}
    />
  );
}
