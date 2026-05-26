import { Locator, Page } from '@playwright/test';
import { LoadingComponent } from './LoadingComponent';

export class ComboboxComponent {
  constructor(
    private readonly page: Page,
    private readonly loading: LoadingComponent
  ) {}

  async fillByRole(name: string | RegExp, value: string): Promise<void> {
    const locator = this.page.getByRole('combobox', { name });
    await this.fill(locator, value);
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: 15000 });

    const disabled = await locator.isDisabled();
    if (disabled) {
      throw new Error('Cannot fill the combobox because it is disabled.');
    }

    // Components hide repetitive control mechanics so services can stay workflow-oriented.
    await locator.focus();
    await locator.click();
    await locator.fill(value);
    await locator.press('Tab');

    await this.loading.waitUntilReady();
  }
}
