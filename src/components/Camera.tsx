import React, { useState } from "react";
import Webcam from "react-webcam";
import Dropdown from "./Dropdown";
import CloudVision from "./CloudVision";
import { type } from "os";
//import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const Camera = (): JSX.Element => {
  const [devices, setDevices] = React.useState<MediaDeviceInfo[] | []>([]);
  const [selectedDevice, setSelectedDevice] =
    React.useState<MediaDeviceInfo | null>(null);
  const [capturing, setCapturing] = React.useState<boolean>(false);
  const [recordedChunks, setRecordedChunks] = React.useState<Blob[] | []>([]);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const cameraRef = React.useRef<Webcam | null>(null);

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

  let labels;
  const [imgSrc, setImgSrc] = useState(null);

  const visionAPI = new CloudVision();
  const screencaptureLabels: string[] = [];
  const handleAnalyse = React.useCallback(async () => {
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.getScreenshot();
      if (imageSrc != null) {
        const imageLabels = await visionAPI.analyseImage(imageSrc);
        labels = imageLabels;
      }

      // setImgSrc(imageSrc);
    }
  }, [cameraRef]);

  const AWS = require('aws-sdk');
  const config = {
    accessKeyId: 'MyKey',
    secretAccessKey: 'MyKey',
    region: 'ap-southeast-2',
  }
  AWS.config.update(config);
  //const tmpCred = new SessionAWSCredentials();
  const client = new AWS.S3({params : {Bucket: 'online-anti-cheat'}});
    const handleUpload = React.useCallback(async () => {

      mediaRecorderRef.current?.stop();
      setCapturing(false);
  
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const formData = new FormData();
      formData.append('video', blob, 'video.webm');
      await client.putObject({
        Body: blob,
        Bucket: "online-anti-cheat",
        Key: "video.webm",
      }).promise();

    // const command = new PutObjectCommand({
    //   Bucket: "online-anti-cheat",
    //   Key: "hello-s3.txt",
    //   Body: "Sample file upload",
    // });
    
    // try {
    //   const response = await client.send(command).promise();
    //   alert("success");
    //   console.log(response);
    // } catch (err) {
    //   console.error(err);
    // }

  }, [mediaRecorderRef, selectedDevice, recordedChunks])

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <div>
      <Webcam
        audio={false}
        videoConstraints={{ deviceId: selectedDevice?.deviceId }}
        ref={cameraRef}
      />
      {capturing ? (
        <div>
          <button onClick={handleStopCaptureClick}> Stop Capture</button>
          <button onClick={handleUpload}>Stop and Upload</button>
        </div>
        
      ) : (
        <div>
          <Dropdown list={devices} handler={handleDropdown} />
          <button onClick={handleStartCaptureClick}>Start Capture</button>
        </div>
      )}
      {recordedChunks.length > 0 && (
        <button onClick={handleDownload}>Download</button>
      )}

      <button onClick={handleAnalyse}>Analyse image</button>
      {imgSrc && <img src={imgSrc} />}

      {labels && <p>{labels[0]}</p>}
    </div>
  );
};

export default Camera;
