import Link from "next/link";
import { FormBox } from "~/components/boxes";
import { BlackBackButton, BlackButton } from "~/components/button";
import { CentredLayout } from "~/components/layouts";
import { useState } from "react";
import AWS from "aws-sdk";

export default function Recordings() {
    //function that retrieves all 0bjects in s3 bucket
    const [objects, setObjects] = useState<string []>([]);

    const config = {
	    accessKeyId: '',
	    secretAccessKey: '',
    region: 'ap-southeast-2',
    }

      AWS.config.update(config);
      const client = new AWS.S3({ params: { Bucket: "online-anti-cheat" } });

      const listS3Objects = async () => {
        try {
          const response = await client.listObjectsV2().promise();
          const objects = (response.Contents || []) as { Key: string }[];
          const s3Objects = objects.map((object) => object.Key);
          setObjects(s3Objects);
        } catch (error) {
          console.error("Error listing S3 objects:", error);
        }
      };

  return (
    <div>
        <a onClick={listS3Objects}>
            <BlackButton text="refresh" />
          </a>
      <h1>List of S3 Objects</h1>
      <ul>
        {objects.map((objectKey, index) => (
          <li key={index}>
            <Link href={`/s3/${objectKey}`}>{objectKey}</Link>
          </li>
        ))}
      </ul>
    
    <p>TESTING</p>
    </div>
    
  );
}