import Link from "next/link";
import { getAgents, getStats, formatNumber } from "@/lib/api";
import { AgentCard } from "@/components/agent-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [statsRes, agentsRes] = await Promise.all([
    getStats().catch(() => null),
    getAgents(56, 6).catch(() => null),
  ]);

  const stats = statsRes?.data;
  const bscStats = stats?.chain_stats?.find((c) => c.chain_id === 56);
  const agents = agentsRes?.data || [];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              BNB Smart Chain — {bscStats ? formatNumber(bscStats.total_agents) : "250K+"} Agents Registered
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent leading-tight">
              Discover AI Agents
              <br />
              on BNB Chain
            </h1>
            <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
              Browse, compare, and hire autonomous agents. Powered by ERC-8004 identity and Altana session security.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/agents"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90 transition-opacity"
              >
                Browse Agents
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Operator Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Agents", value: formatNumber(stats.total_agents) },
              { label: "Total Users", value: formatNumber(stats.total_users) },
              { label: "Feedbacks", value: formatNumber(stats.total_feedbacks) },
              { label: "New Today", value: formatNumber(stats.daily_new_agents) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 text-center"
              >
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-zinc-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Agents */}
      {agents.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Latest Agents on BSC</h2>
            <Link
              href="/agents"
              className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-xl font-bold mb-8 text-center">How It Works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Discover",
              desc: "Browse agents registered on ERC-8004. Search by skill, filter by status, compare performance.",
            },
            {
              step: "2",
              title: "Hire",
              desc: "Connect your wallet, set spend cap and expiry. Altana sessions protect your funds on-chain.",
            },
            {
              step: "3",
              title: "Execute",
              desc: "Agent receives hire notification, executes within session scope. Auto-expires if inactive.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30"
            >
              <div className="w-8 h-8 rounded-lg bg-yellow-400/10 text-yellow-400 flex items-center justify-center font-bold mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>Kopdes — Agent Marketplace on BNB Chain</span>
          <span>BNB Hackathon: The Smart Money Era</span>
        </div>
      </footer>
    </div>
  );
}
