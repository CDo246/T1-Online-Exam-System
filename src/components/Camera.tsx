import React, { useState } from "react";
import Webcam from "react-webcam";
import Dropdown from "./Dropdown";
import CloudVision from "./CloudVision";
import { type } from "os";
import { BlackButton } from "./button";
import { DropdownField } from "./input";

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

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <div className="flex flex-col max-h-full min-h-full overflow-y-auto gap-2">
      <div className="flex-1 max-h-full overflow-y-auto">
        <Webcam
          audio={false}
          videoConstraints={{ deviceId: selectedDevice?.deviceId }}
          ref={cameraRef}
          className="w-full max-h-[50vh] object-contain"
        />
      </div>

      {capturing ? (
        <a onClick={handleStopCaptureClick}>
          <BlackButton text="Stop Capture"/>
        </a>
      ) : (
        <>
          <Dropdown list={devices} handler={handleDropdown} />
          <a onClick={handleStartCaptureClick}>
            <BlackButton text="Start Capture"/>
          </a>
        </>
      )}
      {recordedChunks.length > 0 && (
        <a onClick={handleDownload}>
          <BlackButton text="Download"/>
        </a>
      )}

      <a onClick={handleAnalyse}>
        <BlackButton text="Analyse Image"/>
      </a>
      {imgSrc && <img src={imgSrc} />}

      {labels && <p>{labels[0]}</p>}
    </div>
  );
};

export default Camera;
