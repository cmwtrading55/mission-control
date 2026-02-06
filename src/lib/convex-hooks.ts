// Safe Convex hooks that work even when Convex isn't configured
import { useConvexAvailable } from "@/components/ConvexProvider";
import { useQuery as useConvexQuery, useMutation as useConvexMutation, usePaginatedQuery as useConvexPaginatedQuery } from "convex/react";

// Wrapper that returns undefined when Convex isn't available
export function useQuery<Args extends any[], T>(
  query: any,
  ...args: Args
): T | undefined {
  const isAvailable = useConvexAvailable();
  
  if (!isAvailable) {
    return undefined;
  }
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useConvexQuery(query, ...args);
}

// Wrapper for paginated queries
export function usePaginatedQuery<Args extends any[], T>(
  query: any,
  args: Args[0],
  options: { initialNumItems: number }
): { results: T[]; status: "CanLoadMore" | "LoadingMore" | "Exhausted"; loadMore: (n: number) => void } {
  const isAvailable = useConvexAvailable();
  
  if (!isAvailable) {
    return {
      results: [],
      status: "Exhausted",
      loadMore: () => {},
    };
  }
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useConvexPaginatedQuery(query, args, options);
}

export function useMutation<Args extends any[], T>(
  mutation: any
): (...args: Args) => Promise<T> {
  const isAvailable = useConvexAvailable();
  
  if (!isAvailable) {
    return async () => {
      throw new Error("Convex not configured");
    };
  }
  
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useConvexMutation(mutation);
}
