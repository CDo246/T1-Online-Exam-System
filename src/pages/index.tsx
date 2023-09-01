import Head from "next/head";
import Link from "next/link";
import { api } from "~/utils/api";
import { BlackButton, WhiteButton } from "~/components/button"
import { CentredLayout } from "~/components/layouts";
import { FormBox } from "~/components/boxes";

export default function Home() {
  return ( 
    <CentredLayout title="Exam Inviligation Website" >
        <p className="text-5xl text-white text-center">Exam Inviligation System</p>
        <FormBox>
          <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="student@email.com"></input>
          <input className="rounded-xl border-2 border-black p-3" type="password" placeholder="***@!##@!"></input>
          <hr/>
          <Link href="/student/entersession">
            <BlackButton text="Sign In" />
          </Link>
          <Link href="/createaccount">
            <WhiteButton text="Create Account" />
          </Link>
        </FormBox>      
    </CentredLayout>
  );
}
