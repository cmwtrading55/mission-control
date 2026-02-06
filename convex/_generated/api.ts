// Stub for Cloudflare Pages build
// Real Convex client uses NEXT_PUBLIC_CONVEX_URL at runtime

// Create stub functions that return undefined
const createStub = () => {
  return new Proxy(() => undefined, {
    get: () => createStub(),
  });
};

export const api = {
  activities: {
    getActivityStats: createStub(),
    listActivities: createStub(),
    listScheduledTasks: createStub(),
    getWeeklySchedule: createStub(),
    globalSearch: createStub(),
  },
};

export const internal = {};
