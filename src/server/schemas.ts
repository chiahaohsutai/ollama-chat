import { z } from "zod";

export const Message = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string(),
});

export const ChatRequest = z.object({
  model: z.string(),
  messages: z.array(Message),
});

export const PullRequest = z.object({
  model: z.string(),
});

export const DeleteRequest = z.object({
  model: z.string(),
});
