import { TRPCError } from "@trpc/server";
import { createHash, randomBytes } from "crypto";
import validator from "validator";
import { string, z } from "zod";
import { UserRoles } from "~/utils/enums";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import dotenv from "dotenv";

interface foundObject {
  mid: string;
  description: string;
  score: number;
  topicality: number;
}

export const externalAPIRouter = createTRPCRouter({
    analyseImage: publicProcedure
      .input(z.object({ base64ImageData: z.string() }))
      .output(z.array( z.string()))
      .mutation(async ({ input, ctx }) => {
        const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_CAMERA_API_KEY}`;
        const base64Trimmed = input.base64ImageData.slice(23); //TODO: Probably needs to be changed
        console.log("Attempting to analyse image")

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
                "Content-type": "application/json; charset=UTF-8"
            }
        })

        const resjson = await response.json()
        const objectArray: foundObject[] = resjson.responses[0].labelAnnotations;

        let itemsFound: string[] = []

        for(let i = 0; i < objectArray.length; i++) itemsFound.push(objectArray[i]?.description ?? "")

        return itemsFound
      }),

    //TODO: Not currently implemented
    uploadVideo: publicProcedure
      .input(z.object({ userEmail: z.string() }))
      .query(async ({ input, ctx }) => {
        const user = await ctx.prisma.user.findUnique({
          where: {
            email: input.userEmail,
          },
        });
  
        if (!user) {
          throw new Error(`User with email ${input.userEmail} not found`);
        }
  
        return {
          role: user.role,
        };
      }),
  });
  