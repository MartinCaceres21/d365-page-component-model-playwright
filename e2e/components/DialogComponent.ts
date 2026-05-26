import { expect, Locator, Page } from '@playwright/test';

export class DialogComponent {
  constructor(private readonly page: Page) {}

  getByTitle(name: string | RegExp): Locator {
    return this.page.getByRole('dialog', { name });
  }

  async expectVisible(name: string | RegExp): Promise<Locator> {
    // Dialog synchronization belongs in the component instead of being repeated in specs.
    const dialog = this.getByTitle(name);
    await expect(dialog).toBeVisible({ timeout: 15000 });
    return dialog;
  }
}
