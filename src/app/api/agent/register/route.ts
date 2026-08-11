import { NextRequest, NextResponse } from "next/server";

// In-memory store (demo — production would use a database)
const agentRegistry = new Map<string, {
  wallet: string;
  skills: string[];
  lastHeartbeat: number;
  connectedAt: number;
}>();

const hireQueue = new Map<string, Array<{
  id: string;
  human: string;
  spendCap: string;
  expiry: number;
  skills: string[];
  task?: string;
  hiredAt: number;
}>>();

const executions: Array<{
  wallet: string;
  sessionId: string;
  txHash: string;
  result?: string;
  timestamp: number;
}> = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, skills, timestamp } = body;

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    agentRegistry.set(wallet.toLowerCase(), {
      wallet,
      skills: skills || [],
      lastHeartbeat: timestamp || Date.now(),
      connectedAt: Date.now(),
    });

    return NextResponse.json({ success: true, message: "Agent registered" });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
