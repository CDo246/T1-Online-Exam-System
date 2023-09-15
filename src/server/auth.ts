import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { createHash } from "crypto";
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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /*     async session({ session, user }) { 
      console.log("\n\n\n Session Test")
      console.log(session)
      console.log(user)

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
        },
      }
    }, */

    signIn(profile) {
      //Handles signing in
      // https://next-auth.js.org/configuration/callbacks

      console.log("\n\n\n signIn test");
      console.log(profile);
      const isAllowedToSignIn = true;
      if (isAllowedToSignIn) return true;
      else return false; // Return false to display a default error message
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Login", // The name to display on the sign in form (e.g. "Sign in with...")
      id: "login",

      credentials: {
        email: {
          label: "Email Address",
          type: "text",
          placeholder: "name@example.com",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials, req) {
        if (!credentials) return null;
        console.log(credentials);
        // Add logic here to look up the user from the credentials supplied
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        });

        if (user === null)
          throw new Error(
            JSON.stringify({ errors: "User Not Found", status: false })
          );

        console.log(user.passwordSalt);

        const password = createHash("sha256")
          .update(`${user.passwordSalt}${credentials.password}`)
          .digest("hex");
        if (password === user.password) return user;
        throw new Error(
          JSON.stringify({ errors: "Incorrect Password", status: false })
        );
        return null;
      },
    }),
  ],
  pages: {
    //signIn: "/",
  },
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
