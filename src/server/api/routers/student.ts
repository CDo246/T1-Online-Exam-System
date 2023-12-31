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
        throw new Error(
          `Student with id ${input.userId} not found (this should never be thrown)`
        );
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: student.studentId,
      };
    }),

  getStudentDetailsByEmail: publicProcedure
    .input(z.object({ email: z.string() }))
    .query(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: input.email,
        },
      });

      if (!user) {
        throw new Error(`User with email ${input.email} not found`);
      }

      // Fetch the student with this userId
      const student = await ctx.prisma.student.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!student) {
        throw new Error(
          `Student with id ${input.email} not found (this should never be thrown)`
        );
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: student.studentId,
      };
    }),

  getStudentSession: publicProcedure
    .input(z.object({ email: z.string(), uniqueCode: z.string() }))
    .query(async ({ input, ctx }) => {
      console.log("\n\n\n GETTING STUDENT SESSIOn");
      const user = await ctx.prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });

      if (!user) {
        throw new Error(`User with email ${input.email} not found`);
      }

      const student = await ctx.prisma.student.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!student?.studentId) {
        throw new Error(`Student with id ${input.email} not found`);
      }

      // Fetch the student with this userId
      console.log(student.userId);
      console.log(input.uniqueCode);
      const session = await ctx.prisma.examSession.findFirst({
        where: {
          AND: [
            {
              studentId: student.id ?? "",
              uniqueCode: input.uniqueCode,
            },
          ],
        },
      });

      if (!session) {
        throw new Error(`No session found`);
      }

      console.log("Session Found:");
      console.log(session);
      return session;
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
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input, ctx }) => {
      const session = await ctx.prisma.examSession.findUnique({
        where: {
          sessionId: input.sessionId,
        },
      });

      if (!session) {
        throw new Error(`Session with id ${input.sessionId} not found`);
      }

      const student = await ctx.prisma.student.findUnique({
        where: {
          id: session.studentId,
        },
      });

      if (!student) {
        throw new Error(`Student with id ${session.studentId} not found`);
      }

      const user = await ctx.prisma.user.findUnique({
        where: {
          id: student.userId ?? undefined,
        },
      });

      if (!user) {
        throw new Error(`User with id ${student.userId} not found`);
      }

      // Create new notification relating to session
      const notification = await ctx.prisma.notification.create({
        data: {
          content: `[Suspicious activity flagged] studentId: ${session.studentId} Name: ${user.name}`,
          sessionId: session.sessionId,
        },
      });

      return notification;
    }),

  // Flag the session if suspicious activity has been found
  // Create a notification relating to the session, store in DB
  flagStudentSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
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
      await studentRouter
        .createCaller(ctx)
        .createNotification({ sessionId: session.sessionId });

      // Ideally, we want the notifications to act like real-time events, so we will need to implement a design pattern with the teacher/admin API to check for any newly created
      // notifications associated to any sessions they are overwatching.
      return updatedSession;
    }),

  unflagStudentSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.prisma.examSession.findUnique({
        where: {
          sessionId: input.sessionId,
        },
      });

      if (!session) {
        throw new Error(`Session with id ${input.sessionId} not found`);
      }

      // If session's suspiciousActivity is already false, you might want to handle it (optional)
      if (!session.suspiciousActivity) {
        throw new Error(`Session with id ${input.sessionId} is not flagged`);
      }

      // Update the session to set suspiciousActivity to false
      const updatedSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          suspiciousActivity: false,
        },
      });

      await ctx.prisma.notification.deleteMany({
        where: {
          sessionId: input.sessionId,
        },
      });

      return updatedSession;
    }),

  failStudentSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.prisma.examSession.findUnique({
        where: {
          sessionId: input.sessionId,
        },
      });

      if (!session) {
        throw new Error(`Session with id ${input.sessionId} not found`);
      }

      // If session's suspiciousActivity is already false, you might want to handle it (optional)
      if (session.manuallyFailed) {
        throw new Error(`Session with id ${input.sessionId} is already failed`);
      }

      // Update the session to set suspiciousActivity to false
      const updatedSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          manuallyFailed: true,
        },
      });
      return updatedSession;
    }),

  unfailStudentSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.prisma.examSession.findUnique({
        where: {
          sessionId: input.sessionId,
        },
      });

      if (!session) {
        throw new Error(`Session with id ${input.sessionId} not found`);
      }

      // If session's suspiciousActivity is already false, you might want to handle it (optional)
      if (!session.manuallyFailed) {
        throw new Error(`Session with id ${input.sessionId} is not failed`);
      }

      // Update the session to set suspiciousActivity to false
      const updatedSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          manuallyFailed: false,
        },
      });
      return updatedSession;
    }),

  setStrikes: publicProcedure
    .input(z.object({ sessionId: z.string(), strikes: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const session = await ctx.prisma.examSession.findUnique({
        where: {
          sessionId: input.sessionId,
        },
      });

      if (!session) {
        throw new Error(`Session with id ${input.sessionId} not found`);
      }

      // Update the session to set suspiciousActivity to false
      const updatedSession = await ctx.prisma.examSession.update({
        where: {
          sessionId: input.sessionId,
        },
        data: {
          strikes: input.strikes,
        },
      });

      await ctx.prisma.notification.deleteMany({
        where: {
          sessionId: input.sessionId,
        },
      });

      return updatedSession;
    }),
});
