import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { Layout } from "~/components/layouts";

export default function CreateAccount() {
    return (
        <Layout title="Create Account">
            <div className="grid gap-4 flex-col items-center bg-white p-5 rounded-3xl w-min-half">
                <Link href="/">
                    <BlackBackButton/>
                </Link>
                <hr/>
                <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="First Name"></input>
                <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="Last Name"></input>
                <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="Educational Institution"></input>
                <hr/>
                <p>Test text text text</p>
                <BlackButton text="Create Account" />
            </div>
        </Layout>
    )
}