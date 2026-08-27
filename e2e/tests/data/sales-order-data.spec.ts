import { expect, test } from '@playwright/test';
import { SalesOrderBuilder } from '../../data/SalesOrderBuilder';
import { loadSalesOrderData } from '../../data/salesOrderData';

// The data layer is the only place with branching, so it is the only place that needs a check.
// It runs without a browser or a sandbox, which is why it is the first thing CI proves.
test.describe('Sales order data', () => {
  test('loads a validated dataset per entity', () => {
    expect(loadSalesOrderData('USMF').customerAccount).toBeTruthy();
    expect(loadSalesOrderData('DEMF').warehouse).toBeTruthy();
  });

  test('fails fast on an unknown entity instead of defaulting', () => {
    expect(() => loadSalesOrderData('NOPE')).toThrow(/No sales order dataset/);
  });

  test('the builder validates its overrides', () => {
    const base = loadSalesOrderData('USMF');

    expect(new SalesOrderBuilder(base).withWarehouse('13').build().warehouse).toBe('13');
    expect(() => new SalesOrderBuilder(base).withWarehouse('').build()).toThrow(/"warehouse" is required/);
  });
});
