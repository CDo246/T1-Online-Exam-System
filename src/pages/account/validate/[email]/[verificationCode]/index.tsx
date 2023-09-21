import { useRouter } from "next/router";
import { FormBox } from "~/components/boxes";
import { BlackButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";

export default function Validation() {
    const router = useRouter()
    
    return(
        <CentredLayout title="Account Validation">
            <FormBox>
                <p>Your email address is "{router.query.email}"</p>
                <p>Click the button to validate your account:</p>
                <a onClick={() => {
                    fetch("/api/verifyaccount", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            email: router.query.email,
                            verificationCode: router.query.verificationCode,
                        }),
                        }).then((res) => console.log(res));
                                
                }}>
                    <BlackButton text="Verify Account"/>
                </a>
            </FormBox>
        </CentredLayout>
    )
}