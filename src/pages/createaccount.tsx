import Link from "next/link";

export default function CreateAccount() {
    return (
        <div className="grid min-h-screen bg-black items-center justify-center">
            <div className="grid gap-4 flex-col items-center bg-white p-5 rounded-3xl w-min-half">
                <Link href="/">
                    <button className="rounded-xl border-2 border-black bg-black text-white p-3">←</button>
                </Link>
                <hr/>
                <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="First Name"></input>
                <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="Last Name"></input>
                <input className="rounded-xl border-2 border-black p-3" type="text" placeholder="Educational Institution"></input>
                <hr/>
                <p>Test text text text</p>
                <button className="w-full rounded-xl border-2 border-black text-white bg-black text-xl p-2">
                  Create Account
                </button>
            </div>
        </div>
    )
}