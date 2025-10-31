import { useState } from 'react';
import { Award, TrendingUp, TrendingDown, Minus, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { ParsedResume } from '../lib/resumeParser';
import { calculateAdvancedScore, type AdvancedScoreBreakdown } from '../lib/advancedScoring';

interface ResumeScoreBreakdownProps {
  data: ParsedResume;
  confidenceScore: number;
}

interface ScoreMetric {
  name: string;
  score: number;
  maxScore: number;
  status: 'good' | 'warning' | 'poor';
  feedback: string;
}

export function ResumeScoreBreakdown({ data, confidenceScore }: ResumeScoreBreakdownProps) {
  const [scoringMode, setScoringMode] = useState<'simple' | 'advanced'>('simple');
  const [advancedScore, setAdvancedScore] = useState<AdvancedScoreBreakdown | null>(null);

  // Calculate advanced score when switching to advanced mode
  const handleAdvancedToggle = () => {
    if (scoringMode === 'simple') {
      const score = calculateAdvancedScore(data);
      setAdvancedScore(score);
      setScoringMode('advanced');
    } else {
      setScoringMode('simple');
    }
  };

  const calculateMetrics = (): ScoreMetric[] => {
    const metrics: ScoreMetric[] = [];

    // Contact Information Completeness
    const contactFields = [
      data.personalInfo.fullName,
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location,
    ];
    const contactScore = (contactFields.filter(Boolean).length / contactFields.length) * 100;
    metrics.push({
      name: 'Contact Information',
      score: contactScore,
      maxScore: 100,
      status: contactScore >= 75 ? 'good' : contactScore >= 50 ? 'warning' : 'poor',
      feedback:
        contactScore >= 75
          ? 'All essential contact details provided'
          : contactScore >= 50
          ? 'Missing some contact information'
          : 'Critical contact information missing',
    });

    // Work Experience
    const expScore = Math.min((data.workExperience.length / 3) * 100, 100);
    metrics.push({
      name: 'Work Experience',
      score: expScore,
      maxScore: 100,
      status: expScore >= 66 ? 'good' : expScore >= 33 ? 'warning' : 'poor',
      feedback:
        expScore >= 66
          ? 'Strong work history documented'
          : expScore >= 33
          ? 'Limited work experience'
          : 'Minimal or no work experience',
    });

    // Education
    const eduScore = data.education.length > 0 ? 100 : 0;
    metrics.push({
      name: 'Education',
      score: eduScore,
      maxScore: 100,
      status: eduScore >= 50 ? 'good' : 'warning',
      feedback: eduScore >= 50 ? 'Education credentials provided' : 'No education information found',
    });

    // Skills
    const skillScore = Math.min((data.skills.length / 10) * 100, 100);
    metrics.push({
      name: 'Skills & Expertise',
      score: skillScore,
      maxScore: 100,
      status: skillScore >= 70 ? 'good' : skillScore >= 40 ? 'warning' : 'poor',
      feedback:
        skillScore >= 70
          ? 'Comprehensive skill set documented'
          : skillScore >= 40
          ? 'Basic skills listed'
          : 'Limited skills identified',
    });

    // Professional Summary
    const summaryScore = data.summary && data.summary.length > 50 ? 100 : 0;
    metrics.push({
      name: 'Professional Summary',
      score: summaryScore,
      maxScore: 100,
      status: summaryScore >= 50 ? 'good' : 'warning',
      feedback: summaryScore >= 50 ? 'Clear professional summary' : 'No professional summary found',
    });

    // Online Presence
    const onlineFields = [
      data.personalInfo.linkedinUrl,
      data.personalInfo.githubUrl,
      data.personalInfo.portfolioUrl,
    ];
    const onlineScore = (onlineFields.filter(Boolean).length / onlineFields.length) * 100;
    metrics.push({
      name: 'Online Presence',
      score: onlineScore,
      maxScore: 100,
      status: onlineScore >= 66 ? 'good' : onlineScore >= 33 ? 'warning' : 'poor',
      feedback:
        onlineScore >= 66
          ? 'Strong online professional presence'
          : onlineScore >= 33
          ? 'Some online profiles provided'
          : 'Limited online presence',
    });

    return metrics;
  };

  const metrics = calculateMetrics();
  const overallScore = Math.round(metrics.reduce((acc, m) => acc + m.score, 0) / metrics.length);

  const getScoreColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-emerald-600';
      case 'warning':
        return 'text-amber-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getScoreBadge = (status: string) => {
    switch (status) {
      case 'good':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'poor':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getScoreIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <TrendingUp className="w-4 h-4" />;
      case 'warning':
        return <Minus className="w-4 h-4" />;
      case 'poor':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="glass bg-white/90">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-black" />
              <span className="text-black font-semibold text-lg">Resume Quality Score</span>
            </CardTitle>
            <p className="text-sm text-gray-800 mt-1">
              {scoringMode === 'simple' 
                ? 'Detailed breakdown of resume completeness and quality'
                : 'Advanced ATS-compatible scoring with detailed analysis'
              }
            </p>
          </div>
          <Button
            onClick={handleAdvancedToggle}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {scoringMode === 'simple' ? (
              <>
                <BarChart3 className="w-4 h-4" />
                Advanced
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                Simple
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {scoringMode === 'simple' ? (
          <>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-600">Overall Quality Score</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{overallScore}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Parsing Confidence</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{confidenceScore}%</p>
              </div>
            </div>

            <div className="space-y-4">
              {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`${getScoreColor(metric.status)}`}>{getScoreIcon(metric.status)}</span>
                  <span className="text-sm font-medium text-slate-900">{metric.name}</span>
                </div>
                <Badge variant={getScoreBadge(metric.status) as any}>
                  {Math.round(metric.score)}%
                </Badge>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    metric.status === 'good'
                      ? 'bg-emerald-500'
                      : metric.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${metric.score}%` }}
                />
              </div>
              <p className="text-xs text-slate-600">{metric.feedback}</p>
            </div>
          ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-slate-600">Advanced ATS Score</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{advancedScore?.overallScore}%</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-slate-600">Simple Score</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{overallScore}%</p>
              </div>
            </div>

            <div className="space-y-4">
              {advancedScore && Object.entries(advancedScore.categories).map(([categoryKey, category]) => (
                <div key={categoryKey} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`${getScoreColor(category.score >= 70 ? 'good' : category.score >= 40 ? 'warning' : 'poor')}`}>
                        {getScoreIcon(category.score >= 70 ? 'good' : category.score >= 40 ? 'warning' : 'poor')}
                      </span>
                      <span className="text-sm font-medium text-slate-900">
                        {categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                    </div>
                    <Badge variant={getScoreBadge(category.score >= 70 ? 'good' : category.score >= 40 ? 'warning' : 'poor') as any}>
                      {Math.round(category.score)}%
                    </Badge>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        category.score >= 70
                          ? 'bg-emerald-500'
                          : category.score >= 40
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(category.details).map(([detailKey, detailScore]) => (
                      <div key={detailKey} className="flex justify-between">
                        <span className="text-slate-600">
                          {detailKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span className="font-medium">{Math.round(detailScore)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
