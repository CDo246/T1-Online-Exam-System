import Link from "next/link";
import { BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { getCsrfToken, signOut, useSession } from "next-auth/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { redirect } from "next/dist/server/api-utils";
import router from "next/router";
import { useRouter } from "next/router";
import { api } from "../../utils/api";

export default function Account({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const getRole = api.users.getUserRole.useQuery({
    userEmail: session?.user.email ?? "",
  });
  return (
    <CentredLayout title="Create Account">
      <FormBox>
        <div className="grid grid-flow-col grid-cols-[1fr,auto,auto] gap-1 overflow-x-auto">
          <p className="align-center flex-1 text-center text-xl">
            Welcome, {session?.user.name ?? ""}
          </p>
          <Link href="/account/settings" className="h-full">
            <BlackButton text="Account Settings" />
          </Link>
          <a
            onClick={() => {
              signOut();
              router.push("/");
            }}
            className="h-full"
          >
            <BlackButton text="Log Out" />
          </a>
        </div>
        <hr />
        {['Examiner', 'Admin'].includes(getRole.data?.role ?? '') && (
            <>
              <Link href="/admin/session" className="inline-block">
                <BlackButton text="Teacher Dashboard"/>
              </Link>
            </>
          )}
        <hr />
        {['Student', 'Account'].includes(getRole.data?.role ?? '') && (
            <>
              <Link href="/student/entersession" className="inline-block">
                <BlackButton text="Enter Session"/>
              </Link>
            </>
          )}
        <hr />
        {session && (
          <div>
            <p>Signed in as {session.user.email ?? ""}</p>
            Role: {getRole.data?.role} <br />
            <button onClick={() => signOut()}>Sign out</button>
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
