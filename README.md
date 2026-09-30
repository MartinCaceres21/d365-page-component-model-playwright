# D365 Page Component Model with Playwright

This repository is a public, educational example of how to structure Microsoft Dynamics 365 end-to-end automation with Playwright using a Page Component Model.

It is intentionally generic. It does not include client-specific logic, private URLs, credentials, or production data. The purpose is to explain the architecture and the reasoning behind it.

## Why this repository exists

Automating D365 is not the same as automating a simple marketing site or CRUD application.

D365 usually introduces a set of recurring testing problems:

- large forms with repeated controls
- dynamic shell blocking and loading states
- grids, dialogs, and lookup patterns that appear across many flows
- selectors that become fragile when copied directly into specs
- business processes that span multiple pages or sub-flows
- the same flow running against several entities with different data

If tests interact with all of that directly, specs quickly become long, repetitive, and hard to maintain.

This repository shows one way to solve that problem:

- keep specs focused on business intent
- move workflow orchestration into services
- move D365 control behavior into reusable components
- keep entity variation in the data layer instead of branching inside the workflow
- use fixtures as the composition root for the test runtime

## What "Page Component Model" means here

Classic Page Object Model often maps one class to one page.

That still applies: a page object models a screen. But D365 also repeats the same UI primitives across many forms:

- comboboxes
- dialogs
- grids
- blocking loaders

So this example uses both, with a clear split:

- a **page object** models one screen: how to reach it and where its screen-level controls are
- a **component** models one control that appears on many screens
- a **service** models a business workflow
- a **fixture** wires the runtime together
- a **spec** describes the scenario and verifies the outcome

## Repository structure

```txt
e2e/
|- components/      # Reusable D365 control abstractions
|- data/            # Test data per entity, with validation and builders
|- fixtures/        # Test composition and shared setup
|- pages/           # Page objects: one screen each
|- services/        # Business workflow orchestration
|- tests/           # Thin business-facing specs
\- utils/           # Cross-cutting helpers
```

## Design patterns, and where each one lives

The architecture is not a pile of folders. Each folder exists because a known pattern earns its place.

| Pattern | What it solves | Where it lives here |
| --- | --- | --- |
| Page Object | Encapsulate one screen | [e2e/pages/SalesOrderPage.ts](e2e/pages/SalesOrderPage.ts) |
| Component | Encapsulate a control reused across screens | [e2e/components/](e2e/components/) |
| Service Layer | Orchestrate a business workflow | [e2e/services/SalesOrderService.ts](e2e/services/SalesOrderService.ts) |
| Facade | Hide a complex setup behind something simple | [e2e/fixtures/testBasic.ts](e2e/fixtures/testBasic.ts) |
| Dependency Injection | Pass the pieces in instead of building them inside | the constructors of the service and the components |
| Builder | Assemble a complex object step by step | [e2e/data/SalesOrderBuilder.ts](e2e/data/SalesOrderBuilder.ts) |
| Data-driven variation | Vary the run per entity without branching | [e2e/data/salesOrderData.ts](e2e/data/salesOrderData.ts) |

That last row is where a Strategy pattern is often reached for too early. If only the *values* change per entity, the data layer is enough. Strategy is for when the *steps* themselves genuinely differ.

## Where does a new piece of code live?

When you write something new, the question is not "does it work?" but "where does it go?".

1. Is it a business rule or a whole flow? -> **service**
2. Is it interaction with a reusable control? -> **component**
3. Is it interaction with one specific screen? -> **page object**
4. Does it prepare context: login, company, data? -> **fixture**
5. Is it a verification of the case? -> it stays in the **spec**
6. Is it a value that changes per entity or scenario? -> **data**

## D365 problems mapped to layers

| Problem | Layer that owns it |
| --- | --- |
| Login and session | Fixture / `AuthService` |
| Active company (entity) | Fixture, carried into the URL by the page object |
| Data that differs per entity | Data layer: loader plus validation |
| Combobox that only commits on blur | Component |
| Repeated grid or dialog | Component |
| Full sales order flow | Service |
| Verifying the result | Spec (assertion) |

## Layer responsibilities

### `components`

Components wrap technical interaction with recurring D365 controls: the selector strategy for a control type, the synchronization specific to that control, and the low-level interaction details.

Two D365 specifics are solved here once, for the whole suite:

- `ComboboxComponent` types the value, presses `Tab` so D365 fires its internal event, and only then continues. Without the blur the field *looks* filled but the value was never committed, and the test fails later in a confusing place.
- `LoadingComponent` waits for the blocking overlay to be hidden. Wait for observable state, never for the clock: a fixed timeout passes locally and fails in the pipeline.

What does not belong here: end-to-end business workflows, business assertions, authentication or environment setup.

### `pages`

