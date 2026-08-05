# cocarr-authorization-service

> Enterprise IAM Authorization Service with Policy-Based Access Control.

Part of the **Cocarr Enterprise Platform** ([CoCarr-org](https://github.com/CoCarr-org)).

Topics: `authorization`, `iam`, `rbac`, `pbac`, `permissions`, `security`

## Purpose
The platform's central **IAM decision point**. Owns the permission taxonomy
(Product → Portal → Module → Action), roles and permissions (RBAC), allow/deny
policies (PBAC), role assignments with **temporary access**, **delegation**,
audit, and — the core — **permission resolution**: the single answer to
"what may this principal do?".

Sits behind the API Gateway at `/v1/platform/*`. Complements the Identity
Service (which answers "who is this?"); this service answers "what may they do?".

## Permission model
```
Product → Portal → Module → Action        (taxonomy)
Permission  = a grantable action, keyed e.g. 'workspace.employees.read'
Role        → many Permissions            (RBAC)
Policy      → allow/deny a permission for a principal or role  (PBAC, DENY WINS)
Assignment  → role granted to a principal, optional expiresAt  (temporary access)
Delegation  → a role lent to another principal for a time window
```

**Resolution** = active assignments + active delegations → roles → permissions,
then policies applied (allow adds, **deny overrides**); a `isSuperAdmin` role
short-circuits to "all". Expiry windows on assignments and delegations are
honoured automatically.

## Technology Stack
- Node.js + Express, Sequelize (MySQL)
- Firebase Admin (JWT verification on mutating endpoints)
- express-validator, winston, swagger-ui-express

## Key endpoints
| Method | Path | What |
|---|---|---|
| GET | `/v1/health` · `/v1/docs` | liveness · Swagger |
| CRUD | `/v1/products` `/v1/portals` `/v1/modules` `/v1/permissions` | taxonomy |
| CRUD | `/v1/roles` | roles |
| PUT | `/v1/roles/:id/permissions` | set a role's permissions |
| POST/DEL | `/v1/assignments` · `/v1/assignments/:id` | assign / revoke (`expiresAt` = temporary) |
| GET | `/v1/assignments/principal/:id?activeOnly=true` | a principal's assignments |
| CRUD | `/v1/policies` | allow/deny policies |
| POST/DEL | `/v1/delegations` | delegate a role for a window |
| **GET** | **`/v1/principals/:id/permissions`** | **effective permissions** |
| **POST** | **`/v1/authorize`** | **decision: `{principalId, permission}` → `{allow, reason}`** |
| GET | `/v1/audit` | access-change audit log |

## Getting Started
```bash
git clone https://github.com/CoCarr-org/cocarr-authorization-service.git
cd cocarr-authorization-service && git checkout develop
cp .env.example .env && npm install && npm run dev   # :3060/v1/health, docs /v1/docs
```

## Branch Strategy
`main` (protected) · `develop` (working) · `release`.

## Deployment
Docker + Railway (`railway.json`, healthcheck `/v1/health`) from `develop`. Backed
by `cocarr-iam-db`. Reached via `cocarr-api-gateway` (`/v1/platform`). See
[`CLAUDE.md`](CLAUDE.md) for the resolution rules and what is deferred.

## License
[MIT](LICENSE).
