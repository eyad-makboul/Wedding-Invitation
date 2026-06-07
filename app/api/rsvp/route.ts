import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, guests, status } = body as {
      name?: string;
      phone?: string;
      guests?: number;
      status?: string;
    };

    if (!name || !phone || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rsvp = await prisma.rsvp.create({
      data: {
        name,
        phone,
        guests: Number(guests) || 1,
        status,
      },
    });

    return NextResponse.json({ ok: true, rsvp });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
