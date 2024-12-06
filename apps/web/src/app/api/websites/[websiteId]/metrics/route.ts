import { createClient } from "@/utils/supabase/server";
import {NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string }> }
) {
  try {
    const supabase = await createClient();
    const { websiteId } = await params;
    // Get metrics from materialized view
    const { data: metrics, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .eq('site_id', websiteId)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      total_sessions: metrics.total_sessions,
      avg_duration: metrics.avg_duration,
      pages_per_session: metrics.pages_per_session,
      bounce_rate: 0, // TODO: Add bounce rate calculation to materialized view
      top_pages: metrics.top_pages || []
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
} 