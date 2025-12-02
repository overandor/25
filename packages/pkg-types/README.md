pkg-types

Purpose
- single source of truth for TypeScript types shared across apps and services

Key schemas
- ProvenanceManifest: { projectId, repoPath, merkleRoot, files[], appraisalId }
- SpvEntity: { jurisdiction, entityId, registeredAgent, governanceDocs[] }
- LoanTermSheet: { loanId, collateralTokenId, ltvBps, curePeriod, oracleFeedId }
- OracleSignal: { loanId, status, signature, txHash }

Usage
- exported as ESM modules resolved via tsconfig paths in each workspace
- drives OpenAPI/GraphQL schema generation for svc-api-gateway
