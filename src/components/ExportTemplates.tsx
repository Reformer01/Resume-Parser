import { useState } from 'react';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  FileCode,
  FileCheck,
  Briefcase,
  GraduationCap,
  Award,
  Settings,
  Eye,
  Palette,
  CheckCircle
} from 'lucide-react';
import type { ParsedResume } from '../lib/resumeParser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  format: 'json' | 'csv' | 'txt' | 'xml' | 'pdf';
  category: 'standard' | 'ats' | 'professional' | 'technical';
  customizable: boolean;
}

const exportTemplates: ExportTemplate[] = [
  // Standard Templates
  {
    id: 'standard-json',
    name: 'Standard JSON',
    description: 'Complete structured data in JSON format',
    icon: <FileJson className="w-4 h-4" />,
    format: 'json',
    category: 'standard',
    customizable: false,
  },
  {
    id: 'standard-csv',
    name: 'CSV Spreadsheet',
    description: 'Tabular format perfect for Excel',
    icon: <FileSpreadsheet className="w-4 h-4" />,
    format: 'csv',
    category: 'standard',
    customizable: false,
  },

  // ATS-Friendly Templates
  {
    id: 'ats-plain',
    name: 'ATS Plain Text',
    description: 'Optimized for ATS parsing systems',
    icon: <FileText className="w-4 h-4" />,
    format: 'txt',
    category: 'ats',
    customizable: true,
  },
  {
    id: 'ats-xml',
    name: 'ATS XML Format',
    description: 'HR-XML standard format',
    icon: <FileCode className="w-4 h-4" />,
    format: 'xml',
    category: 'ats',
    customizable: true,
  },
  {
    id: 'ats-enhanced',
    name: 'Enhanced JSON',
    description: 'JSON with ATS optimization metadata',
    icon: <FileCheck className="w-4 h-4" />,
    format: 'json',
    category: 'ats',
    customizable: true,
  },

  // Professional Templates
  {
    id: 'professional-summary',
    name: 'Executive Summary',
    description: 'Concise professional summary format',
    icon: <Briefcase className="w-4 h-4" />,
    format: 'txt',
    category: 'professional',
    customizable: true,
  },
  {
    id: 'professional-detailed',
    name: 'Detailed Profile',
    description: 'Comprehensive professional profile',
    icon: <GraduationCap className="w-4 h-4" />,
    format: 'txt',
    category: 'professional',
    customizable: true,
  },

  // Technical Templates
  {
    id: 'technical-skills',
    name: 'Technical Skills Matrix',
    description: 'Focus on technical skills and competencies',
    icon: <Settings className="w-4 h-4" />,
    format: 'csv',
    category: 'technical',
    customizable: true,
  },
  {
    id: 'technical-experience',
    name: 'Technical Experience',
    description: 'Detailed technical experience breakdown',
    icon: <Award className="w-4 h-4" />,
    format: 'txt',
    category: 'technical',
    customizable: true,
  },
];

