import Link from "next/link";
import { BlackBackButton, BlackButton } from "~/components/button";
import { FormBox } from "~/components/boxes";
import { CentredLayout } from "~/components/layouts";
import { useEffect, useState } from "react";
import { InputField, DropdownField, Validation } from "~/components/input";
import router from "next/router";
import { api } from "~/utils/api";
import { UserRoles } from "~/utils/enums";
import { TRPCClientError } from "@trpc/client";

export default function CreateStudent() {
  const [createAccountError, setCreateAccountError] = useState<string | null>(
    null
  );
  const [success, setSuccess] = useState(false)
  const [studentId, setStudentId] = useState("");
  const [studentIdValid, setStudentIdValid] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeValid, setVerificationCodeValid] = useState(false);
  const [image, setImage] = useState("");
  const [imageValid, setImageValid] = useState(false);
  const [createStudentDisabled, setCreateStudentDisabled] = useState(true);
  const [imageName, setImageName] = useState("")

  if(image !== "" && !imageValid) setImageValid(true);
  const disable =
    !studentIdValid || !verificationCodeValid || !imageValid;
  if (createStudentDisabled !== disable) setCreateStudentDisabled(disable);

  const createStudent = api.accounts.createStudent.useMutation();

  async function enterForm() {
    if (createStudentDisabled) return;
    try { 
       await createStudent.mutateAsync({
        studentId: parseInt(studentId),
        verificationCode: parseInt(verificationCode),
        imageBase64: image
      });
      setImageName("")
      setStudentId("")
      setVerificationCode("")
      
      setCreateStudentDisabled(true)
      setSuccess(true)
      setCreateAccountError(null)
      
    } catch (e) {
      if (e instanceof TRPCClientError) {
        setCreateAccountError(e.message);
        setSuccess(false)
      }
    }
  }

  useEffect(() => {
    if(parseInt(studentId) > 2000000) setStudentId("2000000")
    if(parseInt(verificationCode) > 2000000) setVerificationCode("2000000")
  }, [studentId, verificationCode])

  return (
    <CentredLayout title="Create Student">
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
        {success && (
          <div className="grid grid-cols-[1fr_auto_1fr] rounded-full bg-green-700">
            <div />
            <p className="text-white">
              Student Created Successfully
            </p>
            <a
              className="px-2 text-right text-white"
              onClick={() => setSuccess(false)}
            >
              X
            </a>
          </div>
        )}
        <form className="grid grid-cols-1 gap-4" onSubmit={e => {
          e.preventDefault();
          //enterForm();
        }}>
            <InputField
                name="Student ID"
                type="number"
                placeholder="Student Id"
                value={studentId}
                setValue={setStudentId}
                valid={studentIdValid}
                setValid={setStudentIdValid}
                validation={Validation.NonEmpty}
            />
            <InputField
                name="Verification Code"
                type="number"
                placeholder="Verification Code"
                value={verificationCode}
                setValue={setVerificationCode}
                valid={verificationCodeValid}
                setValid={setVerificationCodeValid}
                validation={Validation.NonEmpty}
            />
            <input
                type="file"
                
                name="myFile"
                accept=".jpeg, .png, .jpg"
                onChange={async (e) => {
                    console.log("Image upload test")
                    if(!e.target.files) return;
                    const file = e.target.files[0];
                    if(!file) return;
                    const fileReader = new FileReader;
                    fileReader.readAsDataURL(file)
                    fileReader.onload = () => {
                        const res = fileReader.result ? fileReader.result.toString() : ""
                        setImage(res)
                        console.log(res)
                        setImageName(e.target.value)
                        console.log("TEST" + e.target.value)
                    }
                }}
            />
          <hr className="min-w-[35vw]" />
          <a
            onClick={() => enterForm()}
          >
            <BlackButton text="Create Account" disabled={createStudentDisabled} />
          </a>
        </form>
      </FormBox>
    </CentredLayout>
  );
}
