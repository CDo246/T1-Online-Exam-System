import React from "react";
import Webcam from "react-webcam";
import Dropdown from "./Dropdown";

const Camera = ():JSX.Element => {
    const [devices, setDevices] = React.useState<MediaDeviceInfo[] | []>([]);
    const [selectedDevice, setSelectedDevice] = React.useState<MediaDeviceInfo| null>(null);
    const [capturing, setCapturing] = React.useState<boolean>(false);
    const [recordedChunks, setRecordedChunks] = React.useState<Blob[] | []>([]);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

    const handleDevices = React.useCallback(
        (mediaDevices: MediaDeviceInfo[]) =>{
            setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"))
            //console.log("List", mediaDevices.filter(({ kind }) => kind === "videoinput"))
        },
            [setDevices] 
            
    );

    const handleDropdown = React.useCallback(
        (newDeviceIndex: number) =>{
            setSelectedDevice(devices[newDeviceIndex] ?? null)
            // console.log(devices); //Something weird about the memory here idk
            console.log(devices[newDeviceIndex]);
        },
            [setSelectedDevice]
    );
    
    const handleStartCaptureClick = () => {
        navigator.mediaDevices.getUserMedia({video: {deviceId: {exact: selectedDevice?.deviceId}}, audio:true}).then(handleStream)
    };

    const handleStream = React.useCallback(
        (stream: MediaStream) =>{
            setCapturing(true);
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: "video/webm"
            });
            mediaRecorderRef.current.addEventListener(
                "dataavailable", handleDataAvailable
            );
            mediaRecorderRef.current.start();
            // console.log(stream);
            // console.log(stream.getTracks().filter(({label}) => label == selectedDevice?.label));
        },
        [setCapturing, mediaRecorderRef]
    );

    const handleDataAvailable = React.useCallback(
        (event: BlobEvent) =>{
            if (event.data.size > 0){
                setRecordedChunks((prev: Blob[]) => prev.concat(event.data));
            }
        },
        [setRecordedChunks]
    );

    const handleStopCaptureClick = React.useCallback(
        () => {
            mediaRecorderRef.current?.stop();
            setCapturing(false);
        },
        [mediaRecorderRef, selectedDevice, setCapturing]
    );

    const handleDownload = React.useCallback(
        () => {
            if(recordedChunks.length) {
                const blob = new Blob(recordedChunks, {
                    type: "video/webm"   
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
        },
        [recordedChunks]
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
        {capturing ? (
            <button onClick = {handleStopCaptureClick}> Stop Capture</button>
        ) : (
            <div>
                <Dropdown list = {devices} handler = {handleDropdown} />
                <button onClick = {handleStartCaptureClick}>Start Capture</button>
            </div>
        )}
        {recordedChunks.length > 0 && (
            <button onClick = {handleDownload}>Download</button>
        )}
    </div>
    )
}; 

export default Camera;