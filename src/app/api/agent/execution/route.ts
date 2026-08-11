import { NextRequest, NextResponse } from "next/server";

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
    const { wallet, sessionId, txHash, result, timestamp } = body;

    if (!wallet || !sessionId || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    executions.push({
      wallet,
      sessionId,
      txHash,
      result,
      timestamp: timestamp || Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ executions: [] });
  }
  const filtered = executions.filter(e => e.wallet.toLowerCase() === wallet.toLowerCase());
  return NextResponse.json({ executions: filtered });
}
