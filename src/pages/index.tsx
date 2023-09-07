/* eslint-disable @typescript-eslint/no-misused-promises */
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { BlackButton, WhiteButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";
import { FormBox } from "~/components/boxes";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

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
        <input
          className="rounded-xl border-2 border-black p-3"
          type="text"
          placeholder="student@email.com"
        ></input>
        <input
          className="rounded-xl border-2 border-black p-3"
          type="password"
          placeholder="***@!##@!"
        ></input>
        <hr />
        <Link href="/admin/monitor">
          <BlackButton text="Sign In" />
        </Link>
        <Link href="/createaccount">
          <WhiteButton text="Create Account" />
        </Link>
        <button onClick={() => signIn()}>asdfsadg</button>
      </FormBox>
    </CentredLayout>
  );
}
