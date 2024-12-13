const { Builder, By, until } = require('selenium-webdriver');

const DIAGRAM_URL = "http://localhost:5173/diagram";

async function testDiagram() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log("Navigating to diagram page...");
        await driver.get(DIAGRAM_URL);

        // Wait page to load
        await driver.wait(until.urlContains(DIAGRAM_URL), 15000);
        console.log("Document page loaded!");

        await driver.sleep(2000);

        // search icon
        console.log("Looking for the icon...");
        const icon = await driver.findElement(By.css('rect[x="-20"][y="-20"][width="40"][height="40"][fill="transparent"]'));

        // Scroll to the icon (if needed)
        await driver.executeScript("arguments[0].scrollIntoView(true);", icon);

        await driver.sleep(1000);

        // click icon
        console.log("Clicking on the icon...");
        await icon.click();

        await driver.sleep(2000);

        console.log("Waiting for the card...");
        const card = await driver.wait(until.elementLocated(By.css('.main-text.container')), 5000);
        await driver.wait(until.elementIsVisible(card), 5000);

        console.log("Card is visible!");

        await driver.sleep(3000); 

        // search close button
        console.log("Looking for the close button...");
        const closeButton = await driver.findElement(By.className("bi bi-x-lg"));

        await driver.sleep(1000); 

        // click close button
        console.log("Clicking on the close button...");
        await closeButton.click();

        await driver.sleep(2000); 

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        await driver.quit();
    }
}

testDiagram();
