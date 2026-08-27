import { Page } from '@playwright/test';

export class AuthService {
  constructor(private readonly page: Page) {}

  async ensureLoggedIn(): Promise<void> {
    // Authentication is kept out of specs so scenario code stays focused on business behavior.
    // In a real project this is where a saved storageState is reused instead of logging in
    // through the UI on every test, and where credentials come from environment secrets.
    void this.page;
  }
}
