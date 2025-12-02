import { loadConfig, createService } from "@ip-prime-brokerage/pkg-utils";
import { z } from "zod";
import { recordSignal, listSignals } from "./signals.js";

const config = loadConfig(z.object({ ORACLE_SECRET: z.string().min(16) }));
const { app, start } = createService({
  name: "svc-legal-oracle",
  port: Number(config.PORT) || 4005,
  routes: [
    {
      method: "POST",
      url: "/default",
      handler: async (req, reply) => {
        const signal = recordSignal(config.ORACLE_SECRET, req.body);
        reply.code(202);
        return { signal };
      },
    },
    {
      method: "GET",
      url: "/signals",
      handler: async () => ({ signals: listSignals() }),
    },
  ],
  health: { role: "legal_oracle" },
});

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
