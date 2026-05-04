import { Suspense } from "react";
import HomeContent from "./HomeContent";

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}