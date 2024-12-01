const { setup, teardown, getDriver } = require("./config/testConfig");
const LoginPage = require("./pageObjects/LoginPage");
const assert = require("assert");

describe("Magento E-commerce Test Suite", function () {
  let loginPage;

  before("Setup Test Environment", async function () {
    await setup();
    loginPage = new LoginPage(getDriver());
  });

  after("Cleanup Test Environment", async function () {
    await teardown();
  });

  describe("Login Functionality", function () {
    it("Should successfully navigate to the login page", async function () {
      await loginPage.navigateToLogin();
      const currentUrl = await loginPage.getCurrentUrl();
      assert(currentUrl.includes("/login"), "Should be on login page");
    });

    it("Should successfully login with valid credentials", async function () {
      const email = "0asd@asd.com";
      const password = "a12345678A";

      await loginPage.login(email, password);

      if (!(await loginPage.isLoggedIn())) {
        const errorMsg = await loginPage.getErrorMessage();
        console.log("Login Error:", errorMsg);
      }
      assert(await loginPage.isLoggedIn(), "User should be logged in");
    });
  });
});
