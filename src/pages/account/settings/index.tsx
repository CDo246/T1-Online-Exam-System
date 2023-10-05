import Link from "next/link";
import { FormBox } from "~/components/boxes";
import { BlackBackButton, BlackButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";

export default function Settings() {
    return (
      <CentredLayout title="Create Account">
        <FormBox>
          <Link href="/account">
            <BlackBackButton />
          </Link>
          <hr />

        </FormBox>
      </CentredLayout>
    );
  }