class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.baseUrl = "https://magento.softwaretestingboard.com";
    console.log("BasePage initialized with URL:", this.baseUrl);
  }

  async navigateTo(url) {
    console.log("Navigating to:", url);
    await this.driver.get(url);
    await this.driver.sleep(1000); // Small delay to ensure page loads
    const currentUrl = await this.getCurrentUrl();
    console.log("Current URL after navigation:", currentUrl);
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }
}

module.exports = BasePage;
