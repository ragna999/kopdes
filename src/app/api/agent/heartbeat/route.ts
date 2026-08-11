import { NextRequest, NextResponse } from "next/server";

const heartbeats = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, timestamp } = body;

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    heartbeats.set(wallet.toLowerCase(), timestamp || Date.now());

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
