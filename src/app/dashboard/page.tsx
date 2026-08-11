"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useEffect, useState } from "react";
import { Agent, getAgentsByOwner } from "@/lib/api";
import { AgentCard } from "@/components/agent-card";
import Link from "next/link";

interface Session {
  agent: string;
  agentName: string;
  tokenId: string;
  spendCap: string;
  expiryDays: number;
  expiryDate: string;
  userAddress: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"agent" | "human">("human");

  useEffect(() => {
    if (!address) return;
    setLoading(true);

    // Fetch agents owned by this wallet
    getAgentsByOwner(address)
      .then((res) => {
        if (res.success) {
          setMyAgents(res.data);
          if (res.data.length > 0) setTab("agent");
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    // Load sessions from localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("kopdes_sessions") || "[]");
      setSessions(stored.filter((s: Session) => s.userAddress.toLowerCase() === address.toLowerCase()));
    } catch {}
  }, [address]);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Connect Your Wallet</h1>
        <p className="text-zinc-400 mb-6">
          Connect your BSC wallet to view your agents, active sessions, and manage your marketplace presence.
        </p>
        <button
          onClick={() => connect({ connector: injected() })}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90 transition-opacity"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-zinc-400 font-mono text-sm">{address}</p>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Tabs */}
      {myAgents.length > 0 && sessions.length > 0 && (
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("agent")}
            className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
              tab === "agent"
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            Agent View ({myAgents.length})
          </button>
          <button
            onClick={() => setTab("human")}
            className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
              tab === "human"
                ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
            }`}
          >
            Human View ({sessions.length})
          </button>
        </div>
      )}

      {/* Agent View */}
      {(tab === "agent" || sessions.length === 0) && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">My Agents</h2>
          {loading ? (
            <div className="text-center py-12 text-zinc-500">
              <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Loading...
            </div>
          ) : myAgents.length === 0 ? (
            <div className="p-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 text-center">
              <p className="text-zinc-400 mb-4">No agents found for this wallet on BSC.</p>
              <p className="text-sm text-zinc-500">
                Register an agent on{" "}
                <a href="https://8004scan.io" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
                  8004scan.io
                </a>{" "}
                to get started.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Human View */}
      {(tab === "human" || myAgents.length === 0) && (
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">My Hired Agents</h2>
          {sessions.length === 0 ? (
            <div className="p-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 text-center">
              <p className="text-zinc-400 mb-4">No active sessions.</p>
              <Link href="/agents" className="text-yellow-400 hover:underline text-sm">
                Browse agents to hire one →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s, i) => (
                <div key={i} className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 flex items-center justify-between">
                  <div>
                    <Link href={`/agent/56/${s.tokenId}`} className="font-medium hover:text-yellow-400 transition-colors">
                      {s.agentName}
                    </Link>
                    <p className="text-xs text-zinc-500 mt-1">
                      Token #{s.tokenId} · Created {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-yellow-400 font-medium">{s.spendCap}</p>
                    <p className="text-xs text-zinc-500">{s.expiryDays}d expiry</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* SDK Status */}
      <section>
        <h2 className="text-xl font-bold mb-4">Agent SDK</h2>
        <div className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-zinc-600" />
            <span className="text-zinc-400">Not connected</span>
          </div>
          <p className="text-sm text-zinc-500 mb-4">
            Install the Agent SDK to receive hire notifications and manage sessions.
          </p>
          <div className="p-3 rounded-lg bg-zinc-950 font-mono text-sm text-zinc-300 mb-3">
            npm install @kopdes/sdk
          </div>
          <div className="p-3 rounded-lg bg-zinc-950 font-mono text-xs text-zinc-400">
            {`import { KopdesAgent } from '@kopdes/sdk';
const agent = new AgentBazaar({ wallet: '0x...', skills: ['swap'] });
agent.on('hired', async (session) => { /* execute */ });
agent.connect();`}
          </div>
        </div>
      </section>
    </div>
  );
}
