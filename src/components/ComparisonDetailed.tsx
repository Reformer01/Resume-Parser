import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, GraduationCap, Award, Code } from 'lucide-react';
import { cn } from '../lib/utils';
import type { ParsedResume } from '../lib/resumeParser';

interface ResumeComparisonData {
  id: string;
  fileName: string;
  data: ParsedResume;
  confidenceScore: number;
}

interface ComparisonDetailedProps {
  resumes: ResumeComparisonData[];
}

export function ComparisonDetailed({ resumes }: ComparisonDetailedProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const getSkillCategoryColor = (category: string) => {
    const colors = {
      'Technical': 'bg-blue-100 text-blue-800',
      'Soft': 'bg-green-100 text-green-800',
      'Language': 'bg-purple-100 text-purple-800',
      'General': 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.General;
  };

  return (
    <div className="space-y-6">
      {/* Personal Information Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-semibold text-slate-900 truncate">{resume.fileName}</h4>
                  <Badge variant="secondary">{resume.confidenceScore}%</Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Name:</span>
                    <span className="font-medium">{resume.data.personalInfo.fullName || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Email:</span>
                    <span className="font-medium truncate">{resume.data.personalInfo.email || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Phone:</span>
                    <span className="font-medium">{resume.data.personalInfo.phone || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Location:</span>
                    <span className="font-medium">{resume.data.personalInfo.location || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">LinkedIn:</span>
                    <span className="font-medium">{resume.data.personalInfo.linkedinUrl ? 'Yes' : 'No'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">GitHub:</span>
                    <span className="font-medium">{resume.data.personalInfo.githubUrl ? 'Yes' : 'No'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Portfolio:</span>
                    <span className="font-medium">{resume.data.personalInfo.portfolioUrl ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Professional Summary Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Professional Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-2">{resume.fileName}</h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {resume.data.summary || 'No professional summary provided'}
                </p>
                {resume.data.summary && (
                  <p className="text-xs text-slate-500 mt-2">
                    {resume.data.summary.length} characters
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Skills & Expertise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{resume.fileName}</h4>
                  <Badge variant="outline">{resume.data.skills.length} skills</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.data.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className={cn("text-xs", getSkillCategoryColor(skill.category))}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                  {resume.data.skills.length === 0 && (
                    <p className="text-sm text-slate-500">No skills listed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Work Experience Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Work Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{resume.fileName}</h4>
                  <Badge variant="outline">{resume.data.workExperience.length} positions</Badge>
                </div>
                <div className="space-y-3">
                  {resume.data.workExperience.map((exp, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-slate-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-slate-900">{exp.jobTitle}</h5>
                          <p className="text-sm text-slate-600">{exp.companyName}</p>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p>{formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}</p>
                          {exp.location && <p>{exp.location}</p>}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-slate-700">{exp.description}</p>
                      )}
                    </div>
                  ))}
                  {resume.data.workExperience.length === 0 && (
                    <p className="text-sm text-slate-500">No work experience listed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Education Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{resume.fileName}</h4>
                  <Badge variant="outline">{resume.data.education.length} entries</Badge>
                </div>
                <div className="space-y-3">
                  {resume.data.education.map((edu, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-slate-100">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h5 className="font-medium text-slate-900">{edu.degree}</h5>
                          <p className="text-sm text-slate-600">{edu.institutionName}</p>
                          {edu.fieldOfStudy && (
                            <p className="text-sm text-slate-500">{edu.fieldOfStudy}</p>
                          )}
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p>
                          {edu.location && <p>{edu.location}</p>}
                        </div>
                      </div>
                      {edu.gpa && (
                        <p className="text-sm text-slate-700">GPA: {edu.gpa}</p>
                      )}
                    </div>
                  ))}
                  {resume.data.education.length === 0 && (
                    <p className="text-sm text-slate-500">No education listed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certifications Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumes.map((resume) => (
              <div key={resume.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{resume.fileName}</h4>
                  <Badge variant="outline">{resume.data.certifications.length} certifications</Badge>
                </div>
                <div className="space-y-2">
                  {resume.data.certifications.map((cert, index) => (
                    <div key={index} className="p-2 bg-white rounded-lg border border-slate-100">
                      <h5 className="font-medium text-slate-900 text-sm">{cert.name}</h5>
                      {cert.organization && (
                        <p className="text-xs text-slate-600">{cert.organization}</p>
                      )}
                      {cert.date && (
                        <p className="text-xs text-slate-500">{formatDate(cert.date)}</p>
                      )}
                    </div>
                  ))}
                  {resume.data.certifications.length === 0 && (
                    <p className="text-sm text-slate-500">No certifications listed</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
