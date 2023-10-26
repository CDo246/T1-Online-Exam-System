import * as cam from "@mediapipe/camera_utils";
import * as mediapipePose from "@mediapipe/pose";
import React, { useEffect, useRef } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Pose } from "@mediapipe/pose";
import Webcam from 'react-webcam'
const UserPose = () => {
    // refs to the html elements
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const landmarkRef = useRef(null);
    // landmarkRef = new LandmarkGrid(landmarkContainer);
    let camera = null; // variable to initialize the camera
    // function to draw the landmarks once the pose has been determnined
    function onResults(results) {
        // Define the canvas elements
        canvasRef.current.width = webcamRef.current.video.videoWidth
        canvasRef.current.height = webcamRef.current.video.videoHeight
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext("2d")
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image,
            0,
            0,
            canvasElement.width,
            canvasElement.height
        )
        drawConnectors(canvasCtx,
            results.poseLandmarks, mediapipePose.POSE_CONNECTIONS,
            { color: '#3240CF', lineWidth: 2 });
        // The dots are the landmarks
        drawLandmarks(canvasCtx, results.poseLandmarks,
            { color: 'red', lineWidth: 2, radius: 3 });
        canvasCtx.restore();
    }
    useEffect(() => {
        const userPose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
            },
        });
        userPose.setOptions({
            maxNumFaces: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
        userPose.onResults(onResults);
        if (
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null
        ) {
            camera = new cam.Camera(webcamRef.current.video, {
                onFrame: async () => {
                    await userPose.send({ image: webcamRef.current.video });
                },
                width: 1280,
                height: 720,
            });
            camera.start();
        }
    }, []);
    return <div>
        <div className="App">
            <Webcam
                ref={webcamRef}
                style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zindex: 9,
                    width: 1280,
                    height: 720,
                }}
            />{" "}
            <canvas
                ref={canvasRef}
                style={{
                    position: "absolute",
                    marginLeft: "auto",
                    marginRight: "auto",
                    left: 0,
                    right: 0,
                    textAlign: "center",
                    zindex: 9,
                    width: 1280,
                    height: 720,
                }}
            ></canvas>
            <div className="landmark-grid-container"></div>
        </div>
    </div>
};
export default UserPose;