import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const studentRouter = createTRPCRouter({
  // Gets the basic details for a student based on their userId
  getStudentDetails: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      if (!user) {
        throw new Error(`User with id ${input.userId} not found`);
      }

      // Fetch the student with this userId
      const student = await ctx.prisma.student.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!student) {
        throw new Error(`Student with id ${input.userId} not found (this should never be thrown)`);
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: student.studentId
      };
    }),


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

  createNotification: publicProcedure
  .input(z.object({ sessionId: z.number() }))
  .query(async ({ input, ctx }) => {
    const session = await ctx.prisma.examSession.findUnique({
      where: {
        sessionId: input.sessionId,
      },
    });

    if (!session) {
      throw new Error(`Session with id ${input.sessionId} not found`);
    }

    const student = await studentRouter.createCaller(ctx).getStudentDetails({ userId: String(session.studentId)})

    // Create new notification relating to session
    const notification = await ctx.prisma.notification.create({
      data: {
        content: `[Suspicious activity flagged] SID: ${session.studentId} Name: ${student.name}`,
        sessionId: session.sessionId
      },
    });
  }),

  // Flag the session if suspicious activity has been found
  // Create a notification relating to the session, store in DB
  flagStudentSession: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input, ctx }) => {
      const session = await ctx.prisma.examSession.findUnique({
        where: {
          sessionId: input.sessionId,
        },
      });

      if (!session) {
        throw new Error(`Session with id ${input.sessionId} not found`);
      }

      // Update the session to set suspiciousActivity to true
      const updatedSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          suspiciousActivity: true,
        },
      });

      // Create new notification
      await studentRouter.createCaller(ctx).createNotification({ sessionId: session.sessionId})

      // Ideally, we want the notifications to act like real-time events, so we will need to implement a design pattern with the teacher/admin API to check for any newly created
      // notifications associated to any sessions they are overwatching.
    }),
  
  

});
