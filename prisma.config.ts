import path from 'node:path'
import { defineConfig } from 'prisma/config'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import dotenv from 'dotenv'

dotenv.config({ debug: false })

export default defineConfig({
	experimental: {
		adapter: true,
	},
	schema: path.join('prisma', 'schema.prisma'),
	async adapter() {
		return new PrismaLibSQL({
			url: process.env.LIBSQL_DATABASE_URL!,
			authToken: process.env.LIBSQL_DATABASE_TOKEN,
		})
	}
})