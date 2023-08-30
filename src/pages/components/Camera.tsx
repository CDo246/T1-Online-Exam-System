import React from "react";
import Webcam from "react-webcam";
import Dropdown from "./Dropdown";

const Camera = ():JSX.Element => {
    const [deviceId, setDeviceId] = React.useState<number | null>(null);
    const [devices, setDevices] = React.useState<MediaDeviceInfo[] | []>([]);
    //const [selectedDevice, setSelectedDevice] = React.useState<MediaDeviceInfo| null>(null);
    const deviceSelected = React.useRef<MediaDeviceInfo|null>(null); //use ref doesnt refresh upon changing source of bug
    const handleDevices = React.useCallback(
        (mediaDevices: MediaDeviceInfo[]) =>
            setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
            [setDevices] 
    );

    const handleDropdown = React.useCallback(
        (newDeviceIndex: number) =>
            //setSelectedDevice(devices[newDeviceIndex]);
            deviceSelected.current = devices[newDeviceIndex], 
            [deviceSelected]
    );

    React.useEffect(
        () => {
            navigator.mediaDevices.enumerateDevices().then(handleDevices);
        },
        [handleDevices]
    );
    return (
    <div>
        <Webcam audio = {false} videoConstraints = {{deviceId: deviceSelected.current?.deviceId}}/>
        <Dropdown list = {devices} handler = {handleDropdown} />
    </div>
    )
}; 

export default Camera;