import { createTRPCRouter } from "~/server/api/trpc";
import { studentRouter } from "./routers/student";
import { accountRouter } from "./routers/account";
import { userRouter } from "./routers/user";
import { sessionRouter } from "./routers/session";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  users: userRouter,
  students: studentRouter,
  accounts: accountRouter,
  sessions: sessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
