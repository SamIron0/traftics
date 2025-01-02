"use client";
import { Button } from "@/components/ui/button";
import type { Tables } from "supabase/types";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { getStripe } from "@/utils/stripe/client";
import { Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAppStore } from "@/stores/useAppStore";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/config/pricing";

type Product = Tables<"products">;
type Price = Tables<"prices">;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface Props {
  products: ProductWithPrices[];
  user: User | null;
}

const features = PRICING_PLANS.map((plan) => ({
  tier: plan.name.toLowerCase(),
  features: plan.features,
}));

export default function Pricing({ products, user }: Props) {
  const { subscriptionStatus } = useAppStore();
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    if (!user) {
      router.push("/signup");
    }

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ price, redirectPath: currentPath }),
    });

    const result = await response.json();

    if (response.ok) {
      if (result.sessionId) {
        const stripe = await getStripe();
        stripe?.redirectToCheckout({ sessionId: result.sessionId });
      } else if (result.errorRedirect) {
        router.push(result.errorRedirect);
      }
    } else {
      console.error("Checkout error:", result.error);
    }
  };

  const handleManageSubscription = async () => {};

  const handleFreeSignup = () => router.push("/signup");

  const freeTier = {
    name: "Free",
    description: "Perfect for personal projects and small websites",
    id: "free-tier",
    prices: [
      { id: "free", currency: "usd", interval: "month", unit_amount: 0 },
    ],
  };
  const proTier = products[0];

  const handleCancelSubscription = async () => {
    if (user == null) {
      console.log("User is not authenticated");
      router.push("/signup");
      return;
    }
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
      });
      const result = await response.json();
      if (response.ok) {
        toast.success("Your subscription has been cancelled successfully.");
        router.push("/account");
      } else {
        toast.error("Failed to cancel subscription: " + result.error);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error("An error occurred while cancelling your subscription.");
    }
    setShowCancelDialog(false);
  };

  return (
    <div className=" w-full space-y-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {subscriptionStatus === "active"
              ? "Manage your subscription and usage"
              : subscriptionStatus === "canceled"
              ? "Reactivate your subscription to access premium features"
              : subscriptionStatus === "past_due"
              ? "Please update your payment method to continue accessing premium features"
              : "Choose the plan that's right for you"}
          </p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-7xl">
          {[freeTier, proTier].map((product, index) => {
            const price = product.prices[0];
            const priceString =
              index === 0
                ? "Free"
                : new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: price.currency!,
                    minimumFractionDigits: 0,
                  }).format((price?.unit_amount || 0) / 100);

            const isFreeTier = index === 0;
            const isProTier = index === 1;
            const hasActiveSubscription =
              subscriptionStatus === "active" ||
              subscriptionStatus === "trialing";

            let buttonText = "";
            let buttonAction = () => {};
            let showButton = true;

            if (hasActiveSubscription) {
              if (isProTier) {
                buttonText = "Current Plan";
                buttonAction = handleManageSubscription;
              } else {
                buttonText = "Downgrade";
                buttonAction = () => {
                  handleCancelSubscription();
                };
              }
            } else {
              if (isFreeTier) {
                buttonText = "Get Started";
                buttonAction = handleFreeSignup;
                showButton = false;
              } else {
                buttonText = "Subscribe";
                buttonAction = () => handleStripeCheckout(price as Price);
              }
            }

            return (
              <div
                key={product.id}
                className={cn(
                  "divide-y divide-gray-200 rounded-lg border shadow-sm",
                  isProTier
                    ? "border-primary/90 border-2 scale-105 z-10 bg-white"
                    : "border-gray-200"
                )}
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-4 text-sm text-gray-500">
                    {product.description}
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {priceString}
                    </span>
                    {index !== 0 && (
                      <span className="text-base font-medium text-gray-500">
                        /{price.interval}
                      </span>
                    )}
                  </p>
                  {showButton && (
                    <Button
                      onClick={buttonAction}
                      disabled={buttonText === "Current Plan"}
                      className={cn(
                        "mt-8 block w-full rounded-md py-2 text-center text-sm font-semibold",
                        isProTier
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-gray-900 text-white hover:bg-gray-800",
                        buttonText === "Current Plan" &&
                          "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {buttonText}
                    </Button>
                  )}
                </div>
                <div className="px-6 pt-6 pb-8">
                  <h4 className="text-sm font-medium text-gray-900">
                    What&apos;s included
                  </h4>
                  <ul role="list" className="mt-6 space-y-4">
                    {features[index].features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {isProTier && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-0">
                    <span className="inline-flex rounded-full bg-primary px-4 py-1 text-sm font-semibold text-white">
                      Most Popular
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to cancel your subscription?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You will lose access to premium
              features at the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription}>
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
