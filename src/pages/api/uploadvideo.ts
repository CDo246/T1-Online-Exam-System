import type { NextApiRequest, NextApiResponse } from "next";
const { IncomingForm, Fields, Files } = require("formidable");
import { promises as fs } from "fs";
import axios from "axios";

type ResponseData = {
  message: string;
  };

  // type Fields = {
  //   [fieldName: string]: string | string[];
  // };
  
  // type Files = {
  //   [fieldName: string]: {
  //     name: string;
  //     type: string;
  //     size: number;
  //     path: string;
  //   };
  // };

  // export const config = { api: { bodyParser: false } };

  // const parseFormData = (req: NextApiRequest): Promise<{ fields: Fields, files: Files }> => new Promise((resolve, reject) => {
  //   const form = new IncomingForm({ multiples: false });
  //   form.parse(req, (err: any, fields : Fields, files : Files) => {
  //     if (err) return reject(err);
  //     resolve({ fields, files });
  //   });
  // });
  
  // const request = async (req: NextApiRequest, video: Buffer) => {
    // const data = new FormData();
    // const blob = new Blob([video], { type: "video/*" });
    // data.append("video", blob);
  
    // return axios.post(`${process.env.API_URL}/api/upload-video`, data, {
    //   headers: req.headers as any,
    // });

  //   const videob = req.body as Buffer
  // });
  
  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
  ) {
    console.log("IT WORKS");
    // const fData = await parseFormData(req);
  
    // const videoFile = fData.files.video as any;
    // const tempVideoPath = videoFile.path;
    // const video = await fs.readFile(tempVideoPath);
    const video = req.body.get("video/mp4");
    const { Storage } = require('@google-cloud/storage');
    const bucketName = "online-exam-system-videostorage";
    //const apiKey = '';
    const date = new Date();
      const currentTime = date.getHours().toString() + date.getMinutes().toString() 
      + date.getSeconds().toString() + date.getDay().toString() + date.getMonth().toString();
  const storage = new Storage();
  const file = storage.bucket(bucketName).file("video.mp4");

  //const blob = new Blob(video, {type: "video/mp4",});
  //const blob2 = video.get("video/mp4");

  // const url = URL.createObjectURL(video);
  //   const a = document.createElement("a");
  //   document.body.appendChild(a);
  //   a.href = url;
  //   a.download = "webcamvideo.mp4";
  //   a.click();
  //   window.URL.revokeObjectURL(url);

    //return;
  
  
  file.save(video, function(err:any) {
    if (!err) {
      // File written successfully.
      console.log("SUCCESS");
    }
  });
  
  //-
  // If the callback is omitted, we'll return a Promise.
  //-
  file.save(video).then(function() {});
    
  
    console.log("THE VIDEO SIZE IS " + video.length);
  
    try {
      const videoSize = video.length;
      console.log("IT WORKED VIDEO SIZE IS" + videoSize);
      //res.status(200).json({ size: videoSize });
    } catch (error: any) {
      console.error(error);
      //res.status(500).json({ error: error.message });
    } finally {
      //fs.rm(tempVideoPath);
    }
  }