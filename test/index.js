const { setup, teardown, getDriver } = require("./config/testConfig");
const LoginPage = require("./pageObjects/LoginPage");
const ProductPage = require("./pageObjects/ProductPage");
const assert = require("assert");

describe("Magento E-commerce Test Suite", function () {
  this.timeout(60000);

  let loginPage;
  let productPage;

  before("Setup Test Environment", async function () {
    await setup();
    loginPage = new LoginPage(getDriver());
    productPage = new ProductPage(getDriver());
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

      // Clear cart after successful login
      console.log("Clearing cart after login...");
      await productPage.clearCart();
    });
  });

  describe("Shopping Cart Functionality", function () {
    it("Should add two products to cart and verify total", async function () {
      try {
        await productPage.navigateToProductList();
        console.log("Successfully navigated to product list");

        // Add first product
        await productPage.addProductToCart(0);
        console.log("First product added successfully");

        // Wait a moment before adding second product
        await productPage.driver.sleep(2000);

        // Add second product
        await productPage.addProductToCart(1);
        console.log("Second product added successfully");

        // Wait for cart to stabilize
        await productPage.driver.sleep(3000);

        // Get cart total with retry
        let total;
        for (let i = 0; i < 3; i++) {
          try {
            total = await productPage.getCartTotal();
            if (!isNaN(total) && total > 0) break;
          } catch (error) {
            console.log(`Cart total attempt ${i + 1} failed:`, error.message);
            if (i === 2) throw error;
            await productPage.driver.sleep(1000);
          }
        }

        console.log("Final Cart Total:", total);
        assert(
          !isNaN(total) && total > 0,
          `Cart total should be a positive number, got: ${total}`
        );
      } catch (error) {
        console.error("Shopping cart test failed:", error);
        throw error;
      }
    });

    it("Should proceed to checkout", async function () {
      await productPage.proceedToCheckoutPage();
      // Add assertions for checkout page when needed
    });
  });
});
