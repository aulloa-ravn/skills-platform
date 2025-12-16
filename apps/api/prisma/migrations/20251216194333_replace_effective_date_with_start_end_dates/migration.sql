-- Replace effectiveDate with start_date and end_date in SeniorityHistory table

-- Step 1: Add new columns as nullable
ALTER TABLE "SeniorityHistory" ADD COLUMN "start_date" TIMESTAMP(3);
ALTER TABLE "SeniorityHistory" ADD COLUMN "end_date" TIMESTAMP(3);

-- Step 2: Copy data from effectiveDate to start_date
UPDATE "SeniorityHistory" SET "start_date" = "effectiveDate";

-- Step 3: Drop the old column
ALTER TABLE "SeniorityHistory" DROP COLUMN "effectiveDate";

-- Step 4: Make start_date NOT NULL
ALTER TABLE "SeniorityHistory" ALTER COLUMN "start_date" SET NOT NULL;
