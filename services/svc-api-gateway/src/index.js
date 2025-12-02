import { z } from "zod";
import { createService, loadConfig, createHttpClient } from "@ip-prime-brokerage/pkg-utils";
import { planCollateralization, createOrchestrator } from "./orchestrator.js";

const config = loadConfig(
  z.object({
    PROVENANCE_URL: z.string().url(),
    SPV_URL: z.string().url(),
    TOKENIZATION_URL: z.string().url(),
    LENDING_URL: z.string().url(),
  })
);

const orchestrator = createOrchestrator({
  httpClient: createHttpClient({ timeoutMs: 7000 }),
  endpoints: {
    provenance: config.PROVENANCE_URL,
    spv: config.SPV_URL,
    tokenization: config.TOKENIZATION_URL,
    lending: config.LENDING_URL,
  },
});
const { app, start } = createService({
  name: "svc-api-gateway",
  port: Number(config.PORT) || 4000,
  routes: [
    {
      method: "POST",
      url: "/pipeline/plan",
      handler: async (req, reply) => {
        const plan = planCollateralization(req.body);
        reply.code(201);
        return { plan };
      },
    },
    {
      method: "POST",
      url: "/pipeline/execute",
      handler: async (req, reply) => {
        const result = await orchestrator.executeCollateralization(req.body);
        reply.code(201);
        return result;
      },
    },
    {
      method: "GET",
      url: "/",
      handler: async () => ({ message: "ip prime brokerage api gateway" }),
    },
  ],
  health: { role: "api_gateway" },
});

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
