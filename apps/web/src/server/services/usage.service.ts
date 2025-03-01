import { createClient } from "@/utils/supabase/server";
import { PRICING_PLANS } from "@/config/pricing";

interface UsageQuota {
  used: number;
  limit: number;
  remaining: number;
}

export class UsageService {
  static async getQuota(siteId: string, org_id: string): Promise<UsageQuota> {
    const supabase = await createClient();

    // Get current subscription
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("price_id, current_period_start, current_period_end")
      .eq("org_id", org_id)
      .in("status", ["trialing", "active"])
      .single();

    // Get current date for fallback period
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get session count for current period
    const { count } = await supabase
      .from("sessions")
      .select("id", { count: "exact" })
      .eq("site_id", siteId)
      .gte(
        "started_at",
        subscription?.current_period_start || startOfMonth.toISOString()
      )
      .lte(
        "started_at",
        subscription?.current_period_end || endOfMonth.toISOString()
      );

    // Determine limit based on subscription
    const plan =
      PRICING_PLANS.find((p) => p.id === subscription?.price_id) ||
      PRICING_PLANS[0];

    return {
      used: count || 0,
      limit: plan.limits.sessions,
      remaining: Math.max(0, plan.limits.sessions - (count || 0)),
    };
  }

  static async checkQuota(siteId: string, org_id: string): Promise<boolean> {
    const quota = await this.getQuota(siteId, org_id);
    return quota.remaining > 0;
  }

  static async isApproachingQuota(
    siteId: string,
    org_id: string,
    threshold: number = 0.9
  ): Promise<boolean> {
    const quota = await this.getQuota(siteId, org_id);
    return quota.used / quota.limit >= threshold;
  }
}
