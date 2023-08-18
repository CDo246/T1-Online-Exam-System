import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Exam Inviligation Page</title>
        <meta name="description" content="This is a website for inviligating exams." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-black">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
            <p className="text-5xl text-white text-center">Exam Inviligation System</p>
            <div className="flex gap-4 flex-col items-center bg-white p-3 rounded-3xl">
              <input className="border-2 rounded border-black p-3"></input>
              <input className="border-2 rounded border-black p-3"></input>
              <Link href="/admin/monitor">
                <button className="rounded-full text-white bg-black text-xl p-2">
                  Student Sign In
                </button>
              </Link>
            </div>      
        </div>
      </main>
    </>
  );
}
