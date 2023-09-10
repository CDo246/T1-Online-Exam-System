import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";

export default function CreateAccount() {
    return (
        <CentredLayout title="Create Account">
            <FormBox>
                <Link href="/">
                    <BlackBackButton/>
                </Link>
                <hr/>
                <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="Name"></input>
                <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="Email Address"></input>
                <input className="rounded-xl border-2 border-black p-3" type="password" placeholder="●●●●●●"></input>
                <hr className="min-w-[35vw]"/>
                <BlackButton text="Create Account" />
            </FormBox>
        </CentredLayout>
    )
}