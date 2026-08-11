import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";

interface Hire {
  id: string;
  human: string;
  spendCap: string;
  expiry: number;
  skills: string[];
  task?: string;
  hiredAt: number;
}

// In-memory fallback
const g = globalThis as unknown as Record<string, Map<string, Hire[]>>;
const HIRES_KEY = "kopdes_hires";
function getMemStore(): Map<string, Hire[]> {
  if (!g[HIRES_KEY]) g[HIRES_KEY] = new Map();
  return g[HIRES_KEY];
}

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet param" }, { status: 400 });
  }

  const r = getRedis();
  let hires: Hire[] = [];

  if (r) {
    const data = await r.get<Hire[]>(KEYS.hires(wallet));
    hires = data || [];
    // Clear after fetching
    if (hires.length > 0) await r.del(KEYS.hires(wallet));
  } else {
    const store = getMemStore();
    hires = store.get(wallet.toLowerCase()) || [];
    store.delete(wallet.toLowerCase());
  }

  return NextResponse.json({ hires });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentWallet, human, spendCap, expiry, skills, task } = body;

    if (!agentWallet || !human) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const hire: Hire = {
      id: `hire_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      human,
      spendCap: spendCap || "0",
      expiry: expiry || Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      skills: skills || [],
      task,
      hiredAt: Date.now(),
    };

    const r = getRedis();
    if (r) {
      const existing = (await r.get<Hire[]>(KEYS.hires(agentWallet))) || [];
      existing.push(hire);
      await r.set(KEYS.hires(agentWallet), JSON.stringify(existing));
    } else {
      const store = getMemStore();
      const key = agentWallet.toLowerCase();
      if (!store.has(key)) store.set(key, []);
      store.get(key)!.push(hire);
    }

    return NextResponse.json({ success: true, hireId: hire.id });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
