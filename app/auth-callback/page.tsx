"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { trpc } from "../_trpc/client";
import { Suspense } from "react";

const AuthCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, isLoading, error } = trpc.authCallback.useQuery();

  // Handle success logic when data is returned
  if (data?.success) {
    router.push(origin ? `/${origin}` : "/dashboard");
  }

  // Handle error logic
  if (error?.data?.code === "UNAUTHORIZED") {
    router.push("/sign-in");
  }

  if (isLoading) {
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
          <h3 className="font-semibold text-xl">Setting up your account...</h3>
          <p>You will be redirected automatically.</p>
        </div>
      </div>
    );
  }

  return null; // Return null if no loading or redirecting logic is active
};

const Page = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AuthCallbackPage />
  </Suspense>
);

export default Page;
