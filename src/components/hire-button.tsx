"use client";

import { useState } from "react";
import { useAccount, useConnect } from "wagmi";
import { injected } from "wagmi/connectors";
import HireModal from "@/components/hire-modal";

interface HireButtonProps {
  agentName: string;
  agentAddress: string;
  tokenId: string;
}

export default function HireButton({ agentName, agentAddress, tokenId }: HireButtonProps) {
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const [showModal, setShowModal] = useState(false);

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: injected() })}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90 transition-opacity"
      >
        Connect Wallet to Hire
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-zinc-950 font-semibold hover:opacity-90 transition-opacity"
      >
        Hire This Agent
      </button>

      {showModal && (
        <HireModal
          agentName={agentName}
          agentAddress={agentAddress}
          tokenId={tokenId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
