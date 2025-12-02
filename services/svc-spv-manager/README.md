svc-spv-manager

Role
- programmatically forms and manages SPVs that legally own borrower IP

Capabilities
- integrates with jurisdictional entity formation APIs, registers agents, stores charter docs
- maintains mapping between borrower identity, SPV entityId, and downstream IPNFToken metadata
- exposes webhook to notify svc-tokenization-engine when SPV is ready for token minting

Controls
- enforces segregation of duties; only trustee-admin scopes can dissolve or transfer SPV ownership
- logs every filing + consent for auditing and enforcement alignment
