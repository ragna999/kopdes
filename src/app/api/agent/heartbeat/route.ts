import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, timestamp } = body;

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    const r = getRedis();
    if (r) {
      await r.set(KEYS.heartbeat(wallet), String(timestamp || Date.now()));
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
