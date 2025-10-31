# Resume Parser

A modern, AI-powered resume parsing and analysis application that extracts and structures information from uploaded resumes. The application provides a clean, user-friendly interface for viewing, comparing, and managing candidate resumes with advanced filtering and search capabilities.

## Features

- **Resume Upload & Parsing**: Upload and parse resumes in various formats (PDF, DOCX, TXT)
- **Structured Data Extraction**: Automatically extracts key information including:
  - Personal Information (Name, Email, Phone, Location)
  - Professional Summary
  - Work Experience with detailed job descriptions
  - Education History
  - Skills and Certifications
- **Resume Comparison**: Side-by-side comparison of multiple resumes
- **Advanced Search**: Filter and search through parsed resumes
- **Responsive Design**: Works on desktop and mobile devices
- **Secure Authentication**: User authentication and data protection

## Technologies Used

### Frontend
- React 18 with TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- Shadcn UI (Component Library)
- Lucide Icons
- React Query (Data Fetching)
- React Hook Form (Form Handling)
- Framer Motion (Animations)

### Backend
- Supabase (Database & Authentication)
- PostgreSQL (Database)
- TypeScript (Type Safety)
- Vite (Development Server)

### Development Tools
- ESLint (Linting)
- Prettier (Code Formatting)
- TypeScript (Type Checking)
- Git (Version Control)

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account (for backend services)


### Setup

1. Clone the repository:
   ```bash
   git clone [https://github.com/yourusername/resume-parser.git](https://github.com/yourusername/resume-parser.git)
   cd resume-parser
Install dependencies:
bash
npm install

# or
yarn
Set up environment variables: Create a .env file in the root directory and add your Supabase credentials:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Start the development server:
bash
npm run dev

# or
yarn dev
Open http://localhost:5173 to view it in your browser.
Project Structure
resume-parser/
├── public/            # Static files
├── src/
│   ├── components/    # Reusable UI components
│   ├── lib/           # Core functionality and utilities
│   │   ├── resumeParser.ts  # Main parsing logic
│   │   ├── databaseService.ts  # Database interactions
│   │   └── supabase.ts  # Supabase client configuration
│   ├── App.tsx        # Main application component
│   └── main.tsx       # Application entry point
├── .eslintrc.js       # ESLint configuration
├── .gitignore         # Git ignore file
├── package.json       # Project dependencies
├── tsconfig.json      # TypeScript configuration
└── vite.config.ts     # Vite configuration


Usage
Upload Resumes:
Click the "Upload Resume" button
Select one or more resume files (PDF, DOCX, or TXT)
The system will automatically parse and store the resume data
View Resumes:
Browse through the list of uploaded resumes
Click on a resume to view detailed information
Use the search and filter options to find specific resumes
Compare Resumes:
Select multiple resumes using the checkboxes
Click "Compare" to view a side-by-side comparison
Analyze key differences in skills, experience, and qualifications
Manage Resumes:
Delete individual resumes using the trash icon
Use the "Clear All" button to remove all resumes
Toggle between different views (list, grid)
Customization
Styling
The application uses Tailwind CSS for styling. You can customize the design by modifying the Tailwind configuration in tailwind.config.js or by adding custom CSS in the 
src/index.css
 file.

Parser Configuration
The resume parsing logic can be customized in 
src/lib/resumeParser.ts
. The parser can be extended to support additional fields or custom parsing rules.

Contributing
Contributions are welcome! Please follow these steps:

Fork the repository
Create a new branch for your feature or bugfix
Make your changes and commit them
Push to your fork and submit a pull request
License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Built with modern web technologies for optimal performance
Special thanks to the open-source community for their contributions
Inspired by the need for better resume management tools
Support
For support, please open an issue in the GitHub repository or contact the maintainers.