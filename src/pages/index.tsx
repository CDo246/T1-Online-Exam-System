import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import {BlackButton, WhiteButton} from "~/components/button"
import { Layout } from "~/components/layouts";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return ( 
    <Layout title="Exam Inviligation Website" >
        <p className="text-5xl text-white text-center">Exam Inviligation System</p>
        <div className="grid gap-4 flex-col items-center bg-white p-5 rounded-3xl ">
          <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="student@email.com"></input>
          <input className="rounded-xl border-2 border-black p-3" type="password" placeholder="***@!##@!"></input>
          <hr/>
          <Link href="/admin/monitor">
            <BlackButton text="Student Sign In" />
          </Link>
          <Link href="/createaccount">
            <WhiteButton text="Create Account" />
          </Link>
        </div>      
    </Layout>
  );
}
