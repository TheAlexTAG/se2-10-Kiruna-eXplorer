const { Builder, By, until } = require("selenium-webdriver");

(async function testNewDocument() {
  // Configura il driver per Chrome
  let driver = await new Builder().forBrowser("chrome").build();

  try {
    // Naviga alla pagina di login
    await driver.get("http://localhost:5173/");

    console.log("Navigazione completati con successo!");

  } catch (err) {
    console.error("Test fallito:", err);
  } finally {
    // Chiudi il browser
    await driver.quit();
  }
})();

