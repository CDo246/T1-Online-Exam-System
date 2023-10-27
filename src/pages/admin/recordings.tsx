import Link from "next/link";
import { FormBox } from "~/components/boxes";
import { BlackBackButton, BlackButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";
import { useState } from "react";
import AWS from "aws-sdk";
import { api } from "~/utils/api";

export default function Recordings() {
  //function that retrieves all 0bjects in s3 bucket
  const [objects, setObjects] = useState<string[]>([]);
  const { data } = api.externalAPIs.listRecordings.useQuery();

  // const config = {
  //   accessKeyId: '',
  //   secretAccessKey: '',
  // region: 'ap-southeast-2',
  // }

  //   AWS.config.update(config);
  //   const client = new AWS.S3({ params: { Bucket: "online-anti-cheat" } });

  //list all files
  const listS3Objects = () => {
    try {
      if (data) {
        const s3Objects = data.s3Objects;
        setObjects(s3Objects);
      }
    } catch (error) {
      console.error("Error listing S3 objects:", error);
    }
  };

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
    <div>
      <a onClick={listS3Objects}>
        <BlackButton text="refresh" />
      </a>
      <h1>Exam Session Video Recordings</h1>
      <ul>
        {objects.map((objectKey, index) => (
          <li key={index}>
            <a onClick={() => downloadFile(objectKey)}>{objectKey}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
