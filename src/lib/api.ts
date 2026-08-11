const API_BASE = process.env.NEXT_PUBLIC_8004SCAN_API || "https://8004scan.io/api/v1/public";

export interface Agent {
  id: string;
  agent_id: string;
  token_id: string;
  chain_id: number;
  contract_address: string;
  owner_address: string;
  name: string;
  description: string;
  image_url: string;
  is_verified: boolean;
  star_count: number;
  supported_protocols: string[];
  x402_supported: boolean;
  total_score: number;
  rank: number | null;
  network_rank: number | null;
  health_score: number | null;
  total_feedbacks: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

export interface Feedback {
  id: string;
  agent_id: string;
  score: number;
  comment: string;
  created_at: string;
  user_address?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

export interface PlatformStats {
  total_agents: number;
  total_users: number;
  total_feedbacks: number;
  daily_new_agents: number;
  average_feedback_score: number;
  chain_stats: Array<{
    chain_id: number;
    name: string;
    total_agents: number;
    total_feedbacks: number;
    average_feedback_score: number;
  }>;
}

export type SortField = "created_at" | "stars" | "name" | "token_id" | "total_score";
export type SortOrder = "asc" | "desc";
export type Protocol = "MCP" | "A2A" | "OASF" | "Web" | "Email";

export interface AgentFilters {
  search?: string;
  protocol?: Protocol;
  sortBy?: SortField;
  sortOrder?: SortOrder;
  ownerAddress?: string;
  page?: number;
  limit?: number;
}

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getAgents(filters: AgentFilters = {}) {
  const params = new URLSearchParams();
  params.set("chain_id", "56");
  if (filters.search) params.set("search", filters.search);
  if (filters.protocol) params.set("protocol", filters.protocol);
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.ownerAddress) params.set("ownerAddress", filters.ownerAddress);
  params.set("page", String(filters.page || 1));
  params.set("limit", String(filters.limit || 20));
  return fetchApi<ApiResponse<Agent[]>>(`/agents?${params.toString()}`);
}

export async function searchAgents(query: string, limit = 20) {
  return fetchApi<ApiResponse<Agent[]>>(
    `/agents/search?q=${encodeURIComponent(query)}&limit=${limit}&chainId=56`
  );
}

export async function getAgent(chainId: number, tokenId: string) {
  return fetchApi<ApiResponse<Agent>>(`/agents/${chainId}/${tokenId}`);
}

export async function getStats() {
  return fetchApi<ApiResponse<PlatformStats>>("/stats");
}

export async function getAgentsByOwner(address: string) {
  return fetchApi<ApiResponse<Agent[]>>(`/accounts/${address}/agents`);
}

export async function getFeedbacks(chainId: number, tokenId: string, limit = 10) {
  return fetchApi<ApiResponse<Feedback[]>>(
    `/feedbacks?chainId=${chainId}&tokenId=${tokenId}&limit=${limit}`
  );
}

export function getAgentHealth(agent: Agent): {
  label: string;
  color: string;
  bg: string;
  level: number;
} {
  const score = agent.health_score;
  const feedbacks = agent.total_feedbacks;
  const avg = agent.average_score;

  if (score !== null) {
    if (score >= 80) return { label: "Healthy", color: "text-emerald-400", bg: "bg-emerald-400/10", level: 4 };
    if (score >= 60) return { label: "Active", color: "text-blue-400", bg: "bg-blue-400/10", level: 3 };
    if (score >= 40) return { label: "Warning", color: "text-yellow-400", bg: "bg-yellow-400/10", level: 2 };
    return { label: "Risky", color: "text-red-400", bg: "bg-red-400/10", level: 1 };
  }

  if (feedbacks > 0 && avg >= 70) return { label: "Active", color: "text-blue-400", bg: "bg-blue-400/10", level: 3 };
  if (feedbacks > 0 && avg >= 40) return { label: "Warning", color: "text-yellow-400", bg: "bg-yellow-400/10", level: 2 };
  if (feedbacks > 0) return { label: "Risky", color: "text-red-400", bg: "bg-red-400/10", level: 1 };

  // Time-based check
  const created = new Date(agent.created_at);
  const now = new Date();
  const daysSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 1) return { label: "New", color: "text-cyan-400", bg: "bg-cyan-400/10", level: 0 };
  if (daysSince < 7) return { label: "Fresh", color: "text-blue-400", bg: "bg-blue-400/10", level: 2 };

  return { label: "Unknown", color: "text-zinc-400", bg: "bg-zinc-400/10", level: 0 };
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  return date.toLocaleDateString();
}

export function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
