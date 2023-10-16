import Link from "next/link";
import { useState } from "react";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { getCsrfToken, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { api } from "../../utils/api";

export default function EnterSession({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession();
  const [sessionCode, setSessionCode] = useState("");
  const createExamSession = api.examSessions.createExamSession.useMutation();
  const isSessionValid = api.sessions.isSessionValid.useMutation();
  const router = useRouter();

  const handleEnterSession = async () => {
    try {
      // Check if session code is valid
      const isValid = await isSessionValid.mutateAsync({
        uniqueCode: sessionCode,
      });

      if (isValid) {
        let result = await createExamSession.mutateAsync({
          uniqueCode: Number(sessionCode),
        });
        sessionStorage.setItem("examSessionId", result.examSession.sessionId);
        router.push("/student/session");
      } else {
        console.error("Invalid session code");
      }
    } catch (error) {
      console.error("Failed to enter session:", error);
    }
  };

  return (
    <CentredLayout title="Enter Session">
      <FormBox>
        <Link href="/">
          <BlackBackButton />
        </Link>
        <hr />
        <input
          className="rounded-xl border-2 border-black p-3"
          type="text"
          placeholder="Session Code"
          value={sessionCode}
          onChange={(e) => setSessionCode(e.target.value)}
        ></input>
        <hr />
        <div onClick={handleEnterSession}>
          <BlackButton text="Enter Session" />
        </div>
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
