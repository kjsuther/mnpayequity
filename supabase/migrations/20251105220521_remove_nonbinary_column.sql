/*
  # Remove nonbinary column from job_classifications table

  1. Changes
    - Remove `nonbinary` column from job_classifications table
    - This simplifies gender tracking to only male and female categories
    - Any existing nonbinary counts will be dropped

  2. Notes
    - This change removes the nonbinary field from the database schema
    - All employee counts will now use only males and females fields
    - This is a destructive change - any nonbinary data will be lost
*/

-- Remove nonbinary column from job_classifications table
ALTER TABLE job_classifications
DROP COLUMN IF EXISTS nonbinary;