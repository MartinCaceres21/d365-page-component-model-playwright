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

If tests interact with all of that directly, specs quickly become long, repetitive, and hard to maintain.

This repository shows one way to solve that problem:

- keep specs focused on business intent
- move workflow orchestration into services
- move D365 control behavior into reusable components
- use fixtures as the composition root for the test runtime

## What "Page Component Model" means here

Classic Page Object Model often maps one class to one page.

That can work, but D365 tends to repeat the same UI primitives across many forms:

- comboboxes
- dialogs
- grids
- blocking loaders

For that reason, this example emphasizes components over page-sized objects.

In this repository:

- a `component` models a reusable UI behavior
- a `service` models a business workflow
- a `fixture` wires the runtime together
- a `spec` describes the scenario in the smallest possible form

## Repository structure

```txt
e2e/
|- components/      # Reusable D365 control abstractions
|- services/        # Business workflow orchestration
|- fixtures/        # Test composition and shared setup
|- tests/           # Thin business-facing specs
\- utils/           # Cross-cutting helpers
```

## Layer responsibilities

### `components`

Components wrap technical interaction with recurring D365 controls.

Examples:

- waiting for the shell loader
- filling a combobox
- locating a dialog
- reading or targeting a grid cell

What belongs here:

- selector strategy for a control type
- synchronization specific to that control
- low-level interaction details

What does not belong here:

- end-to-end business workflows
- test assertions about a whole scenario
- authentication or environment setup

### `services`

Services express business intent using components.

A service should read like workflow orchestration:

- open a form
- create a record
- fill required sections
- move through the intended process

What belongs here:

- multi-step business flow logic
- sequencing across components
- reusable business actions shared by several specs

What does not belong here:

- raw duplicated locators for every control
- global test setup
- test-level scenario framing

### `fixtures`

Fixtures act as the composition root for tests.

They are responsible for:

- preparing the Playwright runtime
- resolving shared setup such as authentication
- instantiating components and services
- exposing a clean facade to specs

This keeps specs small and prevents every test from rebuilding the same object graph.

### `tests`

Specs should describe the scenario, not the implementation mechanics.

A good spec in this style:

- calls a service
- passes scenario inputs
- performs a small number of meaningful assertions

It should not contain long sequences of UI actions that duplicate workflow logic.

## Request flow in this example

The example test follows this path:

1. The spec declares the business scenario.
2. The fixture provides authenticated page context and ready-to-use objects.
3. The service expresses the D365 workflow at a business level.
4. The components encapsulate interaction with recurring UI primitives.

That flow is the core idea of this repository.

## Example walkthrough

The thin example spec is [e2e/tests/sales-orders/create-direct-sales-order.spec.ts](C:/Users/martin.caceres/d365-example/d365-page-component-model-playwright/e2e/tests/sales-orders/create-direct-sales-order.spec.ts).

It depends on [e2e/fixtures/testBasic.ts](C:/Users/martin.caceres/d365-example/d365-page-component-model-playwright/e2e/fixtures/testBasic.ts), which composes:

- [e2e/utils/AuthService.ts](C:/Users/martin.caceres/d365-example/d365-page-component-model-playwright/e2e/utils/AuthService.ts)
- [e2e/components/ComboboxComponent.ts](C:/Users/martin.caceres/d365-example/d365-page-component-model-playwright/e2e/components/ComboboxComponent.ts)
- [e2e/components/DialogComponent.ts](C:/Users/martin.caceres/d365-example/d365-page-component-model-playwright/e2e/components/DialogComponent.ts)
- [e2e/components/GridComponent.ts](C:/Users/martin.caceres/d365-example/d365-page-component-model-playwright/e2e/components/GridComponent.ts)
- [e2e/components/LoadingComponent.ts](C:/Users/martin.caceres/d365-example/d365-page-component-model-playwright/e2e/components/LoadingComponent.ts)
- [e2e/services/SalesOrderService.ts](C:/Users/martin.caceres/d365-example/d365-page-component-model-playwright/e2e/services/SalesOrderService.ts)

The code is intentionally placeholder-heavy because the goal is to explain boundaries, not to publish a real D365 implementation.

## Design principles

- Specs stay thin and business-oriented.
- Components absorb D365 UI complexity.
- Services own workflow sequencing.
- Fixtures compose dependencies and shared setup.
- Repeated control behavior should be abstracted once.
- Public examples should explain architectural intent, not only show folder names.

## What this repository is not

This repository is not:

- a production-ready D365 automation framework
- a client implementation
- a full selector library
- a reference for authentication hardening

It is a documentation-first example of how to organize the automation codebase.

## Next step if you want to go deeper

See [framework-architecture-philosophy.md](C:/Users/martin.caceres/d365-example/d365-page-component-model-playwright/framework-architecture-philosophy.md) for a deeper explanation of why this structure fits D365 particularly well.
