export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string
          user_id: string | null
          file_name: string
          file_type: string
          file_size: number
          raw_text: string | null
          storage_path: string | null
          parsing_status: string
          confidence_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          file_name: string
          file_type: string
          file_size?: number
          raw_text?: string | null
          storage_path?: string | null
          parsing_status?: string
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          file_name?: string
          file_type?: string
          file_size?: number
          raw_text?: string | null
          storage_path?: string | null
          parsing_status?: string
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      parsed_data: {
        Row: {
          id: string
          resume_id: string
          full_name: string | null
          email: string | null
          phone: string | null
          location: string | null
          linkedin_url: string | null
          github_url: string | null
          portfolio_url: string | null
          summary: string | null
          total_years_experience: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          location?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          summary?: string | null
          total_years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          location?: string | null
          linkedin_url?: string | null
          github_url?: string | null
          portfolio_url?: string | null
          summary?: string | null
          total_years_experience?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      skills: {
        Row: {
          id: string
          resume_id: string
          skill_name: string
          category: string | null
          proficiency_level: string | null
          years_experience: number | null
          confidence: number | null
          created_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          skill_name: string
          category?: string | null
          proficiency_level?: string | null
          years_experience?: number | null
          confidence?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          skill_name?: string
          category?: string | null
          proficiency_level?: string | null
          years_experience?: number | null
          confidence?: number | null
          created_at?: string
        }
      }
      work_experience: {
        Row: {
          id: string
          resume_id: string
          company_name: string
          job_title: string
          location: string | null
          start_date: string | null
          end_date: string | null
          is_current: boolean
          description: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          company_name: string
          job_title: string
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          company_name?: string
          job_title?: string
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          is_current?: boolean
          description?: string | null
          order_index?: number
          created_at?: string
        }
      }
      education: {
        Row: {
          id: string
          resume_id: string
          institution_name: string
          degree: string
          field_of_study: string | null
          location: string | null
          start_date: string | null
          end_date: string | null
          gpa: string | null
          honors: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          institution_name: string
          degree: string
          field_of_study?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          gpa?: string | null
          honors?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          institution_name?: string
          degree?: string
          field_of_study?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          gpa?: string | null
          honors?: string | null
          order_index?: number
          created_at?: string
        }
      }
      certifications: {
        Row: {
          id: string
          resume_id: string
          certification_name: string
          issuing_organization: string | null
          issue_date: string | null
          expiry_date: string | null
          credential_id: string | null
          credential_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          certification_name: string
          issuing_organization?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          credential_id?: string | null
          credential_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          certification_name?: string
          issuing_organization?: string | null
          issue_date?: string | null
          expiry_date?: string | null
          credential_id?: string | null
          credential_url?: string | null
          created_at?: string
        }
      }
    }
  }
}
