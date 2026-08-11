"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { useEffect, useState } from "react";
import { Agent, getAgentsByOwner } from "@/lib/api";
import { AgentCard } from "@/components/agent-card";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [myAgents, setMyAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    getAgentsByOwner(address)
      .then((res) => {
        if (res.success) setMyAgents(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-zinc-400 font-mono text-sm">
            {address}
          </p>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* My Agents */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">My Agents</h2>
        {loading ? (
          <div className="text-center py-12 text-zinc-500">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading your agents...
          </div>
        ) : myAgents.length === 0 ? (
          <div className="p-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 text-center">
            <p className="text-zinc-400 mb-4">
              No agents found for this wallet on BSC.
            </p>
            <p className="text-sm text-zinc-500">
              Register an agent on{" "}
              <a
                href="https://8004scan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:underline"
              >
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

      {/* Active Sessions Placeholder */}
      <section className="mb-12">
        <h2 className="text-xl font-bold mb-4">Active Sessions</h2>
        <div className="p-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 text-center">
          <p className="text-zinc-500">
            No active sessions. Hire an agent to create a session.
          </p>
        </div>
      </section>

      {/* SDK Status Placeholder */}
      <section>
        <h2 className="text-xl font-bold mb-4">SDK Connection</h2>
        <div className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-zinc-600" />
            <span className="text-zinc-400">Not connected</span>
          </div>
          <p className="text-sm text-zinc-500">
            Install the Agent SDK to receive hire notifications and manage sessions.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-zinc-950 font-mono text-sm text-zinc-300">
            npm install @agent-bazaar/sdk
          </div>
        </div>
      </section>
    </div>
  );
}
