# Approval flows

Every approval on the platform runs through **one engine** in
cocarr-authorization-service: an `approvalChain` says who must sign and in what
order, an `approvalRequest` is one thing walking that chain, and an
`approvalDecision` is one signature. Adding a flow is seeding a chain plus
teaching one service to wait for the outcome — it is never a new workflow table.

**IAM decides; the owning service acts.** The engine never performs the thing
being approved. It answers "has this been approved, by whom, when", and the
service that owns the data does the irreversible part once the answer is yes.
That boundary is why a lost HTTP response cannot leave IAM saying *approved*
while no employee exists.

---

## 1. Employee onboarding — `workspace.onboarding.approval`

**Live.** Chain `workspace.onboarding.default`, seeded.

| Step | Approver | SLA |
|---|---|---|
| 1 | HR manager (`hr-manager`) | 24h |

```
HR associate hires a candidate         POST /candidates/:id/hire
   └─> employee { status: onboarding, stage: profile }

HR associate fills the record and collects documents
   profile ──> documents ──> review    POST /onboarding/:id/advance

HR associate SUBMITS at review         opens an approvalRequest
   subjectType 'employee', subjectId <employee id>

HR manager approves                    POST /approval-requests/:id/decide
   └─> request.status = approved

workspace-api performs the side effect POST /onboarding/:id/approve
   ├─ mint EMP-000001
   ├─ create the Firebase staff login
   ├─ generate the password-reset link   ← returned ONCE, no re-fetch
   └─ status = active, stage = approved
```

**The reset link is the whole reason the ordering matters.** It is shown exactly
once and cannot be recovered, so it must be produced *after* a human has
approved, in one place, and handed straight to the person who approved.

**Rejection returns the employee to the reviewer, not to the start.** The
employee stays at `review` with the rejection note; HR fixes what was flagged and
submits again. Nothing is destroyed by a rejection.

**Not yet wired:** `workspace-api` does not consult the engine yet — today
`POST /onboarding/:id/approve` will still act on its own. The remaining work is
for it to require an approved request for the subject before minting anything.
Until then the chain is advisory.

---

## 2. Employee access — `workspace.accessRequest`

**Chain seeded, consumer not built.** Chain `workspace.access-request.default`.

| Step | Approver | SLA |
|---|---|---|
| 1 | Reporting manager (`hr-manager`) | 24h |
| 2 | Platform administrator (`platform-admin`) | 48h |

```
Employee (or their manager) requests access to a module/role
   POST /access-requests            (workspace-api, exists)

   └─> opens an approvalRequest, subjectType 'accessRequest'

Reporting manager approves           "should this person have it?"
Platform administrator approves      "apply it" — the IAM change itself

   └─> a roleAssignment is created in IAM
       accessRequest.iamApplied = true
```

**Two steps because they answer different questions.** The manager judges
whether the person needs it; the platform administrator is the one who actually
holds `platform.roles.create` and makes the grant. Collapsing them would either
let a manager mint IAM grants directly, or make the administrator the only person
who ever assesses need.

**`accessRequest.iamApplied` stays false today** — workspace-api records the
decision but nothing writes the resulting role assignment back to IAM. That
write-back is the missing half, and until it exists **an approved access request
does not grant anything.** Do not present it as access control.

---

## 3. Careers → onboarding — FUTURE, not built

Planned: job advertisement → application → application status → selection
stages → hired, feeding the employee onboarding flow above.

When it lands it is **a chain plus a consumer, not a second engine**:

- `careers.application.decision` — a chain over the selection stages
- The final "hired" transition calls the existing `POST /candidates/:id/hire`,
  which already produces an employee at `stage: profile`

That seam already exists, which is the point of building onboarding first: the
careers module has somewhere to hand off to, and onboarding does not need to know
whether a candidate arrived from a job advert or was typed in by hand.

Nothing in the current design assumes candidates are manually created.

---

## Adding a flow

1. Seed a chain in `src/seeds/roles.js` (`APPROVAL_CHAINS`) with its steps and
   approver roles. The pre-deploy seed picks it up.
2. Open a request when the thing is submitted:
   `POST /v1/platform/approval-requests` with `requestType`, `subjectType`,
   `subjectId`.
3. Have the owning service check
   `GET /v1/platform/approval-requests/subject/:subjectType/:subjectId`
   **before** the irreversible step, and refuse unless `status === 'approved'`.
4. Approvers see it in `GET /v1/platform/approval-requests/mine`.

**A missing chain refuses the request rather than auto-approving it.** A flow
whose chain was never seeded fails loudly at submission, naming the requestType —
it does not quietly let everything through.
