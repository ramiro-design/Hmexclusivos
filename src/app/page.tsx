import { Suspense } from "react";
import HomeClient from "./HomeClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
          Cargando...
        </main>
      }
    >
      <HomeClient />
    </Suspense>
  );
}