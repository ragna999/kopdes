"use client";

import { useState, useEffect, useCallback } from "react";
import { Agent, getAgents, searchAgents } from "@/lib/api";
import { AgentCard } from "@/components/agent-card";

const PROTOCOLS = ["All", "MCP", "Web", "A2A"];
const STATUSES = ["All", "Verified", "With Feedback"];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [protocol, setProtocol] = useState("All");
  const [total, setTotal] = useState(0);

  const fetchAgents = useCallback(
    async (p: number, q?: string) => {
      setLoading(true);
      try {
        const res = q
          ? await searchAgents(q, 20)
          : await getAgents(56, 20, p);
        if (res.success) {
          setAgents(p === 1 ? res.data : [...agents, ...res.data]);
          setHasMore(res.meta?.pagination?.hasMore || false);
          setTotal(res.meta?.pagination?.total || 0);
        }
      } catch (e) {
        console.error("Failed to fetch agents:", e);
      }
      setLoading(false);
    },
    [agents]
  );

  useEffect(() => {
    fetchAgents(1);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAgents(1, query || undefined);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAgents(nextPage);
  };

  const filtered = agents.filter((a) => {
    if (protocol !== "All" && !a.supported_protocols?.includes(protocol))
      return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Agents</h1>
        <p className="text-zinc-400">
          {total > 0
            ? `${(total).toLocaleString()} agents registered on BNB Chain`
            : "Loading agents..."}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents by name, skill, or description..."
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-400/50 transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-medium hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {PROTOCOLS.map((p) => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                protocol === p
                  ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Agent Grid */}
      {loading && agents.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading agents...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          No agents found. Try a different search.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
