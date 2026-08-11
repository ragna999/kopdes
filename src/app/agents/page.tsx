import { Suspense } from "react";
import AgentsContent from "./agents-content";

export const dynamic = "force-dynamic";

export default function AgentsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="text-center py-20 text-zinc-500">
            <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Loading agents...
          </div>
        </div>
      }
    >
      <AgentsContent />
    </Suspense>
  );
}
