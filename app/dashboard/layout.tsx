'use client'

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const menuItems = [
		{ name: "🏠 Inicio", href: "/dashboard" },
		{ name: "🛒 Carrito", href: "/dashboard/cart" },
		{ name: "⚙️ Configuración", href: "/dashboard/#" },
		{ name: "❓ Ayuda", href: "/dashboard/#" },
	];

	return (
		<>
			<header className="w-full flex justify-between items-center px-4 pt-4 fixed top-0 z-50 bg-blue-200 pb-2">
				<UserButton />
				<Link href="/dashboard/cart" className="flex items-center gap-1 rounded-2xl px-4 py-1 bg-white hover:bg-gray-50 transition-colors shadow-sm">
					<svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
					</svg>
					<span className="font-medium">Carrito</span>
				</Link>
				<button
					onClick={() => setIsMenuOpen(true)}
					className="md:hidden cursor-pointer p-1 active:scale-95 transition-transform"
				>
					<svg id="menuIcon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M10 6h10"></path> <path d="M4 12h16"></path> <path d="M7 12h13"></path> <path d="M4 18h10"></path>
					</svg>
				</button>
			</header>

			{isMenuOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-60 backdrop-blur-sm transition-opacity md:hidden"
					onClick={() => setIsMenuOpen(false)}
				/>
			)}
			<aside
				className={`
               fixed top-0 right-0 h-full w-64 bg-white z-70 shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col
               ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}
			>
				<div className="flex justify-between items-center p-5 border-b bg-blue-50">
					<h2 className="font-bold text-lg text-blue-900">Menú</h2>
					<button
						onClick={() => setIsMenuOpen(false)}
						className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
					>
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto py-4">
					<ul className="flex flex-col gap-1 px-3">
						{menuItems.map((item) => (
							<li key={item.name}>
								<Link
									href={item.href}
									className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-colors font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									{item.name}
								</Link>
							</li>
						))}
					</ul>
				</nav>

				<div className="p-4 border-t bg-gray-50 text-center text-xs text-gray-400">
					Mi App v1.0
				</div>
			</aside>

			<main className="bg-blue-200 min-h-screen pt-20">
				{children}
			</main>
		</>
	);
}