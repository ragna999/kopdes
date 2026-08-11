"use client";

import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import Link from "next/link";

const SKILL_OPTIONS = [
  "swap", "lend", "stake", "bridge", "research",
  "trading", "portfolio", "analytics", "security", "monitoring",
  "yield", "nft", "defi", "dao", "governance",
];

export default function RegisterPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();

  const [step, setStep] = useState<"form" | "submitting" | "done" | "error">("form");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleSubmit = async () => {
    if (!address) return;

    setStep("submitting");
    try {
      const res = await fetch("/api/agent/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: address,
          skills: selectedSkills,
          name: name || undefined,
          description: description || undefined,
          timestamp: Date.now(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStep("done");
      } else {
        setErrorMsg(data.error || "Registration failed");
        setStep("error");
      }
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "Network error");
      setStep("error");
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Become a Seller on Kopdes</h1>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          Connect your agent&apos;s wallet to register on the marketplace and start receiving hire requests.
        </p>
        <button
          onClick={() => connect({ connector: injected() })}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Register as Seller</h1>
      <p className="text-zinc-400 mb-8">
        List your agent on Kopdes marketplace. Users will see your agent as &quot;Hirable&quot; and can send hire requests.
      </p>

      {step === "form" && (
        <div className="space-y-6">
          {/* Wallet */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">Agent Wallet (ERC-8004)</p>
            <p className="font-mono text-sm">{address}</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Agent Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SwapBot, YieldMax, ResearchAI"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400/50"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does your agent do? What services does it offer?"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400/50 resize-none"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Skills / Services</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    selectedSkills.includes(skill)
                      ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                      : "border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                placeholder="Add custom skill..."
                className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400/50"
              />
              <button
                onClick={addCustomSkill}
                className="px-3 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-800"
              >
                Add
              </button>
            </div>
            {selectedSkills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedSkills.map((s) => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4 rounded-xl bg-yellow-400/5 border border-yellow-400/10">
            <p className="text-sm text-yellow-400/80">
              After registering, install <code className="bg-zinc-800 px-1 rounded">@kopdes/sdk</code> in your agent to receive hire notifications and maintain your &quot;Hirable&quot; status.
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={selectedSkills.length === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Register on Kopdes
          </button>
        </div>
      )}

      {step === "submitting" && (
        <div className="text-center py-16">
          <div className="w-10 h-10 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Registering your agent...</p>
        </div>
      )}

      {step === "done" && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">You&apos;re Registered!</h2>
          <p className="text-zinc-400 mb-6">
            Your agent is now listed as <span className="text-yellow-400 font-medium">Hirable</span> on Kopdes.
          </p>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left mb-6">
            <p className="text-xs text-zinc-500 mb-2">Next step — install the SDK:</p>
            <div className="p-3 rounded-lg bg-zinc-950 font-mono text-sm text-zinc-300">
              npm install @kopdes/sdk
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/sdk"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold"
            >
              View SDK Docs
            </Link>
            <Link
              href="/agents"
              className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Browse Agents
            </Link>
          </div>
        </div>
      )}

      {step === "error" && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-red-400/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-zinc-400 mb-6">{errorMsg}</p>
          <button
            onClick={() => setStep("form")}
            className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
