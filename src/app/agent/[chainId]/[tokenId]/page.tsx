import { getAgent, getAgentStatus, formatNumber, timeAgo } from "@/lib/api";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ chainId: string; tokenId: string }>;
}) {
  const { chainId, tokenId } = await params;

  let agent;
  try {
    const res = await getAgent(parseInt(chainId), tokenId);
    if (!res.success) notFound();
    agent = res.data;
  } catch {
    notFound();
  }

  const status = getAgentStatus(agent);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/agents"
        className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6 inline-block"
      >
        ← Back to Agents
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
        <div className="w-20 h-20 rounded-2xl bg-zinc-800 overflow-hidden shrink-0">
          {agent.image_url ? (
            <img
              src={agent.image_url}
              alt={agent.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-zinc-500">
              {agent.name?.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            {agent.is_verified && (
              <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-zinc-400 mb-4">{agent.description || "No description provided."}</p>
          <div className="flex flex-wrap gap-2">
            <span className={`text-xs px-3 py-1 rounded-full ${status.bg} ${status.color} font-medium`}>
              {status.label}
            </span>
            {agent.supported_protocols?.map((p) => (
              <span key={p} className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400">
                {p}
              </span>
            ))}
            {agent.x402_supported && (
              <span className="text-xs px-3 py-1 rounded-full bg-purple-400/10 text-purple-400">
                x402 Payments
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-2xl border border-zinc-800/50 bg-zinc-900/50">
          <h3 className="text-sm text-zinc-500 mb-3">Identity</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Agent ID</span>
              <span className="font-mono text-zinc-200 truncate max-w-[200px]">{agent.agent_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Token ID</span>
              <span className="font-mono text-zinc-200">{agent.token_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Contract</span>
              <span className="font-mono text-zinc-200 truncate max-w-[200px]">{agent.contract_address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Owner</span>
              <span className="font-mono text-zinc-200 truncate max-w-[200px]">{agent.owner_address}</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-zinc-800/50 bg-zinc-900/50">
          <h3 className="text-sm text-zinc-500 mb-3">Performance</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-400">Average Score</span>
              <span className="text-zinc-200">{agent.average_score?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Total Feedbacks</span>
              <span className="text-zinc-200">{formatNumber(agent.total_feedbacks)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Health Score</span>
              <span className="text-zinc-200">{agent.health_score ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Stars</span>
              <span className="text-zinc-200">{agent.star_count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="p-5 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 mb-8">
        <h3 className="text-sm text-zinc-500 mb-3">Activity</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Created</span>
            <span className="text-zinc-200">{timeAgo(agent.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Last Updated</span>
            <span className="text-zinc-200">{timeAgo(agent.updated_at)}</span>
          </div>
          {agent.rank && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Global Rank</span>
              <span className="text-zinc-200">#{agent.rank}</span>
            </div>
          )}
          {agent.network_rank && (
            <div className="flex justify-between">
              <span className="text-zinc-400">Network Rank</span>
              <span className="text-zinc-200">#{agent.network_rank}</span>
            </div>
          )}
        </div>
      </div>

      {/* Hire CTA */}
      <div className="p-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 text-center">
        <h3 className="text-lg font-bold mb-2">Hire This Agent</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Connect your wallet to create an Altana session with this agent. Set a spend cap and expiry to protect your funds.
        </p>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90 transition-opacity">
          Connect Wallet to Hire
        </button>
      </div>
    </div>
  );
}
