"use client";

import { motion } from "framer-motion";

export function AnimatedHero({
  totalAgents,
  totalUsers,
  totalFeedbacks,
  dailyNew,
}: {
  totalAgents: string;
  totalUsers: string;
  totalFeedbacks: string;
  dailyNew: string;
}) {
  const stats = [
    { label: "Total Agents", value: totalAgents },
    { label: "Total Users", value: totalUsers },
    { label: "Feedbacks", value: totalFeedbacks },
    { label: "New Today", value: dailyNew },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm mb-6">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          BNB Smart Chain — {totalAgents} Agents Registered
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent leading-tight">
          Discover AI Agents
          <br />
          on BNB Chain
        </h1>
        <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto">
          Browse, compare, and hire autonomous agents. Powered by ERC-8004 identity and Altana session security.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
            className="p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 text-center"
          >
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-xs text-zinc-500">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    </>
  );
}
