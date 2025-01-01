import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: pages, error } = await supabase
      .from('page_events')
      .select('*')
      .eq('session_id', id)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Error fetching page events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch page events' },
      { status: 500 }
    );
  }
} 