// SYSTEM ROLES and PERMISSION SETS seeded alongside the taxonomy.
//
// `permissions` here are GLOB PATTERNS expanded ONCE, at seed time, against the
// permissions the taxonomy declares. Resolution itself remains an exact
// permission-key match — there is no runtime wildcard, and adding one would
// change what every existing grant means. So a NEW module does not silently
// widen a seeded role: re-running the seed is what picks it up, which is a
// deliberate, reviewable act rather than a side effect of adding a screen.
//
// `isSystem` marks a role the platform relies on. `super-admin` additionally
// carries `isSuperAdmin`, which short-circuits resolution to "everything" —
// mirroring cocarr-core-api's `team.key === 'super-admin'` rule, and the reason
// it needs no permission list of its own.

const PERMISSION_SETS = [
  {
    key: 'workspace.read-only',
    name: 'Workspace — read only',
    description: 'View employees, org structure, recruitment and access requests.',
    permissions: ['workspace.*.read'],
  },
  {
    key: 'operations.read-only',
    name: 'Operations — read only',
    description: 'View every operations module without acting on any of them.',
    permissions: ['operations.*.read'],
  },
  {
    key: 'operations.finance',
    name: 'Operations — finance',
    description: 'Payments, dues, refunds, settlements, invoices and bank accounts.',
    permissions: ['operations.payments.*', 'operations.payouts.*'],
  },
  {
    key: 'platform.audit',
    name: 'Platform — audit',
    description: 'Read the audit trail and admin login history.',
    permissions: ['platform.auditLogs.*', 'platform.security.read'],
  },
];

const ROLES = [
  {
    key: 'super-admin',
    name: 'Super Administrator',
    description: 'Every permission, everywhere. Resolution short-circuits for this role.',
    isSuperAdmin: true,
    isSystem: true,
    permissions: [],
    permissionSets: [],
  },
  {
    key: 'platform-admin',
    name: 'Platform Administrator',
    description: 'Administers IAM, settings and system health — not the car-sharing business.',
    isSystem: true,
    permissions: ['platform.*'],
    permissionSets: ['platform.audit'],
  },
  {
    key: 'operations-manager',
    name: 'Operations Manager',
    description: 'Full access to the car-sharing operations product.',
    isSystem: true,
    permissions: ['operations.*'],
    permissionSets: [],
  },
  {
    key: 'operations-agent',
    name: 'Operations Agent',
    description: 'Reads everything in operations; may act on bookings only.',
    isSystem: true,
    permissions: ['operations.bookings.update'],
    permissionSets: ['operations.read-only'],
  },
  {
    key: 'finance-manager',
    name: 'Finance Manager',
    description: 'Payments, payouts, refunds and settlements.',
    isSystem: true,
    permissions: ['operations.reports.read'],
    permissionSets: ['operations.finance'],
  },
  {
    key: 'support-agent',
    name: 'Support Agent',
    description: 'Support queues, plus read-only customer and booking context.',
    isSystem: true,
    permissions: ['operations.support.*', 'operations.users.read', 'operations.bookings.read'],
    permissionSets: [],
  },
  {
    key: 'hr-manager',
    name: 'HR Manager',
    description: 'The whole employee lifecycle: recruitment, onboarding, org structure, access requests.',
    isSystem: true,
    permissions: ['workspace.*'],
    permissionSets: [],
  },
  {
    key: 'recruiter',
    name: 'Recruiter',
    description: 'Candidates and onboarding; reads employees for context.',
    isSystem: true,
    permissions: ['workspace.recruitment.*', 'workspace.employees.read'],
    permissionSets: [],
  },
];

// Approval chains the platform ships with. Workspace's access requests are the
// first consumer — the chain lives here so the workflow is configuration rather
// than a branch inside the Workspace service.
const APPROVAL_CHAINS = [
  {
    key: 'workspace.access-request.default',
    name: 'Access request — default',
    requestType: 'workspace.accessRequest',
    description: 'Reporting manager, then the platform administrator who applies the IAM change.',
    steps: [
      { name: 'Reporting manager', approverRoleKey: 'hr-manager', slaHours: 24 },
      { name: 'Platform administrator', approverRoleKey: 'platform-admin', slaHours: 48 },
    ],
  },
  {
    key: 'workspace.onboarding.default',
    name: 'Employee onboarding — approval',
    requestType: 'workspace.onboarding.approval',
    description: 'HR approves onboarding; approval mints the employee code and staff login.',
    steps: [
      { name: 'HR manager', approverRoleKey: 'hr-manager', slaHours: 24 },
    ],
  },
];

module.exports = { ROLES, PERMISSION_SETS, APPROVAL_CHAINS };
