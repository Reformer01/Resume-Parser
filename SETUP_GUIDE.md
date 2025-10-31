# TalentLens Resume Parser - Setup Guide

## 🚀 Quick Start

This application is a React-based resume parser that uses Supabase as the backend database. Follow these steps to get it running:

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account (free at https://supabase.com)

## 🔧 Setup Steps

### 1. ✅ Dependencies Installed
The npm dependencies have been installed successfully.

### 2. 🔑 Supabase Configuration Required

You need to set up a Supabase project and configure the environment variables:

#### Step 2a: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Enter project name: "resume-parser" (or any name you prefer)
6. Set a database password (save this securely)
7. Choose a region close to you
8. Click "Create new project"

#### Step 2b: Get Your Credentials
1. Once your project is created, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

#### Step 2c: Update Environment Variables
1. Open the `.env` file in the `project` folder
2. Replace the placeholder values:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. 🗄️ Database Setup

The application includes a database migration file that creates all necessary tables. You need to run this migration in your Supabase project:

#### Option A: Using Supabase CLI (Recommended)
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref your-project-id`
4. Run migration: `supabase db push`

#### Option B: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `project/supabase/migrations/20251005140057_create_resume_parser_schema.sql`
4. Paste and run the SQL script

### 4. 🚀 Start the Application

Once you've completed the Supabase setup:

```bash
cd project
npm run dev
```

The application will be available at `http://localhost:5173`

## 🎯 How to Use

1. **Upload Resume**: Drag and drop or click to upload a PDF, DOCX, or TXT file
2. **View Results**: The app will parse the resume and display structured data
3. **Review Data**: Check the parsed information for accuracy
4. **Export**: Download the parsed data in various formats
5. **History**: View previously parsed resumes

## 🛠️ Features

- **File Support**: PDF, DOCX, TXT files
- **Data Extraction**: Personal info, skills, work experience, education, certifications
- **Confidence Scoring**: AI-powered confidence scores for parsed data
- **Data Persistence**: All parsed resumes are saved to the database
- **Export Options**: Multiple export formats available
- **Responsive Design**: Works on desktop and mobile

## 🔧 Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables" error**
   - Make sure your `.env` file has the correct Supabase URL and key
   - Ensure the `.env` file is in the `project` folder

2. **Database connection errors**
   - Verify your Supabase project is active
   - Check that the database migration was run successfully
   - Ensure RLS policies are set up correctly

3. **File upload issues**
   - Make sure you're uploading supported file types (PDF, DOCX, TXT)
   - Check file size limits (if any)

4. **Parsing errors**
   - Ensure the uploaded file contains readable text
   - Try with a different file format if parsing fails

## 📁 Project Structure

```
project/
├── src/
│   ├── components/          # React components
│   ├── lib/                # Utility functions and parsers
│   └── main.tsx            # App entry point
├── supabase/
│   └── migrations/         # Database schema
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables (you need to configure this)
```

## 🎨 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Radix UI, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **File Processing**: Mammoth (DOCX), PDF.js (PDF)

## 📞 Support

If you encounter any issues during setup, please check:
1. All environment variables are correctly set
2. Supabase project is active and accessible
3. Database migration has been run successfully
4. All npm dependencies are installed

---

**Ready to start?** Complete the Supabase setup steps above, then run `npm run dev` to launch the application! 🚀
