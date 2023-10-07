import type { NextApiRequest, NextApiResponse } from "next";
const formidable = require('formidable');
const { Storage } = require('@google-cloud/storage');

export const config = {
  api: {
      bodyParser: false,
  }
}

type ResponseData = {
  message: string;
  };
  
  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
  ) {
    console.log("BODY TYPE IS");
    console.log(typeof req.body);
    // const data = await new Promise((resolve, reject) => {
    //   try{
    //     const form = new formidable.IncomingForm();
    //     console.log("Incoming Form done");
    //     form.uploadDir = "./";
    //     form.keepExtensions = true;
    //     form.parse(req, async (err: any, fields: any, files: any) =>{
    //       if (err) {
    //       console.error("Error parsing form data:", err);
    //       return res.status(500).json({ message: "Internal Server Error" });
    //     }
    //     })
    //   }
    //   catch (error : any){
  
    //   }
    // })
    // console.log("TEST");
    // if(req.body.files.video){
    //   const bucketName = "online-exam-system-videostorage";
    //   const storage = new Storage();
    //   const file = storage.bucket(bucketName).file("video.mp4");
    //   file.save(req.body.files.video, function(err:any) {
    //     if (!err) {
    //       // File written successfully.
    //       console.log("SUCCESS");
    //     }
    //   });
      
    //   //-
    //   // If the callback is omitted, we'll return a Promise.
    //   //-
    //   file.save(req.body.files.video).then(function() {});
    // }
    
    
    
    // form.parse(req, async (err: any, fields: any, files: any) => {
    //   console.log("Start Parsing")
    //   if (err) {
    //     console.error("Error parsing form data:", err);
    //     return res.status(500).json({ message: "Internal Server Error" });
    //   }
    //   res.status(200).json({ message: "SUCCESS" });
      
  //   const bucketName = "online-exam-system-videostorage";
  //   const filePath = "C:\\Users\\User\\Downloads\\react-webcam-stream-capture.webm";
  //   const destFileName = 'your-new-file-name';
  //   const storage = new Storage();

  //   async function uploadFile() {
  //     const options = {
  //       destination: destFileName,
  //     };

  // await storage.bucket(bucketName).upload(filePath, options);
    
    
    
      
    
      //console.log("THE VIDEO SIZE IS " + video.length);
    
      try {
        //const videoSize = video.length;
        //console.log("IT WORKED VIDEO SIZE IS" + videoSize);
        res.status(200).json({ message: "SUCCESS" });
      } catch (error: any) {
        console.error(error);
        //res.status(500).json({ error: error.message });
      } finally {
        //fs.rm(tempVideoPath);
      }
  }