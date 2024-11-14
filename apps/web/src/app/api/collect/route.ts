import { NextResponse } from "next/server";
import { Session } from "@/types";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const session: Session = await request.json();

    if (!session.siteId || !session.id || !session.events) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // const supabase = await createClient();

    console.log(session);
  } catch (error) {
    console.error("Error processing session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
//   // Only check and update verification if this is the first event
//   if (session.events.some(event => event.type === 'metadata')) {
//     const { data: website, error: websiteError } = await supabase
//       .from('websites')
//       .select('verified')
//       .eq('id', session.siteId)
//       .single()

//     if (websiteError) {
//       return NextResponse.json(
//         { error: 'Invalid website ID' },
//         { status: 400 }
//       )
//     }

//     // Only update if not already verified
//     if (!website.verified) {
//       const { error: updateError } = await supabase
//         .from('websites')
//         .update({ verified: true })
//         .eq('id', session.siteId)

//       if (updateError) {
//         console.error('Error verifying website:', updateError)
//       }
//     }
//   }

//   const processedEvents = await processEvents(session.events)

//   await addToQueue({
//     ...session,
//     events: processedEvents
//   })

//   return NextResponse.json({ success: true })

// }
