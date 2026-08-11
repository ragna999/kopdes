import EventEmitter from "eventemitter3";

const DEFAULT_API = "https://kopdes-one.vercel.app";

export interface KopdesConfig {
  wallet: string;
  skills?: string[];
  apiUrl?: string;
  pollInterval?: number;
}

export interface HireSession {
  id: string;
  human: string;
  spendCap: string;
  expiry: number;
  skills: string[];
  task?: string;
  hiredAt: number;
}

export interface HireOptions {
  spendCap: string;
  expiry?: number;
  skills?: string[];
  task?: string;
}

export interface KopdesEvents {
  hired: (session: HireSession) => void;
  heartbeat: () => void;
  error: (error: Error) => void;
  connected: () => void;
  disconnected: () => void;
}

type EventMap = {
  [K in keyof KopdesEvents]: Parameters<KopdesEvents[K]>;
};

export class KopdesAgent extends EventEmitter<keyof EventMap> {
  private config: Required<KopdesConfig>;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private _connected = false;
  private knownHires = new Set<string>();

  constructor(config: KopdesConfig) {
    super();
    this.config = {
      wallet: config.wallet,
      skills: config.skills || [],
      apiUrl: config.apiUrl || DEFAULT_API,
      pollInterval: config.pollInterval || 5000,
    };
  }

  /** Connect to marketplace, register, start polling */
  connect(): void {
    if (this._connected) return;
    this._connected = true;
    this.register().catch((e) => this.emit("error", e));
    this.pollTimer = setInterval(() => {
      this.pollHires().catch((e) => this.emit("error", e));
    }, this.config.pollInterval);
    this.pollHires().catch((e) => this.emit("error", e));
    this.emit("connected");
  }

  /** Disconnect from marketplace */
  disconnect(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this._connected = false;
    this.emit("disconnected");
  }

  /** Send heartbeat */
  heartbeat(): void {
    fetch(`${this.config.apiUrl}/api/agent/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: this.config.wallet, timestamp: Date.now() }),
    }).catch((e) => this.emit("error", e));
    this.emit("heartbeat");
  }

  /**
   * HIRE ANOTHER AGENT (agent-to-agent)
   * This agent hires another agent on the marketplace.
   */
  async hire(
    targetAgentWallet: string,
    options: HireOptions
  ): Promise<{ success: boolean; hireId: string }> {
    const expiry =
      options.expiry || Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

    const res = await fetch(`${this.config.apiUrl}/api/agent/hires`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentWallet: targetAgentWallet,
        human: this.config.wallet, // this agent is the "human" (buyer)
        spendCap: options.spendCap,
        expiry,
        skills: options.skills || [],
        task: options.task,
      }),
    });

    if (!res.ok) {
      throw new Error(`Hire failed: ${res.status}`);
    }

    const data = await res.json();
    return { success: data.success, hireId: data.hireId };
  }

  /** Report execution */
  async reportExecution(sessionId: string, txHash: string, result?: string): Promise<void> {
    await fetch(`${this.config.apiUrl}/api/agent/execution`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: this.config.wallet,
        sessionId,
        txHash,
        result,
        timestamp: Date.now(),
      }),
    });
  }

  /** List all hirable agents on Kopdes */
  async listAgents(limit = 50): Promise<Array<{
    wallet: string;
    skills: string[];
    name?: string;
    description?: string;
    status: string;
  }>> {
    const res = await fetch(
      `${this.config.apiUrl}/api/agent/register?limit=${limit}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.agents || [];
  }

  /** Register this agent on Kopdes */
  private async register(): Promise<void> {
    await fetch(`${this.config.apiUrl}/api/agent/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: this.config.wallet,
        skills: this.config.skills,
        timestamp: Date.now(),
      }),
    });
  }

  /** Poll for hire events */
  private async pollHires(): Promise<void> {
    try {
      const res = await fetch(
        `${this.config.apiUrl}/api/agent/hires?wallet=${this.config.wallet}`
      );
      if (!res.ok) return;
      const data = await res.json();
      const hires: HireSession[] = data.hires || [];
      for (const hire of hires) {
        if (!this.knownHires.has(hire.id)) {
          this.knownHires.add(hire.id);
          this.emit("hired", hire);
        }
      }
    } catch {
      // Silent fail — retry next interval
    }
  }

  get isConnected(): boolean { return this._connected; }
  get wallet(): string { return this.config.wallet; }
  get skills(): string[] { return this.config.skills; }
}

/** Quick helper */
export function createAgent(config: KopdesConfig): KopdesAgent {
  const agent = new KopdesAgent(config);
  agent.connect();
  setInterval(() => agent.heartbeat(), 6 * 60 * 60 * 1000);
  agent.heartbeat();
  return agent;
}

export const AgentBazaar = KopdesAgent; // backward compat
export default KopdesAgent;
