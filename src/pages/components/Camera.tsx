import React, { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import Dropdown from "./Dropdown";

const Camera = (): JSX.Element => {
  const [devices, setDevices] = React.useState<MediaDeviceInfo[] | []>([]);
  const [selectedDevice, setSelectedDevice] =
    React.useState<MediaDeviceInfo | null>(null);
  const handleDevices = React.useCallback(
    (mediaDevices: MediaDeviceInfo[]) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
    [setDevices]
  );

  const handleDropdown = React.useCallback(
    (newDeviceIndex: number) =>
      setSelectedDevice(devices[newDeviceIndex] ?? null),
    [setSelectedDevice]
  );

  React.useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  const cameraRef = useRef<any>();
  const [imgSrc, setImgSrc] = useState();

  const capture = React.useCallback(async () => {
    const imgSrc = await cameraRef.current.getScreenshot();
    setImgSrc(imgSrc);
  }, [cameraRef]);

  return (
    <div>
      <Webcam
        audio={false}
        videoConstraints={{ deviceId: selectedDevice?.deviceId }}
        mirrored={true}
      />
      <Dropdown list={devices} handler={handleDropdown} />
    </div>
  );
};

export default Camera;
