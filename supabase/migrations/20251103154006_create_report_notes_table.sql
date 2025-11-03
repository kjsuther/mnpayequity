/*
  # Create Report Notes Table

  1. New Table
    - `report_notes`
      - `id` (uuid, primary key)
      - `report_id` (uuid, foreign key to reports)
      - `title` (text)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `report_notes` table
    - Add policies for authenticated users to manage their report notes
*/

CREATE TABLE IF NOT EXISTS report_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE report_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view report notes"
  ON report_notes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert report notes"
  ON report_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update report notes"
  ON report_notes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete report notes"
  ON report_notes
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_report_notes_report_id ON report_notes(report_id);
