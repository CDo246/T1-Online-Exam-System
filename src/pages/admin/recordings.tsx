import Link from "next/link";
import { FormBox } from "~/components/boxes";
import { BlackButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";
import { useEffect, useState } from "react";
import AWS from "aws-sdk";
import { api } from "~/utils/api";

export default function Recordings() {
  //function that retrieves all 0bjects in s3 bucket
  const [objects, setObjects] = useState<string[]>([]);
  const { data } = api.externalAPIs.listRecordings.useQuery();

  //list all files
  const listS3Objects = () => {
    try {
      console.log("Called")
      if (data) {
        const s3Objects = data.s3Objects;
        setObjects(s3Objects);
      }
    } catch (error) {
      console.error("Error listing S3 objects:", error);
    }
  };

  useEffect(() => listS3Objects(), [data?.s3Objects])

  //download file with objectKey
  const downloadFile = (objectKey: string) => {
    const link = document.createElement("a");
    const bucketName = "online-anti-cheat";
    link.href = `https://${bucketName}.s3.amazonaws.com/${objectKey}`;
    link.target = "_blank";
    link.download = objectKey; // Set the suggested file name
    link.click();
  };

  return (
    <CentredLayout title="Account Validation">
    <FormBox>
        <p className="text-center text-2xl">Exam Session Video Recordings</p>
        <a onClick={listS3Objects}>
          <BlackButton text="Refresh" />
        </a>
        <hr/>
        <div className="grid grid-cols-[1fr_auto] ">
          {objects.map((objectKey, index) => (
            <>
              <p key={index} className="font-bold text-lg">{objectKey}</p>
              <a onClick={() => downloadFile(objectKey)}>
                <BlackButton text="Download"/>
              </a>
            </>
          ))}
        </div>
    </FormBox>
   </CentredLayout>
  );
}
