import Link from "next/link";
import Camera from "../../components/Camera";
import { GrowFormBox, GrowFormBoxFullHeight } from "~/components/boxes";
import { SidebarLayout } from "~/components/layouts";
import { Sidebar } from "~/components/sidebar";

export default function Session() {
  return (
    <SidebarLayout title="Session">
      <Sidebar>
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
