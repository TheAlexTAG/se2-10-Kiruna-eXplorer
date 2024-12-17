const { Builder, By, until } = require('selenium-webdriver');

const MAP_URL = "http://localhost:5173/map";
const DIAGRAM_URL = "http://localhost:5173/diagram";

async function MapToDiagramTest() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        console.log("Navigating to map page...");
        await driver.get(MAP_URL);

        // Wait page to load
        await driver.wait(until.urlContains(MAP_URL), 15000);
        console.log("Document page loaded!");

        await driver.sleep(2000);

        // wait for the cluster icon to be visible and click it
        const clusterSelector = ".custom-cluster-icon.small-cluster"; 
        await driver.wait(until.elementLocated(By.css(clusterSelector)), 5000);
        const cluster = await driver.findElement(By.css(clusterSelector));
        await cluster.click();
        console.log("Cluster open with success.");

        // Wait for the map icon to be visible and click it
        const iconSelector = "#root > div:nth-child(2) > div.leaflet-container.leaflet-touch.leaflet-fade-anim.leaflet-grab.leaflet-touch-drag.leaflet-touch-zoom > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-marker-pane > div:nth-child(1) > div > svg";
        await driver.wait(until.elementLocated(By.css(iconSelector)), 5000);
        const icon = await driver.findElement(By.css(iconSelector));
        await icon.click();
        console.log("Icon clicked with success.");

        // wait for the card to be visible 
        console.log("Waiting for the card...");
        const card = await driver.wait(until.elementLocated(By.css('.main-text.container')), 5000);
        await driver.wait(until.elementIsVisible(card), 5000);

        console.log("Card is visible!");

        await driver.sleep(3000); 

        // search for the "Open in Diagram" button and click it
        const openInDiagramButton = By.xpath("//button[contains(@class, 'btn-primary') and text()='Open in Diagram']");
        await driver.wait(until.elementLocated(openInDiagramButton), 5000);
        await driver.findElement(openInDiagramButton).click();
        console.log("Button 'Open in Diagram' clicked with success.");

        await driver.sleep(3000);

        // verify that the URL has changed to the diagram page
        await driver.wait(until.urlIs(DIAGRAM_URL), 5000);
        const currentUrl = await driver.getCurrentUrl();

        if (currentUrl === DIAGRAM_URL) {
            console.log("First test passed! You have been redirected correctly.");
          } else {
            console.error("Test failed! currentURL:", currentUrl);
          }

        // search for the "Open in Map" button and click it
        const openInMapButton = By.xpath("//button[contains(@class, 'btn-primary') and text()='Open in Map']");
        await driver.wait(until.elementLocated(openInMapButton), 5000);
        await driver.findElement(openInMapButton).click();
        console.log("Button 'Open in Map' clicked with success.");

        await driver.sleep(3000);

        // verify that the URL has changed to the map page
        await driver.wait(until.urlIs(MAP_URL), 5000);
        const currentUrl2 = await driver.getCurrentUrl();

        if (currentUrl2 === MAP_URL) {
            console.log("Second test passed! You have been redirected correctly.");
          } else {
            console.error("Test failed! currentURL:", currentUrl2);
          }

        console.log("Test finished with success!");


    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        await driver.quit();
    }
}

MapToDiagramTest();
