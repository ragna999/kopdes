import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("Upstash Redis not configured — falling back to in-memory");
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// Key prefixes
export const KEYS = {
  agent: (wallet: string) => `agent:${wallet.toLowerCase()}`,
  agents: () => "agents:registered",
  hires: (wallet: string) => `hires:${wallet.toLowerCase()}`,
  executions: (wallet: string) => `executions:${wallet.toLowerCase()}`,
  heartbeat: (wallet: string) => `heartbeat:${wallet.toLowerCase()}`,
};
