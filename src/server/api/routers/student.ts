import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const studentRouter = createTRPCRouter({
  // Gets all examSessions for a student (past and current)
  // Once the sessionID's are known, we can post further queries to get any recordings related to those sessions.
  getStudentSessions: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const student = await ctx.prisma.student.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (!student) {
        throw new Error(`User with id ${input.userId} not found`);
      }

      // Fetch all exam sessions related to the user
      const examSessions = await ctx.prisma.examSession.findMany({
        where: {
          studentId: student.id,
        },
      });

      return {
        id: student.id,
        studentId: student.studentId,
        sessions: examSessions.flat(),
      };
    }),

  // Gets all notifications for a student by querying their examSessions
  // If an examSession has a notification, it means suspicious activity has been detected
  getStudentNotifications: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const student = await ctx.prisma.student.findUnique({
        where: {
          userId: input.userId,
        },
      });

      if (!student) {
        throw new Error(`User with id ${input.userId} not found`);
      }

      // Fetch all exam sessions related to the user
      const examSessions = await ctx.prisma.examSession.findMany({
        where: {
          studentId: student.id,
        },
      });

      // Fetch notifications for all exam sessions in parallel
      const sessionIds = examSessions.map((session) => session.sessionId);
      const notifications = await Promise.all(
        sessionIds.map(async (sessionId) => {
          return ctx.prisma.notification.findMany({
            where: {
              sessionId: sessionId,
            },
          });
        })
      );

      return {
        id: student.id,
        studentId: student.studentId,
        notifications: notifications.flat(), // Flatten the array of arrays
      };
    }),
});
