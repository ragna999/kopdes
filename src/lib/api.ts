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

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getAgents(chainId = 56, limit = 20, page = 1) {
  return fetchApi<ApiResponse<Agent[]>>(
    `/agents?chain_id=${chainId}&limit=${limit}&page=${page}`
  );
}

export async function searchAgents(query: string, limit = 20) {
  return fetchApi<ApiResponse<Agent[]>>(
    `/agents/search?q=${encodeURIComponent(query)}&limit=${limit}`
  );
}

export async function getAgent(chainId: number, tokenId: string) {
  return fetchApi<ApiResponse<Agent>>(
    `/agents/${chainId}/${tokenId}`
  );
}

export async function getStats() {
  return fetchApi<ApiResponse<PlatformStats>>("/stats");
}

export async function getAgentsByOwner(address: string) {
  return fetchApi<ApiResponse<Agent[]>>(
    `/accounts/${address}/agents`
  );
}

export function getAgentStatus(agent: Agent): {
  label: string;
  color: string;
  bg: string;
} {
  if (!agent.health_score && agent.total_feedbacks === 0) {
    return { label: "New", color: "text-blue-400", bg: "bg-blue-400/10" };
  }
  if (agent.health_score !== null && agent.health_score >= 80) {
    return { label: "Healthy", color: "text-emerald-400", bg: "bg-emerald-400/10" };
  }
  if (agent.health_score !== null && agent.health_score >= 50) {
    return { label: "Warning", color: "text-yellow-400", bg: "bg-yellow-400/10" };
  }
  if (agent.health_score !== null && agent.health_score < 50) {
    return { label: "Risky", color: "text-red-400", bg: "bg-red-400/10" };
  }
  if (agent.average_score >= 70) {
    return { label: "Active", color: "text-emerald-400", bg: "bg-emerald-400/10" };
  }
  return { label: "Unknown", color: "text-zinc-400", bg: "bg-zinc-400/10" };
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
