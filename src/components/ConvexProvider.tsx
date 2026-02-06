"use client";

import { ReactNode, useEffect, useState } from "react";
import { ConvexProvider as Provider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function ConvexProvider({ children }: { children: ReactNode }) {
  const [convex, setConvex] = useState<ConvexReactClient | null>(null);

  useEffect(() => {
    // Only initialize Convex on the client side
    if (convexUrl && convexUrl !== "https://placeholder.convex.cloud") {
      const client = new ConvexReactClient(convexUrl, {
        unsavedChangesWarning: false,
      });
      setConvex(client);
    }
  }, []);

  // During static build or if no URL, render children without provider
  if (!convex) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg font-medium">Mission Control</p>
            <p className="text-sm text-slate-500 mt-2">
              {convexUrl 
                ? "Loading..." 
                : "Set NEXT_PUBLIC_CONVEX_URL to enable live data"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <Provider client={convex}>{children}</Provider>;
}
