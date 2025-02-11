"use client";

import { Button, Flex } from "@chakra-ui/react";
import { trpc } from "@/server/client";
import { useState } from "react";

type TextStream = AsyncIterable<string, never, unknown>;

export default function Page() {
  const [lastestMessage, setLastestMessage] = useState<string>("");
  const [messages, setMessages] = useState<string[]>([]);
  const chatCompletion = trpc.chatCompletion.useMutation();

  const updateLatestMessage = async (msg: TextStream | undefined) => {
    if (!msg) return;
    setLastestMessage("");
    for await (const m of msg) {
      setLastestMessage((prev: string) => prev + m);
    }
    setMessages((prev) => [...prev, lastestMessage]);
  };

  const sendChat = async () => {
    const model = "qwen2.5:0.5b";
    const content = "Tell me about the Great Wall of China.";
    chatCompletion.mutate(
      { messages: [{ role: "user", content }], model },
      { onSettled: async (date) => updateLatestMessage(date) }
    );
  };

  return (
    <Flex>
      <Button onClick={sendChat}>Send Chat</Button>
      <Flex>{JSON.stringify(lastestMessage)}</Flex>
    </Flex>
  );
}
