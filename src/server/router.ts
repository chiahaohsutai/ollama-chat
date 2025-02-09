import { router } from "./trpc";
import { publicProcedure } from "./trpc";

export const appRouter = router({
    health: publicProcedure.query(async () => "ok"),
    chatCompletion: publicProcedure.mutation(async () => "ok"),
});

export type AppRouter = typeof appRouter;
