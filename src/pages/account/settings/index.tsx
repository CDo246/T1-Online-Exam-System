import Link from "next/link";
import { useEffect, useState } from "react";
import { FormBox } from "~/components/boxes";
import { BlackBackButton, BlackButton } from "~/components/button";
import { InputField, Validation } from "~/components/input";
import { CentredLayout } from "~/components/layouts";
import { api } from "~/utils/api";
import { getServerSideProps } from "..";
import { InferGetServerSidePropsType } from "next";
import router from "next/router";
import { useSession } from "next-auth/react";

export default function Settings({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const { mutate, error } = api.accounts.updatePassword.useMutation();
  const [oldPassword, setOldPassword] = useState("");
  const [oldPasswordValid, setOldPasswordValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordValid, setNewPasswordValid] = useState(false);
  const [secondPassword, setSecondPassword] = useState("");
  const [secondPasswordValid, setSecondPaswordValid] = useState(false);
  const [canUpdatePassword, setCanUpdatePassword] = useState(false);

  useEffect(
    () =>
      setCanUpdatePassword(
        oldPasswordValid && newPasswordValid && secondPasswordValid
      ),
    [oldPasswordValid, newPasswordValid, secondPasswordValid]
  );

  useEffect(() => {
    if (newPassword === secondPassword && newPasswordValid)
      setSecondPaswordValid(true);
    else setSecondPaswordValid(false);
  }, [newPassword, secondPassword]);

  const updatePass = () => {
    if (!canUpdatePassword) return;
    mutate({
      email: session?.user.email ?? "",
      oldPass: oldPassword,
      newPass: newPassword,
    });
  };

  return (
    <CentredLayout title="Create Account">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updatePass();
        }}
      >
        <FormBox>
          <Link href="/account">
            <BlackBackButton />
          </Link>
          <hr />

          <InputField
            name="Old Password"
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            setValue={setOldPassword}
            valid={oldPasswordValid}
            setValid={setOldPasswordValid}
            validation={Validation.Password}
          />
          <InputField
            name="New Password"
            type="password"
            placeholder="New Password"
            value={newPassword}
            setValue={setNewPassword}
            valid={newPasswordValid}
            setValid={setNewPasswordValid}
            validation={Validation.Password}
          />
          <input
            className={`rounded-xl border-2 focus:outline-none ${
              secondPasswordValid ? "border-black" : "border-red-600"
            } p-3`}
            name="secondPassword"
            type="password"
            placeholder="●●●●●●"
            value={secondPassword}
            onChange={(e) => setSecondPassword(e.target.value)}
          />
          {!secondPasswordValid && (
            <p className="text-red-600">Passwords must be matching</p>
          )}
          <a onClick={() => updatePass()}>
            <BlackButton
              text="Update Your Password"
              disabled={!canUpdatePassword}
            />
          </a>
        </FormBox>
      </form>
    </CentredLayout>
  );
}
