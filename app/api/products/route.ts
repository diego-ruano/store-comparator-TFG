import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  // Comprobación de si el usuario está autenticado
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Recuperamos los parámetros de la url que necesitemos
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("search");

  // Comprobamos si el término de búsqueda es válido
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({ products: [] });
    }

    // Buscamos los productos que coincidan con el término de búsqueda
    const result = await db.execute({
      sql: "SELECT * FROM products WHERE name LIKE ? LIMIT 10",
      args: [`%${searchTerm}%`],
    });

    // Devolvemos los productos encontrados
    return NextResponse.json({
      products: result.rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}