import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  // Comprobación de seguridad
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Leer parámetros de la URL
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("search");
  const sort = searchParams.get("sort")

  // Comprobación de que tenemos los parámetros que nos hacen falta
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json({ products: [] });
    }

    // Preparación de variables para introducir en la consulta
    const likeTerm = `%${searchTerm}%`;
    const startTerm = `${searchTerm}%`;
    let result;

    // Lógica para aplicar el orden que se obtiene en la consulta a la DB
    let orderByClause = "";
    if (sort === 'asc') {
      orderByClause = "price ASC";
    } else if (sort === 'desc') {
      orderByClause = "price DESC";
    } else {
      orderByClause = `CASE WHEN name LIKE '${startTerm}' THEN 0 ELSE 1 END ASC, price ASC`;
    }

    result = await db.execute({
      sql: `
        WITH RankedProducts AS (
          SELECT 
            *,
            ROW_NUMBER() OVER (
              PARTITION BY retailer 
              ORDER BY ${orderByClause}
            ) as retailer_rank
          FROM products
          WHERE name LIKE ? AND price IS NOT NULL
        )
        SELECT * FROM RankedProducts
        ORDER BY retailer_rank ASC, ${sort === 'desc' ? 'price DESC' : 'price ASC'}
        LIMIT 20;
      `,

      args: [likeTerm]
    });

    // Devolver los resultados de la consulta
    return NextResponse.json({
      products: result.rows,
    });

  } catch (error) {
    console.error("Error en búsqueda de productos:", error);
    return NextResponse.json(
      { error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}