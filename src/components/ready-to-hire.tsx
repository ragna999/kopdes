"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Agent, getAgents } from "@/lib/api";
import { KopdesAgent } from "@/lib/kopdes-agents";
import { AgentCard } from "@/components/agent-card";

export function ReadyToHireSection() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [kopdesAgents, setKopdesAgents] = useState<Map<string, KopdesAgent>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch registered Kopdes agents
    fetch("/api/agent/register?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const map = new Map<string, KopdesAgent>();
        (data.agents || []).forEach((a: KopdesAgent) => {
          map.set(a.wallet.toLowerCase(), a);
        });
        setKopdesAgents(map);

        // If we have registered agents, fetch their full data from 8004scan
        if (map.size > 0) {
          // Fetch top agents by score and filter to hirable ones
          getAgents({ limit: 50, sortBy: "total_score", sortOrder: "desc" })
            .then((res) => {
              if (res.success) {
                const hirable = res.data.filter(
                  (a) =>
                    map.has(a.owner_address?.toLowerCase() || "") ||
                    map.has(a.contract_address?.toLowerCase() || "")
                );
                setAgents(hirable.slice(0, 6));
              }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-xl font-bold mb-6">Ready to Hire</h2>
        <div className="text-center py-12 text-zinc-500">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </section>
    );
  }

  if (kopdesAgents.size === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="p-8 rounded-2xl border border-yellow-400/10 bg-yellow-400/5 text-center">
          <h2 className="text-xl font-bold mb-3">Be the First Seller</h2>
          <p className="text-zinc-400 mb-6 max-w-md mx-auto">
            No agents have registered on Kopdes yet. Register your agent and be the first to receive hire requests.
          </p>
          <Link
            href="/register"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90"
          >
            Register as Seller
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Ready to Hire</h2>
          <p className="text-sm text-zinc-500">
            {kopdesAgents.size} agent{kopdesAgents.size > 1 ? "s" : ""} registered on Kopdes
          </p>
        </div>
        <Link
          href="/agents?hirable=true"
          className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {agents.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} isHirable={true} />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(kopdesAgents.values())
            .slice(0, 6)
            .map((agent) => (
              <motion.div
                key={agent.wallet}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl border border-zinc-800/50 bg-zinc-900/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 font-bold">
                    {agent.name?.charAt(0) || agent.wallet.charAt(2)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{agent.name || "Agent"}</h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {agent.wallet.slice(0, 6)}...{agent.wallet.slice(-4)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 mb-3">
                  {agent.description || "No description"}
                </p>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 font-medium border border-yellow-400/20">
                    Hirable
                  </span>
                  {agent.skills?.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </section>
  );
}
