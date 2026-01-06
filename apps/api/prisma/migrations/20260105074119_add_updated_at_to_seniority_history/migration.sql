-- AlterTable: Add updatedAt column with default value for existing records
ALTER TABLE "SeniorityHistory" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to set updatedAt to createdAt (best approximation for historical data)
UPDATE "SeniorityHistory" SET "updatedAt" = "createdAt";
