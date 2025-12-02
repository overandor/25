import { createService, loadConfig } from "@ip-prime-brokerage/pkg-utils";
import { createSpv, getSpv } from "./store.js";

const config = loadConfig();
const { app, start } = createService({
  name: "svc-spv-manager",
  port: Number(config.PORT) || 4002,
  routes: [
    {
      method: "POST",
      url: "/spv",
      handler: async (req, reply) => {
        const record = createSpv(req.body);
        reply.code(201);
        return { spv: record };
      },
    },
    {
      method: "GET",
      url: "/spv/:id",
      handler: async (req, reply) => {
        const spv = getSpv(req.params.id);
        if (!spv) {
          reply.code(404);
          return { error: "not_found" };
        }
        return { spv };
      },
    },
  ],
  health: { role: "spv_manager" },
});

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
