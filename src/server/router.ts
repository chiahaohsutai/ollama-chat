import { z } from "zod";
import ollama from "ollama";
import { router } from "./trpc";
import { ChatRequest } from "./schemas";
import { publicProcedure } from "./trpc";

export const appRouter = router({
  health: publicProcedure.query(async () => "ok"),
  chatCompletion: publicProcedure
    .input(ChatRequest)
    .mutation(async ({ input }) => await chatCompletion(input)),
});

export type AppRouter = typeof appRouter;

async function* chatCompletion(request: z.infer<typeof ChatRequest>) {
  const { model, messages } = request;
  const response = await ollama.chat({ model, messages, stream: true });
  for await (const part of response) {
    yield part.message.content;
  }
}
