import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { getCsrfToken, signOut, useSession } from "next-auth/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { useRouter } from "next/router";
import { api } from "../../utils/api";

export default function Account({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();
  const getRole = api.users.getUserRole.useQuery({
    userEmail: session?.user.email || "",
  });
  return (
    <CentredLayout title="Create Account">
      <FormBox>
        <Link href="/">
          <BlackBackButton />
        </Link>
        <hr />
        <p>Account Stuff</p>
        {session && (
          <div>
            Signed in as {session.user.email ?? "placeholder"} <br />
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
