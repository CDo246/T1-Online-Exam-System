import { TRPCError } from "@trpc/server";
import { createHash, randomBytes } from "crypto";
import validator from "validator";
import { z } from "zod";
import { UserRoles } from "~/utils/enums";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const externalAPIRouter = createTRPCRouter({
    //TODO: Not currently implemented
    analyseImage: publicProcedure
      .input(z.object({ base64ImageData: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const apiKey = "";
        const apiURL = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;
        const base64Trimmed = input.base64ImageData.slice(23); //TODO: Probably needs to be changed

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
                "Content-type": "application/json"
            }
        })

        console.log(response)
        /* 
        class CloudVision {
            constructor() {
                this.labels = [];
            }

            labels: string[];

            setLabels(labels: string[]) {
                this.labels = labels;
            }

            async analyseImage(base64ImageData: string) {
                console.log("attempting to analyse screenshot");
                try {
                //Replace with Key


                const apiResponse = await axios.post(apiURL, requestData);
                this.setLabels(apiResponse.data.responses[0].labelAnnotations);
                } catch (error) {
                console.error("Error performing cloud vision analysis: ", error);
                alert(error);
                }
                console.log("screenshot analysed");
                return this.labels;
            }
            }
        
        */
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
  