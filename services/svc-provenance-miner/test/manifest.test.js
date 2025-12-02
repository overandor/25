import { test } from "node:test";
import assert from "node:assert";
import { computeMerkleRoot } from "../src/manifest.js";

const fixture = [
  "0x" + "aa".repeat(32),
  "0x" + "bb".repeat(32),
  "0x" + "cc".repeat(32),
];

test("merkle root is deterministic", () => {
  const first = computeMerkleRoot(fixture);
  const second = computeMerkleRoot([...fixture]);
  assert.strictEqual(first, second);
});
