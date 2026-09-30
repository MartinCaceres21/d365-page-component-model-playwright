# Why the code is organized this way

The README says what is in the repo. This file is about the reasons behind it, mostly things I learned by getting them wrong first on a real D365 suite.

## Starting from plain specs

You can automate D365 with nothing but Playwright specs, and for the first ten tests that is probably the right call. The trouble shows up later. The same selector ends up in twenty files, every spec has its own copy of the overlay wait, and a release that renames one button means a long afternoon of search and replace. At some point maintenance takes more time than writing new tests, and that is when the structure starts paying for itself.

## Page objects and components

A page object answers "how do I get to this screen and what is on it". That is still useful, and `SalesOrderPage` is exactly that.

D365 adds a second axis. The combobox in the sales order dialog behaves like the combobox in a purchase order, a journal or a customer record: you type, you press Tab so the server commits the value, and you wait for the shell to unblock. Grids, dialogs and the loading overlays repeat across modules in the same way. If that behavior lives in each page object, you fix it once per screen. As a component, you fix it once. The Tab-to-commit fix in `ComboboxComponent` was written a single time and every flow that touches a combobox got it.

## Services

Components shouldn't know the business process. Something has to say "open the list, create the order, fill these three fields, confirm, save", and that is the service. Keeping the sequence there means a spec can read like the scenario, and when the process changes there is one place to change it.

## The data layer

Most of the time the same flow runs for several companies and only the values change: another customer, another warehouse, another sales origin. The easy move is an `if (company === 'X')` inside the service. After a few companies the service is mostly branches and you can no longer read the flow in it.

So the service never asks which company it is running for. It receives a dataset that was already resolved and validated, and adding a company means adding an entry to a map.

The validation happens before the browser starts. A missing value throws with the field name. I care about this more than about anything else in the data layer, because the alternative is a default that looks plausible and a test that passes for a scenario that never actually ran.

## Fixtures

The fixture builds the object graph (auth, company, components, page objects, services) and hands the spec a small object to work with. Specs never log in and never instantiate anything themselves. That also means the graph can change without touching every test.

## Assertions stay in the spec

If a check is hidden inside a service, the test stops saying what it verifies, and a failure points at plumbing instead of at the scenario. Components do wait for things (a dialog to appear, an overlay to go away), but that is synchronization. They use `waitFor`, not `expect`.

## Checks that can't fail

This is the section I would have liked to read before starting. Most of the expensive failures I have seen in D365 were not crashes. They were reads that returned something with the right shape that answered a different question, so the test concluded something false and stayed green, or failed somewhere far away from the cause.

| What happened | How it showed up | What the repo does about it |
| --- | --- | --- |
| The check was already true before the action ran | Green test, nothing created | The spec checks the order id returned by the service |
| Grid values live in the input's `value` attribute, not in its text | `filter({ hasText })` can't find a row that is right there on screen | `GridComponent.rowByCellValue` |
| Waiting for an overlay to hide before it ever appeared | The wait returns immediately and the next step fails | `LoadingComponent` is used as a gate before clicking, not as proof that work finished |
| `page.goto` waiting for `load` | A navigation timeout with the page already rendered | `SalesOrderPage.open` waits for `domcontentloaded` |
| `getByRole('dialog').first()` | Grabs the action center or a progress dialog | `DialogComponent` always looks dialogs up by name |
| Pressing Escape to close a flyout | With nothing open, D365 leaves the form | Dialogs are closed through their own buttons |
| `exact: true` on a lookup after committing it | The accessible name now includes the value, so the locator never matches again | `SalesOrderPage.headerCustomerAccount` matches by prefix |
| Reading a virtualized grid from the DOM | A list that is silently missing rows | Filter the grid down to the exact id before reading |

The question I ask about any check now is whether its locator would already have matched before the action. If it would have, the check is decoration. And when a result contradicts something I know about the environment, I suspect the read before the environment, and try the same read on a case I know works.

## Reading a failure by layer

The layers also help when something breaks. A value that never got committed is a component problem. A customer that doesn't exist in that company is data. A locator built on a generated id is the test's fault. Steps in the wrong order belong to the service. Open the trace, figure out which layer the failure is in, and fix it there. Re-running until it goes green tells you nothing.

## Too much structure

Every layer is here because this repo exists to show them. On a real project I wouldn't start this way. I wait until something repeats about three times before moving it to a shared place, since one occurrence doesn't tell you the shape of the pattern yet. An abstraction that doesn't make the next change cheaper is just indirection, and over-abstracting is harder to undo than putting everything in the specs.

## About this being public

Since this is meant to be read more than run, I kept a few placeholders (auth is the obvious one) where they make the boundaries clearer, and the comments explain design decisions rather than project history. If it helps someone think about how to organize their own D365 suite without ever running it, it did its job.
