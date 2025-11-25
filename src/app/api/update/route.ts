import { updateUserData } from '@/lib/db/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();
    
    // In a real app, validate permissions or rate limits here
    
    await updateUserData(username || 'global_mock');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
