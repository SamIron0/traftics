import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("sessions")
      .update({ is_played: true })
      .eq("id", id);

    if (error) {
      throw error;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking session as played:", error);
    return NextResponse.json(
      { error: "Failed to mark session as played" },
      { status: 500 }
    );
  }
} 