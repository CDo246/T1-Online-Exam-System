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
});
