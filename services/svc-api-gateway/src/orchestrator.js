import {
  validate,
  ProvenanceManifestSchema,
  SPVSchema,
  TokenizationRequestSchema,
  LoanRequestSchema,
} from "@ip-prime-brokerage/pkg-types";

export function createOrchestrator({ httpClient, endpoints }) {
  if (!httpClient) throw new Error("httpClient is required");
  const requiredEndpoints = ["provenance", "spv", "tokenization", "lending"];
  for (const key of requiredEndpoints) {
    if (!endpoints?.[key]) throw new Error(`missing endpoint: ${key}`);
  }

  async function executeCollateralization(input) {
    const plan = planCollateralization(input);

    const manifestResult = await httpClient.post(`${endpoints.provenance}/manifest`, plan.manifest);
    const spvResult = await httpClient.post(`${endpoints.spv}/spv`, plan.spv);
    const tokenResult = await httpClient.post(`${endpoints.tokenization}/tokenize`, {
      ...plan.tokenization,
      spvId: spvResult.spv.id,
    });
    const loanResult = await httpClient.post(`${endpoints.lending}/loans`, {
      ...plan.loan,
      tokenId: tokenResult.token.tokenId,
    });

    return {
      manifest: manifestResult.manifest,
      spv: spvResult.spv,
      token: tokenResult.token,
      loan: loanResult.loan,
      plannedAt: plan.plannedAt,
      executedAt: Date.now(),
    };
  }

  return { executeCollateralization };
}

export function planCollateralization({ manifest, spv, tokenization, loan }) {
  const validatedManifest = validate(ProvenanceManifestSchema, manifest);
  const validatedSpv = validate(SPVSchema, spv);
  const validatedToken = validate(TokenizationRequestSchema, tokenization);
  const validatedLoan = validate(LoanRequestSchema, loan);
  return {
    manifest: validatedManifest,
    spv: validatedSpv,
    tokenization: validatedToken,
    loan: validatedLoan,
    plannedAt: Date.now(),
  };
}
