import { Locator, Page } from '@playwright/test';

export class DialogComponent {
  constructor(private readonly page: Page) {}

  getByTitle(name: string | RegExp): Locator {
    return this.page.getByRole('dialog', { name });
  }

  async waitForVisible(name: string | RegExp): Promise<Locator> {
    // Components synchronize, specs assert. A wait here is not a business assertion,
    // so it uses waitFor instead of expect.
    const dialog = this.getByTitle(name);
    await dialog.waitFor({ state: 'visible', timeout: 15000 });
    return dialog;
  }
}
