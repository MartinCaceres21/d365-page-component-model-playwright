# D365 Page Component Model - Playwright Example

Example automation framework for Microsoft Dynamics 365 using Playwright, TypeScript and Page Component Model.

This repository is intentionally generic. It does not contain real client data, real implementation details, internal URLs, credentials, business identifiers or production datasets.

## Purpose

The goal is to show how to structure a maintainable E2E automation framework for D365 without turning tests into fragile UI scripts.

The framework separates responsibilities into clear layers:

- `tests`: thin business-oriented specs.
- `fixtures`: shared execution setup.
- `services`: business flow orchestration.
- `components`: reusable D365 UI interactions.
- `data`: deterministic test data by domain, case and legal entity.
- `utils`: authentication, data loading, entity resolution and validation.

## Architecture

```txt
e2e/
├─ components/      # Atomic UI interactions
├─ services/        # Business workflow orchestration
├─ fixtures/        # Playwright fixture facade
├─ data/            # Generic sample datasets
├─ tests/           # Thin specs
└─ utils/           # Framework utilities
```

## Design principles

- Keep specs small and focused on business intent.
- Encapsulate D365 UI complexity inside components.
- Keep business workflows inside services.
- Resolve authentication, data and object composition in fixtures.
- Use semantic selectors where possible.
- Prefer state-based waits over fixed timeouts.
- Fail fast when required test data is missing.
- Keep services independent from legal entity-specific logic.

## Setup

```bash
npm install
npx playwright install
cp .env.example .env
```

Update `.env` with local or sandbox values.

```env
D365_BASE_URL=https://example-d365-sandbox.local
ENTITIES=USMF
```

## Run tests

```bash
npm test
```

Run headed:

```bash
npm run test:headed
```

Show report:

```bash
npm run report
```

## Notes

This is a learning repository. The selectors and flows are illustrative and may need to be adapted to a real D365 sandbox.
