import { Locator, Page } from '@playwright/test';

export class DialogComponent {
  constructor(private readonly page: Page) {}

  // Always by name. D365 keeps ambient dialogs in the DOM (action center, progress),
  // so `getByRole('dialog').first()` picks whichever the DOM happens to list first.
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

  async waitForHidden(dialog: Locator): Promise<void> {
    // Dialogs close by acting on them, never with Escape: with no flyout open,
    // Escape leaves the form and every following locator fails somewhere else.
    await dialog.waitFor({ state: 'hidden', timeout: 30000 });
  }
}
