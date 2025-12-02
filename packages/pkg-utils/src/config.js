import { z } from "zod";

const BaseEnvSchema = z.object({
  PORT: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
});

export function loadConfig(schemaExtension = z.object({})) {
  const schema = BaseEnvSchema.merge(schemaExtension);
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid environment: ${detail}`);
  }
  return parsed.data;
}
