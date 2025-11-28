import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<header className="w-full flex justify-between items-center px-4 pt-4 fixed top-0 z-50 bg-blue-200">
				<UserButton />
				<Link href="/dashboard/cart" className="flex items-center gap-1 rounded-2xl px-4 py-1 bg-white">
					<svg className="size-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
						<g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
						<g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
						<g id="SVGRepo_iconCarrier"> <path d="M6.29977 5H21L19 12H7.37671M20 16H8L6 3H3M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
						</g>
					</svg>
					Carrito
				</Link>
				<svg className="md:hidden cursor-pointer" id="menuIcon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M10 6h10"></path> <path d="M4 12h16"></path> <path d="M7 12h13"></path> <path d="M4 18h10"></path> </svg>
			</header>
			<main className="bg-blue-200 min-h-screen pt-24">
				{children}
			</main>
		</>
	);
}