const BasePage = require("./BasePage");
const { until } = require("selenium-webdriver");
const { By } = require("selenium-webdriver");

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.loginUrl = "/customer/account/login/";
  }

  // Locators
  get emailInput() {
    return this.driver.findElement({
      css: '#login-form input[name="login[username]"]',
    });
  }
  get passwordInput() {
    return this.driver.findElement({
      css: '#login-form input[name="login[password]"]',
    });
  }
  get loginButton() {
    return this.driver.findElement({ css: "#login-form button.action.login" });
  }
  get welcomeMessage() {
    return this.driver.findElement({ css: ".logged-in, .welcome" });
  }

  // Actions
  async navigateToLogin() {
    console.log("Navigating to:", this.baseUrl + this.loginUrl);
    await this.driver.get(this.baseUrl + this.loginUrl);

    // Add a small delay to ensure page loads
    await this.driver.sleep(2000);

    // Log current URL for debugging
    const currentUrl = await this.getCurrentUrl();
    console.log("Current URL:", currentUrl);

    // Wait for login form to be visible with more specific selector
    try {
      await this.driver.wait(
        until.elementLocated({
          css: '#login-form input[name="login[username]"]',
        }),
        10000,
        "Login form email input not found"
      );
    } catch (error) {
      console.error("Failed to locate login form:", error.message);
      // Log page source for debugging
      const pageSource = await this.driver.getPageSource();
      console.log("Page source:", pageSource.substring(0, 500) + "..."); // First 500 chars
      throw error;
    }
  }

  async login(email, password) {
    try {
      // Try to remove any overlays or ads that might be in the way
      try {
        await this.driver.sleep(2000); // Wait for ads to load
        const overlays = await this.driver.findElements(
          By.css(
            'iframe, .modal-popup, .modals-overlay, div[id^="aswift"], div[id^="google_ads"]'
          )
        );

        // Remove each overlay
        for (const overlay of overlays) {
          await this.driver.executeScript("arguments[0].remove()", overlay);
        }

        // Also try to remove by ID directly
        await this.driver.executeScript(`
          var elements = document.querySelectorAll('iframe, div[id^="aswift"], div[id^="google_ads"]');
          elements.forEach(e => e.remove());
        `);
      } catch (error) {
        console.log("No overlays found to remove:", error.message);
      }

      // Input email
      await this.driver.wait(
        until.elementIsVisible(await this.emailInput),
        5000
      );
      await this.emailInput.clear();
      await this.emailInput.sendKeys(email);

      // Input password
      await this.driver.wait(
        until.elementIsVisible(await this.passwordInput),
        5000
      );
      await this.passwordInput.clear();
      await this.passwordInput.sendKeys(password);

      // Handle the login button click
      const loginBtn = await this.loginButton;
      await this.driver.executeScript(
        "arguments[0].scrollIntoView(true)",
        loginBtn
      );
      await this.driver.sleep(1000);

      // Try clicking via JavaScript if normal click fails
      try {
        await loginBtn.click();
      } catch (error) {
        console.log("Normal click failed, trying JavaScript click");
        await this.driver.executeScript("arguments[0].click()", loginBtn);
      }

      // Wait for login to complete
      await this.driver.wait(
        until.elementLocated({ css: ".logged-in, .welcome, .message-error" }),
        10000
      );
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async isLoggedIn() {
    try {
      await this.driver.wait(
        until.elementLocated({ css: ".logged-in, .welcome" }),
        5000
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  async getErrorMessage() {
    try {
      const errorElement = await this.driver.findElement({
        css: ".message-error",
      });
      return await errorElement.getText();
    } catch (error) {
      return null;
    }
  }
}

module.exports = LoginPage;
