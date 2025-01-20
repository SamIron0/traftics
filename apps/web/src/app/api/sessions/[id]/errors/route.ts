import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: errors, error } = await supabase
      .from('error_events')
      .select('*')
      .eq('session_id', id)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return NextResponse.json(errors);
  } catch (error) {
    console.error('Error fetching error events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch error events' },
      { status: 500 }
    );
  }
} 