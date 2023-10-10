import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

function generateUniqueCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

export const sessionRouter = createTRPCRouter({
  createSession: publicProcedure
    .input(z.object({ examinerEmail: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.examinerEmail,
        },
      });

      if (!user) {
        throw new Error(`User with email ${input.examinerEmail} not found`);
      }

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

      const examiner = await ctx.prisma.examiner.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!examiner) {
        throw new Error(`Examiner with userId ${user.id} not found`);
      }

      const createdSession = await ctx.prisma.createdSession.create({
        data: {
          uniqueCode,
          examinerId: examiner.id, // The session is created with the examinerId associated.
        },
      });

      console.log("Session created with code: ", createdSession.uniqueCode);
      return { uniqueCode: createdSession.uniqueCode };
    }),

  endSession: publicProcedure
    .input(z.object({ uniqueCode: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.prisma.createdSession.update({
        where: {
          uniqueCode: Number(input.uniqueCode),
        },
        data: {
          valid: false,
        },
      });

      console.log("Session invalidated");
      return session;
  }),

  getSessions: publicProcedure
    .query(async ({ input, ctx }) => {
      const sessions = await ctx.prisma.createdSession.findMany();
      sessions.forEach((session) => {
        console.log(session);
      });
      return sessions;
    }),
});
