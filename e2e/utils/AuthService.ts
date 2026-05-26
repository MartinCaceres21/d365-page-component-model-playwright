import { Page } from '@playwright/test';

export class AuthService {
  constructor(private readonly page: Page) {}

  async ensureLoggedIn(): Promise<void> {
    // Authentication is kept out of specs so scenario code stays focused on business behavior.
    void this.page;
  }
}
