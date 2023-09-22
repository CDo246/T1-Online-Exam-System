import React, { useState } from "react";
import Webcam from "react-webcam";
import Dropdown from "./Dropdown";
import CloudVision from "./CloudVision";
import { type } from "os";
import { BlackBackButton, BlackButton } from "~/components/button";
import { gcs } from 'gcs';

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
    console.log("EGEWGE");
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
    // if (recordedChunks.length) {
    //   const blob = new Blob(recordedChunks, {
    //     type: "video/webm",
    //   });
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement("a");
    //   document.body.appendChild(a);
    //   a.href = url;
    //   a.download = "react-webcam-stream-capture.webm";
    //   a.click();
    //   window.URL.revokeObjectURL(url);
    //   setRecordedChunks([]);
    // }
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

  // React.useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     handleAnalyse();
  //   }, 5000);

  //   return () => {
  //     clearInterval(intervalId);
  //   };
  // }, [handleAnalyse]); 
  
  //const { Storage } = require('@google-cloud/storage');
  //const storage = window.gcs.GoogleCloud
  const bucketName = "online-exam-system-videostorage";
  // const apiKey = '';
  // const storage = new Storage({
  //   projectId: 'hidden-outrider-398205',
  //   credentials: require(apiKey)
  // });
  // const handleCompleteSession = React.useCallback(async () => {
  //   mediaRecorderRef.current?.stop();
  //   setCapturing(false);
  //   if(recordedChunks.length){
  //     const blob = new Blob(recordedChunks, {
  //       type: "video/webm",
  //     });
  //     const fileBuffer = Buffer.from(await blob.arrayBuffer());
      
  //     const date = new Date();
  //     const currentTime = date.getHours() + date.getMinutes() + date.getSeconds() + date.getDay() + date.getMonth();
  //     storage.bucket(bucketName).file(currentTime.toString()).createWriteStream({
  //       metadata: {
  //         contentType: "video/webm",
  //       },
  //     }).on('error', function(err) {
  //       console.log(err);
  //     }).on('finish', function() {
  //       console.log('File uploaded successfully.');
  //     }).end(fileBuffer);
  //   }
  // }, [mediaRecorderRef, selectedDevice, setCapturing, recordedChunks])

  // React.useEffect(() => {
  //   navigator.mediaDevices.enumerateDevices().then(handleDevices);
  // }, [handleDevices]);

  const handleTestUpload = React.useCallback(async () => {
    console.log("OEUFO");
    mediaRecorderRef.current?.stop();
    setCapturing(false);
    console.log("FIRST");
    if(recordedChunks.length){
      const blob = new Blob(recordedChunks, {
        type: "video/mp4",
      });
      const formData = new FormData();
    formData.append('video/mp4', blob);
    

    
      fetch("/api/uploadvideo", {
        method: "POST",
        headers: {
          "Content-Type": "video/mp4",  
        },
        body: formData,
      }).then((res) => console.log(res));
    alert("success");

    }
  }, [mediaRecorderRef, selectedDevice, setCapturing, recordedChunks])

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
          <button onClick={handleTestUpload}>TestUpload</button>
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
