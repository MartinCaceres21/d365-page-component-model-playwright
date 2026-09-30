import { Page } from '@playwright/test';

// D365 blocks the shell with three different overlays depending on the operation.
const BLOCKING_OVERLAYS = ['#ShellBlockingDiv', '#blockingMessage', '#ShellProcessingDiv'];

export class LoadingComponent {
  constructor(private readonly page: Page) {}

  async waitUntilReady(): Promise<void> {
    // Waiting for "hidden" on an overlay that has not appeared yet passes instantly.
    // That is fine as a gate before the next click; it is NOT proof that a long
    // operation finished. For that, wait for a business fact that changes side.
    for (const selector of BLOCKING_OVERLAYS) {
      await this.page.locator(selector).waitFor({ state: 'hidden', timeout: 30000 });
    }
  }
}
