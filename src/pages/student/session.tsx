import Link from "next/link";
import Camera from "../../components/Camera";
import { GrowFormBox, GrowFormBoxFullHeight } from "~/components/boxes";
import { SidebarLayout } from "~/components/layouts";
import { Sidebar } from "~/components/sidebar";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Session() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const studentDetails = api.students.getStudentSession.useQuery({email: session ? (session.user.email ?? "") : "", uniqueCode: useSearchParams().get("sessionCode") ?? ""});

  useEffect(() => {
    // Log initial examSessions
    console.log(studentDetails.data);
  }, [studentDetails.data])


  return (
    <SidebarLayout title="Session">
      <Sidebar>
        <p>Session Information:</p>
        {studentDetails.data && (
          <>
            <p>Session code: {studentDetails.data.uniqueCode}</p>
            <p>{studentDetails.data.deskAIApproved ? "Desk Approved by AI." : "Desk not approved by AI."}</p>
            <p>{studentDetails.data.deskImage ? "Desk image sent for approval." : "No desk image sent."}</p>
            <p>{studentDetails.data.deskManuallyApproved ? "Desk manually approved." : "Desk not manually approved."}</p>
            <hr/>
            <p>Misconduct Information:</p>
            <p className={studentDetails.data.strikes === 0 ? "" : "text-red-600"}   >Strikes: {studentDetails.data.strikes}</p>
            {studentDetails.data.suspiciousActivity && <p className="text-red-600">SUSPICIOUS ACTIVITY FLAGGED</p>}
            {studentDetails.data.manuallyFailed && <p className="text-red-600">FAILED BY EXAMINER</p>}
          </>
        )}
        <div className="flex-1" />
        <Link href="/account">
          <p className="text-gray-600">Leave Session</p>
        </Link>
      </Sidebar>

      <div className="max-h-full overflow-y-auto p-3">
        <GrowFormBoxFullHeight>
          <Camera />
        </GrowFormBoxFullHeight>
      </div>
    </SidebarLayout>
  );
}
