// Aquí va la landing page
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <>
      <h1 className="text-center text-3xl">
        Hello World
      </h1>
      <UserButton />
      <div className="flex flex-col items-center gap-6 p-10">
        <h1 className="text-3xl font-bold">Mi Aplicación</h1>
      </div>
    </>
  );
}
