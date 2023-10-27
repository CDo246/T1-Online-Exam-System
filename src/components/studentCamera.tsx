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
  const [captureCompleted, setCaptureCompleted] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[] | []>([]);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const cameraRef = React.useRef<Webcam | null>(null);
  const router = useRouter();
  let [videoData, setVideoData] = React.useState<any>(null); //TODO: Consider fixing any

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

  //TODO: AWS UseQueries
  const analyseImage = api.externalAPIs.analyseImage.useMutation()

  const handleDevices = React.useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
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

  //Updates videoData
  useEffect(() => {
    console.log("Updating video data")
    setVideoData(new Blob(recordedChunks, {
      type: "video/webm",
    }))
  }, [recordedChunks])

  const handleStopCaptureClick = () => {
    mediaRecorderRef.current?.stop(); //Stopping this triggers an event listener that calls handleDataAvailable, which in turn triggers the useEffect above
    setCapturing(false);
    setCaptureCompleted(true);
  }

  const handleDownload = React.useCallback(() => {
    if (recordedChunks.length) {
      const url = URL.createObjectURL(videoData);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      //setRecordedChunks([]); TODO: This has been disabed to stop button from disappearing
    }
  }, [recordedChunks]);

  const handleFirstCheck = async () => {
    console.log("Running AI Desk Approval")
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.getScreenshot();
      if (imageSrc != null) {
        console.log("SessionID")
        console.log(await studentDetails?.data)
        const passedAICheck = await analyseImage.mutateAsync({ //TODO: Complete
          sessionId: studentDetails?.data?.sessionId ?? "",
          base64ImageData: imageSrc
        })

        if (passedAICheck) alert("AI Check Passed")
        else alert("AI check failed. Try again, or request manual approval.")
      }
      console.log("Desk AI Approval end")
      // setImgSrc(imageSrc);
    }
  };

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
    console.log(videoData)
/*     const formData = new FormData();
    formData.append("video", blob, "video.webm");
    await client
      .putObject({
        Body: blob,
        Bucket: "online-anti-cheat",
        Key: "video33.webm",
        //ContentType: "video/webm",
      })
      .promise(); */
  }, [mediaRecorderRef, selectedDevice, recordedChunks, videoData]);

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

      {capturing ? 
        <div className="grid gap-y-2">
          <a onClick={handleStopCaptureClick}>
            <BlackButton text="Stop Capture" />
          </a>
        </div>
       : 
        (studentDetails.data?.deskAIApproved || studentDetails.data?.deskManuallyApproved) && !captureCompleted && <>
          <Dropdown list={devices} handler={handleDropdown} />
          <a onClick={handleStartCaptureClick}>
            <BlackButton text="Start Capture" />
          </a>
        </>
      }
      {recordedChunks.length > 0 && captureCompleted && (
        <div> 
          <a onClick={handleDownload}>
            <BlackButton text="Download" />
          </a>
          <a onClick={handleUpload}>
            <BlackButton text="Upload (Required to pass exam)"/>
          </a>
        </div>
      )}
      {!studentDetails.data?.deskAIApproved && !studentDetails.data?.deskManuallyApproved && <a onClick={handleFirstCheck}>
        <BlackButton text="Analyse Image For AI Approval" />
      </a>}
      {
        !studentDetails.data?.deskAIApproved && !studentDetails.data?.deskManuallyApproved &&
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
      }
    </div>
  );
};
