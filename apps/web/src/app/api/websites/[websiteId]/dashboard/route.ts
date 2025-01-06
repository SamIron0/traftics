import { getDashboardDataCached } from '@/utils/cache';
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ websiteId: string }> }
) {
    try {
        const { websiteId } = await params;
        const supabase = await createClient();
        
        const data = await getDashboardDataCached(websiteId, supabase);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}