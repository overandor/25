import test from "node:test";
import assert from "node:assert/strict";
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from "undici";

import { createHttpClient } from "@ip-prime-brokerage/pkg-utils";
import { createOrchestrator } from "../src/orchestrator.js";

const previousDispatcher = getGlobalDispatcher();
const mockAgent = new MockAgent();
mockAgent.disableNetConnect();
setGlobalDispatcher(mockAgent);

const endpoints = {
  provenance: "http://provenance.local",
  spv: "http://spv.local",
  tokenization: "http://tokenization.local",
  lending: "http://lending.local",
};

const payload = {
  manifest: {
    merkleRoot: "0x" + "1".repeat(64),
    fileHashes: ["0x" + "2".repeat(64)],
    repository: "https://example.com/repo.git",
    commit: "abc1234",
    totalEffortHours: 100,
    developerHours: { alice: 60, bob: 40 },
  },
  spv: {
    jurisdiction: "DE",
    registeredName: "IP HoldCo",
    registrationNumber: "12345",
    controllerWallet: "0x" + "3".repeat(40),
    purpose: "ip_collateral",
  },
  tokenization: {
    spvId: "00000000-0000-0000-0000-000000000000",
    ipMerkleRoot: "0x" + "1".repeat(64),
    appraisedValueUsd: 1000,
    ltvBps: 3000,
    recipient: "0x" + "4".repeat(40),
  },
  loan: {
    tokenId: "00000000-0000-0000-0000-000000000000",
    principalUsd: 200,
    tenorDays: 30,
    rateBps: 1200,
    borrower: "0x" + "5".repeat(40),
  },
};

test("executeCollateralization chains services and returns aggregate result", async () => {
  const merkleRoot = "0x" + "1".repeat(64);
  mockAgent
    .get(endpoints.provenance)
    .intercept({ path: "/manifest", method: "POST" })
    .reply(201, { manifest: { ...payload.manifest, merkleRoot } }, { headers: { "content-type": "application/json" } });

  const spvId = "11111111-2222-3333-4444-555555555555";
  mockAgent
    .get(endpoints.spv)
    .intercept({ path: "/spv", method: "POST" })
    .reply(201, { spv: { ...payload.spv, id: spvId } }, { headers: { "content-type": "application/json" } });

  const tokenId = "99999999-8888-7777-6666-555555555555";
  mockAgent
    .get(endpoints.tokenization)
    .intercept({ path: "/tokenize", method: "POST" })
    .reply(201, { token: { ...payload.tokenization, spvId, tokenId } }, { headers: { "content-type": "application/json" } });

  const loanId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
  mockAgent
    .get(endpoints.lending)
    .intercept({ path: "/loans", method: "POST" })
    .reply(201, { loan: { ...payload.loan, tokenId, id: loanId } }, { headers: { "content-type": "application/json" } });

  const orchestrator = createOrchestrator({
    httpClient: createHttpClient({ timeoutMs: 2000 }),
    endpoints,
  });

  const result = await orchestrator.executeCollateralization(payload);

  assert.equal(result.spv.id, spvId);
  assert.equal(result.token.tokenId, tokenId);
  assert.equal(result.loan.id, loanId);
  assert.equal(result.manifest.merkleRoot, merkleRoot);
  assert.ok(result.plannedAt <= result.executedAt);
});

test.after(() => {
  setGlobalDispatcher(previousDispatcher);
});
