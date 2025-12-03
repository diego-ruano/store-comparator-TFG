'use client';

import { useState, useEffect } from "react";
import { Product, SortOrder } from "@/lib/types/types";


export default function Dashboard() {
	const [searchTerm, setSearchTerm] = useState('');
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	// Nuevo estado para el orden
	const [sortBy, setSortBy] = useState<SortOrder>(null);

	useEffect(() => {
		if (!searchTerm.trim()) {
			setProducts([]);
			return;
		}

		setIsLoading(true);

		const timeoutId = setTimeout(async () => {
			try {
				// Si tenemos parámetro para ordenar se añade sino nada
				const sortParam = sortBy ? `&sort=${sortBy}` : '';
				// Hacemos fetch a los productos y los guardamos en el estado
				const response = await fetch(`/api/products?search=${searchTerm}${sortParam}`);
				const data = await response.json();
				setProducts(data.products || []);
			} catch (error) {
				console.error("Error buscando productos:", error);
			} finally {
				setIsLoading(false);
			}
		}, 800);

		return () => clearTimeout(timeoutId);

	}, [searchTerm, sortBy]); // Añadimos sortBy a las dependencias para que refresque al cambiar

	// Función para ciclar el orden: Null -> Asc -> Desc -> Null
	const toggleSort = () => {
		if (sortBy === null) setSortBy('asc');
		else if (sortBy === 'asc') setSortBy('desc');
		else setSortBy(null);
	};

	async function handleAddButtonClick(idProduct: number) {
		const response = await fetch(`/api/products/cart/addToCart`, {
			method: "POST",
			body: JSON.stringify({ productId: idProduct }),
		});
		const data = await response.json();

		if (!response.ok) {
			console.error(data);
			alert("Error al añadir al carrito");
			return;
		}

		if (data.success) {
			alert("Producto añadido al carrito");
		}
	}

	return (
		<div className="max-w-5xl mx-auto">
			<header className="fixed top-12 left-0 right-0 z-40 bg-blue-200 py-4">
				<div className="max-w-5xl mx-auto px-3">
					<div className="flex items-center w-full md:w-auto justify-center gap-2">
						<div className="flex items-center px-4 py-2 w-96 bg-white rounded-2xl shadow-sm">
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
						<button
							onClick={toggleSort}
							className={`
                        flex items-center justify-center size-10 rounded-2xl shadow-sm transition-all border
                        ${sortBy ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-transparent hover:bg-gray-50'}
                     `}
							title="Ordenar por precio"
						>
							{sortBy === null && (
								<svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
									<line x1="4" x2="14" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="8" y1="18" y2="18" />
								</svg>
							)}
							{sortBy === 'asc' && (
								<div className="flex flex-col items-center text-[10px] leading-none font-bold">
									<span>-</span>
									<span>€</span>
								</div>
							)}
							{sortBy === 'desc' && (
								<div className="flex flex-col items-center text-[10px] leading-none font-bold">
									<span>+</span>
									<span>€</span>
								</div>
							)}
						</button>

					</div>
					{sortBy && (
						<div className="flex justify-center mt-2">
							<span className="text-xs font-medium text-blue-800 bg-blue-100 px-3 py-1 rounded-full">
								{sortBy === 'asc' ? 'Precio: Menor a Mayor' : 'Precio: Mayor a Menor'}
							</span>
						</div>
					)}
				</div>
			</header>

			<section className="w-full flex flex-col gap-4 mt-24 px-3 pb-20">
				{searchTerm && !isLoading && products.length === 0 && (
					<p className="text-center text-gray-500 mt-10">No se encontraron productos.</p>
				)}

				{products.map((product) => (
					<div key={product.id} className="w-full flex border border-gray-200 py-1.5 shadow-sm hover:shadow-md transition-shadow bg-white rounded-2xl">
						<div className="w-3/10 shrink-0 bg-white rounded-xl flex items-center justify-center p-1">
							{product.url_image ? (
								<img src={product.url_image} alt={product.name} className="w-full h-24 object-contain" />
							) : (
								<span className="text-2xl">📷</span>
							)}
						</div>

						<div className="flex flex-col justify-between px-2 py-1 gap-1 w-full">
							<div className="flex justify-between items-center">
								{product.retailer == 'Carrefour' ?
									(<span className="bg-carrefour text-white text-[10px] font-bold uppercase rounded-full px-2 py-0.5">{product.retailer}</span>
									) : (
										<span className="bg-mercadona text-white text-[10px] font-bold uppercase rounded-full px-2 py-0.5">{product.retailer}</span>
									)}

								<span className="text-lg font-bold text-gray-900">
									{product.price} €
								</span>
							</div>

							<h3 className="font-medium text-gray-800 text-sm line-clamp-2 mt-1 leading-tight">
								{product.name}
							</h3>

							<div className="mt-auto mr-auto pt-2 text-sm w-full flex justify-end">
								<button
									className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-gray-800 transition-colors"
									onClick={() => handleAddButtonClick(product.id)}
								>
									<svg className='size-3' viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
}