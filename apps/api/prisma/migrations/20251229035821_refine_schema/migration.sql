/*
  Warnings:

  - The primary key for the `EmployeeSkill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `validatedAt` on the `EmployeeSkill` table. All the data in the column will be lost.
  - You are about to drop the column `validatedById` on the `EmployeeSkill` table. All the data in the column will be lost.
  - The `id` column on the `EmployeeSkill` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `SeniorityHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdById` on the `SeniorityHistory` table. All the data in the column will be lost.
  - You are about to drop the column `effectiveDate` on the `SeniorityHistory` table. All the data in the column will be lost.
  - The `id` column on the `SeniorityHistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Skill` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Skill` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Suggestion` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Suggestion` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `lastValidatedAt` to the `EmployeeSkill` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `skillId` on the `EmployeeSkill` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `currentSeniorityLevel` on the `Profile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `startDate` to the `SeniorityHistory` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `seniorityLevel` on the `SeniorityHistory` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `skillId` on the `Suggestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('EMPLOYEE', 'TECH_LEAD', 'ADMIN');

-- CreateEnum
CREATE TYPE "SeniorityLevel" AS ENUM ('JUNIOR_ENGINEER', 'MID_ENGINEER', 'SENIOR_ENGINEER', 'STAFF_ENGINEER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Discipline" ADD VALUE 'STYLING';
ALTER TYPE "Discipline" ADD VALUE 'TOOLS';
ALTER TYPE "Discipline" ADD VALUE 'API';
ALTER TYPE "Discipline" ADD VALUE 'PERFORMANCE';
ALTER TYPE "Discipline" ADD VALUE 'SECURITY';
ALTER TYPE "Discipline" ADD VALUE 'IOS';
ALTER TYPE "Discipline" ADD VALUE 'ANDROID';
ALTER TYPE "Discipline" ADD VALUE 'BUILD_TOOLS';
ALTER TYPE "Discipline" ADD VALUE 'NO_CODE';

-- DropForeignKey
ALTER TABLE "EmployeeSkill" DROP CONSTRAINT "EmployeeSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "EmployeeSkill" DROP CONSTRAINT "EmployeeSkill_validatedById_fkey";

-- DropForeignKey
ALTER TABLE "SeniorityHistory" DROP CONSTRAINT "SeniorityHistory_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_skillId_fkey";

-- DropIndex
DROP INDEX "Suggestion_status_idx";

-- AlterTable
ALTER TABLE "EmployeeSkill" DROP CONSTRAINT "EmployeeSkill_pkey",
DROP COLUMN "validatedAt",
DROP COLUMN "validatedById",
ADD COLUMN     "lastValidatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "lastValidatedById" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "skillId",
ADD COLUMN     "skillId" INTEGER NOT NULL,
ADD CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "password" TEXT,
ADD COLUMN     "type" "ProfileType" NOT NULL DEFAULT 'EMPLOYEE',
DROP COLUMN "currentSeniorityLevel",
ADD COLUMN     "currentSeniorityLevel" "SeniorityLevel" NOT NULL;

-- AlterTable
ALTER TABLE "SeniorityHistory" DROP CONSTRAINT "SeniorityHistory_pkey",
DROP COLUMN "createdById",
DROP COLUMN "effectiveDate",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "seniorityLevel",
ADD COLUMN     "seniorityLevel" "SeniorityLevel" NOT NULL,
ADD CONSTRAINT "SeniorityHistory_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Skill_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "skillId",
ADD COLUMN     "skillId" INTEGER NOT NULL,
ADD CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "EmployeeSkill_skillId_idx" ON "EmployeeSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSkill_profileId_skillId_key" ON "EmployeeSkill"("profileId", "skillId");

-- CreateIndex
CREATE INDEX "Suggestion_skillId_idx" ON "Suggestion"("skillId");

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_lastValidatedById_fkey" FOREIGN KEY ("lastValidatedById") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
