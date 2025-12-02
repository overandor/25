import { z } from "zod";

export const ProvenanceManifestSchema = z.object({
  merkleRoot: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  fileHashes: z.array(z.string().regex(/^0x[a-fA-F0-9]{64}$/)).nonempty(),
  repository: z.string().url().optional(),
  commit: z.string().min(7).optional(),
  totalEffortHours: z.number().int().positive(),
  developerHours: z.record(z.string(), z.number().int().nonnegative()).optional(),
});

export const SPVSchema = z.object({
  jurisdiction: z.string(),
  registeredName: z.string(),
  registrationNumber: z.string(),
  controllerWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  purpose: z.string(),
});

export const TokenizationRequestSchema = z.object({
  spvId: z.string().uuid(),
  ipMerkleRoot: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  appraisedValueUsd: z.number().positive(),
  ltvBps: z.number().int().min(1).max(10000),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const LoanRequestSchema = z.object({
  tokenId: z.string().uuid(),
  principalUsd: z.number().positive(),
  tenorDays: z.number().int().positive(),
  rateBps: z.number().int().positive(),
  borrower: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const DefaultSignalSchema = z.object({
  loanId: z.string().uuid(),
  reason: z.enum(["missed_payment", "covenant_breach", "fraud_signal"]),
  timestamp: z.number().int().positive(),
});

export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const detail = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Validation failed: ${detail}`);
  }
  return result.data;
}
