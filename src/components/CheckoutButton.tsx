"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";
import { Button } from "~/components/ui/button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export function CheckoutButton() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const { sessionId } = (await response.json()) as { sessionId: string };
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize");
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw new Error(error.message);
    } catch (err) {
      // Aqui você pode mostrar um toast de erro, se quiser
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCheckout} className="w-full" disabled={loading}>
      {loading ? "Carregando..." : "Assinar Premium"}
    </Button>
  );
}
