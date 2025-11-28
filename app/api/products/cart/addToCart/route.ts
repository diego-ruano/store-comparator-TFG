import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
	try {
		// Comprobación de si el usuario está autenticado 
		let { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: "No autorizado" }, { status: 401 });
		}

		// Sacamos el id del producto en la request
		const body = await request.json();
		const { productId } = body;

		if (!productId) {
			return NextResponse.json({ error: "Falta el ID del producto" }, { status: 400 });
		}

		// Comprobación de si el usuario existe en la base de datos (para desarollo local, sin ngrok o similares no funcionan los webhooks)
		const userCheck = await db.execute({
			sql: "SELECT id FROM users WHERE id = ?",
			args: [userId]
		});

		if (userCheck.rows.length === 0) {
			console.log(`Usuario ${userId} no encontrado en BD. Creándolo automáticamente...`);

			await db.execute({
				sql: "INSERT INTO users (id, created_at) VALUES (?, ?)",
				args: [userId, new Date().toISOString()]
			});
		}

		// Comprobamos si hay un carrito a nombre del usuario
		const cartCheck = await db.execute({
			sql: "SELECT id FROM carts WHERE user_id = ? LIMIT 1",
			args: [userId]
		});

		let cartId;


		if (cartCheck.rows.length === 0) {
			// Crear carrito del usuario si no lo tenía
			const newCart = await db.execute({
				sql: "INSERT INTO carts (user_id, name) VALUES (?, ?) RETURNING id",
				args: [userId, "Carrito Principal"]
			});
			// En Turso/SQLite, si RETURNING no va, usa newCart.lastInsertRowid
			cartId = newCart.rows[0]?.id || newCart.lastInsertRowid;
		} else {
			// C) SÍ tiene carrito -> Usamos su ID
			cartId = cartCheck.rows[0].id;
		}

		// Comprobación de si el producto ya existe en el carrito
		const itemCheck = await db.execute({
			sql: "SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
			args: [cartId, productId]
		});

		// Si el producto está en el carrito sumamos 1 a la cantidad
		if (itemCheck.rows.length > 0) {
			// E) SÍ está -> Sumamos +1 a la cantidad
			const currentQty = Number(itemCheck.rows[0].quantity); // Asegurar que es número
			await db.execute({
				sql: "UPDATE cart_items SET quantity = ? WHERE id = ?",
				args: [currentQty + 1, itemCheck.rows[0].id]
			});
		} else {
			// Si el producto no está en el carrito lo guardamos y le ponemos cantidad 1
			await db.execute({
				sql: "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
				args: [cartId, productId, 1]
			});
		}

		return NextResponse.json({ success: true, message: "Producto añadido" });

	} catch (error) {
		console.error("Error añadiendo al carrito:", error);
		return NextResponse.json({ error: "Error interno" }, { status: 500 });
	}
}