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

## Authentication fails closed
`authMiddleware` has three modes: a trusted `x-gateway-key` edge (identity
headers minted by cocarr-api-gateway — no second Firebase verification), a dev
bypass requiring `AUTH_DISABLED=true` **and** `NODE_ENV !== 'production'`, and
direct bearer-token verification. With neither `GATEWAY_KEY` nor
`ADMIN_SERVICE_ACCOUNT`, every authenticated route answers **503
`AUTH_UNAVAILABLE`**; a **non-matching** gateway key is a hard deny, never a
fall-through. `GET /v1/health` reports the live mode in its `auth` field.

Unconfigured credentials previously attached a synthetic `dev` actor, so a
missing or malformed service account in production turned this service into an
open API with no error anywhere.

## The taxonomy is five levels: Product > Portal > Module > SubModule > Action
`subModule` is ONE SCREEN inside a module — the granularity access is actually
argued about ("they may see Bookings, but not Bookings > Damages"). **Its key is
its nav route** (`/dashboard/operations/damages`): already unique, already
stable, already what the client navigates by, and a parallel slug vocabulary
would be two lists that drift (core-api reached the same conclusion). A module
with no sub-modules is complete — the level is optional, not a required rung.

`permission.subModuleId` is nullable and every pre-existing permission has it
null (= module level), so adding the rung needed no migration and changed no
resolution result. **The permission KEY, not the foreign keys, is still what
authorization compares** — a permission re-parented in the taxonomy must not
silently become a different grant.

`module`/`portal`/`product` carry `route`/`icon`/`sortOrder`: nav metadata, so
where a screen appears is IAM data edited at runtime, not a hardcoded client list.

## `GET /me/navigation` — what the dynamic UI renders itself from
`navigationService`. One call returns the taxonomy tree **already filtered** to
this principal, plus flat `permissions`, the `routes` it may open, held roles/sets
and in-scope `featureFlags`. A client rendering this needs no module list of its
own, so a new module reaches the sidebar by being seeded — no frontend deploy.

- **Visibility is decided by a held PERMISSION at every level, never a role.**
  `actions` on each node is what this principal holds there, which is what a
  button gates on — the client never reasons about roles.
- **A module survives on the strength of a child**: if its only grant is one
  sub-module, it still appears, or that screen is unreachable.
- The tree is assembled in JS from five flat reads, not one nested include — a
  five-level eager load is exactly where one missing association takes out the
  whole response.
- `/principals/:id/navigation` gives the same payload for someone else: "what
  does this person actually see?", which is the question behind every
  permissions complaint.

## Permission sets fold into resolution (they are not decorative)
A role's permissions are the UNION of its direct permissions and every **active**
set it holds. Editing a set edits every role holding it, immediately — that is
the point, and the thing to be careful about. An inactive set grants nothing, so
deactivating one actually removes access rather than just hiding it.

## The bootstrap owner — the account that cannot lock itself out
`src/services/bootstrapOwnerService.js`. **`BOOTSTRAP_OWNER_EMAIL`** (default
`cocarrluxury23@gmail.com`) always holds `super-admin`.

A seeded IAM grants nobody anything — 171 permissions and 8 roles, zero
assignments — and every endpoint that could create the first assignment itself
requires a permission. Without this, a fresh database is administrable by
nobody. Same purpose as core-api's `ensureBootstrapSuperAdmin`.

**It runs at AUTHENTICATION time, not at boot**, and that is forced by the
design: this service holds no identity data (`principalId` is an opaque string,
no email column anywhere), so there is nothing to look an email up against at
boot. The email only ever arrives on a request, minted by the gateway or read
off the verified token, next to the principal id it belongs to.

- **It re-checks on every request, which is the lockout guarantee.** A revoked
  or expired owner assignment is restored on the owner's next request, so a
  mistake in the IAM UI cannot permanently lock the platform's owner out of it.
- **It creates a REAL `roleAssignment`**, not a special case inside resolution.
  A hidden rule granting access with no row would be invisible in the
  assignments list and in `/principals/:id/navigation` — the two places someone
  looks to answer "why does this person have this?" — and would make the owner
  the one principal whose access the data could not explain.
