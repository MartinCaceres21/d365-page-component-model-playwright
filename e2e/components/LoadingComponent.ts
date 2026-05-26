import { Page } from '@playwright/test';

export class LoadingComponent {
  constructor(private readonly page: Page) {}

  async waitUntilReady(): Promise<void> {
    // D365 frequently blocks the shell during navigation and form updates.
    await this.page
      .locator('#ShellBlockingDiv')
      .waitFor({ state: 'hidden', timeout: 30000 });
  }
}
