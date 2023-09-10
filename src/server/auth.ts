import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultSession["user"] & {
      id: string;
      // ...other properties
      // role: UserRole;
    };
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
/*     async session({ session, user }) { 
      console.log("\n\n\n Session Test")
      console.log(session)

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      }
    }, */

    async signIn(profile) {
      //Handles signing in
      // https://next-auth.js.org/configuration/callbacks

      console.log("\n\n\n signIn test")
      console.log(profile)
      const isAllowedToSignIn = true
      if (isAllowedToSignIn) return true
      else return false // Return false to display a default error message
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Student Login",
      id: "student-login",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        studentId: {
          label: "Student ID",
          type: "number",
          placeholder: "12345",
        },
        seatNumber: { label: "Seat Number", type: "string" },
      },
      async authorize(credentials, req) {
        if(!credentials) return null
        // Add logic here to look up the user from the credentials supplied
        const user = await prisma.user.findFirst({
          where: {
            student: {
              studentId: parseInt(credentials.studentId),
/*               sessions: {
                some: {
                  seatNumber: parseInt(credentials!.seatNumber),
                },
              }, */
            },
          },
        });
        console.log(user)
        return user;
      },
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Examiner Login",
      id: "examiner-login",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        examinerId: {
          label: "Examiner ID",
          type: "number",
          placeholder: "12345",
        },
        password: { label: "Password", type: "string" },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const user = await prisma.user.findFirst({
          where: {
            examiner: {
              examinerId: parseInt(credentials!.examinerId),
            },
          },
        });
        return user;
      },
    })
  ],
  pages: {
    //signIn: "/",
  }
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
