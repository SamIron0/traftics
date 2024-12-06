import { createClient } from "./server";
import { cache } from "react";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async () => {
  const supabase = await createClient();
  const { data: subscription} = await supabase
    .from("subscriptions")
    .select("*, prices(*, products(*))")
    .in("status", ["trialing", "active"])
    .maybeSingle();

  return subscription;
});

export const getProducts = cache(async () => {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, prices(*)")
    .eq("active", true)
    .eq("prices.active", true)
    .order("metadata->index")
    .order("unit_amount", { referencedTable: "prices" });
  return products;
});

export const getUserDetails = cache(async () => {
  const supabase = await createClient();
  const { data: userDetails } = await supabase
    .from("users")
    .select("*")
    .single();
  return userDetails;
});
