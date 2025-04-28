import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "~/server/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new NextResponse("Webhook signature verification failed", {
        status: 400,
      });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;

        if (!session.metadata?.userId) {
          console.error("No userId found in session metadata");
          return new NextResponse("No userId found in session metadata", {
            status: 400,
          });
        }

        await db.user.update({
          where: {
            id: session.metadata.userId,
          },
          data: {
            isPremium: true,
            role: "premium",
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("No user found for customer:", customerId);
          return new NextResponse("No user found for customer", {
            status: 400,
          });
        }

        await db.user.update({
          where: { id: user.id },
          data: {
            isPremium: subscription.status === "active",
            role: subscription.status === "active" ? "premium" : "user",
            stripeSubscriptionId: subscription.id,
          },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("No user found for customer:", customerId);
          return new NextResponse("No user found for customer", {
            status: 400,
          });
        }

        await db.user.update({
          where: { id: user.id },
          data: {
            isPremium: false,
            role: "user",
            stripeSubscriptionId: null,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("No user found for customer:", customerId);
          return new NextResponse("No user found for customer", {
            status: 400,
          });
        }

        // You might want to notify the user about the failed payment
        console.log(`Payment failed for user ${user.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
