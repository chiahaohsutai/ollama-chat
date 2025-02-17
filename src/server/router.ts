import ollama from "ollama";
import { z } from "zod";
import { ChatRequest } from "./schemas";
import { publicProcedure, router } from "./trpc";

type ChatRequest = z.infer<typeof ChatRequest>;

export const appRouter = router({
  getModels: publicProcedure.mutation(async () => await getModels()),
  chatCompletion: publicProcedure
    .input(ChatRequest)
    .mutation(async ({ input }) => await chatCompletion(input)),
});

export type AppRouter = typeof appRouter;

async function* chatCompletion(request: ChatRequest) {
  const { model, messages } = request;
  const response = await ollama.chat({ model, messages, stream: true });
  for await (const part of response) {
    yield part.message.content;
  }
}

async function getModels() {
  return await ollama.list();
}
