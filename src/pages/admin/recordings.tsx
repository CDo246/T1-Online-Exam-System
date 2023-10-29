import Link from "next/link";
import { FormBox } from "~/components/boxes";
import { BlackBackButton, BlackButton } from "~/components/button";
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

  console.log(objects)

  //download file with objectKey
  const downloadFile = async (objectKey: string) => {


    console.log("Downloading:")
    const bucketName = "online-anti-cheat";
    const res = await fetch(`https://${bucketName}.s3.amazonaws.com/${objectKey}`)
    console.log(res.body)
    const newRes = await streamToString(res.body)
    console.log(newRes)
    const blob = new Blob([newRes], {type: "video/webm"})
    console.log(blob)

    console.log("true")
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = "react-webcam-stream-capture.webm";
    a.click();
    window.URL.revokeObjectURL(url);
    

    const link = document.createElement("a");
    link.href = `https://${bucketName}.s3.amazonaws.com/${objectKey}`;
    link.target = "_blank";
    link.download = objectKey; // Set the suggested file name
    link.click();
  };

  async function streamToString(stream: any) {
    const reader = stream.getReader();
    const textDecoder = new TextDecoder();
    let result = '';
  
    async function read() {
      const { done, value } = await reader.read();
  
      if (done) {
        return result;
      }
  
      result += textDecoder.decode(value, { stream: true });
      return read();
    }
  
    return read();
  }

  return (
    <CentredLayout title="Account Validation">
    <FormBox>
        <Link href="/account">
          <BlackBackButton />
        </Link>
        <hr/>
        <p className="text-center text-2xl">Exam Session Video Recordings</p>
        <a onClick={listS3Objects}>
          <BlackButton text="Refresh" />
        </a>
        <br/>
        <div className="grid grid-cols-[1fr_auto] gap-y-1">
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
