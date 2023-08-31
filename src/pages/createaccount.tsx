import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";

export default function CreateAccount() {
    return (
        <div className="grid min-h-screen bg-black items-center justify-center">
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
        </div>
    )
}