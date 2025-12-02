/*
  # Create device tokens table

  1. New Tables
    - `device_tokens`
      - `id` (uuid, primary key)
      - `user_identifier` (text) - username or session identifier
      - `device_token` (text) - FCM device token
      - `is_active` (boolean) - whether token is still valid
      - `created_at` (timestamptz) - when token was created
      - `updated_at` (timestamptz) - when token was last updated
      - `last_used_at` (timestamptz) - last time this token was used to send notification

  2. Security
    - Enable RLS on `device_tokens` table
    - Add policy for managing tokens
*/

CREATE TABLE IF NOT EXISTS device_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_identifier text NOT NULL,
  device_token text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_used_at timestamptz,
  UNIQUE(user_identifier, device_token)
);

ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their device tokens"
  ON device_tokens FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS device_tokens_user_idx
  ON device_tokens(user_identifier);

CREATE INDEX IF NOT EXISTS device_tokens_active_idx
  ON device_tokens(is_active);
