import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import * as fs from "fs";
import { getUrlsFromSitemap } from "./obtenerURL.mjs";

chromium.use(stealth());
(async () => {
  console.log("Iniciando");
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    locale: "es-ES",
  });
  const page = await context.newPage();

  try {
    console.log("Configurando cookies");
    await page.goto("https://www.carrefour.es");
    await page
      .locator("#onetrust-reject-all-handler")
      .click({ timeout: 15000 });
    await page.waitForLoadState("networkidle");
    await context.addCookies([
      {
        name: "c4-e-delivery-zone",
        value:
          "eyJ6aXBDb2RlIjoiMjgwMTMiLCJjaXR5IjoiTUFEUklEIiwid2FyZWhvdXNlSWQiOiI5MDAwNiIsImRlbGl2ZXJ5TW9kZSI6IkhPTUVfREVMSVZFUlkifQ==",
        domain: ".carrefour.es",
        path: "/",
      },
    ]);
    await page.reload({ waitUntil: "networkidle" });
    console.log("Cookies cambiadas");

    const productUrls = await getUrlsFromSitemap(browser);
    if (!productUrls || productUrls.length === 0) {
      throw new Error("No se obtuvieron URLs del sitemap");
    }

    fs.writeFileSync("productos.json", "[\n", "utf-8");
    let firstProductSaved = false;

    for (let i = 0; i < productUrls.length; i++) {
      const url = productUrls[i];
      try {
        console.log(`[${i + 1}/${productUrls.length}] Scrapeando: ${url}`);
        await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });

        const nameSelector = "h1.product-header__name";
        await page.waitForSelector(nameSelector, {
          state: "visible",
          timeout: 20000,
        });

        const name = await page.locator(nameSelector).innerText();
        const price = await page.locator(".buybox__price").first().innerText();
        const imageUrl = await page
          .locator("img.normal")
          .first()
          .getAttribute("src");

        const productData = {
          name: name.trim(),
          price: price.trim(),
          imageUrl,
        };
        const dataToSave = { ...productData, url };
        const jsonString =
          (firstProductSaved ? ",\n" : "") +
          JSON.stringify(dataToSave, null, 2);
        fs.appendFileSync("productos.json", jsonString, "utf-8");
        firstProductSaved = true;
      } catch (error) {
        fs.appendFileSync("url_error.txt", "\n");
        fs.appendFileSync("url_error.txt", url);
        console.error(`Error procesando ${url}: ${error.message}`);
      }
    }

    fs.appendFileSync("productos.json", "\n]", "utf-8");
  } catch (e) {
    console.error(e.message);
  } finally {
    await browser.close();
  }
})();
