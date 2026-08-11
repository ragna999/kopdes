import { NextRequest, NextResponse } from "next/server";

// Shared store (demo)
const hireQueue = new Map<string, Array<{
  id: string;
  human: string;
  spendCap: string;
  expiry: number;
  skills: string[];
  task?: string;
  hiredAt: number;
}>>();

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet param" }, { status: 400 });
  }

  const hires = hireQueue.get(wallet.toLowerCase()) || [];

  // Clear after fetching (consume once)
  hireQueue.delete(wallet.toLowerCase());

  return NextResponse.json({ hires });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentWallet, human, spendCap, expiry, skills, task } = body;

    if (!agentWallet || !human) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const key = agentWallet.toLowerCase();
    if (!hireQueue.has(key)) hireQueue.set(key, []);

    const hire = {
      id: `hire_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      human,
      spendCap: spendCap || "0",
      expiry: expiry || Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      skills: skills || [],
      task,
      hiredAt: Date.now(),
    };

    hireQueue.get(key)!.push(hire);

    return NextResponse.json({ success: true, hireId: hire.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
