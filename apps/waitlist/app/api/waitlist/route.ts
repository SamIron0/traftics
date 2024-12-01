import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();
    
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('waitlist_contacts')
      .insert([{ name, email }]);

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You are already on the waitlist!' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { message: 'Successfully joined waitlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}