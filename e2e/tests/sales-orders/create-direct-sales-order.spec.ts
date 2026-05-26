import { testBasic as test, expect } from '../../fixtures/testBasic';

test.describe('Sales Orders - Direct sales', () => {
  test('create basic direct sales order', async ({ page, pageObjects }) => {
    // The spec should read like the scenario, not like a list of raw UI operations.
    await pageObjects.salesOrderService.openSalesOrdersPage();

    await pageObjects.salesOrderService.createManualOrder({
      customerAccount: 'SAMPLE-CUSTOMER',
      salesOrigin: 'Online'
    });

    // A real test would assert business outcomes here.
    await expect(page.locator('body')).toBeVisible();
  });
});
