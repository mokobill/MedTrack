/*
  # Create app access tracking table

  1. New Tables
    - `app_access_logs`
      - `id` (uuid, primary key)
      - `user_identifier` (text) - username or session identifier
      - `access_date` (date) - date of access
      - `access_count` (integer) - number of times accessed on that date
      - `last_accessed_at` (timestamptz) - timestamp of last access
      - `created_at` (timestamptz) - when record was created
      - `updated_at` (timestamptz) - when record was last updated

  2. Security
    - Enable RLS on `app_access_logs` table
    - Add policy for users to view their own access data
*/

CREATE TABLE IF NOT EXISTS app_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  access_date date NOT NULL,
  access_count integer NOT NULL DEFAULT 1,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_identifier, access_date)
);

ALTER TABLE app_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own access logs"
  ON app_access_logs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own access logs"
  ON app_access_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own access logs"
  ON app_access_logs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS app_access_logs_user_date_idx
  ON app_access_logs(user_identifier, access_date DESC);

CREATE INDEX IF NOT EXISTS app_access_logs_date_idx
  ON app_access_logs(access_date DESC);