# Framework Architecture and Philosophy

## Summary

This document explains the architectural decisions behind the example repository.

The main idea is simple:

- specs describe business intent and own the assertions
- fixtures compose runtime dependencies
- services orchestrate workflows
- page objects encapsulate one screen each
- components encapsulate recurring D365 UI mechanics
- data holds everything that varies per entity or scenario

That separation is especially useful in D365 because many screens share the same interaction patterns even when the business scenario is different.

## Why not keep everything in the spec

It is possible to automate D365 directly from Playwright specs.

The problem is that direct scripting usually leads to:

- duplicated selectors
- duplicated waits
- duplicated navigation sequences
- long, low-signal tests
- fragile maintenance when the UI changes

Once a test suite grows, those costs become the main source of slowdown.

## Why components as well as page objects

Traditional Page Object Model groups behavior by page. That is still the right unit for "how do I reach this screen and what lives on it".

It is less expressive when the same D365 control patterns appear on many forms:

- a combobox behaves the same way in every form
- a blocking shell loader can affect any interaction
- a grid appears in different modules with similar access patterns
- dialogs and lookups share structure across workflows

Modeling those as components lets the framework reuse the same control logic across every page object, service, and scenario. A page object represents a screen; a component represents a control. The combobox blur-and-wait fix was written once and every test that touches a combobox got it.

## Why services exist

Components should not tell the whole business story.

A service exists to orchestrate actions such as:

- open the target area
- create a record
- fill the required sections
- continue the workflow in the correct order

This keeps business flow logic in one place and prevents specs from becoming procedural UI scripts.

## Why the data layer exists

The same D365 flow usually runs against several entities, where only the values change: a different customer, a different warehouse, a different origin.

The tempting shortcut is to branch inside the service. That is how a workflow class slowly turns into a configuration file with clicks in it: every new entity adds a branch, and the business flow stops being readable.

Here the variation lives in the data layer instead. The service receives a dataset that is already resolved for the active entity and never asks which entity it is running against. Adding an entity is a new entry in a map, not a change to the workflow.

The data layer also validates before the browser starts. A missing value fails immediately with a clear message, instead of being defaulted to something plausible and producing a green test for a scenario that never ran. Failing early is cheap; a test that passes while lying is expensive.

## Why fixtures matter

Fixtures are the assembly point of the framework.

They keep object creation and shared setup out of the spec. In practice, that means:

- the spec does not instantiate every dependency manually
- authentication and company selection do not leak into scenario code
- the service graph can evolve without rewriting every test

The fixture therefore acts as a facade over the runtime.

## Why assertions stay in the spec

The objects act, the spec verifies.

If an assertion is hidden inside a service or a page object, the test no longer states what it is checking, and a failure points at infrastructure rather than at the scenario. Waiting is different: a component waiting for a dialog or an overlay is synchronizing, not judging the business outcome, so it uses a wait rather than an assertion.

## Diagnosing a failure by layer

The layers are not only a writing convention. They are also the fastest way to read a failure:

- the value was never committed in the form -> synchronization, so a component
- the record for that entity did not exist in the environment -> data
- the locator depended on a generated id -> the test itself
- the flow ran in the wrong order -> the service

Look at the trace first and locate the failure in a layer. Re-running until it passes answers nothing.

## When the structure is too much

Every layer in this repository is here because the repository is *about* the layers. A real suite should not start this way.

- Rule of three: wait until something has repeated three times before moving it to a shared place. One occurrence does not yet show the real pattern.
- An abstraction earns its place only if it makes the next change cheaper. If it only adds indirection, it is cost without return.

Over-abstraction is the mirror image of putting everything in the spec, and it is harder to undo.

## Intended reading order for this repository

If you are new to the repository, read it in this order:

1. `README.md`
2. `e2e/tests/...`
3. `e2e/fixtures/...`
4. `e2e/services/...`
5. `e2e/pages/...`
6. `e2e/components/...`
7. `e2e/data/...`

That order mirrors the way a test is consumed by a reader:

- first the scenario
- then the composition layer
- then the workflow layer
- then the screen and UI abstraction layers
- finally the values the whole thing runs on

## Public example philosophy

Because this is a public repository, the code should optimize for explanation.

That means:

- placeholders are acceptable when they clarify responsibility boundaries
- comments should explain design intent, not private context
- documentation should explain why the structure exists, not only what folders exist

The repository should help readers understand how to think about D365 automation architecture even if they never run the code.
