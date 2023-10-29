import { useEffect, useState, useCallback, useRef} from "react";
import Webcam from "react-webcam";
import Dropdown from "~/components/Dropdown";
import { BlackButton } from "./button";
import AWS from "aws-sdk";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { record } from "zod";

export default function Camera() {
  const [devices, setDevices] = useState<MediaDeviceInfo[] | []>([]);
  const [selectedDevice, setSelectedDevice] =
    useState<MediaDeviceInfo | null>(null);
  const [capturing, setCapturing] = useState<boolean>(false);
  const [captureCompleted, setCaptureCompleted] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [imageSegmenter, setImageSegmenter] = useState(null)
  const cameraRef = useRef<Webcam | null>(null);
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
  
  const addDeskImage = api.examSessions.addDeskImage.useMutation();
  const addLiveFeedImage = api.examSessions.addLiveFeedImage.useMutation();
  const analyseImage = api.externalAPIs.analyseImage.useMutation();
  //TODO: AWS UseQueries
  
  useEffect(() => { //List the media devices
    navigator.mediaDevices.enumerateDevices().then((mediaDevices: MediaDeviceInfo[]) => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
    });
  }, []);
    
  const handleStartCaptureClick = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: { deviceId: { exact: selectedDevice?.deviceId } },
        audio: true,
      })
      .then((stream: MediaStream) => {
        setCapturing(true);
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });
        mediaRecorderRef.current.addEventListener(
          "dataavailable",
          (event: BlobEvent) => {
            if (event.data.size > 0) {
              setRecordedChunks((prev: Blob[]) => prev.concat(event.data));
            }
          }
        );
        mediaRecorderRef.current.start();
      });
  };

  const handleStopCaptureClick = () => {
    mediaRecorderRef.current?.stop(); //Stopping this triggers an event listener that calls handleDataAvailable, which in turn triggers the use Effect above
    setCapturing(false);
    setCaptureCompleted(true);
  };

  const handleDownload = () => {
    if (recordedChunks.length) { 
      const url = URL.createObjectURL(new Blob(recordedChunks, {type: "video/webm"}));
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }

  const handleFirstCheck = async () => {
    console.log("Running AI Desk Approval");
    if (cameraRef.current) {
      const imageSrc = cameraRef.current.getScreenshot();
      if (imageSrc != null) {
        const passedAICheck = await analyseImage.mutateAsync({
          sessionId: studentDetails?.data?.sessionId ?? "",
          base64ImageData: imageSrc,
        });

        if (passedAICheck) alert("AI Check Passed");
        else alert("AI check failed. Try again, or request manual approval.");
      }
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!cameraRef.current || !studentDetails.data) return;
      const imageSrc = cameraRef.current.getScreenshot({width: 320, height: 200}) ?? ""; //TODO: Note - reduce image size once examiner page formatting is adjusted appropriately

      //TODO: Add background blurring here
      //https://www.youtube.com/watch?v=WmR9IMUD_CY TODO: Potential WebRTC Guide
      //TODO: Guide https://developers.google.com/mediapipe/solutions/vision/image_segmenter/web_js#video

      addLiveFeedImage.mutateAsync({
        sessionId: studentDetails.data.sessionId,
        image: imageSrc ?? "",
      });
    }, 1000);

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

  const handleUpload = () => {
    //Needs to be made async again if uncommented
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
  }

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

      {capturing ? (
        <div className="grid gap-y-2">
          <a onClick={handleStopCaptureClick}>
            <BlackButton text="Stop Capture" />
          </a>
        </div>
      ) : (
        (studentDetails.data?.deskAIApproved ??
          studentDetails.data?.deskManuallyApproved) &&
        !captureCompleted && (
          <>
            <Dropdown list={devices} handler={(newDeviceIndex: number) => setSelectedDevice(devices[newDeviceIndex] ?? null)}/>
            <a onClick={handleStartCaptureClick}>
              <BlackButton text="Start Capture" />
            </a>
          </>
        )
      )}
      {recordedChunks.length > 0 && captureCompleted && (
        <div className="grid gap-y-2">
          <a onClick={handleDownload}>
            <BlackButton text="Download" />
          </a>
          <a onClick={handleUpload}>
            <BlackButton text="Upload (Required to pass exam)" />
          </a>
        </div>
      )}
      {!studentDetails.data?.deskAIApproved &&
        !studentDetails.data?.deskManuallyApproved && (
          <a onClick={handleFirstCheck}>
            <BlackButton text="Analyse Image For AI Approval" />
          </a>
        )}
      {!studentDetails.data?.deskAIApproved &&
        !studentDetails.data?.deskManuallyApproved && (
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
        )}
    </div>
  );
}
