/* eslint-disable @typescript-eslint/no-misused-promises */
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { BlackButton, WhiteButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";
import { FormBox } from "~/components/boxes";
import { getCsrfToken, getSession, signIn, signOut, useSession } from "next-auth/react";
import { InputField } from "~/components/input";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useState } from "react";

export default function Home({ csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)

  return (
    <CentredLayout title="Exam Inviligation Website">
      <p className="text-center text-5xl text-white">
        Exam Inviligation System
      </p>
      <FormBox>
        {loginError && <div className="rounded-full bg-red-700 grid grid-cols-[1fr_auto_1fr]">
          <div/>
          <p className="text-white">Sign In Error ({JSON.parse(loginError).errors})</p>
          <a className="text-white text-right px-2" onClick={() => setLoginError(null)}>X</a>
        </div> }
        <input name="csrfToken" type="hidden" defaultValue={csrfToken}/>
        <label>Email Address:</label>
        <InputField name="email" type="text" placeholder="Email Address" value={email} setValue={setEmail}/>
        <label>Password:</label>
        <InputField name="password" type="password" placeholder="●●●●●●" value={password} setValue={setPassword}/>
        <a onClick={() => signIn("login", {email: email, password: password, redirect: false})
          .then(res => {
            setLoginError(res?.error || null)
            console.log("Client Sign-In Result: ")
            console.log(res)
            getSession().then(res => {
              console.log("Session Created: ")
              console.log(res)
              if(res === null) return
              //Redirect upon successful login
              router.push("/student/entersession") //TODO: Update temp redirect home
            })
          })
        }>
          <BlackButton text="Sign In" />
        </a>
        
        <hr />

        <Link href="/createaccount">
          <WhiteButton text="Create Account" />
        </Link>
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