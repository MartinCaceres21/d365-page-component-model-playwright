# Framework Architecture and Philosophy

## Summary

This document explains the architectural decisions behind the example repository.

The main idea is simple:

- specs describe business intent
- fixtures compose runtime dependencies
- services orchestrate workflows
- components encapsulate recurring D365 UI mechanics

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

## Why components instead of page-only objects

Traditional Page Object Model usually groups behavior by page.

That model is less expressive when the same D365 control patterns appear on many forms.

For example:

- a combobox can behave similarly in multiple forms
- a blocking shell loader can affect many interactions
- a grid can appear in different modules with similar access patterns
- dialogs and lookups often share structure across workflows

By modeling those behaviors as components, the framework can reuse the same control logic across multiple services and scenarios.

## Why services exist

Components should not tell the whole business story.

A service exists to orchestrate actions such as:

- open the target area
- create a record
- fill the required sections
- continue the workflow in the correct order

This keeps business flow logic in one place and prevents specs from becoming procedural UI scripts.

## Why fixtures matter

Fixtures are the assembly point of the framework.

They keep object creation and shared setup out of the spec. In practice, that means:

- the spec does not instantiate every dependency manually
- authentication does not leak into scenario code
- the service graph can evolve without rewriting every test

The fixture therefore acts as a facade over the runtime.

## Intended reading order for this repository

If you are new to the repository, read it in this order:

1. `README.md`
2. `e2e/tests/...`
3. `e2e/fixtures/...`
4. `e2e/services/...`
5. `e2e/components/...`

That order mirrors the way a test is consumed by a reader:

- first the scenario
- then the composition layer
- then the workflow layer
- then the UI abstraction layer

## Public example philosophy

Because this is a public repository, the code should optimize for explanation.

That means:

- placeholders are acceptable when they clarify responsibility boundaries
- comments should explain design intent, not private context
- documentation should explain why the structure exists, not only what folders exist

The repository should help readers understand how to think about D365 automation architecture even if they never run the code.
