import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";

export default function EnterSession() {
CI/add_initial_action
    return (
        <CentredLayout title="Create Account">
            <FormBox>
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
main
