import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createOrRetrieveCustomer } from "@/utils/supabase/admin";
import Stripe from "stripe";
import { stripe } from "@/utils/stripe/config";

import {
  getURL,
  getErrorRedirect,
  calculateTrialEndUnixTimestamp,
} from "@/utils/helpers";

export async function POST(request: Request) {
  const { price, redirectPath } = await request.json();

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const {
      error,
      data: { user },
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error(error);
      throw new Error("Could not get user session.");
    }

    let customer: string;
    try {
      customer = await createOrRetrieveCustomer({
        uuid: user?.id || "",
        email: user?.email || "",
      });
    } catch (err) {
      console.error(err);
      throw new Error("Unable to access customer record.");
    }

    let params: Stripe.Checkout.SessionCreateParams = {
      allow_promotion_codes: true,
      billing_address_collection: "required",
      customer,
      customer_update: {
        address: "auto",
      },
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      cancel_url: getURL(),
      success_url: "https://traftics.ironkwe.com",
    };

  
    if (price.type === "recurring") {
      params = {
        ...params,
        mode: "subscription",
        subscription_data: {
          trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days),
        },
      };
    } else if (price.type === "one_time") {
      params = {
        ...params,
        mode: "payment",
      };
    }

    let stripe_session;
    try {
      stripe_session = await stripe.checkout.sessions.create(params);
    } catch (err) {
      console.error(err);
      throw new Error("Unable to create checkout session.");
    }

    if (stripe_session) {
      return NextResponse.json({ sessionId: stripe_session.id });
    } else {
      throw new Error("Unable to create checkout session.");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          errorRedirect: getErrorRedirect(
            redirectPath,
            error.message,
            "Please try again later or contact a system administrator."
          ),
        },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        {
          error: "An unknown error occurred.",
          errorRedirect: getErrorRedirect(
            redirectPath,
            "An unknown error occurred.",
            "Please try again later or contact a system administrator."
          ),
        },
        { status: 500 }
      );
    }
  }
}
