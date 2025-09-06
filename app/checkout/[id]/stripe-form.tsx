import {
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { FormEvent, useState } from "react";

import ProductPrice from "@/components/shared/product/product-price";
import useSettingStore from "@/hooks/use-setting-store";
import SubmitButton from "@/components/shared/submit-button";

export default function StripeForm({
  priceInCents,
  orderId,
}: {
  priceInCents: number;
  orderId: string;
}) {
  const {
    setting: { site },
  } = useSettingStore();

  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [email, setEmail] = useState<string>();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (stripe == null || elements == null || email == null) return;

    setIsLoading(true);
    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${site.url}/checkout/${orderId}/stripe-payment-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message);
        } else {
          setErrorMessage("An unknown error occurred");
        }
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl">Stripe Checkout</div>
      {errorMessage && <div className="text-destructive">{errorMessage}</div>}
      <PaymentElement />
      <div>
        <LinkAuthenticationElement onChange={(e) => setEmail(e.value.email)} />
      </div>
      <SubmitButton
        isLoading={isLoading}
        disabled={stripe == null || elements == null}
        size="lg"
        className="w-full"
        loadingText="Purchasing..."
      >
        Purchase - <ProductPrice price={priceInCents / 100} plain />
      </SubmitButton>
    </form>
  );
}
