import { ComboboxComponent } from '../components/ComboboxComponent';
import { DialogComponent } from '../components/DialogComponent';
import { LoadingComponent } from '../components/LoadingComponent';
import { SalesOrderData } from '../data/salesOrderData';
import { SalesOrderPage } from '../pages/SalesOrderPage';

export class SalesOrderService {
  // Dependency injection: the service receives its pieces instead of building them.
  constructor(
    private readonly salesOrderPage: SalesOrderPage,
    private readonly combobox: ComboboxComponent,
    private readonly dialog: DialogComponent,
    private readonly loading: LoadingComponent
  ) {}

  /**
   * Reads as workflow, not as UI mechanics: no selectors, no waits, and no
   * per-entity branching. The entity variation arrives already resolved in `data`.
   */
  async createManualOrder(data: SalesOrderData): Promise<void> {
    await this.salesOrderPage.open(data.entity);
    await this.salesOrderPage.clickNew();

    const createDialog = await this.dialog.waitForVisible(/create sales order/i);

    await this.combobox.fill(
      createDialog.getByRole('combobox', { name: 'Customer account' }),
      data.customerAccount
    );
    await this.combobox.fill(
      createDialog.getByRole('combobox', { name: 'Sales origin' }),
      data.salesOrigin
    );
    await this.combobox.fill(
      createDialog.getByRole('combobox', { name: 'Warehouse' }),
      data.warehouse
    );

    await createDialog.getByRole('button', { name: 'OK' }).click();
    await this.loading.waitUntilReady();

    await this.salesOrderPage.save();
  }
}
