import { Suspense } from "react";
import HomeContent from "./HomeContent";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}