export type SalesOrderData = {
  entity: string;
  customerAccount: string;
  salesOrigin: string;
  warehouse: string;
};

// Per-entity variation lives in the data layer, never as if/else inside a service.
const DATASETS: Record<string, SalesOrderData> = {
  USMF: {
    entity: 'USMF',
    customerAccount: 'SAMPLE-US-CUSTOMER',
    salesOrigin: 'Online',
    warehouse: '24'
  },
  DEMF: {
    entity: 'DEMF',
    customerAccount: 'SAMPLE-DE-CUSTOMER',
    salesOrigin: 'Phone',
    warehouse: '11'
  }
};

export function loadSalesOrderData(entity: string): SalesOrderData {
  const dataset = DATASETS[entity];

  if (!dataset) {
    throw new Error(
      `No sales order dataset for entity "${entity}". Known entities: ${Object.keys(DATASETS).join(', ')}.`
    );
  }

  return validateSalesOrderData(dataset);
}

export function validateSalesOrderData(data: SalesOrderData): SalesOrderData {
  // Fail fast and loud. A missing value must never be silently defaulted:
  // a test that passes with fallback data is a test that lies.
  for (const field of ['customerAccount', 'salesOrigin', 'warehouse'] as const) {
    if (!data[field]) {
      throw new Error(`Invalid sales order data: "${field}" is required for entity ${data.entity}.`);
    }
  }

  return data;
}
