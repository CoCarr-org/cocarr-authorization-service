# cocarr-authorization-service

Express + Sequelize (MySQL) IAM service. The platform's **decision point** —
"what may this principal do?". Mirrors the other services' conventions.
**Working branch: `develop`.** Port **3060**. Gateway upstream: `/v1/platform`.

## The resolution rules (resolutionService.js — the heart)
`effective(principalId)`:
1. Active **role assignments** (`revokedAt` null, `expiresAt` null or future) +
   active **delegations** to the principal (within `[startsAt, expiresAt)`) → role ids.
2. Roles → their permissions (via `rolePermission`). Any `isSuperAdmin` role ⇒
   `superAdmin: true` (short-circuits to "all", like core-api's super-admin team).
3. **Policies** matching the principal or its roles: `allow` adds a permission
   key, `deny` removes it. **DENY WINS.**
`authorize(principalId, permission)` → `{ allow, reason }`. Super-admin allows
all; otherwise exact permission-key match.

- **Temporary access** = an assignment with `expiresAt`. **Delegation** = a role
  lent for a window. Both are honoured purely by their time fields — no cron
  needed; resolution filters on `now` every call.
- **`principalId` is a free string** — the platform identity id from the Identity
  service (or any subject). No cross-service FK by design.
- **Permission keys are the currency** (e.g. `workspace.employees.read`). The
  `permission.key` is what everything checks against; `moduleId`/`action` are
  structured mirrors for the UI.

## Relationship to core-api's RBAC
core-api still has its own in-process RBAC (`resolveAccess`/`requirePermission`)
for the admin panel today. This service is the **platform-wide** IAM the charter
describes; migrating core-api to call `/v1/authorize` (instead of its local grid)
is a later, deliberate step — do not rip out core-api's RBAC yet.

## Deferred (documented, additive)
- **Permission Sets** (bundles of permissions reusable across roles) — charter
  item; add a `permissionSet` + `setPermission` + `roleSet`, fold into resolution.
- **Approval Chains** (multi-step approval for access requests) — charter item;
  add `approvalChain` + `approvalRequest` with step decisions. The Workspace
  service's access-requests would feed these.
- **Policy conditions** (`policy.condition` JSON is stored but not yet evaluated)
  — ABAC-style attribute checks.
- Wildcard permission keys (`module.*`), scoped assignments enforcement, tests.

## Verified
Syntax-clean; full require graph loads; live HTTP smoke test (health/docs,
`/authorize` guard path, roles validation 400, resolution routes, 404) with the
DB intentionally unreachable. Full resolution (deny-override, expiry, delegation)
needs a MySQL instance — see cocarr-devops compose.
