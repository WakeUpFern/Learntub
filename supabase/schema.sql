-- ==========================================
-- LearnTube — Database Schema (Supabase)
-- ==========================================
-- Run this SQL in the Supabase SQL Editor
-- to create the required tables.

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  youtube_id TEXT NOT NULL,
  title TEXT NOT NULL,
  thumbnail_url TEXT,
  channel_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_time INTEGER NOT NULL,
  end_time INTEGER,
  position INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  youtube_id TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own courses
CREATE POLICY "Users can view own courses"
  ON courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own courses"
  ON courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own courses"
  ON courses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies: users can only access modules of their own courses
CREATE POLICY "Users can view own modules"
  ON modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own modules"
  ON modules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own modules"
  ON modules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own modules"
  ON modules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = modules.course_id
      AND courses.user_id = auth.uid()
    )
  );
