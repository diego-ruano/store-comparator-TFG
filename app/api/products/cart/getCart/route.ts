import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { CartItem } from "@/lib/types/types";

export async function GET() {
	const user = await auth();
	if (!user.userId) {
		return user.redirectToSignIn();
	}

	// ID PARA LAS PRUEBAS, HAY QUE ELIMINARLO CUANDO ESTÉS EN PRODUCCIÓN
	user.userId = 'user_2g7np7Hrk0SN6kj5EDMLDaKNL0S'
	const cartItems = await getCartItems(user.userId);
	return NextResponse.json({ cartItems });
}
async function getCartItems(userId: string): Promise<CartItem[]> {
	const restult = await db.execute({
		sql: `
      SELECT 
        cart_items.id AS item_id,
        cart_items.quantity,
        products.id AS product_id,
        products.name,
        products.price,
        products.url_image,
        products.retailer
      FROM carts
      JOIN cart_items ON carts.id = cart_items.cart_id
      JOIN products ON cart_items.product_id = products.id
      WHERE carts.user_id = ?
    `,
		args: [userId]
	});

	return restult.rows as unknown as CartItem[];
}