# D365 Page Component Model with Playwright

A small example of how I structure end-to-end tests for Microsoft Dynamics 365 Finance & Operations with Playwright and TypeScript.

There is no client code in here, no private URLs and no real data. I wrote it to show the structure and explain why it looks the way it does, so a few pieces (authentication, mostly) are placeholders.

## Why D365 needs more than a page object per page

If you have automated D365 you already know the usual problems. Forms are huge and full of repeated controls. The shell blocks itself with overlays while the server works. The same grids, dialogs and lookups show up in every module. Selectors copied straight into specs break with every release. And the same business flow has to run against several companies, each with its own customers and warehouses.

Put all of that inside the specs and they get long and hard to change very quickly. What worked for me was splitting the code by what kind of knowledge it holds:

- **Page objects** know one screen: how to get there and what is on it.
- **Components** know one control type that appears on many screens (combobox, grid, dialog, loading overlay).
- **Services** know a business flow and the order of its steps.
- **Data** knows what changes from one company to another.
- **Fixtures** put everything together so the spec receives ready-to-use objects.
- **Specs** describe the scenario and check the result.

Here is how the pieces call each other in this repo:

```txt
                      +---------------------------------------+
                      | fixture (testBasic)                   |
  D365_ENTITY ------> |  company -> data (loaded, validated)  |
                      |  login, builds the objects below      |
                      +-------------------+-------------------+
                                          | hands the spec: data, pageObjects
                                          v
                      +---------------------------------------+
                      | spec                                  |
                      |  calls the service, then asserts      |<--- expect() only here
                      +-------------------+-------------------+
                                          | createManualOrder(data) -> order id
                                          v
                      +---------------------------------------+
                      | service (SalesOrderService)           |
                      |  order of the steps, no selectors     |
                      +---------+-------------------+---------+
                                |                   |
                                v                   v
               +------------------------+   +--------------------------+
               | page (SalesOrderPage)  |   | components               |
               |  one screen: URL,      |   |  Combobox  Dialog        |
               |  buttons, header       |-->|  Grid      Loading       |
               +------------------------+   +--------------------------+
                                                         |
                                                         v
                                                   D365 in the browser
```

Arrows go one way only. Components never call pages or services, and the service never looks at which company it is running for.

Plain Page Object Model gives you the page objects. Components are what this adds on top, and in D365 it is where most of the value is, because a combobox behaves the same way in every form of the application.

## Layout

```txt
e2e/
|- components/      # Controls reused across screens
|- data/            # Datasets per company, validation, builder
|- fixtures/        # Test composition and shared setup
|- pages/           # One page object per screen
|- services/        # Business flows
|- tests/           # Specs
\- utils/           # Auth placeholder
```

| Pattern | Where |
| --- | --- |
| Page Object | [e2e/pages/SalesOrderPage.ts](e2e/pages/SalesOrderPage.ts) |
| Component | [e2e/components/](e2e/components/) |
| Service layer | [e2e/services/SalesOrderService.ts](e2e/services/SalesOrderService.ts) |
| Fixture as facade / composition root | [e2e/fixtures/testBasic.ts](e2e/fixtures/testBasic.ts) |
| Dependency injection | constructors of the service and the components |
| Builder | [e2e/data/SalesOrderBuilder.ts](e2e/data/SalesOrderBuilder.ts) |
| Data-driven variation per company | [e2e/data/salesOrderData.ts](e2e/data/salesOrderData.ts) |

About the last row: people often reach for a Strategy pattern when a flow has to run for several companies. If only the values change, a dataset per company is enough. I would only bring in Strategy when the steps themselves are different.

## Deciding where new code goes

This is the checklist I use when I am not sure:

1. A whole business flow, or a rule about the order of steps? Service.
2. How to operate a control that exists on many screens? Component.
3. Something specific to one screen? Page object.
4. Login, company selection, loading data? Fixture.
5. A check on the outcome of the scenario? Stays in the spec.
6. A value that is different per company or per scenario? Data.

And the same thing seen from the D365 side:

| Problem | Where it lives |
| --- | --- |
| Login and session | Fixture (`AuthService`) |
| Active company | Fixture, then the URL built by the page object |
| Values that differ per company | Data layer |
| Combobox that only commits on Tab | `ComboboxComponent` |
| Shell overlays | `LoadingComponent` |
| Grids and dialogs | `GridComponent`, `DialogComponent` |
| The sales order flow | `SalesOrderService` |
| Checking the result | The spec |

## A few details worth pointing out

`ComboboxComponent` types the value and then presses Tab. D365 only commits the value on blur, so without the Tab the field looks filled but the server never got it, and the test fails later somewhere that makes no sense.

`LoadingComponent` waits for the three shell overlays (`#ShellBlockingDiv`, `#blockingMessage`, `#ShellProcessingDiv`) to be hidden. That is enough before the next click. It does not prove that a long operation finished, because an overlay that has not appeared yet is already "hidden".

`SalesOrderPage` opens the list with a menu item URL (`?cmp=<company>&mi=SalesTableListPage`) instead of clicking through the navigation pane. It survives releases better and puts the company in the URL. It also uses `waitUntil: 'domcontentloaded'`, since D365 keeps connections open and the `load` event may never fire.

`SalesOrderService.createManualOrder` returns the id of the order it created. The spec uses that id for its checks. An earlier version of the spec looked for a grid row with the customer account, and that row was there before the test even started (older orders for the same customer), so the test could not fail. The next section has more cases like that one.

Assertions live in the specs. Services and page objects wait for things, but they do not decide whether the scenario passed. When a check is buried inside a service, whoever reads the test can't tell what is being verified.

The data layer validates the dataset before the browser opens. If a value is missing it throws with the field name. Silently falling back to a default would give you a green test for a scenario that never ran.

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

## Reading the code

Start with the spec, [e2e/tests/sales-orders/create-direct-sales-order.spec.ts](e2e/tests/sales-orders/create-direct-sales-order.spec.ts), then follow what it uses: the fixture in [e2e/fixtures/testBasic.ts](e2e/fixtures/testBasic.ts), the service, the page object, the components, and finally the data.

## Running it

```bash
npm ci
npx playwright install --with-deps chromium
cp .env.example .env     # point D365_BASE_URL at your own sandbox
npm test
```

Without `D365_BASE_URL` the UI specs skip themselves, so a clean checkout stays green. The specs in [e2e/tests/data/](e2e/tests/data/) don't need a browser or a sandbox and always run.

`D365_ENTITY` picks the company dataset. In CI the suite runs once per company through a matrix, same code, different data.

## Don't copy all the layers on day one

This repo shows every layer because the layers are the point of the repo. A real suite should grow into them. I usually wait until something has repeated about three times before moving it to a shared place, because with one occurrence you don't know yet what the real pattern is. If an abstraction doesn't make the next change cheaper, it's just one more file to open.

This is not a framework you can drop into a project, and it is not a reference for authentication. It is an example of how to organize the code, with the reasoning written down.
