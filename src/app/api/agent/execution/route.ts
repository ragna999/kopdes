import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";

interface Execution {
  wallet: string;
  sessionId: string;
  txHash: string;
  result?: string;
  timestamp: number;
}

// In-memory fallback
const g = globalThis as unknown as Record<string, Execution[]>;
const EXEC_KEY = "kopdes_executions";
function getMemStore(): Execution[] {
  if (!g[EXEC_KEY]) g[EXEC_KEY] = [];
  return g[EXEC_KEY];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, sessionId, txHash, result, timestamp } = body;

    if (!wallet || !sessionId || !txHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const exec: Execution = { wallet, sessionId, txHash, result, timestamp: timestamp || Date.now() };

    const r = getRedis();
    if (r) {
      await r.set(
        KEYS.executions(wallet),
        JSON.stringify([...((await r.get<Execution[]>(KEYS.executions(wallet))) || []), exec])
      );
    } else {
      getMemStore().push(exec);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  if (!wallet) return NextResponse.json({ executions: [] });

  const r = getRedis();
  let executions: Execution[] = [];

  if (r) {
    executions = (await r.get<Execution[]>(KEYS.executions(wallet))) || [];
  } else {
    executions = getMemStore().filter((e) => e.wallet.toLowerCase() === wallet.toLowerCase());
  }

  return NextResponse.json({ executions });
}
