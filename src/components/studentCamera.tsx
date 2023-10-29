import { useEffect, useState, useCallback, useRef} from "react";
import Webcam from "react-webcam";
import Dropdown from "~/components/Dropdown";
import { BlackButton } from "./button";
import AWS from "aws-sdk";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { record } from "zod";
import { Results, SelfieSegmentation } from "@mediapipe/selfie_segmentation";

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

  //Blurring-Related content
  const [blurring, setBlurring] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const videoRef = useRef<Webcam["video"] | null>(null);
  
  
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
  const uploadVideo = api.externalAPIs.uploadVideo.useMutation();
  const uploadPresignedVideo = api.externalAPIs.uploadPresignedVideo.useMutation();
  
  const handleBlur = () => {
    console.log("Blurring")
    if (cameraRef.current) {
      videoRef.current = cameraRef.current.video;
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        contextRef.current = canvasRef.current.getContext("2d");
        setBlurring(true);
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

        selfieSegmentation.onResults(onBlurResults);
        const sendToMediaPipe = async () => {
          cameraRef.current = cameraRef.current; //I DO NOT KNOW WHY BUT WE NEED THIS LINE
          if (!videoRef.current) {
            requestAnimationFrame(sendToMediaPipe);
          } else {
            await selfieSegmentation.send({ image: videoRef.current });
            requestAnimationFrame(sendToMediaPipe);
          }
        };
        sendToMediaPipe(); //Start loop
      }
    }
  };

  const onBlurResults = (results: Results) => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.save();

      //Creates an empty rectangle
      contextRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      //Draws an image where red indicates a person, and transparent indicates the background
      contextRef.current.drawImage( 
        results.segmentationMask,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      //Makes any non-transparent pixel black
      contextRef.current.globalCompositeOperation = "source-out"; //Source-Out :The new shape is drawn where it doesn't overlap the existing canvas content.
      contextRef.current.fillStyle = "#000000";
/*       contextRef.current.fillRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      ); */
      contextRef.current.filter = "blur(40px)"
      contextRef.current.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      contextRef.current.filter = "blur(0px)"
      //only overwrite missing pixels
      contextRef.current.globalCompositeOperation = "destination-atop"; //Only draws on transparent pixels
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
      const downloadBlob = new Blob(recordedChunks, {type: "video/webm"})
      console.log(downloadBlob)
      const url = URL.createObjectURL(downloadBlob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  }
  
  const handleUpload = async () => {
    console.log(recordedChunks)
    const uploadChunks = await new Blob(recordedChunks, {type: "video/webm"}).text()
    
    const presignedData = await uploadPresignedVideo.mutateAsync({
      userEmail: session?.user.email ?? "",
      sessionId: studentDetails?.data?.sessionId ?? "",
    })
    console.log(presignedData)
    const data: any = {
      ...presignedData.fields,
/*       "Content-Type": "video/webm", */
/*       uploadChunks, */
    }
    console.log(data)

    const formData = new FormData();
    for(const name in data) formData.append(name, data[name])

    const res = await fetch(presignedData.url, {
      method: 'POST',
      body: formData,
    })
    console.log(res)

    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    //formData.append('video', blob, 'video.webm');
    


/*     uploadVideo.mutateAsync({
      userEmail: session?.user.email ?? "",
      sessionId: studentDetails?.data?.sessionId ?? "",
      videoFile: uploadChunks,
    }) */

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
      const imageSrc = canvasRef.current ?
        canvasRef.current.toDataURL("image/wepb", 0.3)
        :
        cameraRef.current.getScreenshot({width: 320, height: 200}) ?? ""; //TODO: Note - reduce image size once examiner page formatting is adjusted appropriately
      addLiveFeedImage.mutateAsync({
          sessionId: studentDetails.data.sessionId,
          image: imageSrc ?? "",
        });
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [studentDetails.data]);

  return (
    <div className="flex max-h-full min-h-full flex-col gap-2 overflow-y-auto">
      <div className="max-h-full flex-1 overflow-y-auto">
        <Webcam
          audio={false}
          videoConstraints={{ deviceId: selectedDevice?.deviceId }}
          ref={cameraRef}
          className="max-h-[50vh] w-full object-contain"
        />
        <canvas
          ref={canvasRef}
          className="max-h-[50vh] w-full object-contain"
        />
      </div>
      <a id="Blur" onClick={handleBlur}>
        <BlackButton text="Blur" />
      </a>
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
