"use client";

import Link from "next/link";
import { Agent, getAgentHealth, formatNumber, timeAgo } from "@/lib/api";

export function AgentCard({ agent }: { agent: Agent }) {
  const health = getAgentHealth(agent);

  return (
    <Link
      href={`/agent/${agent.chain_id}/${agent.token_id}`}
      className="group block p-5 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0">
          {agent.image_url ? (
            <img
              src={agent.image_url}
              alt={agent.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-zinc-500">
              {agent.name?.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate group-hover:text-yellow-400 transition-colors">
              {agent.name}
            </h3>
            {agent.is_verified && (
              <svg className="w-4 h-4 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-xs text-zinc-500 truncate mb-2">
            {agent.description || "No description"}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${health.bg} ${health.color} font-medium`}>
              {health.label}
            </span>
            {agent.supported_protocols?.map((p) => (
              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                {p}
              </span>
            ))}
            {agent.x402_supported && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-400/10 text-purple-400">
                x402
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <span>
            Score:{" "}
            <span className={agent.average_score >= 70 ? "text-emerald-400" : agent.average_score >= 40 ? "text-yellow-400" : "text-zinc-300"}>
              {agent.average_score || 0}
            </span>
          </span>
          <span>Feedbacks: <span className="text-zinc-300">{formatNumber(agent.total_feedbacks)}</span></span>
          {agent.star_count > 0 && <span>⭐ {agent.star_count}</span>}
        </div>
        <span>{timeAgo(agent.updated_at)}</span>
      </div>
    </Link>
  );
}
