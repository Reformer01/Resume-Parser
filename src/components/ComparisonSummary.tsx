import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus, Award, Briefcase, GraduationCap, Code, Link } from 'lucide-react';
import { cn } from '../lib/utils';

interface SummaryData {
  id: string;
  fileName: string;
  yearsOfExperience: number;
  skillCount: number;
  educationLevel: string;
  confidenceScore: number;
  hasLinkedIn: boolean;
  hasGitHub: boolean;
  hasPortfolio: boolean;
  summaryLength: number;
}

interface ComparisonSummaryProps {
  data: SummaryData[];
}

export function ComparisonSummary({ data }: ComparisonSummaryProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  const getTrendIcon = (value: number, maxValue: number) => {
    if (value === maxValue) return <TrendingUp className="w-4 h-4 text-emerald-600" />;
    if (value === 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-amber-600" />;
  };

  const getEducationRank = (level: string) => {
    const ranks = { 'PhD': 5, 'Master\'s': 4, 'Bachelor\'s': 3, 'Associate': 2, 'Other': 1, 'No Education': 0 };
    return ranks[level as keyof typeof ranks] || 0;
  };

  const maxYears = Math.max(...data.map(d => d.yearsOfExperience));
  const maxSkills = Math.max(...data.map(d => d.skillCount));
  const maxEducation = Math.max(...data.map(d => getEducationRank(d.educationLevel)));
  const maxScore = Math.max(...data.map(d => d.confidenceScore));
  const maxSummary = Math.max(...data.map(d => d.summaryLength));

  const metrics = [
    {
      title: 'Years of Experience',
      icon: <Briefcase className="w-5 h-5" />,
      getValue: (d: SummaryData) => d.yearsOfExperience,
      format: (value: number) => `${value} years`,
      maxValue: maxYears,
    },
    {
      title: 'Skills Count',
      icon: <Code className="w-5 h-5" />,
      getValue: (d: SummaryData) => d.skillCount,
      format: (value: number) => `${value} skills`,
      maxValue: maxSkills,
    },
    {
      title: 'Education Level',
      icon: <GraduationCap className="w-5 h-5" />,
      getValue: (d: SummaryData) => getEducationRank(d.educationLevel),
      format: (value: number) => data.find(d => getEducationRank(d.educationLevel) === value)?.educationLevel || '',
      maxValue: maxEducation,
    },
    {
      title: 'Confidence Score',
      icon: <Award className="w-5 h-5" />,
      getValue: (d: SummaryData) => d.confidenceScore,
      format: (value: number) => `${value}%`,
      maxValue: maxScore,
    },
    {
      title: 'Summary Length',
      icon: <Minus className="w-5 h-5" />,
      getValue: (d: SummaryData) => d.summaryLength,
      format: (value: number) => `${value} chars`,
      maxValue: maxSummary,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Overall Rankings
          </CardTitle>
          <CardDescription>
            Ranked by confidence score and key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data
              .sort((a, b) => b.confidenceScore - a.confidenceScore)
              .map((resume, index) => (
                <div
                  key={resume.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    index === 0 && "border-emerald-200 bg-emerald-50",
                    index === 1 && "border-amber-200 bg-amber-50",
                    index >= 2 && "border-slate-200 bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                      index === 0 && "bg-emerald-100 text-emerald-800",
                      index === 1 && "bg-amber-100 text-amber-800",
                      index >= 2 && "bg-slate-100 text-slate-800"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{resume.fileName}</h4>
                      <p className="text-sm text-slate-600">
                        {resume.yearsOfExperience} years exp • {resume.skillCount} skills • {resume.educationLevel}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getScoreBadge(resume.confidenceScore) as any}>
                    {resume.confidenceScore}%
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {metrics.map((metric, metricIndex) => (
          <Card key={metricIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {metric.icon}
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data
                .sort((a, b) => metric.getValue(b) - metric.getValue(a))
                .map((resume, index) => {
                  const value = metric.getValue(resume);
                  const isMax = value === metric.maxValue;
                  
                  return (
                    <div
                      key={resume.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        isMax && "bg-emerald-50 border border-emerald-200",
                        !isMax && "bg-slate-50 border border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getTrendIcon(value, metric.maxValue)}
                        <div>
                          <h5 className="font-medium text-slate-900">{resume.fileName}</h5>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-semibold",
                          isMax && "text-emerald-600",
                          !isMax && "text-slate-700"
                        )}>
                          {metric.format(value)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Online Presence Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Online Presence
          </CardTitle>
          <CardDescription>
            Professional online profiles and portfolios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((resume) => (
              <div key={resume.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <h5 className="font-medium text-slate-900">{resume.fileName}</h5>
                </div>
                <div className="flex items-center gap-2">
                  {resume.hasLinkedIn && (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      LinkedIn
                    </Badge>
                  )}
                  {resume.hasGitHub && (
                    <Badge variant="default" className="bg-gray-100 text-gray-800">
                      GitHub
                    </Badge>
                  )}
                  {resume.hasPortfolio && (
                    <Badge variant="default" className="bg-purple-100 text-purple-800">
                      Portfolio
                    </Badge>
                  )}
                  {!resume.hasLinkedIn && !resume.hasGitHub && !resume.hasPortfolio && (
                    <Badge variant="outline">
                      No Online Presence
                    </Badge>
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
