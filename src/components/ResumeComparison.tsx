import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ComparisonSummary } from './ComparisonSummary';
import { ComparisonDetailed } from './ComparisonDetailed';
import { BarChart3, FileText, Users } from 'lucide-react';
import type { ParsedResume } from '../lib/resumeParser';

interface ResumeComparisonData {
  id: string;
  fileName: string;
  data: ParsedResume;
  confidenceScore: number;
}

interface ResumeComparisonProps {
  resumes: ResumeComparisonData[];
  onClose: () => void;
}

export function ResumeComparison({ resumes, onClose }: ResumeComparisonProps) {
  const [activeTab, setActiveTab] = useState('summary');

  const calculateYearsOfExperience = (workExp: ParsedResume['workExperience']): number => {
    if (workExp.length === 0) return 0;
    
    let totalMonths = 0;
    workExp.forEach(exp => {
      if (exp.startDate && exp.endDate) {
        const start = new Date(exp.startDate);
        const end = exp.isCurrent ? new Date() : new Date(exp.endDate);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        totalMonths += Math.max(0, months);
      }
    });
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
  };

  const getEducationLevel = (education: ParsedResume['education']): string => {
    if (education.length === 0) return 'No Education';
    
    const degrees = education.map(edu => edu.degree.toLowerCase());
    
    if (degrees.some(deg => deg.includes('phd') || deg.includes('doctorate'))) {
      return 'PhD';
    } else if (degrees.some(deg => deg.includes('master') || deg.includes('mba'))) {
      return 'Master\'s';
    } else if (degrees.some(deg => deg.includes('bachelor') || deg.includes('b.s.') || deg.includes('b.a.'))) {
      return 'Bachelor\'s';
    } else if (degrees.some(deg => deg.includes('associate') || deg.includes('diploma'))) {
      return 'Associate';
    } else {
      return 'Other';
    }
  };

  // Prepare summary data for comparison
  const summaryData = resumes.map(resume => ({
    id: resume.id,
    fileName: resume.fileName,
    yearsOfExperience: calculateYearsOfExperience(resume.data.workExperience),
    skillCount: resume.data.skills.length,
    educationLevel: getEducationLevel(resume.data.education),
    confidenceScore: resume.confidenceScore,
    hasLinkedIn: !!resume.data.personalInfo.linkedinUrl,
    hasGitHub: !!resume.data.personalInfo.githubUrl,
    hasPortfolio: !!resume.data.personalInfo.portfolioUrl,
    summaryLength: resume.data.summary?.length || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-sm">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Resume Comparison</h2>
            <p className="text-slate-600 text-sm">
              Comparing {resumes.length} resume{resumes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={onClose} variant="outline">
          Close Comparison
        </Button>
      </div>

      {/* Resume Selection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Selected Resumes
          </CardTitle>
          <CardDescription>
            {resumes.length} resume{resumes.length !== 1 ? 's' : ''} selected for comparison
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {resumes.map((resume, index) => (
              <div key={resume.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                <FileText className="w-4 h-4 text-slate-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{resume.fileName}</p>
                  <p className="text-xs text-slate-500">{resume.confidenceScore}% confidence</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Detailed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-6">
          <ComparisonSummary data={summaryData} />
        </TabsContent>

        <TabsContent value="detailed" className="mt-6">
          <ComparisonDetailed resumes={resumes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
