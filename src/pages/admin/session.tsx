import Link from "next/link";
import { useState, useEffect } from "react";
import { SidebarLayout } from "~/components/layouts";
import { Sidebar } from "~/components/sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

export default function Session() {
  const { data: session, status } = useSession();
  const examinerEmail = session?.user.email ?? "";
  const [sessionCode, setSessionCode] = useState<string | null>(
    "No Code Available"
  );
  const { data, error } = api.sessions.createSession.useQuery({
    examinerEmail,
  });
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCode = localStorage.getItem("sessionCode");
      if (storedCode) {
        setSessionCode(storedCode);
        return;
      }

      if (data) {
        const code = data.uniqueCode.toString() ?? "Error";
        localStorage.setItem("sessionCode", code);
        setSessionCode(code);
      } else if (error) {
        console.error("Failed to fetch session code:", error);
      }
    }
  }, [data, error]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionCode ?? "");
  };

  const endSession = () => {
    // Clear the session code from localStorage and state
    localStorage.removeItem("sessionCode");
    setSessionCode(null);

    // Navigate back to /account
    router.push("/account");
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
          onClick={endSession}
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
          <div className="h-[200px] rounded bg-white" />
          <div className="h-[200px] rounded bg-white" />
          <div className="h-[200px] rounded bg-white" />
          <div className="h-[200px] rounded bg-white" />
          <div className="h-[200px] rounded bg-white" />
          <div className="h-[200px] rounded bg-white" />
          <div className="h-[200px] rounded bg-white" />
        </div>
      </div>
    </SidebarLayout>
  );
}
