import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { createHash, randomBytes } from "crypto";
import validator from "validator";

type ResponseData = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const {email, verificationCode} = req.body;

  let user = await prisma.user.update({
    where: {
      email: email,
      verificationCode: verificationCode,
    },
    data: {
        emailVerified: new Date()
    }
  });

  if(user === null) {
    res.status(400).json({ message: "User Not Found." });
}
else {

    res.status(200).json({ message: "Account Verified." });
  }

}

