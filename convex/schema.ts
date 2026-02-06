// Activity tracking schema for Mission Control
// Records every action the AI assistant performs

import { v } from "convex/values";

// Simple schema definition for placeholder
export default {
  activities: {
    timestamp: v.number(),
    type: v.string(),
    description: v.string(),
    details: v.optional(v.any()),
    sessionKey: v.optional(v.string()),
    channel: v.optional(v.string()),
    status: v.string(),
    durationMs: v.optional(v.number()),
    tokenCount: v.optional(v.number()),
  },
  scheduledTasks: {
    name: v.string(),
    description: v.string(),
    schedule: v.object({
      kind: v.string(),
      expr: v.optional(v.string()),
      everyMs: v.optional(v.number()),
    }),
    nextRunAt: v.number(),
    lastRunAt: v.optional(v.number()),
    lastStatus: v.optional(v.string()),
    enabled: v.boolean(),
    channel: v.optional(v.string()),
    model: v.optional(v.string()),
  },
  searchIndex: {
    content: v.string(),
    contentType: v.string(),
    sourcePath: v.string(),
    title: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  },
  memories: {
    path: v.string(),
    content: v.string(),
    lastModified: v.number(),
    type: v.string(),
  },
};
