import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  // Gets the role of a user
  getUserRole: publicProcedure
    .input(z.object({ userEmail: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.userEmail,
        },
      });

      if (!user) {
        throw new Error(`User with email ${input.userEmail} not found`);
      }

      return {
        role: user.role,
      };
    }),
});
