import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";
import * as fs from "fs/promises";
import pLimit from "p-limit";
import { getUrlsFromSitemap } from "./obtenerURL.js";

chromium.use(stealth());

const CONCURRENCY = 10;
const OUTPUT_PATH = "./scripts/carrefour/productos_carrefour.json";
const ERROR_PATH = "./scripts/carrefour/url_error.txt";

async function safeGoto(page, url, retries = 2) {
	for (let i = 0; i <= retries; i++) {
		try {
			await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
			return;
		} catch (e) {
			if (i === retries) throw e;
			await new Promise(r => setTimeout(r, 1000));
		}
	}
}

const scrapping2 = (async () => {
	await fs.rm(OUTPUT_PATH, { force: true }).catch(() => { });
	await fs.rm(ERROR_PATH, { force: true }).catch(() => { });
	await fs.rm("./scripts/carrefour/urls_productos.txt", { force: true }).catch(() => { });

	const browser = await chromium.launch({ headless: true });

	try {
		const contextInit = await browser.newContext({
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
			locale: "es-ES",
		});

		const pageInit = await contextInit.newPage();
		await pageInit.goto("https://www.carrefour.es", { waitUntil: "domcontentloaded" });
		await pageInit.locator("#onetrust-reject-all-handler").click({ timeout: 5000 }).catch(() => { });
		await contextInit.addCookies([
			{
				name: "c4-e-delivery-zone",
				value:
					"eyJ6aXBDb2RlIjoiMjgwMTMiLCJjaXR5IjoiTUFEUklEIiwid2FyZWhvdXNlSWQiOiI5MDAwNiIsImRlbGl2ZXJ5TW9kZSI6IkhPTUVfREVMSVZFUlkifQ==",
				domain: ".carrefour.es",
				path: "/",
			},
		]);
		await pageInit.close();
		await contextInit.close();

		const productUrls = await getUrlsFromSitemap(browser);
		if (!productUrls || productUrls.length === 0) throw new Error("No se obtuvieron URLs del sitemap");

		const limit = pLimit(CONCURRENCY);
		const results = [];

		const scrapeProduct = async (url, index) => {
			const ctx = await browser.newContext({
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
				locale: "es-ES",
			});
			await ctx.addCookies([
				{
					name: "c4-e-delivery-zone",
					value:
						"eyJ6aXBDb2RlIjoiMjgwMTMiLCJjaXR5IjoiTUFEUklEIiwid2FyZWhvdXNlSWQiOiI5MDAwNiIsImRlbGl2ZXJ5TW9kZSI6IkhPTUVfREVMSVZFUlkifQ==",
					domain: ".carrefour.es",
					path: "/",
				},
			]);

			const page = await ctx.newPage();

			try {
				await safeGoto(page, url);

				const name = await page.locator("h1.product-header__name").textContent();
				const priceText = await page.locator(".buybox__price").first().textContent();
				const priceAsFloat = parseFloat(priceText.replace("€", "").replace(",", ".").trim());
				const url_image = await page.locator("img.normal").first().getAttribute("src");

				if (name && priceAsFloat && url_image) {
					results.push({
						name: name.trim(),
						price: priceAsFloat,
						url_image,
						retailer: "Carrefour",
					});
				}
			} catch {
				await fs.appendFile(ERROR_PATH, url + "\n");
			} finally {
				await ctx.close();
			}
		};

		const tasks = productUrls.map((url, i) => limit(() => scrapeProduct(url, i)));
		await Promise.allSettled(tasks);

		const filtered = results.filter(
			p => p.name && p.price != null && p.url_image && !isNaN(p.price)
		);

		await fs.writeFile(OUTPUT_PATH, JSON.stringify(filtered, null, 2));
	} catch (e) {
		console.error("🚨 Error principal:", e);
	} finally {
		await browser.close();
	}
});

await scrapping2();
export default scrapping2;
