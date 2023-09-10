/* eslint-disable @typescript-eslint/no-misused-promises */
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { BlackButton, WhiteButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";
import { FormBox } from "~/components/boxes";
import { getCsrfToken, getSession, signIn, signOut, useSession } from "next-auth/react";
import { InputField } from "~/components/input";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

export default function Home({ csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();
  console.log(csrfToken)
  console.log("Session: " + session)
  console.log(status)

  return (
    <CentredLayout title="Exam Inviligation Website">
      {session && (
        <div>
          Signed in as {session.user.email} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      )}
      <p className="text-center text-5xl text-white">
        Exam Inviligation System
      </p>
      <FormBox>
        
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        {/* <input name="credentials" type="hidden" defaultValue="student-login" /> */}
        <InputField name="studentId" type="text" placeholder="Student ID"/>
        <InputField name="seatNumber" type="text" placeholder="Seat Number"/>
        <a onClick={() => signIn("student-login", {studentId: 0, seatNumber: 0})
          .then(res => {
            console.log("Client signin")
            getSession().then(res => console.log("Session" + res))
            console.log(res)
            console.log(session)
            console.log(status)
          })
        }>
          <BlackButton text="Student Sign In" />
        </a>
        
        <hr />
        <form className="grid gap-4" method="post" action="/api/auth/callback/credentials">
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <InputField name="username" type="text" placeholder="Examiner ID"/>
          <InputField name="password" type="password" placeholder="Password"/>
          <a type="submit">
            <BlackButton text="Examiner Sign In" />
          </a>
        </form>
        <hr/>
        <Link href="/createaccount">
          <BlackButton text="Create Account" />
        </Link>
        <button onClick={() => signIn()}>asdfsadg</button>
      </FormBox>
    </CentredLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  }
}