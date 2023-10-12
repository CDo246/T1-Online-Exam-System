/*
  Warnings:

  - The primary key for the `Examiner` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Recording` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `imageId` on the `Student` table. All the data in the column will be lost.
  - The primary key for the `ExamSession` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Image` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `uniqueCode` to the `ExamSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "CreatedSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uniqueCode" INTEGER NOT NULL,
    "examinerId" TEXT NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "CreatedSession_examinerId_fkey" FOREIGN KEY ("examinerId") REFERENCES "Examiner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Examiner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examinerId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Examiner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Examiner" ("examinerId", "id", "userId") SELECT "examinerId", "id", "userId" FROM "Examiner";
DROP TABLE "Examiner";
ALTER TABLE "new_Examiner" RENAME TO "Examiner";
CREATE UNIQUE INDEX "Examiner_examinerId_key" ON "Examiner"("examinerId");
CREATE UNIQUE INDEX "Examiner_userId_key" ON "Examiner"("userId");
CREATE TABLE "new_Recording" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recording_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession" ("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Recording" ("createdAt", "data", "id", "sessionId") SELECT "createdAt", "data", "id", "sessionId" FROM "Recording";
DROP TABLE "Recording";
ALTER TABLE "new_Recording" RENAME TO "Recording";
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("id", "studentId", "userId") SELECT "id", "studentId", "userId" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE UNIQUE INDEX "Student_studentId_key" ON "Student"("studentId");
CREATE UNIQUE INDEX "Student_userId_key" ON "Student"("userId");
CREATE TABLE "new_ExamSession" (
    "sessionId" TEXT NOT NULL PRIMARY KEY,
    "seatNumber" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME,
    "suspiciousActivity" BOOLEAN NOT NULL DEFAULT false,
    "studentId" TEXT NOT NULL,
    "uniqueCode" INTEGER NOT NULL,
    "examinerId" TEXT NOT NULL,
    CONSTRAINT "ExamSession_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ExamSession_uniqueCode_examinerId_fkey" FOREIGN KEY ("uniqueCode", "examinerId") REFERENCES "CreatedSession" ("uniqueCode", "examinerId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ExamSession" ("endTime", "examinerId", "seatNumber", "sessionId", "startTime", "studentId", "suspiciousActivity") SELECT "endTime", "examinerId", "seatNumber", "sessionId", "startTime", "studentId", "suspiciousActivity" FROM "ExamSession";
DROP TABLE "ExamSession";
ALTER TABLE "new_ExamSession" RENAME TO "ExamSession";
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "data" BLOB NOT NULL
);
INSERT INTO "new_Image" ("data", "id", "name") SELECT "data", "id", "name" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    CONSTRAINT "Notification_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ExamSession" ("sessionId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("content", "createdAt", "id", "sessionId") SELECT "content", "createdAt", "id", "sessionId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "CreatedSession_uniqueCode_key" ON "CreatedSession"("uniqueCode");

-- CreateIndex
CREATE UNIQUE INDEX "CreatedSession_uniqueCode_examinerId_key" ON "CreatedSession"("uniqueCode", "examinerId");
