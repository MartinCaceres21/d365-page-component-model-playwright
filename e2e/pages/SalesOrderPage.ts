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
    await this.page.goto(`/?cmp=${entity}&mi=SalesTableListPage`);
    await this.loading.waitUntilReady();
  }

  async clickNew(): Promise<void> {
    await this.newButton().click();
    await this.loading.waitUntilReady();
  }

  async save(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.loading.waitUntilReady();
  }

  // Semantic locators describe the control as the user sees it, so dynamic D365 IDs never leak out.
  newButton(): Locator {
    return this.page.getByRole('button', { name: 'New' });
  }
}
