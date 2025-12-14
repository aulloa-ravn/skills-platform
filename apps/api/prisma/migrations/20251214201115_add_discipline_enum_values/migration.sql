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
