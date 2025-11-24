import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

import { spawn } from 'child_process';
import * as fs from 'fs/promises';
import { db, closeDb } from '../lib/db.js';

const filePathCarrefour = join(__dirname, 'carrefour', 'productos_carrefour.json');
const filePathMercadona = join(__dirname, 'mercadona', 'productos_mercadona.json');

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

async function insertProducts(products) {
	const tx = await db.batch(
		products.map(p => ({
			sql: 'INSERT INTO products (name, price, url_image, retailer) VALUES (?, ?, ?, ?)',
			args: [p.name, p.price, p.url_image, p.retailer]
		}))
	);
	return products.length;
}

try {
	await Promise.all([
		runScript(join(__dirname, 'mercadona', 'scrapping.js')),
		runScript(join(__dirname, 'carrefour', 'scrapping.js'))
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

	const countCarrefour = await insertProducts(dataCarrefour);
	console.log(`Insertados ${countCarrefour} productos de Carrefour`);
	const countMercadona = await insertProducts(dataMercadona);
	console.log(`Insertados ${countMercadona} productos de Mercadona`);

} catch (err) {
	console.error(err);
} finally {
	await closeDb();
	process.exit(0);
}
