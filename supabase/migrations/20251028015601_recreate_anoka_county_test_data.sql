/*
  # Recreate Comprehensive Test Data for Anoka County
  
  1. Cleanup
    - Remove existing Anoka County reports and job classifications
  
  2. Test Data Overview
    - Creates 3 pay equity reports for Anoka County (2020, 2022, 2024)
    - Each report includes realistic job classifications
    - 2020: Historical report (Submitted, In Compliance) - 15 job classes
    - 2022: Mid-period report (Submitted, Out of Compliance) - 18 job classes
    - 2024: Current report (Private/Draft) - 20 job classes
  
  3. Job Classifications
    - Diverse mix of county government positions
    - Realistic gender distributions
    - Varying salary ranges
    - Mix of male-dominated, female-dominated, and balanced job classes
*/

DO $$
DECLARE
  v_jurisdiction_id uuid;
  v_report_2020_id uuid;
  v_report_2022_id uuid;
  v_report_2024_id uuid;
BEGIN
  -- Get Anoka County jurisdiction ID
  SELECT id INTO v_jurisdiction_id
  FROM jurisdictions
  WHERE name = 'Anoka County'
  LIMIT 1;

  -- Delete existing data for Anoka County
  DELETE FROM job_classifications 
  WHERE report_id IN (
    SELECT id FROM reports WHERE jurisdiction_id = v_jurisdiction_id
  );
  
  DELETE FROM implementation_reports 
  WHERE report_id IN (
    SELECT id FROM reports WHERE jurisdiction_id = v_jurisdiction_id
  );

  DELETE FROM submission_checklists
  WHERE report_id IN (
    SELECT id FROM reports WHERE jurisdiction_id = v_jurisdiction_id
  );
  
  DELETE FROM reports WHERE jurisdiction_id = v_jurisdiction_id;

  -- Create 2020 Report (Historical, Submitted, In Compliance)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at
  ) VALUES (
    v_jurisdiction_id, 2020, 1, 'Annual Pay Equity Report - Anoka County',
    'Submitted', 'In Compliance', '2020-03-31'
  )
  RETURNING id INTO v_report_2020_id;

  -- 2020 Job Classifications (15 positions)
  INSERT INTO job_classifications (report_id, job_number, title, males, females, nonbinary, points, min_salary, max_salary) VALUES
  (v_report_2020_id, 101, 'County Administrator', 1, 0, 0, 950, 130000, 160000),
  (v_report_2020_id, 102, 'Assistant County Administrator', 0, 1, 0, 850, 105000, 125000),
  (v_report_2020_id, 201, 'Department Director', 8, 4, 0, 750, 85000, 112000),
  (v_report_2020_id, 202, 'Deputy Director', 3, 5, 0, 650, 72000, 92000),
  (v_report_2020_id, 301, 'Finance Manager', 2, 3, 0, 550, 65000, 79000),
  (v_report_2020_id, 302, 'Human Resources Manager', 0, 4, 0, 545, 64000, 79000),
  (v_report_2020_id, 303, 'IT Manager', 4, 1, 0, 560, 68000, 82000),
  (v_report_2020_id, 401, 'Senior Accountant', 5, 12, 0, 450, 52000, 64000),
  (v_report_2020_id, 402, 'Accountant', 8, 22, 0, 350, 43000, 53000),
  (v_report_2020_id, 501, 'Social Worker III', 3, 15, 0, 480, 56000, 68000),
  (v_report_2020_id, 502, 'Social Worker II', 5, 28, 0, 380, 47000, 57000),
  (v_report_2020_id, 601, 'Administrative Coordinator', 2, 18, 0, 320, 40000, 50000),
  (v_report_2020_id, 602, 'Administrative Assistant', 1, 24, 0, 250, 34000, 42000),
  (v_report_2020_id, 701, 'Facilities Maintenance Supervisor', 8, 0, 0, 420, 49000, 61000),
  (v_report_2020_id, 702, 'Facilities Maintenance Worker', 18, 2, 0, 300, 38000, 46000);

  -- Create 2022 Report (Submitted, Out of Compliance)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description,
    case_status, compliance_status, submitted_at
  ) VALUES (
    v_jurisdiction_id, 2022, 1, 'Annual Pay Equity Report - Anoka County',
    'Submitted', 'Out of Compliance', '2022-03-31'
  )
  RETURNING id INTO v_report_2022_id;

  -- 2022 Job Classifications (18 positions)
  INSERT INTO job_classifications (report_id, job_number, title, males, females, nonbinary, points, min_salary, max_salary) VALUES
  (v_report_2022_id, 101, 'County Administrator', 1, 0, 0, 950, 145000, 175000),
  (v_report_2022_id, 102, 'Assistant County Administrator', 0, 1, 0, 850, 115000, 135000),
  (v_report_2022_id, 201, 'Department Director', 9, 5, 0, 750, 92000, 118000),
  (v_report_2022_id, 202, 'Deputy Director', 4, 6, 0, 650, 78000, 98000),
  (v_report_2022_id, 301, 'Finance Manager', 2, 4, 0, 550, 70000, 86000),
  (v_report_2022_id, 302, 'Human Resources Manager', 0, 5, 0, 545, 68000, 84000),
  (v_report_2022_id, 303, 'IT Manager', 5, 1, 0, 560, 74000, 90000),
  (v_report_2022_id, 304, 'Public Health Manager', 0, 3, 0, 530, 67000, 81000),
  (v_report_2022_id, 401, 'Senior Accountant', 6, 15, 0, 450, 56000, 68000),
  (v_report_2022_id, 402, 'Accountant', 10, 28, 0, 350, 46000, 56000),
  (v_report_2022_id, 501, 'Social Worker III', 4, 18, 0, 480, 60000, 72000),
  (v_report_2022_id, 502, 'Social Worker II', 6, 35, 0, 380, 50000, 60000),
  (v_report_2022_id, 503, 'Social Worker I', 3, 22, 0, 280, 42000, 50000),
  (v_report_2022_id, 601, 'Administrative Coordinator', 3, 22, 0, 320, 43000, 53000),
  (v_report_2022_id, 602, 'Administrative Assistant', 2, 30, 0, 250, 36000, 44000),
  (v_report_2022_id, 701, 'Facilities Maintenance Supervisor', 10, 0, 0, 420, 53000, 65000),
  (v_report_2022_id, 702, 'Facilities Maintenance Worker', 22, 3, 0, 300, 41000, 49000),
  (v_report_2022_id, 801, 'IT Support Specialist', 15, 5, 0, 380, 47000, 57000);

  -- Create 2024 Report (Current Draft)
  INSERT INTO reports (
    jurisdiction_id, report_year, case_number, case_description, case_status
  ) VALUES (
    v_jurisdiction_id, 2024, 1, 'Annual Pay Equity Report - Anoka County', 'Private'
  )
  RETURNING id INTO v_report_2024_id;

  -- 2024 Job Classifications (20 positions)
  INSERT INTO job_classifications (report_id, job_number, title, males, females, nonbinary, points, min_salary, max_salary) VALUES
  (v_report_2024_id, 101, 'County Administrator', 1, 0, 0, 950, 155000, 185000),
  (v_report_2024_id, 102, 'Assistant County Administrator', 1, 1, 0, 850, 125000, 145000),
  (v_report_2024_id, 201, 'Department Director', 10, 6, 0, 750, 98000, 126000),
  (v_report_2024_id, 202, 'Deputy Director', 5, 7, 0, 650, 84000, 104000),
  (v_report_2024_id, 301, 'Finance Manager', 3, 5, 0, 550, 76000, 92000),
  (v_report_2024_id, 302, 'Human Resources Manager', 1, 5, 0, 545, 74000, 90000),
  (v_report_2024_id, 303, 'IT Manager', 6, 2, 0, 560, 80000, 96000),
  (v_report_2024_id, 304, 'Public Health Manager', 0, 4, 0, 530, 72000, 88000),
  (v_report_2024_id, 305, 'Communications Manager', 1, 2, 0, 525, 70000, 86000),
  (v_report_2024_id, 401, 'Senior Accountant', 7, 18, 0, 450, 60000, 72000),
  (v_report_2024_id, 402, 'Accountant', 12, 32, 1, 350, 49000, 59000),
  (v_report_2024_id, 501, 'Social Worker III', 5, 22, 0, 480, 64000, 76000),
  (v_report_2024_id, 502, 'Social Worker II', 8, 42, 0, 380, 53000, 63000),
  (v_report_2024_id, 503, 'Social Worker I', 4, 28, 0, 280, 45000, 53000),
  (v_report_2024_id, 601, 'Administrative Coordinator', 4, 26, 0, 320, 46000, 56000),
  (v_report_2024_id, 602, 'Administrative Assistant', 3, 35, 1, 250, 38000, 46000),
  (v_report_2024_id, 701, 'Facilities Maintenance Supervisor', 12, 1, 0, 420, 57000, 69000),
  (v_report_2024_id, 702, 'Facilities Maintenance Worker', 25, 4, 0, 300, 44000, 52000),
  (v_report_2024_id, 801, 'IT Support Specialist', 18, 7, 0, 380, 51000, 61000),
  (v_report_2024_id, 802, 'Network Administrator', 8, 2, 0, 520, 65000, 79000);

END $$;