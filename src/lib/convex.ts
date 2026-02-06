import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

// Only create client if URL is available and we're on the client
export const convex = typeof window !== "undefined" && convexUrl 
  ? new ConvexReactClient(convexUrl, { unsavedChangesWarning: false })
  : null;

// Helper to check if convex is available
export const isConvexAvailable = () => !!convex;
