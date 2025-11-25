import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
	const { userId } = await auth();
	if (!userId) {
		return NextResponse.json({ error: "No autorizado" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { itemId } = body;

		if (!itemId) {
			return NextResponse.json({ error: "Falta el ID del producto" }, { status: 400 });
		}

		// Verificar si el item existe en el carrito
		const result = await db.execute({
			sql: "SELECT quantity FROM cart_items WHERE id = ?",
			args: [itemId],
		});

		if (!result.rows || result.rows.length === 0) {
			return NextResponse.json({ error: "Item no encontrado en el carrito" }, { status: 404 });
		}

		const currentQuantity = Number(result.rows[0].quantity);

		// ELIMINAR NO FUNCIONA DE MOMENTO

		if (currentQuantity > 1) {
			// Si hay más de 1, reducir la cantidad
			await db.execute({
				sql: "UPDATE cart_items SET quantity = quantity - 1 WHERE id = ?",
				args: [itemId],
			});
		} else {
			// Si solo hay 1, eliminar el item completamente
			await db.execute({
				sql: "DELETE FROM cart_items WHERE id = ?",
				args: [itemId],
			});
		}

		return NextResponse.json({ success: true, message: "Producto actualizado" });

	} catch (error) {
		console.error("Error eliminando del carrito:", error);
		return NextResponse.json({ error: "Error interno" }, { status: 500 });
	}
}