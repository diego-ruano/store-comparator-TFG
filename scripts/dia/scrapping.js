import { chromium } from "playwright";
import * as fs from "fs/promises";
import * as path from "path";

export const scrapping = async () => {
	const outputFile = './scripts/dia/productos_dia.json';
	await fs.rm(outputFile, { force: true }).catch(() => { });

	const results = [];

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
		locale: "es-ES",
	});
	const page = await context.newPage();

	try {
		// Leer urls
		const urlsFile = './scripts/dia/urls_productos.txt';
		const data = (await fs.readFile(urlsFile, 'utf-8')).split('\n');
		console.log(data)

		// Iterar
		for (let i = 0; i < data.length; i++) {
			const url = data[i];
			console.log(url)

			try {
				await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });


				// lógica y comprobación de que no esté agotado el producto
				const buyButton = page.locator('button[data-test-id="add-button"], button.add-to-cart-button');
				const isDisabled = await buyButton.isDisabled().catch(() => true);
				const buttonText = await buyButton.textContent().catch(() => "");

				if (isDisabled || buttonText.toLowerCase().includes('agotado')) {
					continue;
				}


				const nameSelector = page.locator('h1, [data-test-id="product-title"]');
				let name = await nameSelector.first().innerText().catch(() => null);

				const priceSelector = page.locator('[data-test-id="price-container"] .price, .product-price');
				let priceText = await priceSelector.first().innerText().catch(() => null);

				const imageSelector = page.locator('img[data-test-id="product-image"], .product-image img');
				let imageUrl = await imageSelector.first().getAttribute('src').catch(() => null);


				// Si tenemos todo que hace falta, optimizamos el formato del precio
				if (name && priceText && imageUrl) {
					let priceClean = priceText
						.replace('€', '')
						.replace(',', '.')
						.trim();

					let price = parseFloat(priceClean);

					const temporalObject = {
						name: name.trim(),
						url_image: imageUrl.startsWith('http') ? imageUrl : `https://www.dia.es${imageUrl}`, // Asegurar URL absoluta
						price: price,
						retailer: 'Dia'
					};
					console.log(temporalObject)

					// validamos que todo esté correcto
					if (temporalObject.name && !isNaN(temporalObject.price) && temporalObject.url_image) {
						results.push(temporalObject);
					}
				}

			} catch (error) {
			}
		}

		// guardado de los resultados
		await fs.writeFile(
			outputFile,
			JSON.stringify(results, null, 2),
			'utf-8'
		);

		console.log(`💾 Scrapping finalizado. Guardados ${results.length} productos en ${outputFile}`);

	} catch (error) {
		console.error("Error global en el scrapping:", error);
	} finally {
		await browser.close();
	}
};

await scrapping();