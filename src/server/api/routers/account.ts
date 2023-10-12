import { TRPCError } from "@trpc/server";
import { createHash, randomBytes } from "crypto";
import validator from "validator";
import { z } from "zod";
import { UserRoles } from "~/utils/enums";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const accountRouter = createTRPCRouter({
  createStudent: publicProcedure
  .input(
    z.object({
      studentId: z.number(),
      verificationCode: z.number(),
      imageBase64: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    console.log("STARTING FN CALL")
    const { studentId, verificationCode, imageBase64} = input;


    //Server-side auth
    if (imageBase64 === "") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Incorrect details.",
      });
    }
    //Check if an account with the email already exists, and fail if there is
    const existingAccount = await ctx.prisma.student.findFirst({
      where: {
        studentId: studentId,
      },
    });
    if (existingAccount) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account with this student ID already exists.",
      });
    }

    console.log("Creating student entry");
    const student = await ctx.prisma.student.create({
      data: {
        studentId: studentId,
        verificationCode: verificationCode,
        imageBase64: imageBase64,
      },
    });
    console.log(student);
    console.log("Created successfully")
  }),

  createStudentAccount: publicProcedure
  .input(
    z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
      studentId: z.number(),
      verificationCode: z.number(),
      imageUrl: z.string(),

    })
  )
  .mutation(async ({ input, ctx }) => {
    const { name, email, password, studentId, verificationCode, imageUrl } = input;
    const salt = randomBytes(8).toString("hex");
    const hash = createHash("sha256")
      .update(`${salt}${password}`)
      .digest("hex");

    //Server-side auth
    if (name === "" || !validator.isEmail(email) || !validator.isStrongPassword(password)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Incorrect details.",
      });
    }
    //Check if an account with the email already exists, and fail if there is
    const existingAccount = await ctx.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (existingAccount) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account with this email already exists.",
      });
    }
    //Make sure the student exists (was created by an examiner)
    const existingStudent = await ctx.prisma.student.findFirst({
      where: {
        AND: [
          {studentId: studentId},
          {verificationCode: verificationCode},
        ]
      }
    })
    if(!existingStudent) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Your student ID or verification code is not correct.",
      });
    }

    console.log("Creating user entry");
    const user = await ctx.prisma.user.create({
      data: {
        name: name,
        email: email,
        verificationCode: randomBytes(8).toString("hex"),
        password: hash,
        passwordSalt: salt,
        role: "Student",
        //student: existingStudent
      },
    });
    console.log(user);
    console.log("Updating student entry")
    const student = await ctx.prisma.student.updateMany({
      data: {
        userId: user.id,
      },
      where: {
        AND: [
          {studentId: studentId},
          {verificationCode: verificationCode},
        ]
      }
    })
    console.log(student)
  }),

  createExaminerAccount: publicProcedure
  .input(
    z.object({
      name: z.string(),
      email: z.string(),
      password: z.string(),
      examinerCreationCode: z.number(),
      role: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { name, email, password, examinerCreationCode, role } = input;
    const salt = randomBytes(8).toString("hex");
    const hash = createHash("sha256")
      .update(`${salt}${password}`)
      .digest("hex");

    if (
      name === "" ||
      !validator.isEmail(email) ||
      !validator.isStrongPassword(password) ||
      !Object.values(UserRoles).includes(role as UserRoles)
    ) {
      console.log(
        "here",
        Object.values(UserRoles).includes(role as UserRoles)
      );
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Incorrect Details.",
      });
    }
    const existingAccount = await ctx.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (existingAccount) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Account with this email already exists.",
      });
    }
    if (examinerCreationCode !== 123) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Incorrect examiner creation code.",
      });
    }
    console.log("Creating account");
    const user = await ctx.prisma.user.create({
      data: {
        name: name,
        email: email,
        verificationCode: randomBytes(8).toString("hex"),
        password: hash,
        passwordSalt: salt,
        role: role,
      },
    });
    console.log(user);
    console.log("creating examiner account");
    const examiner = await ctx.prisma.examiner.create({
      data: {
        examinerId: Math.floor(Math.random() * 10000000),
        userId: user.id,
      },
    });
    console.log(examiner);
  }),
  


  createAccount: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string(),
        password: z.string(),
        role: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { name, email, password, role } = input;
      const salt = randomBytes(8).toString("hex");
      const hash = createHash("sha256")
        .update(`${salt}${password}`)
        .digest("hex");
      console.log(hash);
      console.log(
        "here",
        role,
        Object.values(UserRoles).includes(role as UserRoles)
      );
      if (
        name === "" ||
        !validator.isEmail(email) ||
        !validator.isStrongPassword(password) ||
        !Object.values(UserRoles).includes(role as UserRoles)
      ) {
        console.log(
          "here",
          Object.values(UserRoles).includes(role as UserRoles)
        );
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Incorrect Details",
        });
      }
      const existingAccount = await ctx.prisma.user.findFirst({
        where: {
          email: email,
        },
      });
      if (existingAccount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Account with this email already exists",
        });
      }
      console.log("Creating account");
      const user = await ctx.prisma.user.create({
        data: {
          name: name,
          email: email,
          verificationCode: randomBytes(8).toString("hex"),
          password: hash,
          passwordSalt: salt,
          role: role,
        },
      });
      console.log(user);

      // Create role specific DB model instances
      // TODO: Add role specific data to account creation (studentID/Image, examinerID)
      switch (role) {
        case UserRoles.Student:
          const student = await ctx.prisma.student.create({
            data: {
              studentId: Math.floor(Math.random() * 10000000),
              userId: user.id,
              // imageId: 0,
            },
          });
          console.log(student);
          break;

        case UserRoles.Examiner:
          const examiner = await ctx.prisma.examiner.create({
            data: {
              examinerId: Math.floor(Math.random() * 10000000),
              userId: user.id,
            },
          });
          console.log(examiner);
          break;

        default:
          // Handle other roles or cases if needed
          break;
      }
    }),

  verifyAccount: publicProcedure
    .input(
      z.object({
        email: z.string(),
        verificationCode: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { email, verificationCode } = input;
      const user = await ctx.prisma.user.findFirst({
        where: {
          email: email,
        },
      });
      console.log(user);
      if (user === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User Not Found",
        });
      } else if (verificationCode !== user.verificationCode) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Incorrect Verification Code",
        });
      } else {
        ctx.prisma.user.update({
          where: {
            email: email,
          },
          data: {
            emailVerified: new Date(),
          },
        });
      }
    }),

  updatePassword: publicProcedure
    .input(
      z.object({
        email: z.string(),
        oldPass: z.string(),
        newPass: z.string(),
      })
    )
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      console.log(input.email);
      const user = await ctx.prisma.user.findFirst({
        where: {
          email: input.email,
        },
      });
      if (user === null) return false;

      const savedPass = createHash("sha256")
        .update(`${user.passwordSalt}${input.oldPass}`)
        .digest("hex");
      if (savedPass !== user.password) return false;
      const newPass = createHash("sha256")
        .update(`${user.passwordSalt}${input.newPass}`)
        .digest("hex");

      const res = await ctx.prisma.user.update({
        where: {
          email: input.email,
        },
        data: {
          password: newPass,
        },
      });
      return true;
    }),
});
