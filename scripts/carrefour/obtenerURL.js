import { parseStringPromise } from "xml2js";
import * as fs from "fs";

export async function getUrlsFromSitemap(browser) {
  const SITEMAP_URL =
    "https://www.carrefour.es/crs/cdn-static/sitemap-food/index.xml";
  const page = await browser.newPage();
  try {
    const response = await page.goto(SITEMAP_URL, {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    const xmlContent = await response.text();
    const result = await parseStringPromise(xmlContent);
    let sitemapLinks = [];

    if (result.sitemapindex && result.sitemapindex.sitemap) {
      sitemapLinks = result.sitemapindex.sitemap.map((s) => s.loc[0]);
    } else {
      throw new Error("El XML principal no es un índice de sitemaps válido.");
    }

    let allProductUrls = [];
    for (const link of sitemapLinks) {
      try {
        const productSitemapResponse = await page.goto(link, {
          waitUntil: "domcontentloaded",
          timeout: 60000,
        });
        const productSitemapXml = await productSitemapResponse.text();
        const productSitemapResult = await parseStringPromise(
          productSitemapXml
        );
        if (productSitemapResult.urlset && productSitemapResult.urlset.url) {
          const productUrls = productSitemapResult.urlset.url.map(
            (u) => u.loc[0]
          );
          allProductUrls.push(...productUrls);
        }
      } catch (error) {
        console.log(`No se puede procesar el sidemap ${link}`);
      }
    }
    fs.writeFileSync("./scripts/Carrefour/urls_productos.txt", allProductUrls.join("\n"), "utf-8");
    await page.close();
    return allProductUrls;
  } catch (error) {
    console.error("Error al procesar los sitemaps:", error);
    await page.close();
    return [];
  }
}
