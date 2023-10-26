import React, { useEffect, useState } from "react";
import Webcam from "react-webcam";
import Dropdown from "./Dropdown";
import CloudVision from "./CloudVision";
import { type } from "os";
import { BlackButton } from "./button";
import { DropdownField } from "./input";
import AWS from "aws-sdk";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";

const Camera = (): JSX.Element => {
  const [devices, setDevices] = React.useState<MediaDeviceInfo[] | []>([]);
  const [selectedDevice, setSelectedDevice] =
    React.useState<MediaDeviceInfo | null>(null);
  const [capturing, setCapturing] = React.useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[] | []>([]);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const cameraRef = React.useRef<Webcam | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);

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
  const passAICheck = api.examSessions.passAICheck.useMutation();
  const addDeskImage = api.examSessions.addDeskImage.useMutation();
  const addLiveFeedImage = api.examSessions.addLiveFeedImage.useMutation();

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

  const handleBlur = () => {
    canvasRef.current.width = cameraRef.current.video.videoWidth;
    canvasRef.current.height = cameraRef.current.video.videoHeight;
    contextRef.current = canvasRef.current.getContext("2d");

    console.log("Setting up new face tracking");
    const selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
      },
    });

    selfieSegmentation.setOptions({
      modelSelection: 1,
      selfieMode: false,
    });

    selfieSegmentation.onResults(onResults);
    const sendToMediaPipe = async () => {
      cameraRef.current = cameraRef.current; //I DO NOT KNOW WHY BUT WE NEED THIS LINE
      if (!cameraRef.current.video.videoWidth) {
        requestAnimationFrame(sendToMediaPipe);
      } else {
        await selfieSegmentation.send({ image: cameraRef.current.video });
        requestAnimationFrame(sendToMediaPipe);
      }
    };
    sendToMediaPipe(); //Start loop
  };
  const handleDropdown = React.useCallback(
    (newDeviceIndex: number) => {
      setSelectedDevice(devices[newDeviceIndex] ?? null);

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

  let labels;
  const [imgSrc, setImgSrc] = useState(null);

  const visionAPI = new CloudVision();
  const [sus, setSus] = useState<boolean>(false);
  const handleAnalyse = React.useCallback(async () => {
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.getScreenshot();
      if (imageSrc != null) {
        const imageLabels = await visionAPI.analyseImage(imageSrc);
        labels = imageLabels;
        console.log(imageLabels);
        if (imageLabels.some((obj) => obj === "Gadget")) {
          //This was obj.division ===... but this was throwing an error
          setSus(true);
          alert("SUS DETECTED");
        } else {
          setSus(false);
        }
      }

      // setImgSrc(imageSrc);
    }
  }, [cameraRef]);

  const handleFirstCheck = React.useCallback(async () => {
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.getScreenshot();
      if (imageSrc != null) {
        const imageLabels = await visionAPI.analyseImage(imageSrc);
        labels = imageLabels;
        console.log(imageLabels);

        if (
          imageLabels.some((obj: any) => obj.description === "Gadget") ||
          imageLabels.some((obj: any) => obj.description === "Mobile phone") ||
          imageLabels.some(
            (obj: any) => obj.description === "Tablet computer"
          ) ||
          imageLabels.some(
            (obj: any) => obj.description === "Communication Device"
          ) ||
          imageLabels.some(
            (obj: any) =>
              obj.description === "Mobile device" ||
              imageLabels.some((obj: any) => obj.description === "Mobile phone")
          ) ||
          !studentDetails.data
        ) {
          console.log("AI Failed");
          alert("AI check failed. Try again, or request manual approval.");
        } else {
          console.log("AI Passed");
          await passAICheck.mutateAsync({
            sessionId: studentDetails.data.sessionId,
          });
          console.log("Mutated");
        }
      }

      // setImgSrc(imageSrc);
    }
  }, [cameraRef]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      //handleAnalyse(); TODO: Reenable
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [handleAnalyse]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      if (!cameraRef.current || !studentDetails.data) return;
      const imageSrc = cameraRef.current.getScreenshot() ?? "";
      addLiveFeedImage.mutateAsync({
        sessionId: studentDetails.data.sessionId,
        image: imageSrc ?? "",
      });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [handleAnalyse, studentDetails.data]);

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

  const onResults = (results) => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.save();
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      contextRef.current.drawImage(
        results.segmentationMask,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      //only overwrite existing pixels
      contextRef.current.globalCompositeOperation = "source-out";
      contextRef.current.fillStyle = "#000000";
      contextRef.current.fillRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      //only overwrite missing pixels
      contextRef.current.globalCompositeOperation = "destination-atop";
      contextRef.current.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      contextRef.current.restore();
    }
  };
  //add a button where one click predictWebcam
  return (
    <div className="flex max-h-full min-h-full flex-col gap-2 overflow-y-auto">
      <div className="max-h-full flex-1 overflow-y-auto">
        <Webcam
          audio={false}
          videoConstraints={{ deviceId: selectedDevice?.deviceId }}
          ref={cameraRef}
          className="absolute max-h-[50vh] w-full object-contain"
        />
        <canvas
          ref={canvasRef}
          className=" absolute max-h-[50vh] w-full object-contain"
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
      <a onClick={handleBlur}>
        <BlackButton text="Blur" />
      </a>
      <a
        onClick={async () => {
          console.log("TODO");
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
      {sus && (
        <div>
          <label>WARNING: Suspicious Activity Detected</label>
        </div>
      )}
    </div>
  );
};

export default Camera;
