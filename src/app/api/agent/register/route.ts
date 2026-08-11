import { NextRequest, NextResponse } from "next/server";

interface RegisteredAgent {
  wallet: string;
  skills: string[];
  name?: string;
  description?: string;
  registeredAt: number;
  lastHeartbeat: number;
  status: "online" | "stale" | "offline";
}

// Singleton store — persists within same serverless instance
// globalThis survives across hot reloads in dev, persists within warm instance in prod
const g = globalThis as unknown as Record<string, Map<string, RegisteredAgent>>;
const AGENTS_KEY = "kopdes_registered_agents";

function getStore(): Map<string, RegisteredAgent> {
  if (!g[AGENTS_KEY]) {
    g[AGENTS_KEY] = new Map<string, RegisteredAgent>();
  }
  return g[AGENTS_KEY];
}

function updateStatus(agent: RegisteredAgent): RegisteredAgent {
  const now = Date.now();
  const elapsed = now - agent.lastHeartbeat;
  if (elapsed < 10 * 60 * 1000) return { ...agent, status: "online" };
  if (elapsed < 60 * 60 * 1000) return { ...agent, status: "stale" };
  return { ...agent, status: "offline" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, skills, name, description, timestamp } = body;

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    const store = getStore();
    const key = wallet.toLowerCase();
    const now = timestamp || Date.now();

    store.set(key, {
      wallet,
      skills: skills || [],
      name,
      description,
      registeredAt: store.get(key)?.registeredAt || now,
      lastHeartbeat: now,
      status: "online",
    });

    return NextResponse.json({
      success: true,
      message: "Agent registered on Kopdes",
      hirable: true,
      totalRegistered: store.size,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  const skills = req.nextUrl.searchParams.get("skills");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

  const store = getStore();

  if (wallet) {
    const agent = store.get(wallet.toLowerCase());
    return NextResponse.json({
      registered: !!agent,
      agent: agent ? updateStatus(agent) : null,
    });
  }

  let agents = Array.from(store.values()).map(updateStatus);

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
