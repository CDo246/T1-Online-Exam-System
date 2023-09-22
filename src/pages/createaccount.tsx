import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { useEffect, useState } from "react";
import { InputField, Validation } from "~/components/input";
import router from "next/router";

export default function CreateAccount() {
  const [createAccountError, setCreateAccountError] = useState<string | null>(null)
  const [name, setName] = useState("");
  const [nameValid, setNameValid] = useState(false)
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [secondPassword, setSecondPassword] = useState("")
  const [secondPasswordValid, setSecondPaswordValid] = useState(false)
  const [createAccountDisabled, setCreateAccountDisabled] = useState(true)

  const disable = !nameValid || !emailValid || !passwordValid || !secondPasswordValid
  if(createAccountDisabled !== disable) setCreateAccountDisabled(disable)

  useEffect(() => {
    if(password === secondPassword && passwordValid) setSecondPaswordValid(true)
    else setSecondPaswordValid(false)
  }, [password, secondPassword])

  return (
    <CentredLayout title="Create Account">
      <FormBox>
        <Link href="/">
          <BlackBackButton />
        </Link>
        <hr />
        {createAccountError && (
          <div className="grid grid-cols-[1fr_auto_1fr] rounded-full bg-red-700">
            <div />
            <p className="text-white">
              Error With Account Creation: ({createAccountError})
            </p>
            <a
              className="px-2 text-right text-white"
              onClick={() => setCreateAccountError(null)}
            >
              X
            </a>
          </div>
        )}
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
        <label>Confirm Password:</label> 
        <input
          className={`rounded-xl focus:outline-none border-2 ${secondPasswordValid ? "border-black" : "border-red-600"} p-3`}
          name="secondPassword"
          type="password"
          placeholder="●●●●●●"
          value={secondPassword}
          onChange={(e) => setSecondPassword(e.target.value)}
        />
        {!secondPasswordValid && <p className="text-red-600">Passwords must be matching</p>}
        <hr className="min-w-[35vw]" />
        <a
          onClick={async () => {
            if(createAccountDisabled) return
            const response = await fetch("/api/createaccount", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: name,
                email: email,
                password: password,
              }),
            }).then(res => res.json())
            console.log(response)
            if(response.error === undefined) router.push("/"); //TODO: Create a 'verify your email' page, redirect to that instead
            else setCreateAccountError(response?.error ?? null)
          }}
        >
          <BlackButton text="Create Account" disabled={createAccountDisabled} />
        </a>
      </FormBox>
    </CentredLayout>
  );
}
