import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { createHash, randomBytes } from "crypto";
import validator from "validator";

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

  //Error 400 if the account creation fails for some reason
  if(name === "" || !validator.isEmail(email) || !validator.isStrongPassword(password)) {
    res.status(400).json({ message: "Incorrect Details" });
  }
  else {
    console.log("Creating account")
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
      .then(result => {
        console.log(result)
        res.status(200).json({ message: "Account Created." });
      })
      .catch(e => {
        console.log(e)
        res.status(400).json({ message: "An Error Occured Creating Your Account. There is likely already an account with this email."});
      })
  }
}

