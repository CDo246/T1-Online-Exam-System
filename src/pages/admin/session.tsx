import Link from "next/link";
import { useState, useEffect } from "react";
import { SidebarLayout } from "~/components/layouts";
import { Sidebar } from "~/components/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { TRPCClientError } from "@trpc/client";
import { BlackButton, WhiteButton } from "~/components/button";

// This is not the same as the prisma DB type, this is a custom type to collate data we want to get from the API.
type ExamSessionType = {
  sID: string;
  name: string | null;
  sessionId: string;
  seatNumber: string;
  startTime: Date;
  endTime: Date | null;
  suspiciousActivity: boolean;
  studentId: string;
  uniqueCode: string;
  examinerId: string;
  image: string | null;
  manuallyFailed: boolean;
  strikes: number | null;
  deskImage: string | null;
  deskManuallyApproved: boolean;
  liveFeedImage: string | null;
};

export default function Session() {
  const [sessionCode, setSessionCode] = useState<string | null>("");
  const [flaggedSessions, setFlaggedSessions] = useState<string[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSessionType[]>([]);
  const endSession = api.sessions.endSession.useMutation();
  const flagExamSession = api.students.flagStudentSession.useMutation();
  const unflagExamSession = api.students.unflagStudentSession.useMutation();
  const failExamSession = api.students.failStudentSession.useMutation();
  const unfailExamSession = api.students.unfailStudentSession.useMutation();
  const setExamSessionStrikes = api.students.setStrikes.useMutation();
  const getExamSessionsByCode = api.examSessions.getExamSessionsByCode.useQuery(
    {
      uniqueCode: Number(sessionCode),
    }
  );

  const [hiddenFaceIds, setHiddenFaceIds] = useState<string[]>([]);

  const approveDeskImage = api.examSessions.approveDeskImage.useMutation();
  const removeDeskImage = api.examSessions.removeDeskImage.useMutation();

  const router = useRouter();

  console.log(examSessions);

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

  const handleFail = async (examSessionId: string) => {
    try {
      await failExamSession.mutateAsync({ sessionId: examSessionId });
      console.log("Failed successfully");

      setExamSessions(
        examSessions.map((es) =>
          es.sessionId === examSessionId ? { ...es, manuallyFailed: true } : es
        )
      );
    } catch (error) {
      console.error("Failed to fail:", error);
    }
  };

  const handleUnfail = async (examSessionId: string) => {
    try {
      await unfailExamSession.mutateAsync({ sessionId: examSessionId });
      console.log("UnFailed successfully");

      setExamSessions(
        examSessions.map((es) =>
          es.sessionId === examSessionId ? { ...es, manuallyFailed: false } : es
        )
      );
    } catch (error) {
      console.error("Failed to unfail:", error);
    }
  };

  const setStrikes = async (examSessionId: string, strikes: number) => {
    try {
      await setExamSessionStrikes.mutateAsync({
        sessionId: examSessionId,
        strikes: strikes,
      });
      console.log("Set Strikes successfully");

      setExamSessions(
        examSessions.map((es) =>
          es.sessionId === examSessionId ? { ...es, strikes: strikes } : es
        )
      );
    } catch (error) {
      console.error("Failed to set strikes:", error);
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

        <p className="text-gray-600">Current Participants:</p>
        {examSessions.map((session) => (
          <p key={session.name}>{session.name}</p>
        ))}

        <div className="flex-1" />

        <Link href="/account">
          <p className="text-gray-600">Stop Monitoring</p>
        </Link>
      </Sidebar>
      <div className="items-center justify-center p-10">
        <div className="grid grid-cols-5 flex-col gap-5">
          {examSessions.map((examSession, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center rounded border-4 border-gray-700 p-4
            ${
              examSession.suspiciousActivity ||
              examSession.manuallyFailed ||
              (examSession.strikes ?? 0) >= 3
                ? "bg-red-200"
                : "bg-white"
            }`}
            >
              <div className="grid grid-cols-1 gap-1 text-left">
                {examSession.image &&
                !hiddenFaceIds.includes(examSession.studentId) ? (
                  <>
                    <button
                      onClick={() =>
                        setHiddenFaceIds([
                          ...hiddenFaceIds,
                          examSession.studentId,
                        ])
                      }
                      className="w-full"
                    >
                      <BlackButton text="Hide Profile Pictures" />
                    </button>
                    <img
                      src={examSession.image}
                      className="h-50 object-scale-down"
                    />
                  </>
                ) : (
                  !hiddenFaceIds.includes(examSession.studentId) && (
                    <p>No Image</p>
                  )
                )}
                {examSession.liveFeedImage ? (
                  examSession.liveFeedImage.trim() !== "" ? (
                    <img
                      src={examSession.liveFeedImage}
                      className="h-50 object-scale-down"
                    />
                  ) : (
                    <p>No webcam connected</p>
                  )
                ) : (
                  <p>No webcam connected</p>
                )}
                <p>Student Name: {examSession.name}</p>
                <p>Student ID: {examSession.sID}</p>
                {examSession.suspiciousActivity ? (
                  <button
                    onClick={() =>
                      handleUnflagSuspiciousActivity(examSession.sessionId)
                    }
                    className="w-full"
                  >
                    <WhiteButton text="Remove Warning" />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      handleFlagSuspiciousActivity(examSession.sessionId)
                    }
                    className="w-full"
                  >
                    <BlackButton text="Warn" />
                  </button>
                )}
                {examSession.manuallyFailed && (
                  <button
                    onClick={() => handleUnfail(examSession.sessionId)}
                    className="w-full"
                  >
                    <WhiteButton text="Remove Fail" />
                  </button>
                )}
                {(examSession.strikes ?? 0) >= 2 &&
                  !examSession.manuallyFailed && (
                    <button
                      onClick={() => handleFail(examSession.sessionId)}
                      className="w-full"
                    >
                      <BlackButton text="Fail" />
                    </button>
                  )}

                <div className="grid grid-cols-3 gap-1">
                  <p className="text-center">Strikes: {examSession.strikes}</p>
                  {examSession.strikes ?? 0 > 0 ? (
                    <button
                      onClick={() =>
                        setStrikes(
                          examSession.sessionId,
                          (examSession.strikes ?? 1) - 1
                        )
                      }
                      className="w-full"
                    >
                      <BlackButton text="-" />
                    </button>
                  ) : (
                    <div />
                  )}
                  <button
                    onClick={() =>
                      setStrikes(
                        examSession.sessionId,
                        (examSession.strikes ?? 0) + 1
                      )
                    }
                    className="w-full"
                  >
                    <BlackButton text="+" />
                  </button>
                </div>

                {examSession.deskImage && !examSession.deskManuallyApproved && (
                  <>
                    <img
                      src={examSession.deskImage}
                      className="h-50 object-scale-down"
                    />
                    <button
                      onClick={() => {
                        approveDeskImage.mutateAsync({
                          sessionId: examSession.sessionId,
                        });
                      }}
                      className="w-full"
                    >
                      <BlackButton text="Approve Desk" />
                    </button>
                    <button
                      onClick={() => {
                        removeDeskImage.mutateAsync({
                          sessionId: examSession.sessionId,
                        });
                      }}
                      className="w-full"
                    >
                      <BlackButton text="Disapprove Desk" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SidebarLayout>
  );
}
