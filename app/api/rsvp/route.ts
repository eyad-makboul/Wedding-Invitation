import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, guests, status } = body as {
      name?: string;
      guests?: number;
      status?: string;
    };

    if (!name || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rsvp = await prisma.rsvp.create({
      data: {
        name,
        guests: Number(guests) || 1,
        status,
      },
    });

    return NextResponse.json({ ok: true, rsvp });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}