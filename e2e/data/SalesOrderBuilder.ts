import { SalesOrderData, validateSalesOrderData } from './salesOrderData';

/**
 * Builder: start from the entity dataset and override only what the scenario needs.
 * Use a builder when a scenario needs many combinations; a plain dataset is enough otherwise.
 */
export class SalesOrderBuilder {
  private readonly data: SalesOrderData;

  constructor(base: SalesOrderData) {
    this.data = { ...base };
  }

  forCustomer(customerAccount: string): this {
    this.data.customerAccount = customerAccount;
    return this;
  }

  withSalesOrigin(salesOrigin: string): this {
    this.data.salesOrigin = salesOrigin;
    return this;
  }

  withWarehouse(warehouse: string): this {
    this.data.warehouse = warehouse;
    return this;
  }

  build(): SalesOrderData {
    // The same validation the loader runs: overrides cannot smuggle in an invalid record.
    return validateSalesOrderData(this.data);
  }
}
