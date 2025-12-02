import { createService, loadConfig } from "@ip-prime-brokerage/pkg-utils";
import { createLoan, approveLoan, markDefault, getLoan } from "./store.js";

const config = loadConfig();
const { app, start } = createService({
  name: "svc-lending-core",
  port: Number(config.PORT) || 4004,
  routes: [
    {
      method: "POST",
      url: "/loans",
      handler: async (req, reply) => {
        const loan = createLoan(req.body);
        reply.code(201);
        return { loan };
      },
    },
    {
      method: "POST",
      url: "/loans/:id/approve",
      handler: async (req, reply) => {
        const loan = approveLoan(req.params.id);
        if (!loan) {
          reply.code(404);
          return { error: "not_found" };
        }
        return { loan };
      },
    },
    {
      method: "POST",
      url: "/loans/:id/default",
      handler: async (req, reply) => {
        const loan = markDefault(req.params.id, req.body?.reason || "unspecified");
        if (!loan) {
          reply.code(404);
          return { error: "not_found" };
        }
        return { loan };
      },
    },
    {
      method: "GET",
      url: "/loans/:id",
      handler: async (req, reply) => {
        const loan = getLoan(req.params.id);
        if (!loan) {
          reply.code(404);
          return { error: "not_found" };
        }
        return { loan };
      },
    },
  ],
  health: { role: "lending_core" },
});

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
