-- Resume Parser Database Setup
-- Copy and paste this entire script into your Supabase SQL Editor

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  file_name text NOT NULL,
  file_type text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  raw_text text,
  storage_path text,
  parsing_status text NOT NULL DEFAULT 'pending',
  confidence_score numeric(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create parsed_data table
CREATE TABLE IF NOT EXISTS parsed_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  summary text,
  total_years_experience numeric(4,1),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  category text,
  proficiency_level text,
  years_experience numeric(4,1),
  confidence numeric(5,2),
  created_at timestamptz DEFAULT now()
);

-- Create work_experience table
CREATE TABLE IF NOT EXISTS work_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  job_title text NOT NULL,
  location text,
  start_date date,
  end_date date,
  is_current boolean DEFAULT false,
  description text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create education table
CREATE TABLE IF NOT EXISTS education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  institution_name text NOT NULL,
  degree text NOT NULL,
  field_of_study text,
  location text,
  start_date date,
  end_date date,
  gpa text,
  honors text,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resume_id uuid NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  certification_name text NOT NULL,
  issuing_organization text,
  issue_date date,
  expiry_date date,
  credential_id text,
  credential_url text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resumes_parsing_status ON resumes(parsing_status);
CREATE INDEX IF NOT EXISTS idx_parsed_data_resume_id ON parsed_data(resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_work_experience_resume_id ON work_experience(resume_id);
CREATE INDEX IF NOT EXISTS idx_education_resume_id ON education(resume_id);
CREATE INDEX IF NOT EXISTS idx_certifications_resume_id ON certifications(resume_id);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE parsed_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for demo purposes)
-- Users can insert new resumes
CREATE POLICY "Anyone can insert resumes"
  ON resumes FOR INSERT
  TO public
  WITH CHECK (true);

-- Users can view all resumes (for demo purposes)
CREATE POLICY "Anyone can view resumes"
  ON resumes FOR SELECT
  TO public
  USING (true);

-- Users can update resumes
CREATE POLICY "Anyone can update resumes"
  ON resumes FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Users can delete resumes
CREATE POLICY "Anyone can delete resumes"
  ON resumes FOR DELETE
  TO public
  USING (true);

-- Parsed data policies
CREATE POLICY "Anyone can insert parsed data"
  ON parsed_data FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view parsed data"
  ON parsed_data FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update parsed data"
  ON parsed_data FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete parsed data"
  ON parsed_data FOR DELETE
  TO public
  USING (true);

-- Skills policies
CREATE POLICY "Anyone can insert skills"
  ON skills FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view skills"
  ON skills FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update skills"
  ON skills FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete skills"
  ON skills FOR DELETE
  TO public
  USING (true);

-- Work experience policies
CREATE POLICY "Anyone can insert work experience"
  ON work_experience FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view work experience"
  ON work_experience FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update work experience"
  ON work_experience FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete work experience"
  ON work_experience FOR DELETE
  TO public
  USING (true);

-- Education policies
CREATE POLICY "Anyone can insert education"
  ON education FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view education"
  ON education FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update education"
  ON education FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete education"
  ON education FOR DELETE
  TO public
  USING (true);

-- Certifications policies
CREATE POLICY "Anyone can insert certifications"
  ON certifications FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view certifications"
  ON certifications FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can update certifications"
  ON certifications FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete certifications"
  ON certifications FOR DELETE
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic updated_at
CREATE TRIGGER update_resumes_updated_at
  BEFORE UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parsed_data_updated_at
  BEFORE UPDATE ON parsed_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
