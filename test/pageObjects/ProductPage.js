const BasePage = require("./BasePage");
const { By, until } = require("selenium-webdriver");

class ProductPage extends BasePage {
  // Selectors
  constructor(driver) {
    super(driver);
    this.productListSelector = ".products-grid";
    this.productItemSelector = ".product-item-info";
    this.addToCartButton = "button.action.tocart.primary";
    this.sizeOptionSelector = ".swatch-option.text"; // For selecting size
    this.colorOptionSelector = ".swatch-option.color"; // For selecting color
    this.cartIcon = "a.action.showcart";
    this.cartSubtotal = ".subtotal .price";
    this.proceedToCheckout = "#top-cart-btn-checkout";
    this.productListUrl = "/women/tops-women.html";
    this.addToCartSuccessMsg = ".message-success";
    this.miniCartSelector = ".minicart-wrapper";
  }

  async navigateToProductList() {
    console.log(
      "Navigating to product list:",
      this.baseUrl + this.productListUrl
    );
    await this.driver.get(this.baseUrl + this.productListUrl);
    await this.driver.wait(
      until.elementLocated(By.css(this.productListSelector)),
      10000
    );
  }

  async addProductToCart(productIndex) {
    try {
      // Wait for product grid to be fully loaded
      console.log("Waiting for product grid to load...");
      await this.driver.wait(
        until.elementLocated(By.css(this.productListSelector)),
        10000,
        "Product grid not found"
      );

      // Wait a moment for products to render
      await this.driver.sleep(2000);

      // Find all product items
      console.log("Finding products...");
      const products = await this.driver.findElements(
        By.css(this.productItemSelector)
      );
      console.log(`Found ${products.length} products`);

      if (!products[productIndex]) {
        throw new Error(`Product at index ${productIndex} not found`);
      }

      // Scroll to top first
      await this.driver.executeScript("window.scrollTo(0, 0);");
      await this.driver.sleep(1000);

      // Scroll product into view
      console.log(`Scrolling to product ${productIndex}`);
      await this.driver.executeScript(
        "arguments[0].scrollIntoView({block: 'center'});",
        products[productIndex]
      );
      await this.driver.sleep(2000);

      // Verify product is visible
      const isVisible = await products[productIndex].isDisplayed();
      console.log(`Product ${productIndex} visibility:`, isVisible);

      if (!isVisible) {
        // Try one more time with a different scroll approach
        await this.driver.executeScript(
          `
          const element = arguments[0];
          const y = element.getBoundingClientRect().top + window.pageYOffset - 100;
          window.scrollTo({top: y});
          `,
          products[productIndex]
        );
        await this.driver.sleep(1000);

        const isVisibleRetry = await products[productIndex].isDisplayed();
        if (!isVisibleRetry) {
          throw new Error(
            `Product ${productIndex} is not visible after scroll attempts`
          );
        }
      }

      // Try to interact with the product
      try {
        console.log(`Attempting to add product ${productIndex} to cart`);

        // Find size options within this product
        const sizeOptions = await products[productIndex].findElements(
          By.css(this.sizeOptionSelector)
        );
        if (sizeOptions.length > 0) {
          console.log("Selecting size...");
          await this.driver.wait(
            until.elementIsVisible(sizeOptions[0]),
            5000,
            "Size option not visible"
          );
          await sizeOptions[0].click();
          await this.driver.sleep(500);
        }

        // Find color options within this product
        const colorOptions = await products[productIndex].findElements(
          By.css(this.colorOptionSelector)
        );
        if (colorOptions.length > 0) {
          console.log("Selecting color...");
          await this.driver.wait(
            until.elementIsVisible(colorOptions[0]),
            5000,
            "Color option not visible"
          );
          await colorOptions[0].click();
          await this.driver.sleep(500);
        }

        // Find and click Add to Cart button
        console.log("Clicking Add to Cart...");
        const addToCartBtn = await products[productIndex].findElement(
          By.css(this.addToCartButton)
        );

        await this.driver.wait(
          until.elementIsVisible(addToCartBtn),
          5000,
          "Add to Cart button not visible"
        );

        // Try multiple click methods
        try {
          await addToCartBtn.click();
        } catch (error) {
          console.log("Direct click failed, trying JavaScript click");
          await this.driver.executeScript(
            "arguments[0].click();",
            addToCartBtn
          );
        }

        // Wait for success message
        await this.driver.wait(
          until.elementLocated(By.css(this.addToCartSuccessMsg)),
          10000,
          "Success message not found"
        );

        console.log(`Product ${productIndex} added successfully`);
        await this.driver.sleep(2000);
      } catch (error) {
        console.error(
          `Failed to interact with product ${productIndex}:`,
          error
        );
        throw error;
      }
    } catch (error) {
      console.error(`Failed to add product ${productIndex} to cart:`, error);
      throw error;
    }
  }

