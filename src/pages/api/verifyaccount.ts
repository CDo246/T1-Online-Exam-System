import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { createHash, randomBytes } from "crypto";
import validator from "validator";

type ResponseData = {
  error?: string;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { email, verificationCode } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  console.log(user);
  if (user === null) {
    res.status(200).json({ error: "User Not Found." });
  } else if (verificationCode !== user.verificationCode) {
    res.status(200).json({ error: "Incorrect Verification Code" });
  } else {
    prisma.user.update({
      where: {
        email: email,
      },
      data: {
        emailVerified: new Date(),
      },
    });
    res.status(200).json({ message: "Account Verified." });
  }
}
