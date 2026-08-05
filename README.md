# cocarr-authorization-service

> Enterprise IAM Authorization Service with Policy-Based Access Control.

Part of the **Cocarr Enterprise Platform** ([CoCarr-org](https://github.com/CoCarr-org)).

Topics: `authorization`, `iam`, `rbac`, `pbac`, `permissions`, `security`

## Purpose
Evaluates access decisions using role-based and policy-based access control; the authoritative permission-decision point for the platform.

## Architecture
This repository is one component of the Cocarr platform, a service-oriented
system fronted by the API gateway. Requests flow through the gateway to the
identity, authorization, workspace, core and notification services, each backed
by its own database. See [`cocarr-docs`](https://github.com/CoCarr-org/cocarr-docs)
for the full platform architecture and Architecture Decision Records.

## Technology Stack
- Node.js
- Express
- RBAC + PBAC engine
- Jest

## Folder Structure
```
src/     # Policy engine, roles, permissions, evaluators
docs/    # Policy model and decision contracts
tests/   # Policy evaluation tests
.github/ # Issue/PR templates, workflows, CODEOWNERS
```

## Getting Started
```bash
# Clone
git clone https://github.com/CoCarr-org/cocarr-authorization-service.git
cd cocarr-authorization-service

# Work from the develop branch
git checkout develop
```
Copy `.env.example` to `.env` where applicable and install dependencies with
your package manager (`pnpm install`).

## Development
- Format: `pnpm prettier --write .`
- Lint: `pnpm lint`
- Test: `pnpm test`

Editor settings, Prettier, ESLint, EditorConfig and VS Code configuration ship
with the repository for a consistent developer experience.

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) and use the issue and pull
request templates. All changes require CODEOWNER review.

## Branch Strategy
| Branch    | Purpose                                   | Protected |
|-----------|-------------------------------------------|-----------|
| `main`    | Always-deployable production baseline     | Yes       |
| `develop` | Integration branch for feature work       | No        |
| `release` | Release-candidate stabilisation branch    | Yes       |

Feature branches: `feature/<description>` from `develop`.

## Deployment
Containerised and deployed to Railway.

## Security
See [SECURITY.md](SECURITY.md) for vulnerability reporting. Dependabot alerts
and secret scanning are enabled where supported.

## License
Licensed under the [MIT License](LICENSE).
