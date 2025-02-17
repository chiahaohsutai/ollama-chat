"use client";

import { trpc } from "@/server/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { unstable_httpBatchStreamLink } from "@trpc/client";
import React, { useState } from "react";

export default function TrpcProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({}));
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        unstable_httpBatchStreamLink({
          url: "/api/trpc",
        }),
      ],
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
