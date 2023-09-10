import Link from "next/link";
import { SidebarLayout } from "~/components/layouts";
import { Sidebar } from "~/components/sidebar";

export default function Session() {    
    return (
        <SidebarLayout title="Session">               
            <Sidebar>
                <Link href="/">
                    <p className="text-gray-600">Current Participants</p>
                </Link>
                <Link href="/">
                    <p className="text-gray-600">Queue</p>
                </Link>
                <div className="flex-1"/>
                <Link href="/">
                    <p className="text-gray-600">Session Settings</p>
                </Link>
                <Link href="/">
                    <p className="text-gray-600">Setup</p>
                </Link>
            </Sidebar>
            <div className="items-center justify-center p-10">
                <div className="grid grid-cols-5 flex-col gap-5"> 
                    <div className="h-[200px] bg-white rounded" />
                    <div className="h-[200px] bg-white rounded" />
                    <div className="h-[200px] bg-white rounded" />
                    <div className="h-[200px] bg-white rounded" />
                    <div className="h-[200px] bg-white rounded" />
                    <div className="h-[200px] bg-white rounded" />
                    <div className="h-[200px] bg-white rounded" />
                </div>
            </div>
        </SidebarLayout>
    )
}