import Email from "next-auth/providers/email";
import { useRouter } from "next/router";
import { FormBox } from "~/components/boxes";
import { BlackButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";
import { api } from "~/utils/api";

export default function Validation() {
  const router = useRouter();

  const verifyAccount = api.accounts.verifyAccount.useMutation();
  const disabled = verifyAccount.isLoading || verifyAccount.isSuccess
  return (
    <CentredLayout title="Account Validation">
      <FormBox>
        <p>Your email address is: {router.query.email}</p>
        <p>Click the button to validate your account:</p>
        <a
          onClick={async () => {
            if (disabled) {
              return;
            }
            await verifyAccount.mutateAsync({
              email: router.query.email as string,
              verificationCode: router.query.verificationCode as string,
            });
          }}
        >
          <BlackButton text="Verify Account" disabled = {disabled}/>
        </a>
        {verifyAccount.error && (
          <div className="grid grid-cols-[1fr_auto_1fr] rounded-full bg-red-700">
            <div />
            <p className="text-white">
              {verifyAccount.error.message}
            </p>
          </div>
        )}
        {verifyAccount.isSuccess && (
          <div className="grid grid-cols-[1fr_auto_1fr] rounded-full bg-green-800">
            <div />
            <p className="text-white">
              Email Validation Success 👍
            </p>
          </div>
        )}
      </FormBox>
    </CentredLayout>
  );
}
