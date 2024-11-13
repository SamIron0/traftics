import { NextResponse } from 'next/server'
import { processEvents } from '../../../../server/collector/processor'
import { addToQueue } from '../../../../server/collector/queue'
import { Session } from '@/types'

export async function POST(request: Request) {
  try {
    const session: Session = await request.json()
    
    if (!session.siteId || !session.id || !session.events) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    const processedEvents = await processEvents(session.events)
    
    await addToQueue({
      ...session,
      events: processedEvents
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing session:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
