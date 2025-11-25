import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<header className="w-full flex justify-between items-center p-4 border-b border-gray-200 fixed top-0 z-50 bg-white">
				<UserButton />
				<Link href="/dashboard/cart" className="flex items-center gap-1 border-2 rounded-2xl px-2 py-1">
					<svg className="size-8" xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
						<path opacity="0.5" d="M7.5 18C8.32843 18 9 18.6716 9 19.5C9 20.3284 8.32843 21 7.5 21C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18Z" stroke="#1C274C" strokeWidth="1.5" />
						<path opacity="0.5" d="M16.5 18.0001C17.3284 18.0001 18 18.6716 18 19.5001C18 20.3285 17.3284 21.0001 16.5 21.0001C15.6716 21.0001 15 20.3285 15 19.5001C15 18.6716 15.6716 18.0001 16.5 18.0001Z" stroke="#1C274C" strokeWidth="1.5" />
						<path opacity="0.5" d="M9.5 9L10.0282 12.1179" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
						<path opacity="0.5" d="M15.5283 9L15.0001 12.1179" stroke="#1C274C" strokeWidth="1.5" strokeLinecap="round" />
					</svg>
					Carrito
				</Link>
				<svg className="md:hidden cursor-pointer" id="menuIcon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#023c72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M10 6h10"></path> <path d="M4 12h16"></path> <path d="M7 12h13"></path> <path d="M4 18h10"></path> </svg>
			</header>
			<main>{children}</main>
		</>
	);
}