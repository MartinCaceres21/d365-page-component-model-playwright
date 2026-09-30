import { Locator, Page } from '@playwright/test';

export class GridComponent {
  constructor(private readonly page: Page) {}

  /**
   * D365 grids render each cell as an <input role="textbox">: the value lives in the
   * `value` attribute, not in textContent. `filter({ hasText })` never matches a row,
   * even though the ARIA snapshot shows the text. Anchor by column label + exact value.
   */
  rowByCellValue(column: string, value: string): Locator {
    return this.page
      .getByRole('row')
      .filter({ has: this.page.locator(`[role="textbox"][aria-label="${column}"][value="${value}"]`) });
  }
}
