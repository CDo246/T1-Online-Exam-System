import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { generateUniqueCode } from "~/utils/ids";

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
        uniqueCode = generateUniqueCode(6);
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
          uniqueCode: input.uniqueCode,
        },
        data: {
          valid: false,
        },
      });

      // End all associated examSessions
      await ctx.prisma.examSession.updateMany({
        where: {
          uniqueCode: input.uniqueCode,
        },
        data: {
          endTime: new Date(), // setting endTime to the current date and time
        },
      });

      console.log("Session invalidated and associated examSessions ended");
      return session;
    }),

  getStudentSession: publicProcedure
    .input(z.object({ uniqueCode: z.string(), studentId: z.string() }))
    .query(async ({ input, ctx }) => {
      const examSession = await ctx.prisma.examSession.findFirst({
        where: {
          uniqueCode: input.uniqueCode,
          studentId: input.studentId,
        },
      });
      return examSession;
    }),

  getSessions: publicProcedure.query(async ({ input, ctx }) => {
    const sessions = await ctx.prisma.createdSession.findMany();
    sessions.forEach((session) => {
      console.log(session);
    });
    return sessions;
  }),

  isSessionValid: publicProcedure
    .input(z.object({ uniqueCode: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const validSession = await ctx.prisma.createdSession.findUnique({
        where: {
          uniqueCode: input.uniqueCode,
          valid: true,
        },
      });
      return validSession != null;
    }),
});
