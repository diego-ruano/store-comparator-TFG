import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("search");

  try {
    if (!searchTerm) {
      return NextResponse.json({ products: [] });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM products WHERE name LIKE ? LIMIT 10',
      args: [`%${searchTerm}%`]
    });

    return NextResponse.json({
      result: result.rows
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}
