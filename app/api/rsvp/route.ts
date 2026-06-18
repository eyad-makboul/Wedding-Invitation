import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongoose';
import { Rsvp } from '@/models/Rsvp';

export async function POST(request: Request) {
  try {
    // 1. اتصل بالداتابيز أولاً
    await dbConnect();

    // 2. اقرأ البيانات
    const body = await request.json();
    const { name, guests, status } = body;

    if (!name || !status) {
      return NextResponse.json({ error: 'Name and status are required' }, { status: 400 });
    }

    // 3. احفظ مباشرة عبر الموديل
    const newRsvp = await Rsvp.create({
      name,
      guests: Number(guests) || 1,
      status,
    });

    return NextResponse.json({ success: true, data: newRsvp }, { status: 201 });
  } catch (error: any) {
    console.error('Mongoose RSVP Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}