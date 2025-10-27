import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("search");

  try {
    if (!searchTerm) {
      return NextResponse.json({ products: [] });
    }

    const result = await prisma.products.findMany({
      where: {
        name: {
          contains: searchTerm,
        },
      },
      take: 10
    });

    return NextResponse.json({
      result
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener los productos" },
      { status: 500 }
    );
  }
}
