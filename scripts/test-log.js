const { ConvexHttpClient } = require("convex/browser");
const CONVEX_URL = "https://tacit-walrus-370.convex.cloud";

async function logActivity() {
  const client = new ConvexHttpClient(CONVEX_URL);
  try {
    const result = await client.mutation("activities:logActivity", {
      type: "system_cron",
      description: "Test from mission-control dir",
      details: { job: "test", fixed: true },
      channel: "system",
      status: "success",
      durationMs: 100,
      tokenCount: 0
    });
    console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

logActivity();
