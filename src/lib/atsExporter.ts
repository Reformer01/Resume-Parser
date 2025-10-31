import type { ParsedResume } from './resumeParser';
import { ATS_KEYWORDS } from './advancedScoring';

export interface ATSExportData {
  resume: ParsedResume;
  fileName: string;
  atsKeywords: string[];
  optimizationSuggestions: string[];
  exportDate: string;
}

export function exportAsATSPlainText(resume: ParsedResume, fileName: string): string {
  let atsText = '';
  
  // Header with name and contact info
  atsText += `${resume.personalInfo.fullName || 'Name Not Provided'}\n`;
  atsText += `${resume.personalInfo.email || 'Email Not Provided'}\n`;
  atsText += `${resume.personalInfo.phone || 'Phone Not Provided'}\n`;
  if (resume.personalInfo.location) {
    atsText += `${resume.personalInfo.location}\n`;
  }
  atsText += '\n';
  
  // Professional Summary
  if (resume.summary) {
    atsText += 'PROFESSIONAL SUMMARY\n';
    atsText += `${resume.summary}\n\n`;
  }
  
  // Work Experience
  if (resume.workExperience.length > 0) {
    atsText += 'WORK EXPERIENCE\n';
    resume.workExperience.forEach((exp, index) => {
      atsText += `${exp.jobTitle}\n`;
      atsText += `${exp.companyName}\n`;
      if (exp.location) {
        atsText += `${exp.location}\n`;
      }
      atsText += `${exp.startDate || 'Start Date Not Provided'} - ${exp.isCurrent ? 'Present' : exp.endDate || 'End Date Not Provided'}\n`;
      if (exp.description) {
        atsText += `${exp.description}\n`;
      }
      if (index < resume.workExperience.length - 1) {
        atsText += '\n';
      }
    });
    atsText += '\n';
  }
  
  // Education
  if (resume.education.length > 0) {
    atsText += 'EDUCATION\n';
    resume.education.forEach((edu, index) => {
      atsText += `${edu.degree}\n`;
      atsText += `${edu.institutionName}\n`;
      if (edu.fieldOfStudy) {
        atsText += `${edu.fieldOfStudy}\n`;
      }
      if (edu.location) {
        atsText += `${edu.location}\n`;
      }
      if (edu.startDate || edu.endDate) {
        atsText += `${edu.startDate || 'Start Date Not Provided'} - ${edu.endDate || 'End Date Not Provided'}\n`;
      }
      if (edu.gpa) {
        atsText += `GPA: ${edu.gpa}\n`;
      }
      if (index < resume.education.length - 1) {
        atsText += '\n';
      }
    });
    atsText += '\n';
  }
  
  // Skills
  if (resume.skills.length > 0) {
    atsText += 'SKILLS\n';
    const skillsByCategory = resume.skills.reduce((acc, skill) => {
      const category = skill.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);
    
    Object.entries(skillsByCategory).forEach(([category, skills], categoryIndex) => {
      atsText += `${category}: ${skills.join(', ')}\n`;
    });
    atsText += '\n';
  }
  
  // Certifications
  if (resume.certifications.length > 0) {
    atsText += 'CERTIFICATIONS\n';
    resume.certifications.forEach((cert, index) => {
      atsText += `${cert.name}`;
      if (cert.organization) {
        atsText += ` - ${cert.organization}`;
      }
      if (cert.date) {
        atsText += ` (${cert.date})`;
      }
      atsText += '\n';
    });
  }
  
  return atsText.trim();
}

export function exportAsATSXML(resume: ParsedResume, fileName: string): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<resume>
  <metadata>
    <fileName>${fileName}</fileName>
    <exportDate>${new Date().toISOString()}</exportDate>
    <format>ATS-XML</format>
  </metadata>
  
  <personalInformation>
    <fullName>${resume.personalInfo.fullName || ''}</fullName>
    <email>${resume.personalInfo.email || ''}</email>
    <phone>${resume.personalInfo.phone || ''}</phone>
    <location>${resume.personalInfo.location || ''}</location>
    <linkedinUrl>${resume.personalInfo.linkedinUrl || ''}</linkedinUrl>
    <githubUrl>${resume.personalInfo.githubUrl || ''}</githubUrl>
    <portfolioUrl>${resume.personalInfo.portfolioUrl || ''}</portfolioUrl>
  </personalInformation>
  
  <professionalSummary>
    <summary>${resume.summary || ''}</summary>
  </professionalSummary>
  
  <workExperience>
    ${resume.workExperience.map(exp => `
    <position>
      <jobTitle>${exp.jobTitle}</jobTitle>
      <companyName>${exp.companyName}</companyName>
      <location>${exp.location || ''}</location>
      <startDate>${exp.startDate || ''}</startDate>
      <endDate>${exp.endDate || ''}</endDate>
      <isCurrent>${exp.isCurrent}</isCurrent>
      <description>${exp.description || ''}</description>
    </position>`).join('')}
  </workExperience>
  
  <education>
    ${resume.education.map(edu => `
    <degree>
      <institutionName>${edu.institutionName}</institutionName>
      <degree>${edu.degree}</degree>
      <fieldOfStudy>${edu.fieldOfStudy || ''}</fieldOfStudy>
      <location>${edu.location || ''}</location>
      <startDate>${edu.startDate || ''}</startDate>
      <endDate>${edu.endDate || ''}</endDate>
      <gpa>${edu.gpa || ''}</gpa>
    </degree>`).join('')}
  </education>
  
  <skills>
    ${resume.skills.map(skill => `
    <skill>
      <name>${skill.name}</name>
      <category>${skill.category || 'General'}</category>
    </skill>`).join('')}
  </skills>
  
  <certifications>
    ${resume.certifications.map(cert => `
    <certification>
      <name>${cert.name}</name>
      <organization>${cert.organization || ''}</organization>
      <date>${cert.date || ''}</date>
    </certification>`).join('')}
  </certifications>
</resume>`;
  
  return xml;
}

export function exportAsEnhancedJSON(resume: ParsedResume, fileName: string): ATSExportData {
  const allText = JSON.stringify(resume).toLowerCase();
  const atsKeywords = Object.values(ATS_KEYWORDS).flat().filter(keyword => 
    allText.includes(keyword.toLowerCase())
  );
  
  const optimizationSuggestions = generateOptimizationSuggestions(resume, atsKeywords);
  
  return {
    resume,
    fileName,
    atsKeywords: [...new Set(atsKeywords)], // Remove duplicates
    optimizationSuggestions,
    exportDate: new Date().toISOString(),
  };
}

function generateOptimizationSuggestions(resume: ParsedResume, foundKeywords: string[]): string[] {
  const suggestions: string[] = [];
  
  // Check for missing contact information
  if (!resume.personalInfo.fullName) {
    suggestions.push('Add a full name to improve ATS compatibility');
  }
  if (!resume.personalInfo.email) {
    suggestions.push('Include an email address for contact');
  }
  if (!resume.personalInfo.phone) {
    suggestions.push('Add a phone number for better contact options');
  }
  
  // Check for missing sections
  if (resume.skills.length === 0) {
    suggestions.push('Add a skills section with relevant technical and soft skills');
  }
  if (resume.workExperience.length === 0) {
    suggestions.push('Include work experience to show career progression');
  }
  if (resume.education.length === 0) {
    suggestions.push('Add education information to complete your profile');
  }
  
  // Check for professional summary
  if (!resume.summary || resume.summary.length < 50) {
    suggestions.push('Add a compelling professional summary (50+ characters)');
  }
  
  // Check for action verbs and quantifiable achievements
  const summaryText = (resume.summary || '').toLowerCase();
  const hasActionVerbs = ['achieved', 'improved', 'increased', 'developed', 'managed'].some(verb => 
    summaryText.includes(verb)
  );
  if (!hasActionVerbs) {
    suggestions.push('Use action verbs (achieved, improved, increased) to describe accomplishments');
  }
  
  const hasQuantifiableData = ['%', '$', 'increased', 'decreased', 'improved'].some(indicator => 
    summaryText.includes(indicator)
  );
  if (!hasQuantifiableData) {
    suggestions.push('Include quantifiable achievements with numbers and percentages');
  }
  
  // Check for online presence
  if (!resume.personalInfo.linkedinUrl && !resume.personalInfo.githubUrl && !resume.personalInfo.portfolioUrl) {
    suggestions.push('Add LinkedIn, GitHub, or portfolio URL to enhance online presence');
  }
  
  // Check for industry-specific keywords
  const totalKeywords = Object.values(ATS_KEYWORDS).flat().length;
  const keywordRatio = foundKeywords.length / totalKeywords;
  if (keywordRatio < 0.1) {
    suggestions.push('Include more industry-specific keywords to improve ATS matching');
  }
  
  return suggestions;
}
