"use client"

import { Flex } from "@chakra-ui/react";
import { trpc } from "@/utils/trpc";

export default function Home() {
  const { data } = trpc.health.useQuery();

  return <Flex>{data}</Flex>;
}
