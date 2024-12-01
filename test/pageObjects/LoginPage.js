const BasePage = require("./BasePage");
const { until } = require("selenium-webdriver");

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.url =
      "https://magento.softwaretestingboard.com/customer/account/login";
  }

  // Locators
  get emailInput() {
    return this.driver.findElement({ css: 'input[name="login[username]"]' });
  }
  get passwordInput() {
    return this.driver.findElement({ css: 'input[name="login[password]"]' });
  }
  get loginButton() {
    return this.driver.findElement({ css: "button.action.login" });
  }
  get welcomeMessage() {
    return this.driver.findElement({ css: ".logged-in, .welcome" });
  }

  // Actions
  async navigateToLogin() {
    await this.navigateTo(this.url);
    // Wait for the login form to be visible
    await this.driver.wait(
      until.elementLocated({ css: 'input[name="login[username]"]' }),
      10000
    );
  }

  async login(email, password) {
    try {
      await this.driver.wait(
        until.elementIsVisible(await this.emailInput),
        5000
      );
      await this.emailInput.clear();
      await this.emailInput.sendKeys(email);

      await this.driver.wait(
        until.elementIsVisible(await this.passwordInput),
        5000
      );
      await this.passwordInput.clear();
      await this.passwordInput.sendKeys(password);

      await this.loginButton.click();

      // Wait for either success or error message
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
