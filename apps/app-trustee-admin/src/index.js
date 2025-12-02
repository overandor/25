import { createService, loadConfig, createHttpClient } from "@ip-prime-brokerage/pkg-utils";
import { renderStatusPanel } from "@ip-prime-brokerage/pkg-ui";
import { z } from "zod";

const config = loadConfig(
  z.object({
    API_GATEWAY_URL: z.string().url().default("http://localhost:4000"),
    USER_AUTH_URL: z.string().url().default("http://localhost:4006"),
    LEGAL_ORACLE_URL: z.string().url().default("http://localhost:4005"),
  })
);

const httpClient = createHttpClient({ timeoutMs: 3000 });

async function fetchHealth(url) {
  try {
    const health = await httpClient.get(`${url}/health`);
    return { status: "ok", health };
  } catch (error) {
    return { status: "err", error: error.message };
  }
}

const { app, start } = createService({
  name: "app-trustee-admin",
  port: Number(config.PORT) || 4102,
  routes: [
    {
      method: "GET",
      url: "/status",
      handler: async () => {
        const gateway = await fetchHealth(config.API_GATEWAY_URL);
        const userAuth = await fetchHealth(config.USER_AUTH_URL);
        const oracle = await fetchHealth(config.LEGAL_ORACLE_URL);
        return {
          role: "trustee",
          gateway,
          userAuth,
          oracle,
          timestamp: Date.now(),
        };
      },
    },
    {
      method: "GET",
      url: "/",
      handler: async () => {
        const gateway = await fetchHealth(config.API_GATEWAY_URL);
        const userAuth = await fetchHealth(config.USER_AUTH_URL);
        const oracle = await fetchHealth(config.LEGAL_ORACLE_URL);
        const status = [gateway, userAuth, oracle].every((s) => s.status === "ok") ? "ok" : "warn";
        const stats = {
          "api_gateway": config.API_GATEWAY_URL,
          "gateway_status": gateway.status,
          "user_auth": config.USER_AUTH_URL,
          "user_auth_status": userAuth.status,
          "legal_oracle": config.LEGAL_ORACLE_URL,
          "legal_oracle_status": oracle.status,
          "controls": "manage registry + oracle keys",
        };
        return renderStatusPanel({ title: "Trustee Admin", status, stats });
      },
    },
  ],
  health: {
    role: "trustee_ui",
    gateway: config.API_GATEWAY_URL,
    user_auth: config.USER_AUTH_URL,
    legal_oracle: config.LEGAL_ORACLE_URL,
  },
});

app.addHook("onSend", async (req, reply, payload) => {
  if (req.url === "/" && typeof payload === "string") {
    reply.header("content-type", "text/html; charset=utf-8");
  }
});

if (process.env.NODE_ENV !== "test") {
  start();
}

export { app, start };
