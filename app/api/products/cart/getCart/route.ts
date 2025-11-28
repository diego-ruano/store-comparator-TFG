import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { CartItem } from "@/lib/types/types";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cartItems = await getCartItems(userId);
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