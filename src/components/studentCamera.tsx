import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import Dropdown from "~/components/Dropdown";
import { BlackButton } from "./button";
import AWS from "aws-sdk";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Camera() {
  const [devices, setDevices] = React.useState<MediaDeviceInfo[] | []>([]);
  const [selectedDevice, setSelectedDevice] =
    React.useState<MediaDeviceInfo | null>(null);
  const [capturing, setCapturing] = React.useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[] | []>([]);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const cameraRef = React.useRef<Webcam | null>(null);
  const router = useRouter();

  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/");
    },
  });

  const studentDetails = api.students.getStudentSession.useQuery({
    email: session ? session.user.email ?? "" : "",
    uniqueCode: useSearchParams().get("sessionCode") ?? "",
  });

  const addDeskImage = api.examSessions.addDeskImage.useMutation();
  const addLiveFeedImage = api.examSessions.addLiveFeedImage.useMutation();

  //TODO: AWS/Google Query UseQueries
  const analyseImage = api.externalAPIs.analyseImage.useMutation()

  useEffect(() => {
    // Log initial examSessions
    console.log(studentDetails.data);
  }, [studentDetails.data]);

  const handleDevices = React.useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
      //console.log("List", mediaDevices.filter(({ kind }) => kind === "videoinput"))
    },
    [setDevices]
  );

  const handleDropdown = React.useCallback(
    (newDeviceIndex: number) => {
      setSelectedDevice(devices[newDeviceIndex] ?? null);
      // console.log(devices); //Something weird about the memory here idk
      console.log(devices[newDeviceIndex]);
    },
    [setSelectedDevice]
  );

  const handleStartCaptureClick = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: { exact: selectedDevice?.deviceId } },
        audio: true,
      })
      .then(handleStream);
  };

  const handleStream = React.useCallback(
    (stream: MediaStream) => {
      setCapturing(true);
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
      // console.log(stream);
      // console.log(stream.getTracks().filter(({label}) => label == selectedDevice?.label));
    },
    [setCapturing, mediaRecorderRef]
  );

  const handleDataAvailable = React.useCallback(
    (event: BlobEvent) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev: Blob[]) => prev.concat(event.data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = React.useCallback(() => {
    mediaRecorderRef.current?.stop();
    setCapturing(false);
  }, [mediaRecorderRef, selectedDevice, setCapturing]);

  const handleDownload = React.useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const handleFirstCheck = React.useCallback(async () => {
    console.log("Running AI Desk Approval")
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.getScreenshot();
      if (imageSrc != null) {
        console.log("TEST")
        const imageLabels = await analyseImage.mutateAsync({ //TODO: Complete
          sessionId: studentDetails?.data?.sessionId ?? "",
          base64ImageData: imageSrc
        })

        //THIS should be irrelevant
        if (imageLabels)  {
          console.log("AI Passed");
/*           await passAICheck.mutateAsync({
            sessionId: studentDetails.data.sessionId,
          }); */
          console.log("Mutated");
        } else {
          console.log("AI Failed");
          alert("AI check failed. Try again, or request manual approval.");
        }
      }
      console.log("Desk AI Approval end")
      // setImgSrc(imageSrc);
    }
  }, [cameraRef]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (!cameraRef.current || !studentDetails.data) return;
      const imageSrc = cameraRef.current.getScreenshot() ?? "";
      addLiveFeedImage.mutateAsync({
        sessionId: studentDetails.data.sessionId,
        image: imageSrc ?? "",
      });
    }, 100000);

    return () => {
      clearInterval(intervalId);
    };
  }, [studentDetails.data]);

  //const AWS = require("aws-sdk");
  const config = {
    accessKeyId: "",
    secretAccessKey: "",
    region: "ap-southeast-2",
  };
  AWS.config.update(config);
  const client = new AWS.S3({ params: { Bucket: "online-anti-cheat" } });
  const handleUpload = React.useCallback(async () => {
    mediaRecorderRef.current?.stop();
    setCapturing(false);

    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    const formData = new FormData();
    formData.append("video", blob, "video.webm");
    await client
      .putObject({
        Body: blob,
        Bucket: "online-anti-cheat",
        Key: "video33.webm",
        //ContentType: "video/webm",
      })
      .promise();
  }, [mediaRecorderRef, selectedDevice, recordedChunks]);

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <div className="flex max-h-full min-h-full flex-col gap-2 overflow-y-auto">
      <div className="max-h-full flex-1 overflow-y-auto">
        <Webcam
          audio={false}
          videoConstraints={{ deviceId: selectedDevice?.deviceId }}
          ref={cameraRef}
          className="max-h-[50vh] w-full object-contain"
        />
      </div>

      {capturing ? (
        <div>
          <a onClick={handleStopCaptureClick}>
            <BlackButton text="Stop Capture" />
          </a>
          <a onClick={handleUpload}>
            <BlackButton text="Stop and Upload Capture" />
          </a>
        </div>
      ) : (
        <>
          <Dropdown list={devices} handler={handleDropdown} />
          <a onClick={handleStartCaptureClick}>
            <BlackButton text="Start Capture" />
          </a>
        </>
      )}
      {recordedChunks.length > 0 && (
        <a onClick={handleDownload}>
          <BlackButton text="Download" />
        </a>
      )}
      <a onClick={handleFirstCheck}>
        <BlackButton text="Analyse Image For AI Approval" />
      </a>
      <a
        onClick={async () => {
          if (!cameraRef.current || !studentDetails.data) return;
          const imageSrc = cameraRef.current.getScreenshot();
          console.log(imageSrc);
          await addDeskImage.mutateAsync({
            sessionId: studentDetails.data.sessionId,
            deskImage: imageSrc ?? "",
          });
        }}
      >
        <BlackButton text="Request Manual Approval" />
      </a>
    </div>
  );
};
