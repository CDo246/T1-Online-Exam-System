import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { getCsrfToken, signOut, useSession } from "next-auth/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";

<<<<<<< HEAD
export default function EnterSession() {
CI/add_initial_action
=======
export default function EnterSession({ csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { data: session, status } = useSession()
>>>>>>> 4b728de044fc40a718209dbc39175544421ad692
    return (
        <CentredLayout title="Create Account">
            <FormBox>
                {/* TODO: Remove this temp session info */}
                {session && (
                    <div>
                        Signed in as {session.user.email || "placeholder"} <br />
                        <button onClick={() => signOut()}>Sign out</button>
                    </div>
                )}
                <Link href="/">
                    <BlackBackButton/>
                </Link>
                <hr/>
                <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="Session Code"></input>
                <hr/>
                <Link href = "/student/session">
                <BlackButton text="Enter Session" />
                </Link>
            </FormBox>
        </CentredLayout>
    )
}
<<<<<<< HEAD
main
=======

export async function getServerSideProps(context: GetServerSidePropsContext) {
    return {
      props: {
        csrfToken: await getCsrfToken(context),
      },
    }
  }
>>>>>>> 4b728de044fc40a718209dbc39175544421ad692
