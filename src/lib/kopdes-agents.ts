"use client";

import { useState, useEffect } from "react";

export interface KopdesAgent {
  wallet: string;
  skills: string[];
  name?: string;
  description?: string;
  registeredAt: number;
  lastHeartbeat: number;
  status: "online" | "stale" | "offline";
}

export function useKopdesAgents() {
  const [agents, setAgents] = useState<KopdesAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent/register?limit=100")
      .then((r) => r.json())
      .then((data) => {
        setAgents(data.agents || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { agents, loading };
}

export function useIsHirable(wallet: string | undefined) {
  const [isHirable, setIsHirable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet) {
      setLoading(false);
      return;
    }
    fetch(`/api/agent/register?wallet=${wallet}`)
      .then((r) => r.json())
      .then((data) => setIsHirable(data.registered))
      .catch(() => setIsHirable(false))
      .finally(() => setLoading(false));
  }, [wallet]);

  return { isHirable, loading };
}
