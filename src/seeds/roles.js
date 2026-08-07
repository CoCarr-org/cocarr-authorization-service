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
    department: 'EXEC',
    name: 'Super Administrator',
    description: 'Every permission, everywhere. Resolution short-circuits for this role.',
    isSuperAdmin: true,
    isSystem: true,
    permissions: [],
    permissionSets: [],
  },
  {
    // THE DEFAULT ROLE every employee gets at onboarding, and the floor nobody
    // drops below. Without it a newly onboarded employee holds nothing at all:
    // an empty sidebar and a 403 on every call, which reads as a broken account
    // rather than "your access has not been decided yet".
    //
    // It grants exactly one thing — reading the employee directory — because a
    // baseline that grants nothing is indistinguishable from no role, and a
    // baseline that grants more becomes the thing everybody silently has. A
    // super admin assigns the real role afterwards; this is the starting point,
    // not the destination.
    key: 'employee',
    name: 'Employee',
    description: 'Baseline access for every onboarded employee. Specific roles are assigned on top.',
    isSystem: true,
    permissions: ['workspace.employees.read'],
    permissionSets: [],
  },
  {
    key: 'platform-admin',
    department: 'TECH',
    name: 'Platform Administrator',
    description: 'Administers IAM, settings and system health — not the car-sharing business.',
    isSystem: true,
    permissions: ['platform.*'],
    permissionSets: ['platform.audit'],
  },
  {
    key: 'operations-manager',
    department: 'OPS',
    name: 'Operations Manager',
    description: 'Full access to the car-sharing operations product.',
    isSystem: true,
    permissions: ['operations.*'],
    permissionSets: [],
  },
  {
    key: 'operations-agent',
    department: 'OPS',
    name: 'Operations Agent',
    description: 'Reads everything in operations; may act on bookings only.',
    isSystem: true,
    permissions: ['operations.bookings.update'],
    permissionSets: ['operations.read-only'],
  },
  {
    key: 'finance-manager',
    department: 'FIN',
    name: 'Finance Manager',
    description: 'Payments, payouts, refunds and settlements.',
    isSystem: true,
    permissions: ['operations.reports.read'],
    permissionSets: ['operations.finance'],
  },
  {
    key: 'support-agent',
    department: 'SUP',
    name: 'Support Agent',
    description: 'Support queues, plus read-only customer and booking context.',
    isSystem: true,
    permissions: ['operations.support.*', 'operations.users.read', 'operations.bookings.read'],
    permissionSets: [],
  },
  {
    key: 'hr-manager',
    department: 'PPL',
    name: 'HR Manager',
    description: 'The whole employee lifecycle: recruitment, onboarding, org structure, access requests.',
    isSystem: true,
    permissions: ['workspace.*'],
    permissionSets: [],
  },
  {
    key: 'recruiter',
    department: 'PPL',
    name: 'Recruiter',
    description: 'Candidates and onboarding; reads employees for context.',
    isSystem: true,
    permissions: ['workspace.recruitment.*', 'workspace.employees.read'],
    permissionSets: [],
  },

  // ── the gaps ────────────────────────────────────────────────────────────
  //
  // Eight departments existed with roles for only five of them, so Technology,
  // Growth and Risk had people and nothing to assign them. Each of these is a
  // function the Access Matrix spec already names — they were simply never
  // seeded, which left the org chart and the permission model disagreeing about
  // which functions the business has.
  //
  // Every department now has a MANAGER and, where the work is genuinely split
  // by seniority, an agent tier. That pairing is what a role means here: it is
  // the old team-and-level combined, so Operations Manager and Operations Agent
  // are two roles rather than two levels of one.
  {
    key: 'developer',
    department: 'TECH',
    name: 'Developer / DevOps',
    description: 'System health, integrations and feature flags. Reads the audit trail; administers no accounts.',
    isSystem: true,
    permissions: [
      'platform.systemHealth.*', 'platform.integrations.*', 'platform.featureFlags.*',
      'platform.auditLogs.read',
    ],
    permissionSets: [],
  },
  {
    key: 'fleet-manager',
    department: 'OPS',
    name: 'Fleet Manager',
    description: 'Vehicles and hosts — onboarding, RC verification, approvals and availability.',
    isSystem: true,
    permissions: ['operations.vehicles.*', 'operations.hosts.*', 'operations.masterData.read'],
    permissionSets: [],
  },
  {
    key: 'support-manager',
    department: 'SUP',
    name: 'Support Manager',
    description: 'Runs the support desk: tickets, escalations and the bookings behind them.',
    isSystem: true,
    permissions: [
      'operations.support.*', 'operations.bookings.*', 'operations.users.read',
      'operations.dashboard.read',
    ],
    permissionSets: [],
  },
  {
    key: 'finance-analyst',
    department: 'FIN',
    name: 'Finance Analyst',
    description: 'Reads payments, payouts and reports. Deliberately no write access to money.',
    isSystem: true,
    permissions: ['operations.payments.read', 'operations.payouts.read', 'operations.reports.read'],
    permissionSets: [],
  },
  {
    key: 'marketing-manager',
    department: 'GRW',
    name: 'Marketing Manager',
    description: 'Campaigns, referrals and offers, with the reporting to judge them.',
    isSystem: true,
    permissions: ['operations.marketing.*', 'operations.reports.read', 'operations.dashboard.read'],
    permissionSets: [],
  },
  {
    key: 'analytics-viewer',
    department: 'GRW',
    name: 'Analytics Viewer',
    description: 'Reports and dashboards, read-only. The narrowest role that is still useful.',
    isSystem: true,
    permissions: ['operations.reports.read', 'operations.dashboard.read'],
    permissionSets: [],
  },
  {
    key: 'compliance-officer',
    department: 'RSK',
    name: 'KYC & Compliance Officer',
    description: 'Identity and document review for riders and hosts — the approval side of onboarding.',
    isSystem: true,
    permissions: ['operations.users.*', 'operations.hosts.read', 'operations.dashboard.read'],
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
