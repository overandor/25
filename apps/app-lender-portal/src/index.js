import { createService, loadConfig, createHttpClient } from "@ip-prime-brokerage/pkg-utils";
import { renderStatusPanel } from "@ip-prime-brokerage/pkg-ui";
import { z } from "zod";

const config = loadConfig(
  z.object({
    API_GATEWAY_URL: z.string().url().default("http://localhost:4000"),
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
  name: "app-lender-portal",
  port: Number(config.PORT) || 4101,
  routes: [
    {
      method: "GET",
      url: "/status",
      handler: async () => {
        const gateway = await fetchHealth(config.API_GATEWAY_URL);
        const legalOracle = await fetchHealth(config.LEGAL_ORACLE_URL);
        return {
          role: "lender",
          gateway,
          legalOracle,
          timestamp: Date.now(),
        };
      },
    },
    {
      method: "GET",
      url: "/",
      handler: async () => {
        const gateway = await fetchHealth(config.API_GATEWAY_URL);
        const legalOracle = await fetchHealth(config.LEGAL_ORACLE_URL);
        const status = gateway.status === "ok" && legalOracle.status === "ok" ? "ok" : "warn";
        const stats = {
          "api_gateway": config.API_GATEWAY_URL,
          "gateway_status": gateway.status,
          "legal_oracle": config.LEGAL_ORACLE_URL,
          "legal_oracle_status": legalOracle.status,
          "next_action": "review loan book and oracle attestations",
        };
        return renderStatusPanel({ title: "Lender Portal", status, stats });
      },
    },
  ],
  health: { role: "lender_ui", gateway: config.API_GATEWAY_URL, legal_oracle: config.LEGAL_ORACLE_URL },
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
