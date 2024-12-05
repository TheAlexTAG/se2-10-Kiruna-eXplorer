const { Builder, By, until } = require('selenium-webdriver');

const LOGIN_URL = "http://localhost:5173/login";
const DOCUMENT_URL = "http://localhost:5173/document";
const USERNAME = "up";
const PASSWORD = "pwd";

// Generate random clientX and clientY values within a range
function getRandomCoordinates(minX, maxX, minY, maxY) {
    return {
        x: Math.floor(Math.random() * (maxX - minX + 1)) + minX,
        y: Math.floor(Math.random() * (maxY - minY + 1)) + minY,
    };
}

async function testListDocuments() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // Step 1: Navigate to Login Page
        console.log("Navigating to login page...");
        await driver.get(LOGIN_URL);

        console.log("Entering username...");
        await driver.wait(until.elementLocated(By.id("formBasicUsername")), 10000);
        await driver.findElement(By.id("formBasicUsername")).sendKeys(USERNAME);

        console.log("Entering password...");
        await driver.wait(until.elementLocated(By.id("formBasicPassword")), 10000);
        await driver.findElement(By.id("formBasicPassword")).sendKeys(PASSWORD);

        console.log("Submitting login form...");
        await driver.findElement(By.css('button[type="submit"]')).click();

        // Debug: Capture Page Source
        const pageSource = await driver.getPageSource();
        console.log("Page Source After Login Submit:", pageSource);

        // Confirm Login
        console.log("Waiting for post-login confirmation...");
        await driver.wait(until.urlContains("http://localhost:5173/"), 15000);
        const currentUrl = await driver.getCurrentUrl();
        console.log("Current URL after login:", currentUrl);

        // Debug Cookies
        const cookies = await driver.manage().getCookies();
        console.log("Session Cookies After Login:", cookies);

        // Debug Local Storage
        const token = await driver.executeScript("return window.localStorage.getItem('auth-token');");
        console.log("Token in local storage:", token);

        // Step 2: Navigate to the Document Page
        if (!cookies.length && !token) {
            throw new Error("Login failed: No cookies or token found. Check login credentials or app behavior.");
        }

        console.log("Navigating to document page...");
        await driver.get(DOCUMENT_URL);

        console.log("Waiting for document page...");
        await driver.wait(until.urlContains(DOCUMENT_URL), 15000);
        console.log("Document page loaded!");
    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        await driver.quit();
    }
}

testListDocuments();