  async getCartTotal() {
    try {
      // First ensure we're on a stable page state
      await this.driver.sleep(2000);

      // Try to open the cart
      console.log("Opening cart...");
      const cartIcon = await this.driver.findElement(By.css(this.cartIcon));
      await cartIcon.click();
      await this.driver.sleep(2000);

      // Wait for mini cart to be visible and stable
      console.log("Waiting for mini cart...");
      await this.driver.wait(
        until.elementLocated(By.css(this.miniCartSelector)),
        10000,
        "Mini cart not found"
      );

      // Simple retry mechanism for getting the total
      let attempts = 3;
      while (attempts > 0) {
        try {
          const subtotalElement = await this.driver.findElement(
            By.css(".subtotal .price")
          );
          await this.driver.wait(until.elementIsVisible(subtotalElement), 5000);

          const subtotalText = await subtotalElement.getText();
          console.log("Raw subtotal text:", subtotalText);

          const total = this.parsePrice(subtotalText);
          console.log("Parsed total:", total);
          return total;
        } catch (error) {
          console.log(`Attempt ${4 - attempts} failed:`, error.message);
          attempts--;
          if (attempts === 0) throw error;
          await this.driver.sleep(1000);
        }
      }
    } catch (error) {
      console.error("Failed to get cart total:", error);
      throw error;
    }
  }

  // Helper method to parse price
  parsePrice(text) {
    if (!text) {
      throw new Error("Empty price text received");
    }

    console.log("Parsing price from:", text);
    const price = text.replace(/[^0-9.]/g, "");
    console.log("Extracted price:", price);

    const total = parseFloat(price);
    if (isNaN(total)) {
      throw new Error(`Failed to parse price from text: ${text}`);
    }

    return total;
  }

  async proceedToCheckoutPage() {
    try {
      // Make sure cart is open
      console.log("Opening cart for checkout...");
      const cartIcon = await this.driver.findElement(By.css(this.cartIcon));
      await cartIcon.click();
      await this.driver.sleep(2000);

      // Wait for mini cart to be visible
      console.log("Waiting for mini cart...");
      await this.driver.wait(
        until.elementLocated(By.css(this.miniCartSelector)),
        10000,
        "Mini cart not found"
      );

      // Wait for checkout button and try different approaches to click it
      console.log("Looking for checkout button...");
      await this.driver.wait(
        until.elementLocated(By.css(this.proceedToCheckout)),
        10000
      );

      const checkoutButton = await this.driver.findElement(
        By.css(this.proceedToCheckout)
      );

      // Try multiple approaches to click the button
      try {
        // First try: Direct click
        await checkoutButton.click();
      } catch (error) {
        console.log("Direct click failed, trying JavaScript click");
        try {
          // Second try: JavaScript click
          await this.driver.executeScript(
            "arguments[0].click();",
            checkoutButton
          );
        } catch (error) {
          console.log("JavaScript click failed, trying with actions");
          // Third try: Actions click
          const actions = this.driver.actions({ bridge: true });
          await actions.move({ origin: checkoutButton }).click().perform();
        }
      }

      // Wait to ensure we've moved to checkout page
      await this.driver.sleep(2000);
      console.log("Proceeded to checkout");
    } catch (error) {
      console.error("Failed to proceed to checkout:", error);
      throw error;
    }
  }

  async clearCart() {
    try {
      console.log("Clearing cart...");
      // Open cart
      const cartIcon = await this.driver.findElement(By.css(this.cartIcon));
      await cartIcon.click();
      await this.driver.sleep(1000);

      // Look for delete/remove buttons
      try {
        const removeButtons = await this.driver.findElements(
          By.css(".action.delete, .action-delete")
        );

        for (const button of removeButtons) {
          await button.click();
          // Wait for confirmation modal if it appears
          try {
            const confirmButton = await this.driver.findElement(
              By.css(".action-primary, .action-accept")
            );
            await confirmButton.click();
          } catch (e) {
            console.log("No confirmation needed for item removal");
          }
          await this.driver.sleep(1000);
        }

        console.log(`Removed ${removeButtons.length} items from cart`);
      } catch (error) {
        console.log("No items to remove from cart");
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    }
  }
}

module.exports = ProductPage;
