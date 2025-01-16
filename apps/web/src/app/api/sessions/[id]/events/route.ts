import { NextResponse } from "next/server";
import { SessionEventService } from "@/server/services/sessionEvent.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const events = await SessionEventService.getSessionEvents(id);
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching session events:", error);
    return NextResponse.json(
      { error: "Failed to fetch session events" },
      { status: 500 }
    );
  }
}
