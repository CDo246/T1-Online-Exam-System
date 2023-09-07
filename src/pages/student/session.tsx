import Link from "next/link";
import { GrowFormBox } from "~/components/boxes";
import { SidebarLayout } from "~/components/layouts";
import { Sidebar } from "~/components/sidebar";

export default function Session() {
  return (
    <SidebarLayout title="Session">
      <Sidebar>
        <div className="flex-1" />
        <Link href="/">
          <p className="text-gray-600">Verify Session</p>
        </Link>
        <Link href="/">
          <p className="text-gray-600">Settings</p>
        </Link>
      </Sidebar>
      <div className="items-center justify-center p-10">
        <div className="margin-auto flex min-h-full flex-col">
          <GrowFormBox></GrowFormBox>
        </div>
      </div>
    </SidebarLayout>
  );
}
