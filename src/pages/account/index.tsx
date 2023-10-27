import Link from "next/link";
import { BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { getCsrfToken, signOut, useSession } from "next-auth/react";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import router from "next/router";
import { useEffect, useState } from "react";
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

  const [sessionCode, setSessionCode] = useState<string>("");
  const [invalidSessionCode, setInvalidSessionCode] = useState(false);
  const createSession = api.sessions.createSession.useMutation();
  const createExamSession = api.examSessions.createExamSession.useMutation();
  const isSessionValid = api.sessions.isSessionValid.useMutation();

  useEffect(() => {
    const storedCode = localStorage.getItem("sessionCode");
    if (storedCode) setSessionCode(storedCode);
  }, []);

  const getRole = api.users.getUserRole.useQuery({
    userEmail: session?.user.email ?? "",
  });

  const handleCreateSession = async () => {
    try {
      const response = await createSession.mutateAsync({
        examinerEmail: session?.user.email ?? "", //TODO: Fix this
      });
      localStorage.setItem("sessionCode", response.uniqueCode.toString());
      setSessionCode(response.uniqueCode.toString());
      router.push("/admin/session");
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleEnterSession = async () => {
    try {
      // Check if session code is valid
      const isValid = await isSessionValid.mutateAsync({
        uniqueCode: sessionCode,
      });

      if (isValid) {
        await createExamSession.mutateAsync({
          uniqueCode: sessionCode,
        });
        router.push(`/student/session?sessionCode=${sessionCode}`);
      } else {
        setInvalidSessionCode(true);
        console.error("Invalid session code");
      }
    } catch (error) {
      console.error("Failed to enter session:", error);
    }
  };

  return (
    <CentredLayout title="Create Account">
      <FormBox>
        <div className="grid grid-flow-col grid-cols-[1fr,auto,auto] gap-1 overflow-x-auto">
          <p className="align-center flex-1 text-center text-xl">
            Welcome, {session?.user.name ?? ""} ({session?.user.email ?? ""})
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
        {privilegedRoles.includes((getRole.data?.role as UserRoles) ?? "") && (
          <>
            <hr />
            <Link href="/admin/createstudent" className="inline-block">
              <BlackButton text="Add Students" />
            </Link>
            <hr />
            <Link href="/admin/recordings" className="inline-block">
              <BlackButton text="View Video Recordings" />
            </Link>
            {sessionCode ? (
              <Link href="/admin/session" className="inline-block">
                <BlackButton text="Current Session" />
              </Link>
            ) : (
              <div className="inline-block" onClick={handleCreateSession}>
                <BlackButton text="Create Session" />
              </div>
            )}
          </>
        )}
        {defaultRoles.includes((getRole.data?.role as UserRoles) ?? "") && (
          <>
            <hr />
            {invalidSessionCode && (
              <div className="grid grid-cols-[1fr_auto_1fr] rounded-full bg-red-700">
                <div />
                <p className="text-white">Invalid Session Code</p>
                <button
                  className="px-2 text-right text-white"
                  onClick={() => setInvalidSessionCode(false)}
                >
                  X
                </button>
              </div>
            )}
            <input
              className="rounded-xl border-2 border-black p-3"
              type="text"
              placeholder="Session Code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
            ></input>
            <div onClick={handleEnterSession}>
              <BlackButton text="Enter Session" />
            </div>
          </>
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
