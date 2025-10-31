import { useState } from 'react';
import { FileText, Upload, Users, BarChart3 } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { BulkUploadQueue } from './components/BulkUploadQueue';
import { ParsedDataDisplay } from './components/ParsedDataDisplay';
import { ResumeHistory } from './components/ResumeHistory';
import { ResumeComparison } from './components/ResumeComparison';
import { ExportTemplates } from './components/ExportTemplates';
import { ResumeScoreBreakdown } from './components/ResumeScoreBreakdown';
import { FilePreview } from './components/FilePreview';
import { Button } from './components/ui/button';
import { DatabaseService } from './lib/databaseService';
import { ParsedResume, parseResume, calculateConfidenceScore } from './lib/resumeParser';
import { extractTextFromFile } from './lib/textExtraction';
import { supabase } from './lib/supabase';
import type { Database } from './lib/database.types';

type ViewMode = 'upload' | 'results' | 'bulk' | 'compare' | 'preview';

interface QueuedFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  progress?: number;
}

type ResumeWithData = {
  resume: Database['public']['Tables']['resumes']['Row'];
  parsedData: Database['public']['Tables']['parsed_data']['Row'] | null;
  skills: Database['public']['Tables']['skills']['Row'][];
  workExperience: Database['public']['Tables']['work_experience']['Row'][];
  education: Database['public']['Tables']['education']['Row'][];
  certifications: Database['public']['Tables']['certifications']['Row'][];
};

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState(-1);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [comparisonResumes, setComparisonResumes] = useState<any[]>([]);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelect = (file: File) => {
    setPendingFile(file);
    setViewMode('preview');
  };

  const handlePreviewConfirm = async () => {
    if (!pendingFile) return;

    setIsProcessing(true);
    setCurrentFileName(pendingFile.name);
    setViewMode('results');

    try {
      const resumeId = crypto.randomUUID();

      // Insert resume record
      await DatabaseService.insertResume({
        id: resumeId,
        file_name: pendingFile.name,
        file_type: pendingFile.type || pendingFile.name.split('.').pop() || 'unknown',
        file_size: pendingFile.size,
        parsing_status: 'processing',
      });

      const text = await extractTextFromFile(pendingFile);

      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the file. Please ensure the file contains readable text.');
      }

      // Update raw text
      await DatabaseService.updateResume(resumeId, { raw_text: text });

      const parsed = parseResume(text);
      const score = calculateConfidenceScore(parsed);

      // Update status and confidence score
      await DatabaseService.updateResume(resumeId, {
        parsing_status: 'completed',
        confidence_score: score,
      });

      // Insert parsed data
      await DatabaseService.insertParsedData({
        resume_id: resumeId,
        full_name: parsed.personalInfo.fullName,
        email: parsed.personalInfo.email,
        phone: parsed.personalInfo.phone,
        location: parsed.personalInfo.location,
        linkedin_url: parsed.personalInfo.linkedinUrl,
        github_url: parsed.personalInfo.githubUrl,
        portfolio_url: parsed.personalInfo.portfolioUrl,
        summary: parsed.summary,
      });

      // Insert skills
      if (parsed.skills.length > 0) {
        await DatabaseService.insertSkills(
          parsed.skills.map((skill: { name: string; category: string }) => ({
            resume_id: resumeId,
            skill_name: skill.name,
            category: skill.category,
          }))
        );
      }

      // Insert work experience
      if (parsed.workExperience.length > 0) {
        await DatabaseService.insertWorkExperience(
          parsed.workExperience.map((exp: any, index: number) => ({
            resume_id: resumeId,
            company_name: exp.companyName,
            job_title: exp.jobTitle,
            location: exp.location,
            start_date: exp.startDate,
            end_date: exp.endDate,
            is_current: exp.isCurrent,
            description: exp.description,
            order_index: index,
          }))
        );
      }

      // Insert education
      if (parsed.education.length > 0) {
        await DatabaseService.insertEducation(
          parsed.education.map((edu: any, index: number) => ({
            resume_id: resumeId,
            institution_name: edu.institutionName,
            degree: edu.degree,
            field_of_study: edu.fieldOfStudy,
            location: edu.location,
            start_date: edu.startDate,
            end_date: edu.endDate,
            gpa: edu.gpa,
            order_index: index,
          }))
        );
      }

      // Insert certifications
      if (parsed.certifications.length > 0) {
        await DatabaseService.insertCertifications(
          parsed.certifications.map((cert: { name: string; organization: string | null; date: string | null }) => ({
            resume_id: resumeId,
            certification_name: cert.name,
            issuing_organization: cert.organization,
            issue_date: cert.date,
          }))
        );
      }

      setParsedData(parsed);
      setConfidenceScore(score);
      setCurrentResumeId(resumeId);
      setRefreshHistory(prev => prev + 1);
    } catch (error) {
      console.error('Error processing resume:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process resume. Please try again.';
      alert(errorMessage);

      setIsProcessing(false);
      throw error;
    } finally {
      setIsProcessing(false);
      setPendingFile(null);
    }
  };

  const handlePreviewCancel = () => {
    setPendingFile(null);
    setViewMode('upload');
  };

  const handleSelectResume = async (resumeId: string) => {
    console.log('Resume selected:', resumeId);
    try {
      const resumeData: ResumeWithData = await DatabaseService.getResumeWithData(resumeId) as ResumeWithData;

      const reconstructedData: ParsedResume = {
        personalInfo: {
          fullName: resumeData.parsedData?.full_name || null,
          email: resumeData.parsedData?.email || null,
          phone: resumeData.parsedData?.phone || null,
          location: resumeData.parsedData?.location || null,
          linkedinUrl: resumeData.parsedData?.linkedin_url || null,
          githubUrl: resumeData.parsedData?.github_url || null,
          portfolioUrl: resumeData.parsedData?.portfolio_url || null,
        },
        summary: resumeData.parsedData?.summary || null,
        skills: resumeData.skills.map((s: { skill_name: string; category: string | null }) => ({
          name: s.skill_name,
          category: s.category || 'General',
        })),
        workExperience: resumeData.workExperience.map((exp: { company_name: string; job_title: string; location: string | null; start_date: string | null; end_date: string | null; is_current: boolean; description: string | null }) => ({
          companyName: exp.company_name,
          jobTitle: exp.job_title,
          location: exp.location,
          startDate: exp.start_date,
          endDate: exp.end_date,
          isCurrent: exp.is_current,
          description: exp.description,
        })),
        education: resumeData.education.map((edu: { institution_name: string; degree: string; field_of_study: string | null; location: string | null; start_date: string | null; end_date: string | null; gpa: string | null }) => ({
          institutionName: edu.institution_name,
          degree: edu.degree,
          fieldOfStudy: edu.field_of_study,
          location: edu.location,
          startDate: edu.start_date,
          endDate: edu.end_date,
          gpa: edu.gpa,
        })),
        certifications: resumeData.certifications.map((cert: { certification_name: string; issuing_organization: string | null; issue_date: string | null }) => ({
          name: cert.certification_name,
          organization: cert.issuing_organization,
          date: cert.issue_date,
        })),
      };

      setParsedData(reconstructedData);
      setConfidenceScore(resumeData.resume.confidence_score || 0);
      setCurrentFileName(resumeData.resume.file_name);
      setCurrentResumeId(resumeId);
      setViewMode('results');
    } catch (error) {
      console.error('Error loading resume:', error);
      alert('Failed to load resume');
    }
  };

  const handleUpdateData = async (updatedData: ParsedResume) => {
    setParsedData(updatedData);

    if (currentResumeId) {
      try {
        await DatabaseService.updateResume(currentResumeId, {
          parsing_status: 'completed',
          confidence_score: confidenceScore,
        });

        // Note: In a real implementation, you might want to update parsed_data table here too
        // For now, we'll just update the resume status
      } catch (error) {
        console.error('Error updating data:', error);
      }
    }
  };

  const handleNewUpload = () => {
    console.log('New upload clicked');
    setViewMode('upload');
    console.log('View mode changed to upload');
    setParsedData(null);
    setCurrentResumeId(null);
    setCurrentFileName('');
  };

  const handleMultipleFilesSelect = (files: File[]) => {
    console.log('Multiple files selected:', files.length);
    const newQueuedFiles: QueuedFile[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending' as const,
    }));
    setQueuedFiles(newQueuedFiles);
    setViewMode('bulk');
    console.log('View mode changed to bulk');
  };

  const handleRemoveQueuedFile = (fileId: string) => {
    console.log('Remove queued file clicked:', fileId);
    setQueuedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleClearQueue = () => {
    console.log('Clear queue clicked');
    setQueuedFiles([]);
    setViewMode('upload');
    console.log('View mode changed to upload');
  };

  const handleProcessQueue = async () => {
    console.log('Process queue clicked');
    const pendingFiles = queuedFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    for (let i = 0; i < pendingFiles.length; i++) {
      const queuedFile = pendingFiles[i];
      setCurrentProcessingIndex(i);
      
      // Update status to processing
      setQueuedFiles(prev => prev.map(f => 
        f.id === queuedFile.id ? { ...f, status: 'processing' as const } : f
      ));

      try {
        // Process the file using existing logic but don't change view mode
        await handleFileSelect(queuedFile.file);
        
        // Update status to completed
        setQueuedFiles(prev => prev.map(f => 
          f.id === queuedFile.id ? { ...f, status: 'completed' as const } : f
        ));
      } catch (error) {
        // Update status to failed
        setQueuedFiles(prev => prev.map(f => 
          f.id === queuedFile.id ? { 
            ...f, 
            status: 'failed' as const,
            error: error instanceof Error ? error.message : 'Processing failed'
          } : f
        ));
      }
    }

    setCurrentProcessingIndex(-1);
    setRefreshHistory(prev => prev + 1);
  };

  const handleToggleComparison = (resumeId: string) => {
    setSelectedForComparison(prev => {
      if (prev.includes(resumeId)) {
        return prev.filter(id => id !== resumeId);
      } else if (prev.length < 4) { // Limit to 4 resumes for comparison
        return [...prev, resumeId];
      }
      return prev;
    });
  };

  const handleStartComparison = async () => {
    if (selectedForComparison.length < 2) return;

    try {
      const comparisonData = await Promise.all(
        selectedForComparison.map(async (resumeId) => {
          const { data: resume, error: resumeError } = await supabase
            .from('resumes')
            .select('*')
            .eq('id', resumeId)
            .maybeSingle() as { data: Database['public']['Tables']['resumes']['Row'] | null, error: any };

          if (resumeError) throw resumeError;
          if (!resume) throw new Error('Resume not found');

          const { data: parsedDataRow, error: parsedError } = await supabase
            .from('parsed_data')
            .select('*')
            .eq('resume_id', resumeId)
            .maybeSingle() as { data: Database['public']['Tables']['parsed_data']['Row'] | null, error: any };

          const { data: skills, error: skillsError } = await supabase
            .from('skills')
            .select('*')
            .eq('resume_id', resumeId);

          const { data: workExp, error: workError } = await supabase
            .from('work_experience')
            .select('*')
            .eq('resume_id', resumeId)
            .order('order_index');

          const { data: education, error: eduError } = await supabase
            .from('education')
            .select('*')
            .eq('resume_id', resumeId)
            .order('order_index');

          const { data: certifications, error: certError } = await supabase
            .from('certifications')
            .select('*')
            .eq('resume_id', resumeId);

          if (parsedError || skillsError || workError || eduError || certError) {
            throw new Error('Failed to load resume data');
          }

          const reconstructedData: ParsedResume = {
            personalInfo: {
              fullName: parsedDataRow?.full_name || null,
              email: parsedDataRow?.email || null,
              phone: parsedDataRow?.phone || null,
              location: parsedDataRow?.location || null,
              linkedinUrl: parsedDataRow?.linkedin_url || null,
              githubUrl: parsedDataRow?.github_url || null,
              portfolioUrl: parsedDataRow?.portfolio_url || null,
            },
            summary: parsedDataRow?.summary || null,
            skills: (skills || []).map((s: { skill_name: string; category: string | null }) => ({
              name: s.skill_name,
              category: s.category || 'General',
            })),
            workExperience: (workExp || []).map((exp: { company_name: string; job_title: string; location: string | null; start_date: string | null; end_date: string | null; is_current: boolean; description: string | null }) => ({
              companyName: exp.company_name,
              jobTitle: exp.job_title,
              location: exp.location,
              startDate: exp.start_date,
              endDate: exp.end_date,
              isCurrent: exp.is_current,
              description: exp.description,
            })),
            education: (education || []).map((edu: { institution_name: string; degree: string; field_of_study: string | null; location: string | null; start_date: string | null; end_date: string | null; gpa: string | null }) => ({
              institutionName: edu.institution_name,
              degree: edu.degree,
              fieldOfStudy: edu.field_of_study,
              location: edu.location,
              startDate: edu.start_date,
              endDate: edu.end_date,
              gpa: edu.gpa,
            })),
            certifications: (certifications || []).map((cert: { certification_name: string; issuing_organization: string | null; issue_date: string | null }) => ({
              name: cert.certification_name,
              organization: cert.issuing_organization,
              date: cert.issue_date,
            })),
          };

          return {
            id: resumeId,
            fileName: resume.file_name,
            data: reconstructedData,
            confidenceScore: resume.confidence_score || 0,
          };
        })
      );

      setComparisonResumes(comparisonData);
      setViewMode('compare');
    } catch (error) {
      console.error('Error loading comparison data:', error);
      alert('Failed to load comparison data');
    }
  };

  const handleResumeDeleted = () => {
    setRefreshHistory(prev => prev + 1);
  };

  const handleCloseComparison = () => {
    setViewMode('upload');
    setComparisonMode(false);
    setSelectedForComparison([]);
    setComparisonResumes([]);
  };

  return (
    <div
      className="min-h-screen bg-platform relative"
      style={{
        backgroundImage: "url('/9.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background image with no overlay or floating elements - completely visible */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ zIndex: 10 }}>
        <header className="mb-8 header-glass p-6" style={{ zIndex: 20 }}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-4 glass rounded-xl shadow-lg">
                <img
                  src="/TL logo.png"
                  alt="TalentLens Logo"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 drop-shadow-sm">
                  TalentLens
                </h1>
                <p className="text-gray-700 text-sm mt-1 font-medium">
                  Intelligent resume parsing and analysis
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className={`btn-glass ${viewMode === 'upload' ? 'btn-active' : 'text-gray-900 border-gray-200 hover:bg-white/80'}`}
                onClick={() => setViewMode('upload')}
              >
                <Upload className="w-4 h-4 mr-2" />
                Single Upload
              </Button>
              <Button
                size="sm"
                className={`btn-glass ${viewMode === 'bulk' ? 'btn-active' : 'text-gray-900 border-gray-200 hover:bg-white/80'}`}
                onClick={() => setViewMode('bulk')}
              >
                <Users className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button
                size="sm"
                className={`btn-glass ${comparisonMode ? 'btn-active' : 'text-gray-900 border-gray-200 hover:bg-white/80'}`}
                onClick={() => {
                  setComparisonMode(!comparisonMode);
                  if (comparisonMode) {
                    setSelectedForComparison([]);
                  }
                }}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Compare
              </Button>
              {selectedForComparison.length >= 2 && (
                <Button
                  variant="default"
                  size="sm"
                  className="glass-dark bg-emerald-500/25 text-white border-emerald-400/40 hover:bg-emerald-500/35"
                  onClick={handleStartComparison}
                >
                  Compare {selectedForComparison.length} Resumes
                </Button>
              )}
            </div>
          </div>
        </header>

        {viewMode === 'upload' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            </div>

            <div className="lg:col-span-1">
              <ResumeHistory 
                onSelectResume={handleSelectResume} 
                refreshTrigger={refreshHistory}
                comparisonMode={comparisonMode}
                selectedForComparison={selectedForComparison}
                onToggleComparison={handleToggleComparison}
                onResumeDeleted={handleResumeDeleted}
              />
            </div>
          </div>
        ) : viewMode === 'bulk' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FileUpload 
                onFileSelect={handleFileSelect} 
                onMultipleFilesSelect={handleMultipleFilesSelect}
                isProcessing={isProcessing}
                allowMultiple={true}
              />
              {queuedFiles.length > 0 && (
                <div className="mt-6">
                  <BulkUploadQueue
                    files={queuedFiles}
                    onProcessQueue={handleProcessQueue}
                    onRemoveFile={handleRemoveQueuedFile}
                    onClearQueue={handleClearQueue}
                    isProcessing={isProcessing}
                    currentProcessingIndex={currentProcessingIndex}
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <ResumeHistory 
                onSelectResume={handleSelectResume} 
                refreshTrigger={refreshHistory}
                comparisonMode={comparisonMode}
                selectedForComparison={selectedForComparison}
                onToggleComparison={handleToggleComparison}
                onResumeDeleted={handleResumeDeleted}
              />
            </div>
          </div>
        ) : viewMode === 'compare' ? (
          <ResumeComparison 
            resumes={comparisonResumes} 
            onClose={handleCloseComparison} 
          />
        ) : viewMode === 'preview' && pendingFile ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <FilePreview
              file={pendingFile}
              onConfirm={handlePreviewConfirm}
              onCancel={handlePreviewCancel}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between glass-dark p-6 rounded-2xl border border-white/15">
              <div className="flex items-center gap-3">
                <div className="p-3 glass rounded-xl">
                  <FileText className="w-5 h-5 text-white/80" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-lg">{currentFileName}</h2>
                  <p className="text-sm text-gray-700">Resume parsed successfully</p>
                </div>
              </div>
              <Button
                size="sm"
                className="btn-glass btn-active hover:scale-105 transition-transform"
                onClick={handleNewUpload}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload New
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {parsedData && (
                  <ParsedDataDisplay
                    data={parsedData}
                    onUpdate={handleUpdateData}
                    confidenceScore={confidenceScore}
                  />
                )}
              </div>

              <div className="lg:col-span-1 space-y-6">
                {parsedData && (
                  <>
                    <ResumeScoreBreakdown data={parsedData} confidenceScore={confidenceScore} />
                    <ExportTemplates data={parsedData} />
                  </>
                )}
                <ResumeHistory 
                  onSelectResume={handleSelectResume} 
                  refreshTrigger={refreshHistory}
                  comparisonMode={comparisonMode}
                  selectedForComparison={selectedForComparison}
                  onToggleComparison={handleToggleComparison}
                  onResumeDeleted={handleResumeDeleted}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
