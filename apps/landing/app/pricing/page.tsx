"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PRICING_PLANS } from "./pricing-config";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="w-full space-y-12 h-[100dvh]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Choose the plan that&apos;s right for you
          </p>
        </div>
        <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-7xl">
          {PRICING_PLANS.map((plan, index) => {
            const isPopular = plan.name === "Pro";

            return (
              <div
                key={plan.id}
                className={`divide-y divide-gray-200 rounded-lg border shadow-sm ${
                  isPopular
                    ? "border-primary/90 border-2 scale-105 z-10 bg-white relative"
                    : "border-gray-200"
                }`}
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mt-4 text-sm text-gray-500">
                    {plan.description}
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${plan.price}
                    </span>
                    <span className="text-base font-medium text-gray-500">
                      /{plan.interval}
                    </span>
                  </p>
                  <Button
                    asChild
                    className={`mt-8 block w-full rounded-md py-2 text-center text-sm font-semibold ${
                      isPopular
                        ? "bg-primary text-white hover:bg-primary/90"
                        : "bg-gray-900 text-white hover:bg-gray-800"
                    }`}
                  >
                    <Link href="/signup">{ plan.name != "Pro" ? "Sign up free" : "Get Started" }</Link>
                  </Button>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <h4 className="text-sm font-medium text-gray-900">
                    What&apos;s included
                  </h4>
                  <ul role="list" className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {isPopular && (
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
    </div>
  );
}