/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordSalt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verificationCode` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" DATETIME,
    "verificationCode" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "passwordSalt" TEXT NOT NULL,
    "role" TEXT NOT NULL
);
INSERT INTO "new_User" ("email", "emailVerified", "id", "name", "role") SELECT "email", "emailVerified", "id", "name", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
