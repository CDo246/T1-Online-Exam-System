import Link from "next/link";
import { BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { getCsrfToken, signOut, useSession } from "next-auth/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { redirect } from "next/dist/server/api-utils";
import router from "next/router"
import { AppRouter, appRouter } from "~/server/api/root";

export default function Account({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {router.push('/')}
    }
  );
  {appRouter.students.createNotification}
  console.log(session)
  return (
    <CentredLayout title="Create Account">
      <FormBox>
        <div className="grid grid-flow-col grid-cols-[1fr,auto,auto] gap-1 overflow-x-auto">

          <p className="text-center text-xl flex-1 align-center">Welcome, {session?.user.name ?? ""}</p>
          <Link href="/account/settings" className="h-full">
            <BlackButton text="Account Settings"/>
          </Link>
          <a onClick={() => {signOut(); router.push('/');}} className="h-full">
            <BlackButton text="Log Out"/>
          </a>
        </div>
        <hr/>
        {session && (
          <div>
            <p>Signed in as {session.user.email ?? ""}</p> 
          </div>
        )}
      </FormBox>
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
