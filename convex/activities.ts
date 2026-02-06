// Convex functions for Mission Control

import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";

// ACTIVITY FEED QUERIES

// For useQuery - returns wrapped result
export const listActivities = query({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(v.any()),
    nextCursor: v.optional(v.number()),
  }),
  handler: async (ctx: any, args: any) => {
    const limit = args.limit ?? 50;
    let dbQuery = ctx.db
      .query("activities")
      .withIndex("by_timestamp", (q: any) =>
        args.cursor ? q.lt("timestamp", args.cursor) : q
      )
      .order("desc");
    
    if (args.type) {
      dbQuery = dbQuery.filter((q: any) => q.eq(q.field("type"), args.type));
    }
    
    const results = await dbQuery.take(limit + 1);

    const items = results.slice(0, limit);
    const nextCursor = results.length > limit ? items[items.length - 1].timestamp : undefined;

    return { items, nextCursor };
  },
});

// For usePaginatedQuery - returns items directly for Convex pagination
export const listActivitiesPaginated = query({
  args: {
    type: v.optional(v.string()),
    paginationOpts: v.object({
      numItems: v.number(),
      cursor: v.optional(v.union(v.string(), v.null())),
      id: v.optional(v.number()),
    }),
  },
  returns: v.object({
    page: v.array(v.any()),
    continueCursor: v.optional(v.string()),
    isDone: v.boolean(),
  }),
  handler: async (ctx: any, args: any) => {
    const { numItems } = args.paginationOpts;
    const cursor = args.paginationOpts.cursor;
    
    let dbQuery = ctx.db
      .query("activities")
      .order("desc");
    
    if (args.type) {
      dbQuery = dbQuery.withIndex("by_type", (q: any) => q.eq("type", args.type));
    }
    
    // Handle cursor-based pagination
    if (cursor && cursor !== null) {
      const cursorTimestamp = parseInt(cursor, 10);
      dbQuery = dbQuery.filter((q: any) => q.lt(q.field("timestamp"), cursorTimestamp));
    }
    
    const results = await dbQuery.take(numItems + 1);
    const page = results.slice(0, numItems);
    const isDone = results.length <= numItems;
    const continueCursor = !isDone && page.length > 0 
      ? String(page[page.length - 1].timestamp) 
      : undefined;

    return { page, continueCursor, isDone };
  },
});

export const getActivityStats = query({
  args: {},
  returns: v.object({
    totalActivities: v.number(),
    todayCount: v.number(),
    byType: v.any(),
  }),
  handler: async (ctx: any) => {
    const now = Date.now();
    const todayStart = now - 24 * 60 * 60 * 1000;

    const allActivities = await ctx.db.query("activities").collect();
    const todayActivities = allActivities.filter((a: any) => a.timestamp > todayStart);

    const byType = allActivities.reduce((acc: any, activity: any) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActivities: allActivities.length,
      todayCount: todayActivities.length,
      byType,
    };
  },
});

// SCHEDULED TASKS QUERIES

export const listScheduledTasks = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx: any) => {
    return await ctx.db
      .query("scheduledTasks")
      .withIndex("by_enabled", (q: any) => q.eq("enabled", true))
      .order("asc", "nextRunAt")
      .collect();
  },
});

export const getWeeklySchedule = query({
  args: {
    weekStart: v.number(), // Unix timestamp for start of week
  },
  returns: v.array(v.any()),
  handler: async (ctx: any, args: any) => {
    const weekEnd = args.weekStart + 7 * 24 * 60 * 60 * 1000;
    
    return await ctx.db
      .query("scheduledTasks")
      .withIndex("by_next_run", (q: any) => 
        q.gte("nextRunAt", args.weekStart).lt("nextRunAt", weekEnd)
      )
      .order("asc")
      .collect();
  },
});

// GLOBAL SEARCH - simplified without contains
export const globalSearch = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx: any, args: any) => {
    const limit = args.limit ?? 20;
    const searchTerm = args.query.toLowerCase();
    
    // Get recent activities (Convex doesn't have full-text search in basic queries)
    const activities = await ctx.db
      .query("activities")
      .order("desc", "timestamp")
      .take(limit * 2);
    
    // Filter client-side for description match
    const filteredActivities = activities.filter((a: any) => 
      a.description && a.description.toLowerCase().includes(searchTerm)
    ).slice(0, limit);

    // Get memories
    const memories = await ctx.db
      .query("memories")
      .take(limit * 2);
    
    const filteredMemories = memories.filter((m: any) => 
      m.content && m.content.toLowerCase().includes(searchTerm)
    ).slice(0, limit);

    // Get indexed content
    const indexed = await ctx.db
      .query("searchIndex")
      .order("desc", "timestamp")
      .take(limit * 2);
    
    const filteredIndexed = indexed.filter((i: any) => 
      i.content && i.content.toLowerCase().includes(searchTerm)
    ).slice(0, limit);

    return [
      ...filteredActivities.map((a: any) => ({ ...a, resultType: "activity" })),
      ...filteredMemories.map((m: any) => ({ ...m, resultType: "memory" })),
      ...filteredIndexed.map((i: any) => ({ ...i, resultType: "indexed" })),
    ].sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));
  },
});

// MUTATIONS

export const logActivity = mutation({
  args: {
    type: v.string(),
    description: v.string(),
    details: v.optional(v.any()),
    sessionKey: v.optional(v.string()),
    channel: v.optional(v.string()),
    status: v.string(),
    durationMs: v.optional(v.number()),
    tokenCount: v.optional(v.number()),
  },
  returns: v.id("activities"),
  handler: async (ctx: any, args: any) => {
    return await ctx.db.insert("activities", {
      timestamp: Date.now(),
      ...args,
    });
  },
});

export const upsertScheduledTask = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    schedule: v.object({
      kind: v.string(),
      expr: v.optional(v.string()),
      everyMs: v.optional(v.number()),
    }),
    nextRunAt: v.number(),
    enabled: v.boolean(),
    channel: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  returns: v.id("scheduledTasks"),
  handler: async (ctx: any, args: any) => {
    const existing = await ctx.db
      .query("scheduledTasks")
      .filter((q: any) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("scheduledTasks", args);
  },
});

export const indexContent = mutation({
  args: {
    content: v.string(),
    contentType: v.string(),
    sourcePath: v.string(),
    title: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  returns: v.id("searchIndex"),
  handler: async (ctx: any, args: any) => {
    return await ctx.db.insert("searchIndex", {
      timestamp: Date.now(),
      ...args,
    });
  },
});
