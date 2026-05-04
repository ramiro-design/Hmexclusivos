import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
          Cargando...
        </main>
      }
    >
      <HomeClient />
    </Suspense>
  );
}