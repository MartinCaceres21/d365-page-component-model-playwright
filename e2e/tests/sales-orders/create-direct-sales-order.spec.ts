import { SalesOrderBuilder } from '../../data/SalesOrderBuilder';
import { testBasic as test, expect } from '../../fixtures/testBasic';

test.describe('Sales Orders - Direct sales', () => {
  // The example is public: without a real sandbox there is nothing to drive.
  test.skip(!process.env.D365_BASE_URL, 'Set D365_BASE_URL to run against a D365 sandbox.');

  test('creates a direct sales order with the entity dataset', async ({ data, pageObjects }) => {
    // The spec reads like the scenario: one workflow call, then the business check.
    await pageObjects.salesOrderService.createManualOrder(data);

    // Objects act, the spec verifies.
    await expect(pageObjects.grid.rowByText(data.customerAccount)).toBeVisible();
  });

  test('creates a direct sales order for a specific warehouse', async ({ data, pageObjects }) => {
    // Same workflow, scenario-specific data. No new service method, no if/else.
    const order = new SalesOrderBuilder(data).withWarehouse('13').build();

    await pageObjects.salesOrderService.createManualOrder(order);

    await expect(pageObjects.grid.rowByText(order.customerAccount)).toBeVisible();
  });
});
