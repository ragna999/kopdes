import { NextRequest, NextResponse } from "next/server";
import { getRedis, KEYS } from "@/lib/redis";

interface RegisteredAgent {
  wallet: string;
  skills: string[];
  name?: string;
  description?: string;
  registeredAt: number;
  lastHeartbeat: number;
  status: "online" | "stale" | "offline";
}

// In-memory fallback
const g = globalThis as unknown as Record<string, Map<string, RegisteredAgent>>;
const AGENTS_KEY = "kopdes_registered_agents";
function getMemStore(): Map<string, RegisteredAgent> {
  if (!g[AGENTS_KEY]) g[AGENTS_KEY] = new Map();
  return g[AGENTS_KEY];
}

function updateStatus(agent: RegisteredAgent): RegisteredAgent {
  const now = Date.now();
  const elapsed = now - agent.lastHeartbeat;
  if (elapsed < 10 * 60 * 1000) return { ...agent, status: "online" };
  if (elapsed < 60 * 60 * 1000) return { ...agent, status: "stale" };
  return { ...agent, status: "offline" };
}

async function saveAgent(agent: RegisteredAgent) {
  const r = getRedis();
  if (r) {
    const key = KEYS.agent(agent.wallet);
    await r.set(key, JSON.stringify(agent));
    await r.sadd(KEYS.agents(), agent.wallet.toLowerCase());
  } else {
    getMemStore().set(agent.wallet.toLowerCase(), agent);
  }
}

async function getAgent(wallet: string): Promise<RegisteredAgent | null> {
  const r = getRedis();
  if (r) {
    const data = await r.get<string>(KEYS.agent(wallet));
    if (typeof data === "string") return JSON.parse(data);
    return data as RegisteredAgent | null;
  }
  return getMemStore().get(wallet.toLowerCase()) || null;
}

async function getAllAgents(): Promise<RegisteredAgent[]> {
  const r = getRedis();
  if (r) {
    const members = await r.smembers<string[]>(KEYS.agents());
    if (!members || members.length === 0) return [];
    const pipeline = r.pipeline();
    for (const w of members) {
      pipeline.get(KEYS.agent(w));
    }
    const results = await pipeline.exec<(string | null)[]>();
    return results
      .map((d) => {
        if (!d) return null;
        if (typeof d === "string") return JSON.parse(d) as RegisteredAgent;
        return d as RegisteredAgent;
      })
      .filter(Boolean) as RegisteredAgent[];
  }
  return Array.from(getMemStore().values());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, skills, name, description, timestamp } = body;

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    const now = timestamp || Date.now();
    const existing = await getAgent(wallet);

    const agent: RegisteredAgent = {
      wallet,
      skills: skills || [],
      name,
      description,
      registeredAt: existing?.registeredAt || now,
      lastHeartbeat: now,
      status: "online",
    };

    await saveAgent(agent);

    const r = getRedis();
    return NextResponse.json({
      success: true,
      message: "Agent registered on Kopdes",
      hirable: true,
      storage: r ? "redis" : "memory",
    });
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  const skills = req.nextUrl.searchParams.get("skills");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

  if (wallet) {
    const agent = await getAgent(wallet);
    return NextResponse.json({
      registered: !!agent,
      agent: agent ? updateStatus(agent) : null,
    });
  }

  let agents = (await getAllAgents()).map(updateStatus);

  if (skills) {
    const skillFilter = skills.split(",").map((s) => s.trim().toLowerCase());
    agents = agents.filter((a) =>
      a.skills.some((s) => skillFilter.includes(s.toLowerCase()))
    );
  }

  agents.sort((a, b) => b.lastHeartbeat - a.lastHeartbeat);

  return NextResponse.json({
    total: agents.length,
    agents: agents.slice(0, limit),
  });
}
