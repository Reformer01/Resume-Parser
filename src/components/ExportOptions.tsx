import { Download, FileJson, FileSpreadsheet, FileText, FileCode, FileCheck } from 'lucide-react';
import type { ParsedResume } from '../lib/resumeParser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { exportAsATSPlainText, exportAsATSXML, exportAsEnhancedJSON } from '../lib/atsExporter';

interface ExportOptionsProps {
  data: ParsedResume;
  fileName: string;
}

export function ExportOptions({ data, fileName }: ExportOptionsProps) {
  const exportAsJSON = () => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_parsed.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsATSText = () => {
    const atsText = exportAsATSPlainText(data, fileName);
    const blob = new Blob([atsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_ats.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsXML = () => {
    const xmlContent = exportAsATSXML(data, fileName);
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_ats.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsEnhancedJSON = () => {
    const enhancedData = exportAsEnhancedJSON(data, fileName);
    const jsonStr = JSON.stringify(enhancedData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_enhanced.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsCSV = () => {
    const rows: string[][] = [];

    rows.push(['Personal Information', '']);
    rows.push(['Full Name', data.personalInfo.fullName || '']);
    rows.push(['Email', data.personalInfo.email || '']);
    rows.push(['Phone', data.personalInfo.phone || '']);
    rows.push(['Location', data.personalInfo.location || '']);
    rows.push(['LinkedIn', data.personalInfo.linkedinUrl || '']);
    rows.push(['GitHub', data.personalInfo.githubUrl || '']);
    rows.push(['Portfolio', data.personalInfo.portfolioUrl || '']);
    rows.push(['']);

    if (data.summary) {
      rows.push(['Professional Summary', '']);
      rows.push([data.summary, '']);
      rows.push(['']);
    }

    if (data.skills.length > 0) {
      rows.push(['Skills', 'Category']);
      data.skills.forEach(skill => {
        rows.push([skill.name, skill.category]);
      });
      rows.push(['']);
    }

    if (data.workExperience.length > 0) {
      rows.push(['Work Experience', '']);
      rows.push(['Company', 'Job Title', 'Start Date', 'End Date', 'Location']);
      data.workExperience.forEach(exp => {
        rows.push([
          exp.companyName,
          exp.jobTitle,
          exp.startDate || '',
          exp.isCurrent ? 'Present' : exp.endDate || '',
          exp.location || '',
        ]);
      });
      rows.push(['']);
    }

    if (data.education.length > 0) {
      rows.push(['Education', '']);
      rows.push(['Institution', 'Degree', 'Field of Study', 'End Date', 'GPA']);
      data.education.forEach(edu => {
        rows.push([
          edu.institutionName,
          edu.degree,
          edu.fieldOfStudy || '',
          edu.endDate || '',
          edu.gpa || '',
        ]);
      });
      rows.push(['']);
    }

    if (data.certifications.length > 0) {
      rows.push(['Certifications', '']);
      rows.push(['Name', 'Organization', 'Date']);
      data.certifications.forEach(cert => {
        rows.push([cert.name, cert.organization || '', cert.date || '']);
      });
    }

    const csvContent = rows.map(row =>
      row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_parsed.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Download the parsed resume data in your preferred format
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Standard Formats</h4>
          <Button onClick={exportAsJSON} className="w-full" variant="default">
            <FileJson className="w-4 h-4" />
            Export as JSON
          </Button>
          <Button onClick={exportAsCSV} className="w-full" variant="secondary">
            <FileSpreadsheet className="w-4 h-4" />
            Export as CSV
          </Button>
        </div>
        
        <div className="border-t border-slate-200 pt-3">
          <h4 className="text-sm font-medium text-slate-700 mb-2">ATS-Friendly Formats</h4>
          <Button onClick={exportAsATSText} className="w-full" variant="outline">
            <FileText className="w-4 h-4" />
            Export as ATS Text
          </Button>
          <Button onClick={exportAsXML} className="w-full" variant="outline">
            <FileCode className="w-4 h-4" />
            Export as XML
          </Button>
          <Button onClick={exportAsEnhancedJSON} className="w-full" variant="outline">
            <FileCheck className="w-4 h-4" />
            Export Enhanced JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
