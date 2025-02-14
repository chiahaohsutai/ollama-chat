"use client";

import { Prose } from "@/components/ui/prose";
import { trpc } from "@/server/client";
import { Message } from "@/server/schemas";
import { Flex, For, IconButton, Text, Textarea } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaArrowUp } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { RxHamburgerMenu } from "react-icons/rx";
import Markdown from "react-markdown";
import { z } from "zod";

type Message = z.infer<typeof Message>;

const systemPrompt: Message = {
  role: "system",
  content: "Your a helpful assistant. Use markdown syntax.",
};
const model = "openchat";

export default function Page() {
  const messagesContainer = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatCompletion = trpc.chatCompletion.useMutation();

  const [stream, setStream] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");

  useEffect(() => {
    const container = messagesContainer.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [history]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "";
    textarea.style.height = Math.min(textarea.scrollHeight, 300) + "px";
  }, [input]);

  useEffect(() => {
    const currStream = stream;
    const last = history[history.length - 1];
    if (last?.role === "assistant") {
      const content = last.content + currStream;
      setHistory((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content },
      ]);
    } else {
      const msg: Message = { role: "assistant", content: currStream };
      setHistory((prev) => [...prev, msg]);
    }
  }, [stream]);

  async function sendChat() {
    if (!input || isGenerating) return;
    const userInput = Message.parse({ role: "user", content: input });
    const oldHistory = history;
    setInput("");
    setHistory((prev) => [...prev, userInput]);
    setIsGenerating(true);

    const messages = [systemPrompt, ...oldHistory, userInput];
    const variables = { model, messages };
    chatCompletion.mutate(variables, {
      onSuccess: async (data) => {
        for await (const part of data) {
          setStream(part);
        }
        setIsGenerating(false);
      },
    });
  }

  return (
    <Flex height="100svh" maxHeight="100svh" width="100%" fontSize="xl" px={6}>
      <Flex>
        <Flex></Flex>
      </Flex>
      <Flex
        flex={1}
        direction="column"
        gap={4}
        overflowY="auto"
        alignItems="center"
      >
        <Flex direction="column" height="100%" width="100%" overflow="auto">
          <Flex
            ref={messagesContainer}
            flexGrow={1}
            flexBasis={0}
            width="100%"
            direction="column"
            gap={4}
            overflow="auto"
            scrollbarColor="auto #27272a"
            alignItems="center"
          >
            <Flex
              bg="gray.800"
              py={4}
              top={0}
              position="sticky"
              justifyContent="space-between"
              width="100%"
              alignItems="center"
            >
              <Flex
                _hover={{ bg: "gray.600" }}
                cursor="pointer"
                borderRadius={8}
                color="gray.400"
              >
                <RxHamburgerMenu size={24} />
              </Flex>
              <Flex
                justifyContent="center"
                alignItems="center"
                cursor="default"
                borderRadius={8}
                color="gray.400"
              >
                <Text fontWeight="800" fontSize="2xl">
                  OpenGPT
                </Text>
              </Flex>
              <Flex
                _hover={{ bg: "gray.600" }}
                cursor="pointer"
                p={2}
                borderRadius={8}
                color="gray.400"
              >
                <FiEdit size={24} />
              </Flex>
            </Flex>
            <Flex width="100%" maxWidth="1000px" direction="column" gap={4}>
              <For each={history}>
                {(message, i) =>
                  message.role === "assistant" ? (
                    <Flex key={i} width="100%">
                      <Prose minWidth="100%" fontSize="lg" color="white">
                        <Markdown>{message.content}</Markdown>
                      </Prose>
                    </Flex>
                  ) : (
                    <Flex key={i} justifyContent="flex-end">
                      <Text
                        overflow="wrap"
                        bg={"gray.700"}
                        py={2}
                        px={4}
                        borderRadius={8}
                      >
                        {message.content}
                      </Text>
                    </Flex>
                  )
                }
              </For>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          width="100%"
          maxWidth="1000px"
          flex={1}
          direction="column"
          gap={4}
          position="sticky"
          bottom={0}
          flexBasis={0}
        >
          <Flex direction="column" gap={2} width="100%" alignItems="center">
            <Flex
              bg="gray.600"
              p={3}
              borderRadius={16}
              alignItems="center"
              width="100%"
            >
              <Flex width="100%">
                <Textarea
                  border={0}
                  fontSize="lg"
                  outline="none"
                  resize="none"
                  rows={1}
                  value={input}
                  placeholder="Message OpenGPT"
                  _placeholder={{ color: "gray.400" }}
                  onChange={(e) => setInput(e.target.value)}
                  ref={inputRef}
                />
              </Flex>
              <Flex>
                <IconButton
                  borderRadius="50%"
                  alignItems="center"
                  cursor="pointer"
                  onClick={sendChat}
                  loading={isGenerating}
                  bg={isGenerating ? "gray.500" : "white"}
                  _hover={{ bg: isGenerating ? "gray.500" : "gray.400" }}
                >
                  <FaArrowUp size={16} color="black" />
                </IconButton>
              </Flex>
            </Flex>
            <Flex
              fontSize="sm"
              color="gray.200"
              justifyContent="center"
              pb={2}
              pt={2}
            >
              <Text>OpenGPT can make mistakes. Check important info.</Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
