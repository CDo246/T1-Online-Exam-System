import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

// Function to generate a random 6-digit integer code
function generateUniqueCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const sessionRouter = createTRPCRouter({
  // Generates a new session for an examiner
  createSession: publicProcedure
    .input(z.object({ examinerEmail: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.examinerEmail,
        },
      });

      if (!user) {
        throw new Error(`User with email ${input.examinerEmail} not found`);
      }

      // Generate a unique code
      let uniqueCode;
      do {
        uniqueCode = generateUniqueCode();
      } while (
        await ctx.prisma.createdSession.findUnique({
          where: {
            uniqueCode,
          },
        })
      );

      // Get the examiner from the user
      const examiner = await ctx.prisma.examiner.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!examiner) {
        throw new Error(`Examiner with id ${user.id} not found`);
      }

      // Create the session with the unique code
      const createdSession = await ctx.prisma.createdSession.create({
        data: {
          uniqueCode,
          examinerId: examiner.id,
        },
      });

      console.log("Session created with code: ", createdSession.uniqueCode);
      return { uniqueCode: createdSession.uniqueCode };
    }),
});
