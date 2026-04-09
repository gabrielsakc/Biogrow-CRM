"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h2>
        <button onClick={reset} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg">Try again</button>
      </div>
    </div>
  );
}
