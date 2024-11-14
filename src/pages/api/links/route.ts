import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Link from '@/models/Link';

export async function GET() {
  try {
    await dbConnect();
    const links = await Link.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(6);
    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { message: 'Failed to fetch links' },
      { status: 500 }
    );
  }
}