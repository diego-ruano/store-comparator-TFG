import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
	return (
		<>
			<main className="grid place-items-center h-screen bg-blue-50">
				<SignIn />
			</main>
		</>
	);
};