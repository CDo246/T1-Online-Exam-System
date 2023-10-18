import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const examSessionRouter = createTRPCRouter({
  createExamSession: publicProcedure
    .input(z.object({ uniqueCode: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const userEmail = ctx.session?.user.email;

      if (!userEmail) {
        throw new Error(`User email not found from session [big error, fix]`);
      }

      // Get the user from the session email
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: userEmail,
        },
      });

      if (!user) {
        throw new Error(`User not found from email`);
      }

      // Get the student from the userId
      const student = await ctx.prisma.student.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!student) {
        throw new Error(
          `Student not found from userID [perhaps issue with account creation?]`
        );
      }

      console.log("User is", user.id);

      // Get the createdSession from the uniqueCode
      const createdSession = await ctx.prisma.createdSession.findUnique({
        where: {
          uniqueCode: input.uniqueCode,
        },
      });

      if (!createdSession) {
        throw new Error(`Session with code ${input.uniqueCode} not found`);
      }

      // Get the examinerId from the createdSession
      const examiner = await ctx.prisma.examiner.findUnique({
        where: {
          id: createdSession.examinerId,
        },
      });

      if (!examiner) {
        throw new Error(
          `Examiner with examinerId ${createdSession.examinerId} not found`
        );
      }

      // Check if an ExamSession instance already exists for this createdSession and student (we only want 1 instance max)
      const existingExamSessions = await ctx.prisma.examSession.findMany({
        where: {
          uniqueCode: input.uniqueCode,
          studentId: student.id
        },
      });
      
      if (existingExamSessions.length > 0) {
        console.log("Re-entering existing exam session", existingExamSessions[0])
      
        // Delete any other instances (incase any exist)
        for (let i = 1; i < existingExamSessions.length; i++) {
          const examSession = existingExamSessions[i];
          if (examSession) {
            await ctx.prisma.examSession.delete({
              where: {
                sessionId: examSession.sessionId
              }
            });
          }
        }
        return { existingExamSession: existingExamSessions[0] }; // Return only the first session
      }

      // Create new ExamSession instance
      const examSession = await ctx.prisma.examSession.create({
        data: {
          seatNumber: "NA",
          startTime: new Date(),
          studentId: student.id,
          examinerId: examiner.id,
          uniqueCode: createdSession.uniqueCode,
        },
      });

      console.log(
        "ExamSession created: ",
        student.id,
        examiner.id,
        createdSession.uniqueCode
      );
      return { examSession };
    }),

  getExamSessionsByCode: publicProcedure
    .input(z.object({ uniqueCode: z.number() }))
    .query(async ({ input, ctx }) => {
      const examSessions = await ctx.prisma.examSession.findMany({
        where: { uniqueCode: input.uniqueCode },
      });

      const modifiedExamSessions = await Promise.all(
        examSessions.map(async (examSession) => {
          const student = await ctx.prisma.student.findUnique({
            where: { id: examSession.studentId },
          });

          if (!student) {
            throw new Error("Student not found");
          }

          const user = await ctx.prisma.user.findUnique({
            where: { id: student.userId ?? undefined },
          });

          if (!user) {
            throw new Error("User not found");
          }

          return {
            ...examSession,
            sID: student.studentId,
            image: student.imageBase64,
            name: user.name,
          };
        })
      );

      return { examSessions: modifiedExamSessions };
    }),

  passAICheck: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      console.log(input.sessionId);
      console.log("\n\n\n\n\n\n");
      const examSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          deskAIApproved: true,
        },
      });
      console.log(examSession);
    }),

  addDeskImage: publicProcedure
    .input(z.object({ sessionId: z.string(), deskImage: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const examSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          deskImage: input.deskImage ?? "",
        },
      });
      console.log(examSession);
    }),

  removeDeskImage: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const examSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          deskImage: null,
        },
      });
      console.log(examSession);
    }),

  approveDeskImage: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const examSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          deskManuallyApproved: true,
        },
      });
      console.log(examSession);
    }),

  addLiveFeedImage: publicProcedure
    .input(z.object({ sessionId: z.string(), image: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const examSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          liveFeedImage: input.image ?? "",
        },
      });
      console.log(examSession);
    }),
});
