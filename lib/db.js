import { createClient } from '@libsql/client';

/**
 * @typedef {import('@libsql/client').Client} Client
 */

const globalForDb = globalThis;
globalForDb.db = globalForDb.db || undefined;

/**
 * @returns {Client}
 */
function initializeClient() {
	if (!process.env.URL || !process.env.TOKEN) {
		throw new Error('Missing required environment variables: URL and TOKEN must be set');
	}

	return createClient({
		url: process.env.URL,
		authToken: process.env.TOKEN,
	});
}

/** @type {Client|undefined} */
let dbInstance = globalForDb.db;

/**
 * @returns {Client}
 */
function getDb() {
	if (!dbInstance) {
		dbInstance = initializeClient();
		globalForDb.db = dbInstance;

		if (process.env.NODE_ENV !== 'production') {
			console.log('Database client initialized');
		}
	}
	return dbInstance;
}

/** @type {Client} */
export const db = new Proxy({}, {
	get(target, prop) {
		const client = getDb();
		const value = client[prop];
		if (typeof value === 'function') {
			return value.bind(client);
		}
		return value;
	}
});

export async function closeDb() {
	if (dbInstance) {
		await dbInstance.close();
		dbInstance = undefined;
		globalForDb.db = undefined;
	}
}
