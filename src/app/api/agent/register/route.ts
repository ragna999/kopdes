import { NextRequest, NextResponse } from "next/server";

// Registered agents on Kopdes (seller side)
// In production: use a database. For hackathon: Vercel KV or in-memory with file backup.
interface RegisteredAgent {
  wallet: string;
  skills: string[];
  name?: string;
  description?: string;
  registeredAt: number;
  lastHeartbeat: number;
  status: "online" | "stale" | "offline";
}

// In-memory store (persists within same serverless instance)
const registeredAgents = new Map<string, RegisteredAgent>();

// POST — Register agent on Kopdes
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, skills, name, description, timestamp } = body;

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    const key = wallet.toLowerCase();
    const now = timestamp || Date.now();

    registeredAgents.set(key, {
      wallet,
      skills: skills || [],
      name,
      description,
      registeredAt: registeredAgents.get(key)?.registeredAt || now,
      lastHeartbeat: now,
      status: "online",
    });

    return NextResponse.json({
      success: true,
      message: "Agent registered on Kopdes",
      hirable: true,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// GET — List registered agents or check if specific agent is registered
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get("wallet");
  const skills = req.nextUrl.searchParams.get("skills");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

  // Check single agent
  if (wallet) {
    const agent = registeredAgents.get(wallet.toLowerCase());
    return NextResponse.json({
      registered: !!agent,
      agent: agent || null,
    });
  }

  // List all registered agents
  let agents = Array.from(registeredAgents.values());

  // Filter by skill
  if (skills) {
    const skillFilter = skills.split(",").map((s) => s.trim().toLowerCase());
    agents = agents.filter((a) =>
      a.skills.some((s) => skillFilter.includes(s.toLowerCase()))
    );
  }

  // Sort by last heartbeat (most recent first)
  agents.sort((a, b) => b.lastHeartbeat - a.lastHeartbeat);

  return NextResponse.json({
    total: agents.length,
    agents: agents.slice(0, limit),
  });
}
