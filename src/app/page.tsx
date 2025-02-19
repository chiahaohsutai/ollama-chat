"use client";

import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog";
import { Prose } from "@/components/ui/prose";
import { trpc } from "@/server/client";
import { Message } from "@/server/schemas";
import {
  Button,
  Flex,
  For,
  IconButton,
  Input,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaArrowUp, FaPlus } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { RxHamburgerMenu } from "react-icons/rx";
import Markdown from "react-markdown";
import { z } from "zod";

type Message = z.infer<typeof Message>;

const systemPrompt: Message = {
  role: "system",
  content: "Your a helpful assistant.",
};

export default function Page() {
  const messagesContainer = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatCompletion = trpc.chatCompletion.useMutation();
  const getModels = trpc.getModels.useMutation();

  const [stream, setStream] = useState<string>("");
  const [currModel, setCurrModel] = useState<string>("");
  const [hideSidebar, setHideSidebar] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [openAddDialog, setOpenAddDialog] = useState(false);

  useEffect(() => {
    getModels.mutate(undefined, {
      onSuccess: (data: { models: { model: string }[] }) => {
        setCurrModel(data.models[0].model);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  async function sendChat() {
    if (!input || isGenerating) return;
    const userInput = Message.parse({ role: "user", content: input });
    const oldHistory = history;
    setInput("");
    setHistory((prev) => [...prev, userInput]);
    setIsGenerating(true);

    const messages = [systemPrompt, ...oldHistory, userInput];
    const variables = { model: currModel, messages };
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
    <Flex height="100svh" maxHeight="100svh" width="100%" fontSize="xl">
      <DialogRoot
        open={openAddDialog}
        onOpenChange={(e) => setOpenAddDialog(e.open)}
      >
        <DialogContent bg="rgb(24, 25, 26)">
          <DialogHeader>
            <DialogTitle>Add a new model</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Input placeholder="ex. deepseek-r1" />
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button>Add</Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
      <Flex
        overflow="hidden"
        width={hideSidebar ? "0px" : "300px"}
        bg="rgb(24, 25, 26)"
        fontSize="lg"
        transition="width 0.8s ease"
      >
        <Flex direction="column" minWidth="300px" p={4} overflowY="auto">
          <Flex direction="column" gap={1}>
            <Flex alignItems="center" justifyContent="space-between">
              <Text fontSize="xl" fontWeight="800" px={3} py={2}>
                Models
              </Text>
              <IconButton
                bg="rgb(24, 25, 26)"
                color="white"
                size="2xs"
                _hover={{ bg: "gray.700" }}
                onClick={() => setOpenAddDialog(true)}
              >
                <FaPlus />
              </IconButton>
            </Flex>
            <Flex direction="column">
              <For each={getModels.data?.models.map((m) => m.model)}>
                {(model, i) => (
                  <Flex
                    key={i}
                    borderRadius={8}
                    px={3}
                    py={2}
                    cursor="pointer"
                    bg={currModel === model ? "gray.700" : "inherit"}
                    _hover={{
                      bg: currModel === model ? "gray.700" : "gray.800",
                    }}
                    onClick={() => setCurrModel(model)}
                  >
                    <Text>{model}</Text>
                  </Flex>
                )}
              </For>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Flex
        flex={1}
        direction="column"
        gap={4}
        overflowY="auto"
        alignItems="center"
        px={6}
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
                onClick={() => setHideSidebar(!hideSidebar)}
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
                  OllamaChat
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
                  placeholder="Message Ollama"
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
                  disabled={getModels.isPending}
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
              <Text>LLMs can make mistakes. Check important info.</Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
