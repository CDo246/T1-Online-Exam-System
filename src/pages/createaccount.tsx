import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { useState } from "react";

export default function CreateAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <CentredLayout title="Create Account">
      <FormBox>
        <Link href="/">
          <BlackBackButton />
        </Link>
        <hr />
        <input
          className="rounded-xl border-2 border-black p-3"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        ></input>
        <input
          className="rounded-xl border-2 border-black p-3"
          type="text"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        ></input>
        <input
          className="rounded-xl border-2 border-black p-3"
          type="password"
          placeholder="●●●●●●"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        ></input>
        <hr className="min-w-[35vw]" />
        <a
          onClick={() => {
            fetch("/api/createaccount", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: name,
                email: email,
                password: password,
              }),
            }).then((res) => console.log(res));
          }}
        >
          <BlackButton text="Create Account" />
        </a>
      </FormBox>
    </CentredLayout>
  );
}
