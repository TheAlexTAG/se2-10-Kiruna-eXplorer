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

async function testNavigation() {
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        // e2e for adding location for a new document

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

        // Step 3: Click on Add New Document button
        await driver.findElement(By.xpath('//*[@id="root"]/div/div[1]/div/button')).click();
        console.log("insert new document")


        // step 4: click on the map button
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[3]/div[3]/button')).click();
        console.log("map opened")


        // step 5: select point button

        // Wait for the map to load (use an element unique to the map page)
       await driver.wait(until.elementLocated(By.css('svg.leaflet-zoom-animated')),10000);
       console.log("map opened successfully")


        // Simulate clicking a specific location on the map (coordinates-based or a visible element)
       await driver.executeScript(`
       const mapElement = document.querySelector('.leaflet-pane.leaflet-overlay-pane');
       const clickEvent = new MouseEvent('click', { bubbles: true, clientX: 200, clientY: 300 });
       mapElement.dispatchEvent(clickEvent);
       `);


       console.log("Specific location selected on the map.");

        // Step 6: Choose a Zone

        // Click on the "Choose a zoon" button
        await driver.findElement(By.xpath('/html/body/div[5]/div/div/div[2]/div/div[1]/button[2]')).click();

        // Wait for zones to appear and select one
        await driver.wait(until.elementLocated(By.css('path.leaflet-interactive:nth-of-type(3)')),10000).click();
        console.log("Zone selected on the map.");

        // Step 7: Draw an Area

        // Click on the "Draw a custom area on Map" button
        await driver.findElement(By.xpath('/html/body/div[5]/div/div/div[2]/div/div[1]/button[3]')).click();


        // Click on the "Draw Area" button to activate area selection
        await driver.findElement(By.css('a.leaflet-draw-draw-polygon')).click();


        // Simulate drawing on the map (start point, intermediate points, and endpoint)
        await driver.executeScript(`
            const mapElement = document.querySelector('.leaflet-pane.leaflet-overlay-pane');
            if (!mapElement) {
                throw new Error("Map element not found.");
            }

            // Generate random points within a range
            function getRandomCoordinates(minX, maxX, minY, maxY) {
                return {
                    x: Math.floor(Math.random() * (maxX - minX + 1)) + minX,
                    y: Math.floor(Math.random() * (maxY - minY + 1)) + minY,
                };
            }

            const rect = document.querySelector('.leaflet-container').getBoundingClientRect();
            const minX = rect.left;
            const maxX = rect.right;
            const minY = rect.top;
            const maxY = rect.bottom;

            const start = getRandomCoordinates(minX, maxX, minY, maxY);
            const mid1 = getRandomCoordinates(minX, maxX, minY, maxY);
            const mid2 = getRandomCoordinates(minX, maxX, minY, maxY);

            // Simulate drawing events
            const startPoint = new MouseEvent('mousedown', { bubbles: true, clientX: start.x, clientY: start.y });
            const movePoint1 = new MouseEvent('mousemove', { bubbles: true, clientX: mid1.x, clientY: mid1.y });
            const movePoint2 = new MouseEvent('mousemove', { bubbles: true, clientX: mid2.x, clientY: mid2.y });
            const endPoint = new MouseEvent('mouseup', { bubbles: true, clientX: start.x, clientY: start.y });

            mapElement.dispatchEvent(startPoint);
            mapElement.dispatchEvent(movePoint1);
            mapElement.dispatchEvent(movePoint2);
            mapElement.dispatchEvent(endPoint);

            console.log("Random area drawn on the map.");
        `);

        console.log("Random points selected and area drawn.");
        
        console.log("Area drawn on the map.");


        // Step 8: click on OK and save the map
        await driver.findElement(By.xpath('/html/body/div[5]/div/div/div[3]/button[2]')).click();
        console.log("map saved")

        

        // e2e test for editing location of an existing document

        // Step 1: Navigate to the Document Page

        console.log("Navigating to document page...");
        await driver.get(DOCUMENT_URL);

        console.log("Waiting for document page...");
        await driver.wait(until.urlContains(DOCUMENT_URL), 15000);
        console.log("Document page loaded!");

        // Step 2: Click on document meue
        await driver.findElement(By.xpath('//*[@id="root"]/div/div[4]/table/tbody/tr[1]/td[9]/div/button/i')).click();
        console.log("manue opened")

        // Step 3: Click on edit document button
        await driver.findElement(By.xpath('//*[@id="root"]/div/div[4]/table/tbody/tr[1]/td[9]/div/div/a[2]/div')).click();
        console.log("Ready for editing ducoment")

        // Step 4: Click on chose location on map button
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/form/div[3]/div[3]/button')).click();
        console.log("Ready for editing location")

        // step 5: select point button

        // Wait for the map to load (use an element unique to the map page)
       await driver.wait(until.elementLocated(By.css('svg.leaflet-zoom-animated')),10000);
       console.log("map opened successfully")


        // Simulate clicking a specific location on the map (coordinates-based or a visible element)
       await driver.executeScript(`
       const mapElement = document.querySelector('.leaflet-pane.leaflet-overlay-pane');
       const clickEvent = new MouseEvent('click', { bubbles: true, clientX: 200, clientY: 300 });
       mapElement.dispatchEvent(clickEvent);
       `);


       console.log("Specific location selected on the map.");

        // Step 6: Choose a Zone

        // Click on the "Choose a zoon" button
        await driver.findElement(By.xpath('/html/body/div[5]/div/div/div[2]/div/div[1]/button[2]')).click();

        // Wait for zones to appear and select one
        await driver.wait(until.elementLocated(By.css('path.leaflet-interactive:nth-of-type(3)')),10000).click();
        console.log("Zone selected on the map.");

        // Step 7: Draw an Area

        // Click on the "Draw a custom area on Map" button
        await driver.findElement(By.xpath('/html/body/div[5]/div/div/div[2]/div/div[1]/button[3]')).click();


        // Click on the "Draw Area" button to activate area selection
        await driver.findElement(By.css('a.leaflet-draw-draw-polygon')).click();


        // Simulate drawing on the map (start point, intermediate points, and endpoint)
        await driver.executeScript(`
            const mapElement = document.querySelector('.leaflet-pane.leaflet-overlay-pane');
            if (!mapElement) {
                throw new Error("Map element not found.");
            }

            // Generate random points within a range
            function getRandomCoordinates(minX, maxX, minY, maxY) {
                return {
                    x: Math.floor(Math.random() * (maxX - minX + 1)) + minX,
                    y: Math.floor(Math.random() * (maxY - minY + 1)) + minY,
                };
            }

            const rect = document.querySelector('.leaflet-container').getBoundingClientRect();
            const minX = rect.left;
            const maxX = rect.right;
            const minY = rect.top;
            const maxY = rect.bottom;

            const start = getRandomCoordinates(minX, maxX, minY, maxY);
            const mid1 = getRandomCoordinates(minX, maxX, minY, maxY);
            const mid2 = getRandomCoordinates(minX, maxX, minY, maxY);

            // Simulate drawing events
            const startPoint = new MouseEvent('mousedown', { bubbles: true, clientX: start.x, clientY: start.y });
            const movePoint1 = new MouseEvent('mousemove', { bubbles: true, clientX: mid1.x, clientY: mid1.y });
            const movePoint2 = new MouseEvent('mousemove', { bubbles: true, clientX: mid2.x, clientY: mid2.y });
            const endPoint = new MouseEvent('mouseup', { bubbles: true, clientX: start.x, clientY: start.y });

            mapElement.dispatchEvent(startPoint);
            mapElement.dispatchEvent(movePoint1);
            mapElement.dispatchEvent(movePoint2);
            mapElement.dispatchEvent(endPoint);

            console.log("Random area drawn on the map.");
        `);

        console.log("Random points selected and area drawn.");
        
        console.log("Area drawn on the map.");
          

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        await driver.quit();
    }
}

testNavigation();
