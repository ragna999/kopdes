"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Agent,
  AgentFilters,
  Protocol,
  SortField,
  SortOrder,
  getAgents,
  searchAgents,
  formatNumber,
} from "@/lib/api";
import { AgentCard } from "@/components/agent-card";

const PROTOCOLS: (Protocol | "All")[] = ["All", "MCP", "A2A", "OASF", "Web", "Email"];
const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "created_at", label: "Newest" },
  { value: "total_score", label: "Best Score" },
  { value: "stars", label: "Most Starred" },
  { value: "name", label: "Name (A-Z)" },
];

export default function AgentsContent() {
  const searchParams = useSearchParams();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [protocol, setProtocol] = useState<Protocol | "All">(
    (searchParams.get("protocol") as Protocol) || "All"
  );
  const [sortBy, setSortBy] = useState<SortField>(
    (searchParams.get("sort") as SortField) || "created_at"
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(
    (searchParams.get("order") as SortOrder) || "desc"
  );
  const [ownerSearch, setOwnerSearch] = useState(searchParams.get("owner") || "");

  const fetchAgents = useCallback(
    async (p: number, append = false) => {
      setLoading(true);
      try {
        const useSearch = search.trim().length > 0 && !search.trim().startsWith("0x");
        let res;

        if (useSearch) {
          res = await searchAgents(search.trim(), 20);
        } else {
          const filters: AgentFilters = {
            page: p,
            limit: 20,
            sortBy,
            sortOrder,
          };
          if (protocol !== "All") filters.protocol = protocol;
          if (search.trim().startsWith("0x")) {
            filters.ownerAddress = search.trim();
          } else if (ownerSearch.trim().startsWith("0x")) {
            filters.ownerAddress = ownerSearch.trim();
          }
          res = await getAgents(filters);
        }

        if (res.success) {
          setAgents(append ? [...agents, ...res.data] : res.data);
          setHasMore(res.meta?.pagination?.hasMore ?? res.data.length === 20);
          setTotal(res.meta?.pagination?.total || res.data.length);
        }
      } catch (e) {
        console.error("Failed to fetch agents:", e);
      }
      setLoading(false);
    },
    [search, protocol, sortBy, sortOrder, ownerSearch, agents]
  );

  useEffect(() => {
    setPage(1);
    fetchAgents(1);
  }, [protocol, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAgents(1);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAgents(nextPage, true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Agents</h1>
        <p className="text-zinc-400">
          {total > 0 ? `${total.toLocaleString()} agents on BNB Chain` : "Loading..."}
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, skill, or paste owner address (0x...)"
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:border-yellow-400/50 transition-colors"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-medium hover:opacity-90 transition-opacity"
          >
            Search
          </button>
        </div>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPage(1);
              setTimeout(() => fetchAgents(1), 0);
            }}
            className="mt-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear search
          </button>
        )}
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500 mr-1">Protocol:</span>
          {PROTOCOLS.map((p) => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                protocol === p
                  ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-zinc-800 hidden sm:block" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-zinc-500 mr-1">Sort:</span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                sortBy === opt.value
                  ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                  : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button
            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
            className="text-xs px-2 py-1 rounded-lg border border-zinc-800 text-zinc-400 hover:border-zinc-700"
            title={sortOrder === "desc" ? "Descending" : "Ascending"}
          >
            {sortOrder === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && agents.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          Loading agents...
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          No agents found. Try adjusting your filters.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
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
