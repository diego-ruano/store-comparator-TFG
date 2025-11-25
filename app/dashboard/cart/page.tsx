'use client'

import React from 'react'
import Link from "next/link";
import { useState, useEffect } from "react";
import { CartItem } from "@/lib/types/types";

export default function CartPage() {

	const [cartItems, setCartItems] = useState<CartItem[]>([])

	useEffect(() => {
		const items = fetch(`/api/products/cart/getCart`)
		items.then(res => res.json()).then(data => {
			setCartItems(data.cartItems)
			console.log(data)
		})
	}, [])

	return (
		<>
			<article className='w-full flex flex-col gap-2 px-2'>
				<section className='mt-25'>
					<main className="w-full flex justify-center px-10">
						<Link href="/dashboard" className='border px-20 py-2 rounded-2xl'>Volver</Link>
					</main>
				</section>
				{cartItems.map((item) => {
					return (
						<section key={item.item_id} className='w-full flex flex-col items-center px-4 py-2 gap-2 border rounded-2xl'>
							<div className='flex space-between'>
								<img className='size-10' src={item.url_image} />
								<p className='text-center'>{item.name}</p>
							</div>
							<div className='w-full flex px-5'>
								<div className='w-full flex gap-4'>
									<p>{item.quantity}</p>
									<p>x</p>
									<p>{item.price}€</p>
									<p>=</p>
									<p>{item.quantity * item.price}€</p>
								</div>
								<button onClick={() => handleRemoveFromCart(item.item_id, setCartItems)} className='cursor-pointer'>❌</button>
							</div>
						</section>
					)
				})}
			</article >
		</>
	);
}

async function handleRemoveFromCart(itemId: number, setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>) {
	try {
		const response = await fetch('/api/products/cart/removeFromCart', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ itemId }),
		});

		if (!response.ok) {
			throw new Error('Error al eliminar del carrito');
		}

		const data = await response.json();

		if (data.success) {
			// Refrescar el carrito después de eliminar
			const cartResponse = await fetch('/api/products/cart/getCart');
			const cartData = await cartResponse.json();
			setCartItems(cartData.cartItems);
		}
	} catch (error) {
		console.error('Error:', error);
		alert('Error al eliminar el producto del carrito');
	}
}