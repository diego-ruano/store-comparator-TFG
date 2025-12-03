import { parseStringPromise } from "xml2js";
import * as fs from "fs";
import * as path from "path";
import { chromium } from "playwright";

const browserInit = await chromium.launch({ headless: true });
const browser = await browserInit.newContext({
	userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
	locale: "es-ES",
	viewport: { width: 1920, height: 1080 },
	deviceScaleFactor: 1,
	hasTouch: false,
	isMobile: false,
	javaScriptEnabled: true,
	timezoneId: "Europe/Madrid",
	permissions: ['geolocation'],
	extraHTTPHeaders: {
		"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
		"Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
		"Cache-Control": "max-age=0",
		"Sec-Ch-Ua": "\"Chromium\";v=\"118\", \"Google Chrome\";v=\"118\", \"Not=A?Brand\";v=\"99\"",
		"Sec-Ch-Ua-Mobile": "?0",
		"Sec-Ch-Ua-Platform": "\"Windows\"",
		"Sec-Fetch-Dest": "document",
		"Sec-Fetch-Mode": "navigate",
		"Sec-Fetch-Site": "none",
		"Sec-Fetch-User": "?1",
		"Upgrade-Insecure-Requests": "1"
	}
});

export async function getDiaUrls(browser) {
	const SITEMAP_URL = "https://www.dia.es/sitemap.xml";
	const page = await browser.newPage();

	try {
		console.log(`🌍 Navegando al sitemap de Dia: ${SITEMAP_URL}`);

		const response = await page.goto(SITEMAP_URL, {
			waitUntil: "domcontentloaded",
			timeout: 60000,
		});

		const xmlContentRaw = await response.text();
		console.log(xmlContentRaw)

		const startIndex = xmlContentRaw.indexOf("<urlset");
		const endIndex = xmlContentRaw.lastIndexOf("</urlset>");

		let xmlContent = xmlContentRaw;

		if (startIndex > -1 && endIndex > -1) {
			xmlContent = xmlContentRaw.substring(startIndex, endIndex + 9);
		}

		const result = await parseStringPromise(xmlContent);
		let allProductUrls = [];

		if (result.urlset && result.urlset.url) {
			console.log("📄 Procesando lista de URLs...");

			const urls = result.urlset.url
				.map((u) => u.loc[0])
				.filter((url) => url.includes('/p/'));

			allProductUrls = urls;
		} else {
			console.warn("⚠️ No se encontró la estructura urlset esperada en el XML.");
		}

		console.log(`✅ Total final: ${allProductUrls.length} productos encontrados.`);

		const dirPath = "./scripts/dia";
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath, { recursive: true });
		}

		fs.writeFileSync(path.join(dirPath, "urls_productos.txt"), allProductUrls.join("\n"), "utf-8");

		await page.close();
		return allProductUrls;

	} catch (error) {
		console.error("❌ Error al procesar el sitemap de Dia:", error);
		await page.close();
		return [];
	}
}

await getDiaUrls(browser);
await browser.close();
await browserInit.close();