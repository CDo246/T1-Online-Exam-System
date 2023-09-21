import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { useState } from "react";
import { InputField, Validation } from "~/components/input";

export default function CreateAccount() {
  const [name, setName] = useState("");
  const [nameValid, setNameValid] = useState(false)
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [createAccountDisabled, setCreateAccountDisabled] = useState(true)

  let disable = !nameValid || !emailValid || !passwordValid
  if(createAccountDisabled !== disable) setCreateAccountDisabled(disable)

  return (
    <CentredLayout title="Create Account">
      <FormBox>
        <Link href="/">
          <BlackBackButton />
        </Link>
        <hr />
        <InputField
          name="Name"
          type="text"
          placeholder="Name"
          value={name}
          setValue={setName}
          valid={nameValid}
          setValid={setNameValid}
          validation={Validation.NonEmpty}
          />
        <InputField
          name="Email Address"
          type="text"
          placeholder="Email Address"
          value={email}
          setValue={setEmail}
          valid={emailValid}
          setValid={setEmailValid}
          validation={Validation.Email}
          />
        <InputField
          name="Password"
          type="password"
          placeholder="●●●●●●"
          value={password}
          setValue={setPassword}
          valid={passwordValid}
          setValid={setPasswordValid}
          validation={Validation.Password}
          />
        <hr className="min-w-[35vw]" />
        <a
          onClick={() => {
            if(createAccountDisabled) return
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
          <BlackButton text="Create Account" disabled={createAccountDisabled} />
        </a>
      </FormBox>
    </CentredLayout>
  );
}
