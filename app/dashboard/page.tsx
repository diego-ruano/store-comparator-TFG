'use client';

import { useState, useEffect } from "react";
import { Product } from "@/lib/types/types";


export default function Dashboard() {
	const [searchTerm, setSearchTerm] = useState('');
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (!searchTerm.trim()) {
			setProducts([]);
			return;
		}

		setIsLoading(true);

		const timeoutId = setTimeout(async () => {
			try {
				const response = await fetch(`/api/products?search=${searchTerm}`);
				const data = await response.json();
				setProducts(data.products);
			} catch (error) {
				console.error("Error buscando productos:", error);
			} finally {
				setIsLoading(false);
			}
		}, 800);

		return () => clearTimeout(timeoutId);

	}, [searchTerm]);

	return (
		<div className="max-w-5xl mx-auto">
			<header className="fixed top-12 left-0 right-0 z-40 bg-blue-200 py-4">
				<div className="max-w-5xl mx-auto px-3">
					<div className="flex items-center w-full md:w-auto justify-center">
						<div className="flex items-center px-4 py-2 w-full md:w-96 bg-white">
							<input
								type="text"
								placeholder="Buscar productos..."
								className="w-full outline-none bg-white"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							{isLoading ? (
								<span className="animate-spin">⏳</span>
							) : (
								<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<path d="M16.32 14.9l5.39 5.4a1 1 0 0 1-1.42 1.4l-5.38-5.38a8 8 0 1 1 1.41-1.41zM10 16a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"></path>
								</svg>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Contenido debajo del buscador fijo */}
			<section className="w-full flex flex-col gap-4 mt-6">
				{searchTerm && !isLoading && products.length === 0 && (
					<p className="text-center text-gray-500">No se encontraron productos.</p>
				)}

				{products.map((product) => (
					<div key={product.id} className="w-full flex border border-gray-200 py-1.5 shadow-sm hover:shadow-md transition-shadow bg-white">
						<div className="w-3/10 shrink-0 bg-white rounded-xl">
							{product.url_image ? (
								<img src={product.url_image} alt={product.name} className="w-full h-full object-contain" />
							) : (
								<span className="text-2xl">📷</span>
							)}
						</div>

						<div className="flex flex-col justify-between px-2 py-1 gap-1">
							<div className="flex justify-between items-center">
								<span className="bg-blue-600 text-white text-xs font-bold uppercase rounded-full px-3 py-1">
									{product.retailer}
								</span>
								<span className="text-lg font-bold text-gray-900">
									{product.price} €
								</span>
							</div>

							<h3 className="font-medium text-gray-800 line-clamp-2 mt-2">
								{product.name}
							</h3>

							<div className="mt-auto mr-auto pt-2 text-sm">
								<button
									className="px-3 py-1 bg-black text-white rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors"
									onClick={() => handleAddButtonClick(product.id)}
								>
									<svg className='size-4' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
										<circle cx="9" cy="21" r="1"></circle>
										<circle cx="20" cy="21" r="1"></circle>
										<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
									</svg>
									Añadir
								</button>
							</div>
						</div>
					</div>
				))}
			</section>
		</div>
	);

	async function handleAddButtonClick(idProduct: number) {
		const response = await fetch(`/api/products/cart/addToCart`, {
			method: "POST",
			body: JSON.stringify({ productId: idProduct }),
		});
		const data = await response.json();

		if (!response.ok) {
			console.error(data);
			throw new Error("Error al añadir al carrito");
		}

		if (data.success) {
			alert("Producto añadido al carrito");
		}
	}
}
