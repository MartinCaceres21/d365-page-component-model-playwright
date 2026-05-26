import { Locator, Page } from '@playwright/test';

export class GridComponent {
  constructor(private readonly page: Page) {}

  rowByText(text: string | RegExp): Locator {
    // Grid lookup strategy is centralized here so workflow code does not depend on raw locators.
    return this.page.getByRole('row', { name: text });
  }

  cellByText(text: string | RegExp): Locator {
    return this.page.getByRole('gridcell', { name: text });
  }
}
