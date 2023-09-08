import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getProviders, signIn, getCsrfToken } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "~/server/auth";

export default function SignIn({ csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log("Token:")
  console.log(csrfToken)
    return(
        <CentredLayout title="Sign In">
          <form method="post" action="/api/auth/callback/credentials">
              <FormBox>
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <label>
              Username
              <input name="username" type="text" />
              </label>
              <label>
              Password
              <input name="password" type="password" />
              </label>
              <button type="submit">Sign In As Student</button>
            </FormBox>
          </form>
        </CentredLayout>
    )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    return {
      props: {
        csrfToken: await getCsrfToken(context),
      },
    }
  }