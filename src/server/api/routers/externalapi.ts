import { string, z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import AWS from "aws-sdk";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  S3RequestPresigner,
  getSignedUrl,
} from "@aws-sdk/s3-request-presigner";

interface foundObject {
  mid: string;
  description: string;
  score: number;
  topicality: number;
}

export const externalAPIRouter = createTRPCRouter({
  analyseImage: publicProcedure
    .input(z.object({ sessionId: z.string(), base64ImageData: z.string() }))
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      const userEmail = ctx?.session?.user.email ?? ""; //

      const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CAMERA_API_KEY}`;
      const base64Trimmed = input.base64ImageData.slice(23);

      const response = await fetch(apiURL, {
        method: "POST",
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Trimmed,
              },
              features: [
                {
                  type: "LABEL_DETECTION",
                  maxResults: 10,
                },
              ],
            },
          ],
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      const resjson = await response.json();
      console.log(resjson.responses[0].labelAnnotations);
      if (resjson.error) {
        console.log(
          "Error with Google API request, probably lacking an API key, add it to the .env"
        );
        console.log(resjson.error);
        return false;
      }
      const objectArray: foundObject[] = resjson.responses[0].labelAnnotations;

      const itemsFound: string[] = [];

      for (const item of objectArray) itemsFound.push(item?.description ?? ""); ////for(let i = 0; i < objectArray.length; i++) itemsFound.push(objectArray[i]?.description ?? "")
      const wasSuccessful = !itemsFound.some(
        (obj) =>
          obj === "Gadget" ||
          obj === "Mobile phone" ||
          obj === "Tablet computer" ||
          obj === "Communication Device" ||
          obj === "Mobile device" ||
          obj === "Mobile phone"
      );

      const foundStudent = await ctx.prisma.student.findFirst({
        where: {
          user: {
            email: userEmail,
          },
        },
      });

      console.log("SessionID " + input.sessionId);
      if (!foundStudent) return false;
      const examSession = await ctx.prisma.examSession.updateMany({
        //Should only update 1, as sessionId unique
        where: {
          AND: [
            { sessionId: input.sessionId },
            {
              student: {
                user: {
                  email: userEmail,
                },
              },
            },
          ],
        },
        data: {
          deskAIApproved: true,
        },
      });
      console.log(examSession);
      return wasSuccessful;
    }),

  //TODO: Not currently implemented
  uploadVideo: publicProcedure
    .input(
      z.object({
        userEmail: z.string(),
        sessionId: z.string(),
        videoFile: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const config = {
        accessKeyId: `${process.env.AMAZON_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.AMAZON_SECRET_ACCESS_KEY}`,
        region: "ap-southeast-2",
      };
      AWS.config.update(config);
      const client = new AWS.S3({ params: { Bucket: "online-anti-cheat" } });

      const result = await client
        .putObject({
          Body: input.videoFile,
          Bucket: "online-anti-cheat",
          Key: "failtest8",
        })
        .promise();
      console.log(result);

      return;
    }),

  uploadPresignedVideo: publicProcedure
    .input(z.object({ userEmail: z.string(), sessionId: z.string() }))
    .mutation(({ input, ctx }) => {
      AWS.config.update({
        accessKeyId: `${process.env.AMAZON_ACCESS_KEY_ID}`,
        secretAccessKey: `${process.env.AMAZON_SECRET_ACCESS_KEY}`,
        region: "ap-southeast-2",
        signatureVersion: "v4",
      });

      const client = new AWS.S3();
      return client.createPresignedPost({
        Fields: {
          Key: "SampleKey",
        },
        Bucket: "online-anti-cheat",
      });
    }),

  listRecordings: publicProcedure.query(async ({ input, ctx }) => {
    const config = {
      accessKeyId: `${process.env.AMAZON_ACCESS_KEY_ID}`,
      secretAccessKey: `${process.env.AMAZON_SECRET_ACCESS_KEY}`,
      region: "ap-southeast-2",
    };

    AWS.config.update(config);
    const client = new AWS.S3({ params: { Bucket: "online-anti-cheat" } });

    const response = await client.listObjectsV2().promise();
    const objects = (response.Contents ?? []) as { Key: string }[];
    const s3Objects = objects.map((object) => object.Key);
    return {
      s3Objects: s3Objects,
    };
  }),
});
