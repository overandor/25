import crypto from "crypto";
import { z } from "zod";
import { createService, loadConfig } from "@ip-prime-brokerage/pkg-utils";

const config = loadConfig(z.object({ AUTH_SECRET: z.string().min(16) }));
const users = new Map();

function signToken(wallet) {
  const issuedAt = Date.now();
  const signature = crypto.createHmac("sha256", config.AUTH_SECRET).update(`${wallet}:${issuedAt}`).digest("hex");
  return { token: signature, wallet, issuedAt };
}

const { app, start } = createService({
  name: "svc-user-auth",
  port: Number(config.PORT) || 4006,
  routes: [
    {
      method: "POST",
      url: "/register",
      handler: async (req, reply) => {
        const body = z.object({ wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/) }).parse(req.body);
        users.set(body.wallet, { createdAt: Date.now() });
        const token = signToken(body.wallet);
        reply.code(201);
        return { token };
      },
    },
    {
      method: "POST",
      url: "/token",
      handler: async (req, reply) => {
        const body = z.object({ wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/) }).parse(req.body);
        if (!users.has(body.wallet)) {
          reply.code(404);
          return { error: "unknown_wallet" };
        }
        return { token: signToken(body.wallet) };
      },
    },
  ],
  health: { role: "user_auth" },
});

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
