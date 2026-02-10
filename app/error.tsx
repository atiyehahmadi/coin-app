"use client";

import { CoinOverviewFallback } from "@/components/home/fallback";


export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  console.error(error);

  return <CoinOverviewFallback />;
}
