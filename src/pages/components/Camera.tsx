import React from "react";
import Webcam from "react-webcam";

const Camera = ():JSX.Element => {
    const [deviceId, setDeviceId] = React.useState<number | null>(null);
    const [devices, setDevices] = React.useState<MediaDeviceInfo[] | []>([]);

    const handleDevices = React.useCallback(
        (mediaDevices: MediaDeviceInfo[]) =>
            setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput")),
            [setDevices]
    );
    React.useEffect(
        () => {
            navigator.mediaDevices.enumerateDevices().then(handleDevices);
        },
        [handleDevices]
    );
    return (
    <div>
        {devices.map((device, key) => (
            <div>
             <Webcam audio={false} videoConstraints={{ deviceId: device.deviceId }} />
             {device.label || `Device ${key + 1}`}
           </div>
        ))}
    </div>
    )
}; 

export default Camera;