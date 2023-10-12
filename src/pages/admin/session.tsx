import Link from "next/link";
import { useState, useEffect } from "react";
import { SidebarLayout } from "~/components/layouts";
import { Sidebar } from "~/components/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { TRPCClientError } from "@trpc/client";

// This is not the same as the prisma DB type, this is a custom type to collate data we want to get from the API.
type ExamSessionType = {
  sID: number;
  name: string | null;
  sessionId: string;
  seatNumber: string;
  startTime: Date;
  endTime: Date | null;
  suspiciousActivity: boolean;
  studentId: string;
  uniqueCode: number;
  examinerId: string;
};

export default function Session() {
  const [sessionCode, setSessionCode] = useState<string | null>("");
  const [flaggedSessions, setFlaggedSessions] = useState<string[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSessionType[]>([]);
  const endSession = api.sessions.endSession.useMutation();
  const flagExamSession = api.students.flagStudentSession.useMutation();
  const unflagExamSession = api.students.unflagStudentSession.useMutation();
  const getExamSessionsByCode = api.examSessions.getExamSessionsByCode.useQuery(
    {
      uniqueCode: Number(sessionCode),
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (getExamSessionsByCode.data) {
      setExamSessions(getExamSessionsByCode.data.examSessions);
    }
    // Log initial examSessions
    console.log(getExamSessionsByCode.data?.examSessions);
  }, [getExamSessionsByCode.data]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCode = localStorage.getItem("sessionCode");
      if (storedCode) {
        setSessionCode(storedCode);
      }
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionCode ?? "");
  };

  const handleEndSession = async () => {
    try {
      await endSession.mutateAsync({ uniqueCode: sessionCode ?? "" });
    } catch (error) {
      if (error instanceof TRPCClientError) {
        console.error("Failed to end session:", error.message);
      }
    } finally {
      localStorage.removeItem("sessionCode");
      setSessionCode(null);
      router.push("/account");
    }
  };

  const handleFlagSuspiciousActivity = async (examSessionId: string) => {
    try {
      await flagExamSession.mutateAsync({ sessionId: examSessionId });
      console.log("Suspicious activity flagged successfully");

      setExamSessions(
        examSessions.map((es) =>
          es.sessionId === examSessionId
            ? { ...es, suspiciousActivity: true }
            : es
        )
      );
    } catch (error) {
      console.error("Failed to flag suspicious activity:", error);
    }
  };

  const handleUnflagSuspiciousActivity = async (examSessionId: string) => {
    try {
      await unflagExamSession.mutateAsync({ sessionId: examSessionId });
      console.log("Suspicious activity unflagged successfully");

      setExamSessions(
        examSessions.map((es) =>
          es.sessionId === examSessionId
            ? { ...es, suspiciousActivity: false }
            : es
        )
      );
    } catch (error) {
      console.error("Failed to unflag suspicious activity:", error);
    }
  };

  return (
    <SidebarLayout title="Session">
      <Sidebar>
        <div className="mb-4 flex flex-col items-start rounded-lg border-2 border-gray-300 bg-white p-2 shadow-lg">
          <label className="mb-1 font-bold text-gray-600">Session Code</label>
          <div className="flex items-center">
            <span className="mr-2 text-lg">{sessionCode}</span>
            <button
              onClick={copyToClipboard}
              className="rounded bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
        </div>
        <button
          onClick={handleEndSession}
          className="mb-4 w-full rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
        >
          End Session
        </button>
        <Link href="/">
          <p className="text-gray-600">Current Participants</p>
        </Link>
        <Link href="/">
          <p className="text-gray-600">Queue</p>
        </Link>
        <div className="flex-1" />
        <Link href="/">
          <p className="text-gray-600">Session Settings</p>
        </Link>
        <Link href="/">
          <p className="text-gray-600">Setup</p>
        </Link>
      </Sidebar>
      <div className="items-center justify-center p-10">
        <div className="grid grid-cols-5 flex-col gap-5">
          {examSessions.map((examSession, index) => (
            <div
              key={index}
              className={`flex h-[200px] flex-col items-center justify-center rounded border-4 border-gray-700
            ${examSession.suspiciousActivity ? "bg-red-500" : "bg-white"}`}
            >
              <div className="text-left">
                <p>(Image Placeholder)</p>
                <p>Name: {examSession.name}</p>
                <p>ID: {examSession.sID}</p>
                {examSession.suspiciousActivity ? (
                  <button
                    onClick={() =>
                      handleUnflagSuspiciousActivity(examSession.sessionId)
                    }
                    className="mt-2 rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                  >
                    Unflag
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleFlagSuspiciousActivity(examSession.sessionId)
                    }
                    className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Flag
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
