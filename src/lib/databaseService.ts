import { supabase } from './supabase';
import type { Database } from './database.types';

type ResumeInsert = Database['public']['Tables']['resumes']['Insert'];
type ParsedDataInsert = Database['public']['Tables']['parsed_data']['Insert'];
type SkillsInsert = Database['public']['Tables']['skills']['Insert'];
type WorkExperienceInsert = Database['public']['Tables']['work_experience']['Insert'];
type EducationInsert = Database['public']['Tables']['education']['Insert'];
type CertificationsInsert = Database['public']['Tables']['certifications']['Insert'];

export class DatabaseService {
  static async insertResume(data: ResumeInsert) {
    try {
      const { data: result, error } = await (supabase as any)
        .from('resumes')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error inserting resume:', error);
      throw error;
    }
  }

  static async updateResume(id: string, updates: Partial<ResumeInsert>) {
    try {
      const { data: result, error } = await (supabase as any)
        .from('resumes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error updating resume:', error);
      throw error;
    }
  }

  static async insertParsedData(data: ParsedDataInsert) {
    try {
      const { data: result, error } = await (supabase as any)
        .from('parsed_data')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error inserting parsed data:', error);
      throw error;
    }
  }

  static async insertSkills(skills: SkillsInsert[]) {
    try {
      const { data: result, error } = await (supabase as any)
        .from('skills')
        .insert(skills)
        .select();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error inserting skills:', error);
      throw error;
    }
  }

  static async insertWorkExperience(experience: WorkExperienceInsert[]) {
    try {
      const { data: result, error } = await (supabase as any)
        .from('work_experience')
        .insert(experience)
        .select();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error inserting work experience:', error);
      throw error;
    }
  }

  static async insertEducation(education: EducationInsert[]) {
    try {
      const { data: result, error } = await (supabase as any)
        .from('education')
        .insert(education)
        .select();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error inserting education:', error);
      throw error;
    }
  }

  static async insertCertifications(certifications: CertificationsInsert[]) {
    try {
      const { data: result, error } = await (supabase as any)
        .from('certifications')
        .insert(certifications)
        .select();

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('Error inserting certifications:', error);
      throw error;
    }
  }

  static async getResumeWithData(resumeId: string) {
    try {
      // Get resume basic info
      const { data: resume, error: resumeError } = await (supabase as any)
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

      if (resumeError) throw resumeError;

      // Get parsed data
      const { data: parsedData, error: parsedError } = await (supabase as any)
        .from('parsed_data')
        .select('*')
        .eq('resume_id', resumeId)
        .single();

      // Get skills
      const { data: skills, error: skillsError } = await (supabase as any)
        .from('skills')
        .select('*')
        .eq('resume_id', resumeId);

      // Get work experience
      const { data: workExp, error: workError } = await (supabase as any)
        .from('work_experience')
        .select('*')
        .eq('resume_id', resumeId)
        .order('order_index');

      // Get education
      const { data: education, error: eduError } = await (supabase as any)
        .from('education')
        .select('*')
        .eq('resume_id', resumeId)
        .order('order_index');

      // Get certifications
      const { data: certifications, error: certError } = await (supabase as any)
        .from('certifications')
        .select('*')
        .eq('resume_id', resumeId);

      if (parsedError || skillsError || workError || eduError || certError) {
        console.warn('Some data could not be loaded:', { parsedError, skillsError, workError, eduError, certError });
      }

      return {
        resume,
        parsedData,
        skills: skills || [],
        workExperience: workExp || [],
        education: education || [],
        certifications: certifications || []
      };
    } catch (error) {
      console.error('Error getting resume data:', error);
      throw error;
    }
  } 
  static async deleteResume(id: string) {
    try {
      // Delete in order: certifications, education, work_experience, skills, parsed_data, resumes
      const { error: certError } = await (supabase as any).from('certifications').delete().eq('resume_id', id);
      if (certError) throw certError;

      const { error: eduError } = await (supabase as any).from('education').delete().eq('resume_id', id);
      if (eduError) throw eduError;

      const { error: workError } = await (supabase as any).from('work_experience').delete().eq('resume_id', id);
      if (workError) throw workError;

      const { error: skillsError } = await (supabase as any).from('skills').delete().eq('resume_id', id);
      if (skillsError) throw skillsError;

      const { error: parsedError } = await (supabase as any).from('parsed_data').delete().eq('resume_id', id);
      if (parsedError) throw parsedError;

      const { error: resumeError } = await (supabase as any).from('resumes').delete().eq('id', id);
      if (resumeError) throw resumeError;

      return true;
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  }

  static async deleteAllResumes() {
    try {
      const { data: resumeRows, error: loadError } = await (supabase as any)
        .from('resumes')
        .select('id');

      if (loadError) throw loadError;
      const resumeIds = (resumeRows || []).map((row: { id: string }) => row.id);

      if (resumeIds.length === 0) {
        return { deleted: 0 };
      }

      const relatedTables: Array<{ table: string; column: string }> = [
        { table: 'certifications', column: 'resume_id' },
        { table: 'education', column: 'resume_id' },
        { table: 'work_experience', column: 'resume_id' },
        { table: 'skills', column: 'resume_id' },
        { table: 'parsed_data', column: 'resume_id' },
      ];

      for (const { table, column } of relatedTables) {
        const { error } = await (supabase as any)
          .from(table)
          .delete()
          .in(column, resumeIds);

        if (error) throw error;
      }

      const { error: resumeError } = await (supabase as any)
        .from('resumes')
        .delete()
        .in('id', resumeIds);

      if (resumeError) throw resumeError;

      return { deleted: resumeIds.length };
    } catch (error) {
      console.error('Error clearing resumes:', error);
      throw error;
    }
  }
}
