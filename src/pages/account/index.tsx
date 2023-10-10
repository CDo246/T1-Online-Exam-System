import Link from "next/link";
import { BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { getCsrfToken, signOut, useSession } from "next-auth/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import router from "next/router";
import { api } from "../../utils/api";
import { UserRoles } from "~/utils/enums";

const privilegedRoles = [UserRoles.Examiner, UserRoles.Admin];
const defaultRoles = [UserRoles.Student, UserRoles.Default];

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
        {privilegedRoles.includes((getRole.data?.role as UserRoles) ?? "") && (
          <>
            <Link href="/admin/session" className="inline-block">
              {typeof window !== "undefined" &&
              localStorage.getItem("sessionCode") ? (
                <BlackButton text="Current Session" />
              ) : (
                <BlackButton text="Create Session" />
              )}
            </Link>
          </>
        )}
        <hr />
        {defaultRoles.includes((getRole.data?.role as UserRoles) ?? "") && (
          <>
            <Link href="/student/entersession" className="inline-block">
              <BlackButton text="Enter Session" />
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