A page object owns one screen: how to navigate to it, and where its screen-level controls are.

`SalesOrderPage` navigates by menu item (`?cmp=<entity>&mi=SalesTableListPage`) instead of clicking through the shell menu. That is stable across releases and carries the company in the URL.

### `services`

Services express business intent using page objects and components: multi-step flow logic, sequencing, and reusable business actions shared by several specs.

What does not belong here: raw duplicated locators, global test setup, and — specifically for D365 — branching per entity. If the values differ per entity, that variation belongs in the data layer so the service stays generic.

### `data`

The data layer resolves and validates a dataset before the browser does anything:

- per-entity values live in one map instead of being scattered through the workflow
- `validateSalesOrderData` fails fast and loud on a missing value

Silently defaulting a missing value makes the test pass while exercising the wrong scenario. A test that fails clearly is worth more than one that passes lying.

`SalesOrderBuilder` starts from the entity dataset and overrides only what a scenario needs, so a variation does not require a new service method.

### `fixtures`

Fixtures act as the composition root. They prepare the Playwright runtime, resolve shared setup such as authentication and the active entity, instantiate components and services, and expose a clean facade to specs.

This keeps specs small and prevents every test from rebuilding the same object graph. No spec should ever log in by itself.

### `tests`

Specs describe the scenario and verify it. A good spec in this style calls a service, passes scenario inputs, and performs a small number of meaningful assertions.

**Objects act, the spec verifies.** Assertions stay in the spec: if they are hidden inside a service or a page object, whoever reads the test no longer knows what is being checked. Components may still *wait* for state — that is synchronization, not a business assertion.

## Request flow in this example

1. The spec declares the business scenario.
2. The fixture provides authenticated page context, the resolved entity dataset, and ready-to-use objects.
3. The service expresses the D365 workflow at a business level.
4. The page object and the components encapsulate interaction with the screen and its recurring UI primitives.

## Example walkthrough

The thin example spec is [e2e/tests/sales-orders/create-direct-sales-order.spec.ts](e2e/tests/sales-orders/create-direct-sales-order.spec.ts).

It depends on [e2e/fixtures/testBasic.ts](e2e/fixtures/testBasic.ts), which composes:

- [e2e/utils/AuthService.ts](e2e/utils/AuthService.ts)
- [e2e/data/salesOrderData.ts](e2e/data/salesOrderData.ts)
- [e2e/pages/SalesOrderPage.ts](e2e/pages/SalesOrderPage.ts)
- [e2e/components/ComboboxComponent.ts](e2e/components/ComboboxComponent.ts)
- [e2e/components/DialogComponent.ts](e2e/components/DialogComponent.ts)
- [e2e/components/GridComponent.ts](e2e/components/GridComponent.ts)
- [e2e/components/LoadingComponent.ts](e2e/components/LoadingComponent.ts)
- [e2e/services/SalesOrderService.ts](e2e/services/SalesOrderService.ts)

Authentication stays a placeholder on purpose: publishing a real login flow is not the point of this repository.

## Running it

```bash
npm ci
npx playwright install --with-deps chromium
cp .env.example .env     # then point D365_BASE_URL at your own sandbox
npm test
```

The UI specs skip themselves when `D365_BASE_URL` is not set, so a clean checkout stays green. The data-layer specs in [e2e/tests/data/](e2e/tests/data/) run everywhere: no browser, no sandbox.

`D365_ENTITY` selects the dataset. CI runs the same suite once per entity through a matrix: same flow, different data, no branching in the code.

## Design principles

- Specs stay thin, business-oriented, and own the assertions.
- Components absorb D365 UI complexity: one problem, one place.
- Services own workflow sequencing and stay free of entity branching.
- Fixtures compose dependencies and shared setup.
- Wait for observable state, never for the clock.
- Data is validated before execution, never silently defaulted.
- Every check must be able to fail: anchor it to the record this run created, not to anything that happens to match. See *Reads that answer a different question* in [framework-architecture-philosophy.md](framework-architecture-philosophy.md).

## When not to add a layer

The opposite mistake to "everything in the spec" is abstracting too early.

- Rule of three: do not move something into a shared place until it has repeated three times. With a single occurrence you do not yet know what the real pattern is.
- An abstraction is good only if it lowers the cost of change. The control question: does this make the next change easier, or only more indirect?

A repository this size can afford to show every layer because the layers are its subject. A real suite should grow into them.

## What this repository is not

This repository is not:

- a production-ready D365 automation framework
- a client implementation
- a full selector library
- a reference for authentication hardening

It is a documentation-first example of how to organize the automation codebase.

## Next step if you want to go deeper

See [framework-architecture-philosophy.md](framework-architecture-philosophy.md) for a deeper explanation of why this structure fits D365 particularly well.
