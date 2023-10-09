import Email from "next-auth/providers/email";
import { useRouter } from "next/router";
import { FormBox } from "~/components/boxes";
import { BlackButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";
import { api } from "~/utils/api";

export default function Validation() {
  const router = useRouter();

  const verifyAccount = api.accounts.verifyAccount.useMutation();

  return (
    <CentredLayout title="Account Validation">
      <FormBox>
        <p>Your email address is: {router.query.email}</p>
        <p>Click the button to validate your account:</p>
        <a
          onClick={async () => {
            await verifyAccount.mutateAsync({email : router.query.email as string, 
              verificationCode: router.query.verificationCode as string
            });
          }}
        >
          <BlackButton text="Verify Account" />
        </a>
      </FormBox>
    </CentredLayout>
  );
}
