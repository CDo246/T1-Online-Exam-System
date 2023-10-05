import { createHash } from "crypto";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const accountRouter = createTRPCRouter({

    updatePassword: publicProcedure
    .input(z.object({
        email: z.string(),
        oldPass: z.string(),
        newPass: z.string(),
    }))
    .output(z.boolean())
    .mutation(async ({input, ctx}) => {
        console.log(input.email)
        const user = await ctx.prisma.user.findFirst({
            where: {
                email: input.email,
            }
        })
        if(user === null) return false;

        const savedPass = createHash("sha256")
            .update(`${user.passwordSalt}${input.oldPass}`)
            .digest("hex");
        if(savedPass !== user.password) return false;
        const newPass = createHash("sha256")
            .update(`${user.passwordSalt}${input.newPass}`)
            .digest("hex");

        const res = await ctx.prisma.user.update({
            where: {
                email: input.email,
            },
            data: {
                password: newPass
            }
        })
        return true;
    }),
});
