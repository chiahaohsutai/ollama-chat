import ollama from "ollama";
import { z } from "zod";
import { ChatRequest, DeleteRequest, PullRequest } from "./schemas";
import { publicProcedure, router } from "./trpc";

type ChatRequest = z.infer<typeof ChatRequest>;
type PullRequest = z.infer<typeof PullRequest>;
type DeleteRequest = z.infer<typeof DeleteRequest>;

export const appRouter = router({
  getModels: publicProcedure.mutation(async () => await ollama.list()),
  pullModel: publicProcedure
    .input(PullRequest)
    .mutation(async ({ input }) => await ollama.pull({ model: input.model })),
  chatCompletion: publicProcedure
    .input(ChatRequest)
    .mutation(async ({ input }) => chatCompletion(input)),
  deleteModel: publicProcedure
    .input(DeleteRequest)
    .mutation(async ({ input }) => {
      await ollama.delete({ model: input.model });
    }),
});

export type AppRouter = typeof appRouter;

async function* chatCompletion(request: ChatRequest) {
  const { model, messages } = request;
  const response = await ollama.chat({ model, messages, stream: true });
  for await (const part of response) {
    yield part.message.content;
  }
}