export function ExportTemplates({ data }: { data: ParsedResume }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const filteredTemplates = selectedCategory === 'all'
    ? exportTemplates
    : exportTemplates.filter(template => template.category === selectedCategory);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    generatePreview(templateId);
    setShowPreview(true);
  };

  const generatePreview = (templateId: string) => {
    const template = exportTemplates.find(t => t.id === templateId);
    if (!template) return;

    switch (templateId) {
      case 'standard-json':
        setPreviewContent(JSON.stringify(data, null, 2));
        break;
      case 'standard-csv':
        setPreviewContent(generateCSVPreview(data));
        break;
      case 'ats-plain':
        setPreviewContent(generateATSPlainPreview(data));
        break;
      case 'professional-summary':
        setPreviewContent(generateProfessionalSummaryPreview(data));
        break;
      case 'technical-skills':
        setPreviewContent(generateTechnicalSkillsPreview(data));
        break;
      default:
        setPreviewContent('Preview not available for this template.');
    }
  };

  const generateCSVPreview = (data: ParsedResume) => {
    const rows = [
      ['Section', 'Value'],
      ['Name', data.personalInfo.fullName || ''],
      ['Email', data.personalInfo.email || ''],
      ['Phone', data.personalInfo.phone || ''],
      ['Location', data.personalInfo.location || ''],
      ['Skills', data.skills.map(s => s.name).join('; ')],
      ['Experience', data.workExperience.map(exp =>
        `${exp.jobTitle} at ${exp.companyName}`
      ).join('; ')],
    ];
    return rows.map(row => row.join(',')).join('\n');
  };

  const generateATSPlainPreview = (data: ParsedResume) => {
    let content = `${data.personalInfo.fullName || 'Name'}\n`;
    content += `${data.personalInfo.email || 'Email'}\n`;
    content += `${data.personalInfo.phone || 'Phone'}\n`;
    if (data.personalInfo.location) content += `${data.personalInfo.location}\n`;
    content += '\n';

    if (data.summary) {
      content += `SUMMARY\n${data.summary}\n\n`;
    }

    if (data.skills.length > 0) {
      content += `SKILLS\n${data.skills.map(s => s.name).join(', ')}\n\n`;
    }

    if (data.workExperience.length > 0) {
      content += 'EXPERIENCE\n';
      data.workExperience.forEach(exp => {
        content += `${exp.jobTitle} - ${exp.companyName}\n`;
        if (exp.description) content += `${exp.description}\n`;
        content += '\n';
      });
    }

    return content;
  };

  const generateProfessionalSummaryPreview = (data: ParsedResume) => {
    let content = `PROFESSIONAL SUMMARY\n\n`;
    content += `${data.personalInfo.fullName || 'Professional'}\n\n`;

    if (data.personalInfo.location) {
      content += `Location: ${data.personalInfo.location}\n`;
    }
    content += `Email: ${data.personalInfo.email || 'Not provided'}\n`;
    content += `Phone: ${data.personalInfo.phone || 'Not provided'}\n\n`;

    if (data.summary) {
      content += `OVERVIEW\n${data.summary}\n\n`;
    }

    if (data.workExperience.length > 0) {
      content += 'CAREER HIGHLIGHTS\n';
      data.workExperience.slice(0, 3).forEach((exp, index) => {
        content += `${index + 1}. ${exp.jobTitle} at ${exp.companyName}`;
        if (exp.description) {
          content += ` - ${exp.description.split('.')[0]}.`;
        }
        content += '\n';
      });
      content += '\n';
    }

    if (data.skills.length > 0) {
      content += `CORE COMPETENCIES\n${data.skills.slice(0, 10).map(s => s.name).join(' • ')}\n`;
    }

    return content;
  };

  const generateTechnicalSkillsPreview = (data: ParsedResume) => {
    const rows = [
      ['Category', 'Skill'],
      ...data.skills.map(skill => [
        skill.category || 'General',
        skill.name
      ])
    ];
    return rows.map(row => row.join(',')).join('\n');
  };

  const handleExport = () => {
    if (!selectedTemplate) return;

    const template = exportTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    // Here you would implement the actual export functionality
    console.log(`Exporting with template: ${template.name}`);
  };

  return (
    <Card className="glass bg-white/90">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-black" />
          <h3 className="text-black font-semibold text-lg">Export Templates</h3>
        </div>
        <p className="text-sm text-gray-800 mt-1">Choose from professionally designed export templates</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">Template Category</label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Templates' },
              { value: 'standard', label: 'Standard' },
              { value: 'ats', label: 'ATS-Friendly' },
              { value: 'professional', label: 'Professional' },
              { value: 'technical', label: 'Technical' }
            ].map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid gap-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate === template.id
                  ? 'border-slate-400 bg-slate-50'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{template.icon}</div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-slate-900">{template.name}</h4>
                    <p className="text-sm text-slate-600">{template.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.format.toUpperCase()}
                      </Badge>
                      <Badge
                        variant={template.category === 'ats' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {template.category}
                      </Badge>
                      {template.customizable && (
                        <Badge variant="outline" className="text-xs">
                          Customizable
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {selectedTemplate === template.id && (
                  <div className="text-slate-400">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Preview and Export */}
        {selectedTemplate && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Preview</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>

            {showPreview && (
              <div className="p-4 bg-slate-50 border rounded-lg">
                <pre className="text-xs font-mono whitespace-pre-wrap break-words max-h-64 overflow-auto">
                  {previewContent}
                </pre>
              </div>
            )}

            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Export with Selected Template
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
