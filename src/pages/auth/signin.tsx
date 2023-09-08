import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getProviders, signIn, getCsrfToken } from "next-auth/react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "~/server/auth";

export default function SignIn({ csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return(
        <CentredLayout title="Sign In">
          <form method="post" action="/api/auth/callback/credentials">
            <FormBox>
              <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
              <label>
              Username
              <input name="studentId" type="text" />
              </label>
              <label>
              Password
              <input name="seatNumber" type="password" />
              </label>
              <a type="submit">
                <BlackButton text="Student Sign In"/>
              </a>
              <hr/>
              <a type="submit">
                <BlackButton text="Supervisor Sign In"/>
              </a>
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