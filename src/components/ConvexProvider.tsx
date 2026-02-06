"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { ConvexProvider as Provider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Create a context to track if Convex is available
const ConvexAvailableContext = createContext<boolean>(false);

export function useConvexAvailable() {
  return useContext(ConvexAvailableContext);
}

export function ConvexProvider({ children }: { children: ReactNode }) {
  const [convex, setConvex] = useState<ConvexReactClient | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only initialize Convex on the client side
    if (typeof window !== "undefined" && convexUrl && convexUrl !== "https://placeholder.convex.cloud") {
      try {
        const client = new ConvexReactClient(convexUrl, {
          unsavedChangesWarning: false,
        });
        setConvex(client);
      } catch (e) {
        console.error("Failed to initialize Convex:", e);
      }
    }
    setIsReady(true);
  }, []);

  // Show loading during initialization
  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-lg font-medium">Mission Control</p>
            <p className="text-sm text-slate-500 mt-2">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // If no Convex client, render children without provider (they should handle this)
  if (!convex) {
    return (
      <ConvexAvailableContext.Provider value={false}>
        <div className="min-h-screen bg-slate-950 text-slate-200">
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2">
            <p className="text-sm text-amber-200 text-center">
              ⚠️ Convex not configured. Set NEXT_PUBLIC_CONVEX_URL for live data.
            </p>
          </div>
          {children}
        </div>
      </ConvexAvailableContext.Provider>
    );
  }

  return (
    <ConvexAvailableContext.Provider value={true}>
      <Provider client={convex}>{children}</Provider>
    </ConvexAvailableContext.Provider>
  );
}
