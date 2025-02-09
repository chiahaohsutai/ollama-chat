"use client"

import { Flex } from "@chakra-ui/react";
import { trpc } from "@/server/client";

export default function Home() {
  const { data } = trpc.health.useQuery();

  return <Flex>{data}</Flex>;
}
