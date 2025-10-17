/**
 * Global account types (identity) — from the product spec:
 * Founder, Partner, Employee, Mentor, Investor, Admin
 * Note: Workspace roles (per-business) will be added later.
 */
export type AccountType = "Founder" | "Partner" | "Employee" | "Mentor" | "Investor" | "Admin";

/**
 * Minimal capability map (expand later to full RBAC from the spec).
 * This is just to demonstrate how you'd gate pages/components by account type.
 */
export const Capabilities: Record<AccountType, { dashboard: boolean; canCreateBusiness: boolean; viewSensitive: boolean; }> = {
  Founder:  { dashboard: true, canCreateBusiness: true,  viewSensitive: true },
  Partner:  { dashboard: true, canCreateBusiness: false, viewSensitive: true },
  Employee: { dashboard: true, canCreateBusiness: false, viewSensitive: false },
  Mentor:   { dashboard: true, canCreateBusiness: false, viewSensitive: false },
  Investor: { dashboard: true, canCreateBusiness: false, viewSensitive: false },
  Admin:    { dashboard: true, canCreateBusiness: true,  viewSensitive: true },
};

/** Simple check helper */
export function canViewSensitive(accountType?: AccountType) {
  return accountType ? Capabilities[accountType].viewSensitive : false;
}
