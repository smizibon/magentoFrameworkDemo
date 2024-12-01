const { Builder } = require("selenium-webdriver");
const firefox = require("selenium-webdriver/firefox");

let driver;

async function setup() {
  let options = new firefox.Options();
  let service = new firefox.ServiceBuilder("./driver/geckodriver");

  driver = await new Builder()
    .forBrowser("firefox")
    .setFirefoxOptions(options)
    .setFirefoxService(service)
    .build();

  await driver.manage().window().maximize();
  return driver;
}

async function teardown() {
  if (driver) {
    await driver.quit();
  }
}

module.exports = {
  setup,
  teardown,
  getDriver: () => driver,
};
