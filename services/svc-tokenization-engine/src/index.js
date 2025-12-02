import { createService, loadConfig } from "@ip-prime-brokerage/pkg-utils";
import { mintToken, getToken } from "./store.js";

const config = loadConfig();
const { app, start } = createService({
  name: "svc-tokenization-engine",
  port: Number(config.PORT) || 4003,
  routes: [
    {
      method: "POST",
      url: "/tokenize",
      handler: async (req, reply) => {
        const token = mintToken(req.body);
        reply.code(201);
        return { token };
      },
    },
    {
      method: "GET",
      url: "/token/:id",
      handler: async (req, reply) => {
        const token = getToken(req.params.id);
        if (!token) {
          reply.code(404);
          return { error: "not_found" };
        }
        return { token };
      },
    },
  ],
  health: { role: "tokenization" },
});

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
