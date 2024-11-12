import { NextResponse } from 'next/server'
import { WebsiteService } from '../../../../server/services/website.service'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const websites = await WebsiteService.getWebsites(user)
    return NextResponse.json(websites)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const website = await WebsiteService.createWebsite(user, body)
    return NextResponse.json(website, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
