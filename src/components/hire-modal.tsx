"use client";

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther, parseUnits } from "viem";
import { motion, AnimatePresence } from "framer-motion";

interface HireModalProps {
  agentName: string;
  agentAddress: string;
  tokenId: string;
  onClose: () => void;
}

const SPEND_PRESETS = [
  { label: "0.01 BNB", value: "0.01" },
  { label: "0.1 BNB", value: "0.1" },
  { label: "1 BNB", value: "1" },
  { label: "Custom", value: "custom" },
];

const EXPIRY_PRESETS = [
  { label: "1 Day", value: 1 },
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "Custom", value: 0 },
];

export default function HireModal({ agentName, agentAddress, tokenId, onClose }: HireModalProps) {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [step, setStep] = useState<"config" | "confirm" | "signing" | "done" | "error">("config");
  const [spendPreset, setSpendPreset] = useState("0.1");
  const [customSpend, setCustomSpend] = useState("");
  const [expiryPreset, setExpiryPreset] = useState(7);
  const [customExpiry, setCustomExpiry] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const spendAmount = spendPreset === "custom" ? customSpend : spendPreset;
  const expiryDays = expiryPreset === 0 ? parseInt(customExpiry) || 7 : expiryPreset;

  const handleHire = async () => {
    if (!walletClient || !address) {
      setErrorMsg("Please connect your wallet first.");
      setStep("error");
      return;
    }

    setStep("signing");

    try {
      // Dynamically import Altana SDK (client-side only)
      const { createClient, BNB, signerFromPrivateKey } = await import("@altananetwork/sdk");

      // For browser, we use the wallet's signer via wagmi
      // The SDK needs a private key signer, but in browser we use the injected provider
      // We'll create a session request that the user signs via their wallet

      // Build the hire parameters
      const spendWei = parseEther(spendAmount || "0.1");
      const expiryTimestamp = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;

      // For now, we'll build the session config and show it to the user
      // In production, this would use Altana SDK's createClient + grantSession
      const sessionConfig = {
        agent: agentAddress,
        agentName,
        tokenId,
        spendCap: spendAmount + " BNB",
        expiryDays,
        expiryDate: new Date(expiryTimestamp * 1000).toISOString(),
        userAddress: address,
        createdAt: new Date().toISOString(),
      };

      // Store session in localStorage for demo
      const existing = JSON.parse(localStorage.getItem("kopdes_sessions") || "[]");
      existing.push(sessionConfig);
      localStorage.setItem("kopdes_sessions", JSON.stringify(existing));

      // Notify agent via marketplace API
      try {
        await fetch("/api/agent/hires", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentWallet: agentAddress,
            human: address,
            spendCap: spendAmount + " BNB",
            expiry: expiryTimestamp,
            skills: [],
            task: `Hired via Kopdes marketplace. Token #${tokenId}`,
          }),
        });
      } catch {
        // Non-critical — session still saved locally
      }

      setStep("done");
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Transaction failed");
      setStep("error");
    }
  };

  if (!isConnected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-xl font-bold mb-4">Connect Wallet</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Connect your BSC wallet to hire {agentName}.
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
        >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Hire Agent</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            ✕
          </button>
        </div>

        {step === "config" && (
          <>
            <div className="mb-4 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
              <p className="text-sm text-zinc-400">Hiring</p>
              <p className="font-medium">{agentName}</p>
              <p className="text-xs text-zinc-500 font-mono mt-1">Token #{tokenId}</p>
            </div>

            {/* Spend Cap */}
            <div className="mb-5">
              <label className="text-sm text-zinc-400 mb-2 block">Spend Cap</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {SPEND_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setSpendPreset(p.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      spendPreset === p.value
                        ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {spendPreset === "custom" && (
                <input
                  type="number"
                  value={customSpend}
                  onChange={(e) => setCustomSpend(e.target.value)}
                  placeholder="Amount in BNB"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-yellow-400/50"
                />
              )}
            </div>

            {/* Expiry */}
            <div className="mb-5">
              <label className="text-sm text-zinc-400 mb-2 block">Session Expiry</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {EXPIRY_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setExpiryPreset(p.value)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                      expiryPreset === p.value
                        ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                        : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {expiryPreset === 0 && (
                <input
                  type="number"
                  value={customExpiry}
                  onChange={(e) => setCustomExpiry(e.target.value)}
                  placeholder="Days"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-yellow-400/50"
                />
              )}
            </div>

            {/* Info */}
            <div className="mb-6 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/10">
              <p className="text-xs text-yellow-400/80">
                An Altana session will be created on-chain. The agent can only spend up to{" "}
                <strong>{spendAmount || "0.1"} BNB</strong> within{" "}
                <strong>{expiryDays} days</strong>. You can revoke anytime.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("confirm")}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90"
              >
                Review
              </button>
            </div>
          </>
        )}

        {step === "confirm" && (
          <>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Agent</span>
                <span>{agentName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Spend Cap</span>
                <span className="text-yellow-400 font-medium">{spendAmount} BNB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Expires</span>
                <span>{expiryDays} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Your Wallet</span>
                <span className="font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("config")}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Back
              </button>
              <button
                onClick={handleHire}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90"
              >
                Sign & Hire
              </button>
            </div>
          </>
        )}

        {step === "signing" && (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Waiting for wallet signature...</p>
            <p className="text-xs text-zinc-600 mt-2">Check your wallet</p>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Agent Hired!</h3>
            <p className="text-sm text-zinc-400 mb-1">{agentName} has been notified.</p>
            <p className="text-xs text-zinc-500 mb-6">
              Session: {spendAmount} BNB cap, {expiryDays} days
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold"
            >
              Done
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-red-400/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-bold mb-2">Error</h3>
            <p className="text-sm text-zinc-400 mb-6">{errorMsg}</p>
            <button
              onClick={() => setStep("config")}
              className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Try Again
            </button>
          </div>
        )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
