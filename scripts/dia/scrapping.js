import { chromium } from "playwright";
import * as fs from "fs/promises";

export const scrapping = async () => {
	const outputFile = './scripts/dia/productos_dia.json';
	await fs.rm(outputFile, { force: true }).catch(() => { });

	const results = [];

	const browser = await chromium.launch({ headless: false, slowMo: 1000 });
	const context = await browser.newContext({
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
		locale: "es-ES",
	});
	const page = await context.newPage();

	try {
		// Leer urls
		const urlsFile = './scripts/dia/urls_productos.txt';
		const data = (await fs.readFile(urlsFile, 'utf-8')).split('\n');

		// Iterar
		for (let i = 0; i < data.length; i++) {
			const url = data[i];
			console.log(url)

			try {
				await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
				const localizadorRechazarCookies = await page.locator('#onetrust-reject-all-handler')

				if (localizadorRechazarCookies.isVisible()) {
					localizadorRechazarCookies.click()
				}

				// lógica y comprobación de que no esté agotado el producto
				const localizadorBotonAgotado = page.locator('[data-test-id="add2cart-basic-button"]')
				const texto = await localizadorBotonAgotado.innerText()
				console.log(localizadorBotonAgotado)
				console.log(texto)

				// Aquí hay que comprobar que los selectores estén bien puestos
				const nombre = await page.locator('.product-title').innerText().catch()
				const precio = await page.locator('.buy-box__active-price').innerText().catch()
				const url_imagen = await page.locator('.product-image').first().getAttribute('src').catch()
				console.log({
					comentario: 'mostrando datos',
					nombre: nombre,
					precio: precio,
					url_imagen: url_imagen
				})

				// Los src son rutas relativas así añadimos lo necesario para poder encontrarlas
				if (!url_imagen.startsWith('http')) {
					url_imagen = `www.dia.es${url_imagen}`
					console.log(url_imagen)
				}

				// Si tenemos todo que hace falta, optimizamos el formato del precio
				if (nombre && precio && url_imagen) {
					let precioFormateado = precio
						.replace('€', '')
						.replace(',', '.')
						.trim();

					let precioFinal = parseFloat(precioFormateado);

					const objetoTemporal = {
						nombre: nombre.trim(),
						url_image: url_imagen,
						precio: precioFinal,
						retailer: 'Dia'
					};
					console.log(objetoTemporal)

					// validamos que todo esté correcto
					if (temporalObject.name && !isNaN(temporalObject.price) && temporalObject.url_image) {
						results.push(temporalObject);
					}
				}

			} catch (error) {
			}
			console.log(results)
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