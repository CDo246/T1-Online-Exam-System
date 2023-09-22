import { useRouter } from "next/router";
import { useState } from "react";
import { FormBox } from "~/components/boxes";
import { BlackButton } from "~/components/button";
import { InputField, Validation } from "~/components/input";
import { CentredLayout } from "~/components/layouts";

export default function Reset() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);

  return (
    <CentredLayout title="Account Validation">
      <FormBox>
        <p>This page is not fully-functional yet.</p>
        <p>Your email address is: {router.query.email}</p>
        <InputField
          name="Password"
          type="password"
          placeholder="Password"
          value={password}
          setValue={setPassword}
          valid={passwordValid}
          setValid={setPasswordValid}
          validation={Validation.Password}
        />

        <a
          onClick={() => {
            console.log("Password Resetting not yet implemented");
          }}
        >
          <BlackButton text="Verify Account" />
        </a>
      </FormBox>
    </CentredLayout>
  );
}
