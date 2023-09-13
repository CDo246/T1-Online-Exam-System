import React from "react";
import Webcam from "react-webcam";
import Dropdown from "./Dropdown";

const Camera = ():JSX.Element => {
    const [devices, setDevices] = React.useState<MediaDeviceInfo[] | []>([]);
    const [selectedDevice, setSelectedDevice] = React.useState<MediaDeviceInfo| null>(null);
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

    React.useEffect(
        () => {
            navigator.mediaDevices.enumerateDevices().then(handleDevices);
        },
        [handleDevices]
    );
    return (
    <div>
        <Webcam audio = {false} videoConstraints = {{deviceId: selectedDevice?.deviceId}}/>
        <Dropdown list = {devices} handler = {handleDropdown} />
    </div>
    )
}; 

export default Camera;