import { SalesOrderBuilder } from '../../data/SalesOrderBuilder';
import { testBasic as test, expect } from '../../fixtures/testBasic';

test.describe('Sales Orders - Direct sales', () => {
  // The example is public: without a real sandbox there is nothing to drive.
  test.skip(!process.env.D365_BASE_URL, 'Set D365_BASE_URL to run against a D365 sandbox.');

  test('creates a direct sales order with the entity dataset', async ({ data, pageObjects }) => {
    // The spec reads like the scenario: one workflow call, then the business check.
    const orderId = await pageObjects.salesOrderService.createManualOrder(data);

    // Objects act, the spec verifies. Every check must be able to FAIL: a row with this
    // customer account already existed before the run (older orders), so it proved nothing.
    // The order header only exists once the create navigated to the new record.
    expect(orderId).toMatch(/\S/);
    await expect(pageObjects.salesOrderPage.headerCustomerAccount()).toHaveValue(data.customerAccount);
  });

  test('creates a direct sales order for a specific warehouse', async ({ data, pageObjects }) => {
    // Same workflow, scenario-specific data. No new service method, no if/else.
    const order = new SalesOrderBuilder(data).withWarehouse('13').build();

    const orderId = await pageObjects.salesOrderService.createManualOrder(order);

    // Back on the list, anchored by THIS run's id: exactly one row, no lookalikes.
    await pageObjects.salesOrderPage.open(order.entity);
    await expect(pageObjects.grid.rowByCellValue('Sales order', orderId)).toHaveCount(1);
  });
});
