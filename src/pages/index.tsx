/* eslint-disable @typescript-eslint/no-misused-promises */
import Head from "next/head";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "~/utils/api";
import { BlackButton, WhiteButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";
import { FormBox } from "~/components/boxes";
import {
  getCsrfToken,
  getSession,
  signIn,
  signOut,
  useSession,
} from "next-auth/react";
import { InputField, Validation } from "~/components/input";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useState } from "react";

export default function Home({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signInDisabled, setSignInDisabled] = useState(true);

  const accountCreated = useSearchParams().get("created");
  const disable = !emailValid || !passwordValid;
  if (signInDisabled !== disable) setSignInDisabled(disable);
  
  const enterForm = () => {
    if (signInDisabled) return;
    signIn("login", {
      email: email,
      password: password,
      redirect: false,
    }).then((res) => {
      setLoginError(res?.error ?? null);
      console.log("Client Sign-In Result: ");
      console.log(res);
      getSession().then((res) => {
        console.log("Session Created: ");
        console.log(res);
        if (res === null) return;
        //Redirect upon successful login
        router.push("/account");
      });
    });
  }
  
  return (
    <CentredLayout title="Exam Inviligation Website">
      <p className="text-center text-5xl text-white">
        Exam Inviligation System
      </p>
      <form onSubmit={e => {e.preventDefault(); enterForm();}}>
        <FormBox>
          {accountCreated !== null && (
              <div className="grid grid-cols-[1fr_auto_1fr] rounded-full bg-green-700">
                <div />
                <p className="text-white">
                  Your account with the email address {accountCreated} has been created!
                </p>
                <Link href="/">
                  <p className="px-2 text-right text-white">X</p>
                </Link>
              </div>
            )
          }
          {loginError && (
            <div className="grid grid-cols-[1fr_auto_1fr] rounded-full bg-red-700">
              <div />
              <p className="text-white">
                Sign In Error ({JSON.parse(loginError).errors})
              </p>
              <a
                className="px-2 text-right text-white"
                onClick={() => setLoginError(null)}
              >
                X
              </a>
            </div>
          )}
          <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
          <InputField
            name="Email Address"
            type="text"
            placeholder="Email Address"
            value={email}
            setValue={setEmail}
            valid={emailValid}
            setValid={setEmailValid}
            validation={Validation.Email}
          />
          <InputField
            name="Password"
            type="password"
            placeholder="●●●●●●"
            value={password}
            setValue={setPassword}
            valid={passwordValid}
            setValid={setPasswordValid}
            validation={Validation.Password}
          />
          <a
            onClick={() => enterForm()}
          >
            <BlackButton text="Sign In" disabled={signInDisabled} />
          </a>

          <hr />

          <Link href="/createaccount">
            <WhiteButton text="Create Account" />
          </Link>
        </FormBox>
      </form>
    </CentredLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}
