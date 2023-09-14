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
<<<<<<< HEAD
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
=======
    <>
      <Head>
        <title>Exam Inviligation Page</title>
        <meta name="description" content="This is a website for inviligating exams." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="grid items-center gap-8 ">
            <p className="text-5xl text-white text-center">Exam Inviligation System</p>
            <div className="grid gap-4 flex-col items-center bg-white p-5 rounded-3xl ">
              <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="student@email.com"></input>
              <input className="rounded-xl border-2 border-black p-3" type="password" placeholder="***@!##@!"></input>
              <hr/>
              <Link href="/admin/monitor">
                <button className="w-full rounded-xl border-2 border-black text-white bg-black text-xl p-2">
                  Student Sign In
                </button>
              </Link>
              <Link href="/createaccount">
                <button className="w-full rounded-xl border-2 border-black text-xl p-2">
                  Create Account
                </button>
              </Link>
            </div>      
        </div>
      </main>
    </>
>>>>>>> main
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  }
}