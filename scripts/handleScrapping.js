import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import { prisma } from '../lib/prisma.js';

const filePathCarrefour = './scripts/carrefour/productos_carrefour.json';
const filePathMercadona = './scripts/mercadona/productos_mercadona.json';

function runScript(path) {
	return new Promise((resolve, reject) => {
		const child = spawn('node', [path], { stdio: 'inherit' });
		child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${path} salió con código ${code}`)));
		child.on('error', reject);
	});
}

async function waitForFile(path, timeout = 120000) {
	const start = Date.now();
	while (true) {
		try {
			await fs.access(path);
			return;
		} catch {
			if (Date.now() - start > timeout) throw new Error(`Timeout esperando el archivo ${path}`);
			await new Promise(r => setTimeout(r, 500));
		}
	}
}

try {
	await Promise.all([
		runScript('./scripts/mercadona/scrapping.js'),
		runScript('./scripts/carrefour/scrapping.js')
	]);

	await waitForFile(filePathCarrefour);
	await waitForFile(filePathMercadona);

	const carrefourContent = JSON.parse(await fs.readFile(filePathCarrefour, 'utf-8'));
	const mercadonaContent = JSON.parse(await fs.readFile(filePathMercadona, 'utf-8'));

	const dataCarrefour = carrefourContent.map(p => ({
		name: p.name,
		price: p.price,
		url_image: p.url_image,
		retailer: p.retailer
	}));
	const dataMercadona = mercadonaContent.map(p => ({
		name: p.name,
		price: p.price,
		url_image: p.url_image,
		retailer: p.retailer
	}));

	const resultCarrefour = await prisma.products.createMany({ data: dataCarrefour });
	console.log(`Insertados ${resultCarrefour.count} productos de Carrefour`);
	const resultMercadona = await prisma.products.createMany({ data: dataMercadona });
	console.log(`Insertados ${resultMercadona.count} productos de Mercadona`);

} catch (err) {
	console.error(err);
} finally {
	await prisma.$disconnect();
	process.exit(0);
}
