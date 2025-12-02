import { createService, loadConfig } from "@ip-prime-brokerage/pkg-utils";
import { buildManifest } from "./manifest.js";

const config = loadConfig();
const { app, start } = createService({
  name: "svc-provenance-miner",
  port: Number(config.PORT) || 4001,
  routes: [
    {
      method: "POST",
      url: "/manifest",
      schema: { body: { type: "object", required: ["fileHashes", "totalEffortHours"], properties: { fileHashes: { type: "array", items: { type: "string" } }, repository: { type: "string" }, commit: { type: "string" }, totalEffortHours: { type: "number" }, developerHours: { type: "object" } } } },
      handler: async (req) => {
        const manifest = buildManifest(req.body);
        return { manifest };
      },
    },
  ],
  health: { role: "ip_miner" },
});

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
