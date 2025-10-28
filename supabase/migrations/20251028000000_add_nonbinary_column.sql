/*
  # Add nonbinary column to job_classifications table

  1. Changes
    - Add `nonbinary` column to job_classifications table
    - Column tracks number of nonbinary employees in each job classification
    - Default value is 0
    - This aligns with PDF requirements showing males, females, and nonbinary columns

  2. Notes
    - This is a critical field required by the reporting specification
    - All existing records will have nonbinary set to 0 by default
    - No data loss - purely additive change
*/

-- Add nonbinary column to job_classifications table
ALTER TABLE job_classifications
ADD COLUMN IF NOT EXISTS nonbinary integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN job_classifications.nonbinary IS 'Number of nonbinary employees in this job classification';
