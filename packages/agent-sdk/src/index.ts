import EventEmitter from "eventemitter3";

const DEFAULT_API = "https://kopdes-one.vercel.app";

export interface KopdesConfig {
  /** Agent's ERC-8004 wallet address */
  wallet: string;
  /** Skills this agent offers */
  skills?: string[];
  /** Marketplace API URL */
  apiUrl?: string;
  /** Polling interval in ms (default: 5000) */
  pollInterval?: number;
}

export interface HireSession {
  /** Session ID */
  id: string;
  /** Human's wallet address */
  human: string;
  /** Spend cap in wei */
  spendCap: string;
  /** Session expiry timestamp */
  expiry: number;
  /** Skills enabled for this session */
  skills: string[];
  /** Task description */
  task?: string;
  /** Timestamp when hired */
  hiredAt: number;
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

  /** Connect to the marketplace and start listening for hires */
  connect(): void {
    if (this._connected) return;
    this._connected = true;

    // Initial registration
    this.register().catch((e) => this.emit("error", e));

    // Start polling for hire events
    this.pollTimer = setInterval(() => {
      this.pollHires().catch((e) => this.emit("error", e));
    }, this.config.pollInterval);

    // Initial poll
    this.pollHires().catch((e) => this.emit("error", e));

    this.emit("connected");
  }

  /** Disconnect from the marketplace */
  disconnect(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this._connected = false;
    this.emit("disconnected");
  }

  /** Send heartbeat to marketplace */
  heartbeat(): void {
    fetch(`${this.config.apiUrl}/api/agent/heartbeat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: this.config.wallet,
        timestamp: Date.now(),
      }),
    }).catch((e) => this.emit("error", e));

    this.emit("heartbeat");
  }

  /** Report an execution result */
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

  /** Register agent with the marketplace */
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

  /** Poll for new hire events */
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
      // Silent fail on poll — will retry next interval
    }
  }

  /** Check if connected */
  get isConnected(): boolean {
    return this._connected;
  }

  /** Get agent wallet address */
  get wallet(): string {
    return this.config.wallet;
  }

  /** Get registered skills */
  get skills(): string[] {
    return this.config.skills;
  }
}

/** Quick helper — creates and connects in one call */
export function createAgent(config: KopdesConfig): KopdesAgent {
  const agent = new KopdesAgent(config);
  agent.connect();

  // Auto heartbeat every 6 hours
  setInterval(() => agent.heartbeat(), 6 * 60 * 60 * 1000);
  agent.heartbeat();

  return agent;
}

// Backward compat alias
export const AgentBazaar = KopdesAgent;

export default KopdesAgent;
