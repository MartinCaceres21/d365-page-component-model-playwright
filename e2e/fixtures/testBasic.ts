import { test as base, expect } from '@playwright/test';
import { ComboboxComponent } from '../components/ComboboxComponent';
import { DialogComponent } from '../components/DialogComponent';
import { GridComponent } from '../components/GridComponent';
import { LoadingComponent } from '../components/LoadingComponent';
import { SalesOrderService } from '../services/SalesOrderService';
import { AuthService } from '../utils/AuthService';

type PageObjects = {
  combobox: ComboboxComponent;
  dialog: DialogComponent;
  grid: GridComponent;
  loading: LoadingComponent;
  salesOrderService: SalesOrderService;
};

type TestFixtures = {
  pageObjects: PageObjects;
};

export const testBasic = base.extend<TestFixtures>({
  page: async ({ page }, use) => {
    // The fixture owns shared setup so the spec can remain focused on the scenario.
    const auth = new AuthService(page);
    await auth.ensureLoggedIn();

    await use(page);
  },

  pageObjects: async ({ page }, use) => {
    const loading = new LoadingComponent(page);
    const combobox = new ComboboxComponent(page, loading);

    // The fixture composes the object graph once and exposes a small facade to tests.
    await use({
      loading,
      combobox,
      dialog: new DialogComponent(page),
      grid: new GridComponent(page),
      salesOrderService: new SalesOrderService(page, combobox, loading)
    });
  }
});

export { expect };
