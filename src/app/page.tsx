import Link from "next/link";
import { getAgents, getStats, formatNumber } from "@/lib/api";
import { AgentCard } from "@/components/agent-card";
import { AnimatedHero } from "@/components/animated-hero";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [statsRes, agentsRes] = await Promise.all([
    getStats().catch(() => null),
    getAgents({ limit: 6, sortBy: "created_at", sortOrder: "desc" }).catch(() => null),
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
          <AnimatedHero
            totalAgents={bscStats ? formatNumber(bscStats.total_agents) : "250K+"}
            totalUsers={stats ? formatNumber(stats.total_users) : "300K+"}
            totalFeedbacks={stats ? formatNumber(stats.total_feedbacks) : "3M+"}
            dailyNew={stats ? formatNumber(stats.daily_new_agents) : "2K+"}
          />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
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
      </section>

      {/* Stats */}
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
