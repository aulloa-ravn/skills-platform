-- CreateEnum
CREATE TYPE "Role" AS ENUM ('EMPLOYEE', 'TECH_LEAD', 'ADMIN');

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "password" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'EMPLOYEE';
