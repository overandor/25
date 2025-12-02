import { randomUUID } from "crypto";
import { validate, LoanRequestSchema } from "@ip-prime-brokerage/pkg-types";

const loans = new Map();

export function createLoan(request) {
  const data = validate(LoanRequestSchema, request);
  const loanId = randomUUID();
  const record = { id: loanId, status: "pending", ...data, createdAt: Date.now() };
  loans.set(loanId, record);
  return record;
}

export function approveLoan(id) {
  const loan = loans.get(id);
  if (!loan) return null;
  loan.status = "active";
  loan.approvedAt = Date.now();
  return loan;
}

export function markDefault(id, reason) {
  const loan = loans.get(id);
  if (!loan) return null;
  loan.status = "default";
  loan.defaultReason = reason;
  loan.defaultedAt = Date.now();
  return loan;
}

export function getLoan(id) {
  return loans.get(id);
}
