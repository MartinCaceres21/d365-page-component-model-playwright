import { Locator, Page } from '@playwright/test';
import { LoadingComponent } from '../components/LoadingComponent';

/**
 * Page object: one D365 screen. It knows how to reach the screen and where its
 * screen-level controls are. Reusable controls stay in components.
 */
export class SalesOrderPage {
  constructor(
    private readonly page: Page,
    private readonly loading: LoadingComponent
  ) {}

  async open(entity: string): Promise<void> {
    // Menu-item navigation is stable across releases and carries the company,
    // unlike clicking through the shell menu.
    // D365 keeps connections open, so the default `load` event may never fire and
    // `goto` would eat the whole test budget with the page already rendered.
    await this.page.goto(`/?cmp=${entity}&mi=SalesTableListPage`, { waitUntil: 'domcontentloaded' });
    await this.loading.waitUntilReady();
  }

  async clickNew(): Promise<void> {
    await this.newButton().click();
    await this.loading.waitUntilReady();
  }

  async save(): Promise<void> {
    // Ribbon buttons carry an icon glyph in their accessible name: no `exact: true` here.
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.loading.waitUntilReady();
  }

  // Semantic locators describe the control as the user sees it, so dynamic D365 IDs never leak out.
  newButton(): Locator {
    return this.page.getByRole('button', { name: 'New' });
  }

  // Header fields of the order form. They do not exist on the list page, so a check
  // on them proves the create actually navigated to the new order.
  orderNumber(): Locator {
    return this.page.getByRole('textbox', { name: 'Sales order', exact: true });
  }

  headerCustomerAccount(): Locator {
    // A committed lookup appends its value and a link hint to the accessible name,
    // so `exact: true` would never match again: anchor by prefix.
    return this.page.getByRole('combobox', { name: /^Customer account/ });
  }
}