- **`ensure()` never throws.** It runs inside `authenticate`; a DB blip must not
  turn a valid request into a 500. It returns early on a string compare for
  every other account, so the normal path costs nothing.
- Falls back to the Firebase uid when `identityId` is absent (the owner signed
  in before `POST /v1/auth/verify` created their identity row) — the same
  fallback `navigationController` uses.
- If the `super-admin` role is missing it logs and names `seedTaxonomy.js`
  rather than failing silently.

`node scripts/verifyBootstrapOwner.js` exercises all of the above against
stubbed models — no MySQL needed.

## Seeding — `scripts/seedTaxonomy.js`
```
node scripts/seedTaxonomy.js --dry-run     # touches NO database, runs anywhere
node scripts/seedTaxonomy.js --confirm     # 3 products, 26 modules, 63 sub-modules,
                                           # 167 permissions, 4 sets, 8 roles, 2 chains
```
`src/seeds/taxonomy.js` was **generated from cocarr-platform-web's real
`navConfig.js`** (17 groups / 63 pages / 21 RBAC modules) so IAM and the sidebar
people actually use cannot disagree on day one. Regenerate it after a nav change.

**Idempotent and additive.** It never deletes anything, and it **never re-grants
an existing role** — somebody narrowing a seeded role in the admin UI made a
decision, and a seed restoring defaults on the next deploy would revert it with
no trace. `--regrant-roles` forces it when that really is the intent.

Seed-time globs (`operations.*`) are expanded ONCE against declared permissions.
**Resolution stays exact-match** — there is no runtime wildcard, so a new module
never silently widens a seeded role.

## Every IAM read requires authentication
The taxonomy is a map of every module, screen and action the platform has;
handing that to an anonymous caller describes the attack surface for free. All
reads (and `/authorize`) now sit behind `authenticate` — only `/health` is public.
`crudRouterFactory` exists so that stays true for new resources: seven
hand-written routers drift, and what drifts first is which routes need auth.

## Deferred (documented, additive)
- **Approval REQUESTS** — the chains (shape) exist; the per-request step
  decisions (`approvalRequest` + `approvalStepDecision`) do not. Workspace's
  access requests are the first intended consumer.
- **Scoped assignments are REPORTED, not ENFORCED.** `roleAssignment.organizationId`
  and `effective().scopes` carry the org, but resolution does not narrow
  permissions by it — that needs every call site to pass the org it acts in. Do
  not describe scoped assignments as enforced.
- **Feature flags branch nothing.** Surfaced on the navigation payload, read by
  no server-side path. Same state as core-api's table, and the same warning: a
  flag nobody reads looks exactly like a switch that works.
- **Policy conditions** (`policy.condition` JSON stored, not evaluated) — ABAC.
- Wildcard permission keys at runtime, tests.

## Verified — against a real MySQL
`db.sync({alter:true})` creates all **19 tables** in one clean pass (no aborted
sync, so nothing is silently missing). `seedTaxonomy.js --confirm` writes the
full tree — 3 products, 27 modules, 63 sub-modules, 171 permissions, 4 sets, 8
roles, 2 chains — and a re-run recognises all 281 rows and creates no duplicates.

Live resolution, confirmed end to end:
- **Permission sets fold in**: operations-agent resolves to 53 permissions (52
  from `operations.read-only` plus the direct `operations.bookings.update`).
- **Deny wins** over a set-granted permission: 53 → 52, and `/authorize` refuses.
- **Temporary access** needs no cron — an assignment expiring in 3s grants 15
  permissions, then 0 once the window passes; an already-expired one grants 0.
- **Delegation** hands the delegatee the lent role's 15 permissions.
- `GET /me/navigation` returns 11 modules / 41 routes for that principal, with
  `bookings` carrying `["read","update"]` and its four screens.
- Every access change lands in `auditLogs`.

Cross-service: cocarr-workspace-api enforcing against this service refuses an
operations-agent (`403 workspace.employees.read`) and serves an hr-manager, whose
`POST /departments` writes a real row.
