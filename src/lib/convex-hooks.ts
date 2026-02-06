// Safe Convex hooks that work even when Convex isn't configured
import { useConvexAvailable } from "@/components/ConvexProvider";
import { useQuery as useConvexQuery, useMutation as useConvexMutation, usePaginatedQuery as useConvexPaginatedQuery } from "convex/react";

// Wrapper that returns undefined when Convex isn't available
export function useQuery(query: any, args?: any): any {
  const isAvailable = useConvexAvailable();
  
  if (!isAvailable) {
    return undefined;
  }
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return (useConvexQuery as any)(query, args);
}

// Wrapper for paginated queries
export function usePaginatedQuery(query: any, args: any, options: { initialNumItems: number }): any {
  const isAvailable = useConvexAvailable();
  
  if (!isAvailable) {
    return {
      results: [],
      status: "Exhausted",
      loadMore: () => {},
    };
  }
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return (useConvexPaginatedQuery as any)(query, args, options);
}

export function useMutation(mutation: any): any {
  const isAvailable = useConvexAvailable();
  
  if (!isAvailable) {
    return async () => {
      throw new Error("Convex not configured");
    };
  }
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return (useConvexMutation as any)(mutation);
}
