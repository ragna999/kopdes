"use client";

import Link from "next/link";
import { useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-zinc-950 text-sm">
              K
            </div>
            <span className="font-bold text-lg">Kopdes</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 font-medium">
              BSC
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/agents" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Browse Agents
          </Link>
          <Link href="/sdk" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Agent SDK
          </Link>
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-medium hover:opacity-90 transition-opacity"
            >
              Connect
            </button>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex flex-col gap-1.5 p-1"
            aria-label="Menu"
          >
            <span className={`w-5 h-0.5 bg-zinc-300 transition-transform ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`w-5 h-0.5 bg-zinc-300 transition-opacity ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`w-5 h-0.5 bg-zinc-300 transition-transform ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-800/50 bg-zinc-950/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/agents"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-zinc-300 hover:text-yellow-400 py-2"
            >
              Browse Agents
            </Link>
            <Link
              href="/sdk"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-zinc-300 hover:text-yellow-400 py-2"
            >
              Agent SDK
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-zinc-300 hover:text-yellow-400 py-2"
            >
              Dashboard
            </Link>
            {isConnected && (
              <div className="pt-2 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
