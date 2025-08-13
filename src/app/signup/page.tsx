import { Suspense } from "react";
import SignupClient from "./signup-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SignupClient />
    </Suspense>
  );
}