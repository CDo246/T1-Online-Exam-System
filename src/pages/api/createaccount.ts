import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { createHash, randomBytes } from "crypto";

type ResponseData = {
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { name, email, password } = req.body;
  const salt = randomBytes(8).toString("hex");
  const hash = createHash("sha256").update(`${salt}${password}`).digest("hex");
  console.log(hash);
  //Validate password
  prisma.user
    .create({
      data: {
        name: name,
        email: email,
        password: hash,
        passwordSalt: salt,
        role: "Account",
      },
    })
    .then((res) => console.log(res));
  console.log("TEST");
  res.status(200).json({ message: "Hello" });
  //Error 400 if the account creation fails for some reason
}
