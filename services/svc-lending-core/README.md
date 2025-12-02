svc-lending-core

Role
- central loan engine connecting provenance data to collateral locks and cash flow monitoring

Functions
- ingest manifests + valuations → compute risk-adjusted LTV, haircut schedule
- manage loan applications, approvals, drawdowns, repayments
- coordinate IPCollateralManager escrow instructions and monitor contract events
- expose telemetry APIs for apps and svc-legal-oracle

Data model highlights
- Loan: {loanId, borrowerId, tokenId, principal, rate, maturity, curePeriod}
- CovenantState: {loanId, metric, threshold, observed}
- CollateralState: mirrored from IPCollateralManager (enum + timestamp)
