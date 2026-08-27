import { test as base, expect } from '@playwright/test';
import { ComboboxComponent } from '../components/ComboboxComponent';
import { DialogComponent } from '../components/DialogComponent';
import { GridComponent } from '../components/GridComponent';
import { LoadingComponent } from '../components/LoadingComponent';
import { loadSalesOrderData, SalesOrderData } from '../data/salesOrderData';
import { SalesOrderPage } from '../pages/SalesOrderPage';
import { SalesOrderService } from '../services/SalesOrderService';
import { AuthService } from '../utils/AuthService';

type PageObjects = {
  combobox: ComboboxComponent;
  dialog: DialogComponent;
  grid: GridComponent;
  loading: LoadingComponent;
  salesOrderPage: SalesOrderPage;
  salesOrderService: SalesOrderService;
};

type TestFixtures = {
  entity: string;
  data: SalesOrderData;
  pageObjects: PageObjects;
};

export const testBasic = base.extend<TestFixtures>({
  // The entity comes from the environment, so the same spec runs for any company.
  entity: async ({}, use) => {
    await use(process.env.D365_ENTITY ?? 'USMF');
  },

  // Data is resolved and validated before the browser does anything.
  data: async ({ entity }, use) => {
    await use(loadSalesOrderData(entity));
  },

  page: async ({ page }, use) => {
    // The fixture owns shared setup so the spec can remain focused on the scenario.
    const auth = new AuthService(page);
    await auth.ensureLoggedIn();

    await use(page);
  },

  pageObjects: async ({ page }, use) => {
    const loading = new LoadingComponent(page);
    const combobox = new ComboboxComponent(page, loading);
    const dialog = new DialogComponent(page);
    const salesOrderPage = new SalesOrderPage(page, loading);

    // The fixture composes the object graph once and exposes a small facade to tests.
    await use({
      loading,
      combobox,
      dialog,
      salesOrderPage,
      grid: new GridComponent(page),
      salesOrderService: new SalesOrderService(salesOrderPage, combobox, dialog, loading)
    });
  }
});

export { expect };
