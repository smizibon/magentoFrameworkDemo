# Magento E-commerce Test Automation

This project contains automated tests for the Magento e-commerce platform using Selenium WebDriver with JavaScript.

## Prerequisites

Before running the tests, ensure you have the following installed:

- Node.js (v12 or higher)
- npm (Node Package Manager)
- Firefox Browser
- Git (for version control)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Download GeckoDriver**
   - Download the latest version of GeckoDriver from [Mozilla's GitHub](https://github.com/mozilla/geckodriver/releases)
   - Extract the executable
   - Place it in the `driver` folder in your project root
   - For Unix-based systems (Linux/Mac), make it executable:
     ```bash
     chmod +x driver/geckodriver
     ```

## Project Structure

project-root/
├── driver/
│ └── geckodriver
├── test/
│ ├── config/
│ │ ├── testConfig.js
│ │ └── mocha.opts.js
│ ├── pageObjects/
│ │ ├── BasePage.js
│ │ └── LoginPage.js
│ ├── reports/
│ │ └── [generated reports]
│ └── index.js
├── package.json
└── README.md

## Running Tests

bash

### Run all tests
npm test

