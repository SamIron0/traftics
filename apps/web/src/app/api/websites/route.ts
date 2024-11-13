import { NextResponse } from 'next/server'
import { WebsiteService } from '../../../../server/services/website.service';
import { getAuthUser } from '@/lib/auth'

interface ApiError {
  message: string;
  code?: string;
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const websites = await WebsiteService.getWebsites(user)
    return NextResponse.json(websites)
  } catch (error) {
    const apiError = error as ApiError
    return NextResponse.json({ error: apiError.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const website = await WebsiteService.createWebsite(user, body)
    return NextResponse.json(website, { status: 201 })
  } catch (error) {
    const apiError = error as ApiError
    return NextResponse.json({ error: apiError.message }, { status: 400 })
  }
}
