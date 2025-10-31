export interface ParsedResume {
  personalInfo: {
    fullName: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
  };
  summary: string | null;
  skills: Array<{
    name: string;
    category: string;
  }>;
  workExperience: Array<{
    companyName: string;
    jobTitle: string;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }>;
  education: Array<{
    institutionName: string;
    degree: string;
    fieldOfStudy: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    gpa: string | null;
  }>;
  certifications: Array<{
    name: string;
    organization: string | null;
    date: string | null;
  }>;
}

export function parseResume(text: string): ParsedResume {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  return {
    personalInfo: extractPersonalInfo(text, lines),
    summary: extractSummary(text),
    skills: extractSkills(text),
    workExperience: extractWorkExperience(text),
    education: extractEducation(text),
    certifications: extractCertifications(text),
  };
}

function extractPersonalInfo(text: string, lines: string[]) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const linkedinRegex = /(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi;
  const githubRegex = /(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+/gi;
  const urlRegex = /(https?:\/\/[^\s]+)/gi;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkedinMatch = text.match(linkedinRegex);
  const githubMatch = text.match(githubRegex);

  const fullName = lines[0] || null;

  const allUrls = text.match(urlRegex) || [];
  const portfolioUrl = allUrls.find(url =>
    !url.includes('linkedin.com') &&
    !url.includes('github.com') &&
    (url.includes('portfolio') || url.includes('personal') || url.match(/\.(com|net|io|dev)/))
  ) || null;

  return {
    fullName,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0] : null,
    location: extractLocation(lines),
    linkedinUrl: linkedinMatch ? linkedinMatch[0] : null,
    githubUrl: githubMatch ? githubMatch[0] : null,
    portfolioUrl,
  };
}

function extractLocation(lines: string[]): string | null {
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (/,/.test(line) && (
      /\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY)\b/.test(line) ||
      /\d{5}/.test(line)
    )) {
      return line;
    }
  }
  return null;
}

function extractSummary(text: string): string | null {
  // Detect common summary headers and capture paragraph/bullets until next section
  const summaryKeywords = ['professional summary', 'summary', 'objective', 'profile', 'about me', 'about'];
  const lowerText = text.toLowerCase();

  // Find the earliest matching summary header
  let start = -1;
  let matched = '';
  for (const key of summaryKeywords) {
    const i = lowerText.indexOf(key);
    if (i !== -1 && (start === -1 || i < start)) {
      start = i;
      matched = key;
    }
  }
  if (start === -1) return null;

  const sectionStart = start + matched.length;
  const end = getNextSectionIndex(lowerText, sectionStart, [
    'experience', 'work experience', 'employment', 'work history',
    'education', 'skills', 'certification', 'projects'
  ]);
  const raw = text.substring(sectionStart, end === -1 ? text.length : end).trim();

  // Clean excessive whitespace and keep first ~1000 chars
  const cleaned = raw
    .replace(/^[\s:\-•]+/, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, 1000);

  return cleaned.length > 20 ? cleaned : null;
}

function extractSkills(text: string): Array<{ name: string; category: string }> {
  const skills: Array<{ name: string; category: string }> = [];
  const skillsKeywords = ['skills', 'technical skills', 'core competencies', 'expertise'];
  const lowerText = text.toLowerCase();

  const technicalSkills = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'asp.net',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'sql', 'mongodb', 'postgresql', 'mysql',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'jenkins', 'ci/cd', 'agile', 'scrum',
    'rest', 'api', 'graphql', 'microservices', 'tensorflow', 'pytorch', 'machine learning', 'ai',
    'data analysis', 'excel', 'tableau', 'power bi', 'figma', 'sketch', 'photoshop'
  ];

  for (const keyword of skillsKeywords) {
    const keywordIndex = lowerText.indexOf(keyword);
    if (keywordIndex !== -1) {
      const sectionStart = keywordIndex;
      const sectionEnd = text.indexOf('\n\n', sectionStart);
      const skillsSection = text.substring(
        sectionStart,
        sectionEnd !== -1 ? sectionEnd : sectionStart + 500
      );

      const skillLines = skillsSection.split('\n').slice(1);
      for (const line of skillLines) {
        const lineSkills = line.split(/[,;|•·]/);
        for (const skill of lineSkills) {
          const cleanSkill = skill.trim();
          if (cleanSkill.length > 1 && cleanSkill.length < 50) {
            skills.push({
              name: cleanSkill,
              category: 'General'
            });
          }
        }
      }
      break;
    }
  }

  technicalSkills.forEach(techSkill => {
    if (lowerText.includes(techSkill) && !skills.some(s => s.name.toLowerCase() === techSkill)) {
      skills.push({
        name: techSkill.charAt(0).toUpperCase() + techSkill.slice(1),
        category: 'Technical'
      });
    }
  });

  return skills.slice(0, 30);
}

function extractWorkExperience(text: string) {
  const experience: Array<{
    companyName: string;
    jobTitle: string;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }> = [];

  const lowerText = text.toLowerCase();
  const sectionStart = findAnySectionStart(lowerText, ['experience', 'work experience', 'employment', 'work history']);
  if (sectionStart === -1) return experience;

  const sectionEnd = getNextSectionIndex(lowerText, sectionStart, [
    'education', 'skills', 'projects', 'certification', 'certifications'
  ]);
  const experienceSection = text.substring(sectionStart, sectionEnd === -1 ? text.length : sectionEnd);

  // Split into potential job blocks by blank lines or bullet separators
  const blocks = experienceSection
    .split(/\n\s*\n+/)
    .map(b => b.trim())
    .filter(b => b.length > 0)
    .slice(0, 20);

  const dateRangeRegex = new RegExp(
    // Examples: Jan 2020 - Present, 2018–2021, 03/2019 — 06/2020
    '((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\\s+\\d{4}|\\d{1,2}[\\/.-]\\d{4}|\\d{4})\\s*[\\-–—to]+\\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\\s+\\d{4}|\\d{1,2}[\\/.-]\\d{4}|\\d{4}|present|current)',
    'i'
  );

  for (const block of blocks) {
    const blockLines = block.split('\n').map(l => l.trim()).filter(Boolean);
    if (blockLines.length === 0) continue;

    const header = blockLines[0];
    const rest = blockLines.slice(1);

    const dateMatch = block.match(dateRangeRegex);
    let startDate: string | null = null;
    let endDate: string | null = null;
    let isCurrent = false;
    if (dateMatch) {
      startDate = normalizeDate(dateMatch[1]);
      endDate = /present|current/i.test(dateMatch[2]) ? null : normalizeDate(dateMatch[2]);
      isCurrent = /present|current/i.test(dateMatch[2]);
    }

    // Heuristic to split header into title @ company or company - title
    let jobTitle = '';
    let companyName = '';
    let location: string | null = null;

    const headerParts = header.split(/\s[@\-–—]\s|\s\|\s/);
    if (headerParts.length >= 2) {
      // Choose the part that looks like a title (has senior/engineer/manager etc.)
      const titleKeywords = /(engineer|developer|manager|lead|director|analyst|consultant|designer|architect)/i;
      const [a, b] = headerParts;
      if (titleKeywords.test(a) && !titleKeywords.test(b)) {
        jobTitle = a.trim();
        companyName = b.trim();
      } else if (titleKeywords.test(b) && !titleKeywords.test(a)) {
        jobTitle = b.trim();
        companyName = a.trim();
      } else {
        // Fallback: assume first is title, second is company
        jobTitle = a.trim();
        companyName = b.trim();
      }
    } else {
      // Try to infer from first 2 lines
      jobTitle = header;
      if (rest[0]) companyName = rest[0];
    }

    // Try to find location in first few lines
    const locLine = [header, ...rest].find(l => /\b([A-Z][a-zA-Z]+\s*,\s*[A-Z][a-zA-Z]+|\b[A-Z]{2}\b|\d{5})/.test(l));
    if (locLine) {
      const locMatch = locLine.match(/([A-Z][a-zA-Z]+\s*,\s*[A-Z][a-zA-Z]+|\b[A-Z]{2}\b\s*\d{5}?)/);
      location = locMatch ? locMatch[1] : null;
    }

    // Description: collect bullets/lines excluding the header and pure date lines
    const description = rest
      .filter(l => !dateRangeRegex.test(l))
      .join('\n')
      .replace(/^[\s\-•]+/gm, '')
      .trim() || null;

    if (jobTitle || companyName || description || startDate) {
      experience.push({
        companyName: companyName || 'Unknown Company',
        jobTitle: jobTitle || 'Unknown Position',
        location: location || null,
        startDate,
        endDate,
        isCurrent,
        description,
      });
    }
  }

  return experience.slice(0, 10);
}

// Utilities
function findAnySectionStart(lowerText: string, keys: string[]): number {
  let pos = -1;
  for (const k of keys) {
    const i = lowerText.indexOf(k);
    if (i !== -1 && (pos === -1 || i < pos)) pos = i;
  }
  return pos;
}

function getNextSectionIndex(lowerText: string, from: number, sectionKeys: string[]): number {
  const rest = lowerText.slice(from);
  let nearest = -1;
  for (const key of sectionKeys) {
    const i = rest.indexOf(key);
    if (i !== -1) {
      const absolute = from + i;
      if (nearest === -1 || absolute < nearest) nearest = absolute;
    }
  }
  return nearest;
}

function normalizeDate(raw: string): string | null {
  const s = raw.trim();
  // If it's YYYY
  if (/^\d{4}$/.test(s)) return s;
  // If it's MM/YYYY or M/YYYY
  const m1 = s.match(/^(\d{1,2})[\/.\-](\d{4})$/);
  if (m1) return `${m1[2]}-${String(parseInt(m1[1], 10)).padStart(2, '0')}`;
  // Month YYYY
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','sept','oct','nov','dec'];
  const m2 = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m2) {
    const mi = months.indexOf(m2[1].toLowerCase());
    if (mi !== -1) return `${m2[2]}-${String((mi % 12) + 1).padStart(2, '0')}`;
  }
  return s;
}

function extractEducation(text: string) {
  const education: Array<{
    institutionName: string;
    degree: string;
    fieldOfStudy: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    gpa: string | null;
  }> = [];

  const educationKeywords = ['education', 'academic', 'qualifications'];
  const degreeKeywords = [
    'bachelor', 'master', 'phd', 'doctorate', 'associate', 'diploma',
    'b.s.', 'b.a.', 'm.s.', 'm.a.', 'mba', 'ph.d.'
  ];
  const lowerText = text.toLowerCase();

  for (const keyword of educationKeywords) {
    const keywordIndex = lowerText.indexOf(keyword);
    if (keywordIndex !== -1) {
      const sectionStart = keywordIndex;
      const certificationsIndex = lowerText.indexOf('certification', sectionStart);
      const skillsIndex = lowerText.indexOf('skills', sectionStart);
      const nextSectionIndex = Math.min(
        certificationsIndex !== -1 ? certificationsIndex : Infinity,
        skillsIndex !== -1 ? skillsIndex : Infinity
      );
      const sectionEnd = nextSectionIndex !== Infinity ? nextSectionIndex : text.length;
      const educationSection = text.substring(sectionStart, sectionEnd);

      const dateRegex = /\d{4}/g;
      const dates = Array.from(educationSection.matchAll(dateRegex));

      const sectionLines = educationSection.split('\n').map(l => l.trim()).filter(l => l);

      let currentEntry: any = null;

      for (const line of sectionLines) {
        const lineLower = line.toLowerCase();
        const hasDegree = degreeKeywords.some(deg => lineLower.includes(deg));

        if (hasDegree || (line.length > 10 && /university|college|institute|school/i.test(line))) {
          if (currentEntry) {
            education.push(currentEntry);
          }

          currentEntry = {
            institutionName: '',
            degree: '',
            fieldOfStudy: null,
            location: null,
            startDate: null,
            endDate: null,
            gpa: null,
          };

          if (hasDegree) {
            currentEntry.degree = line;
          } else {
            currentEntry.institutionName = line;
          }
        } else if (currentEntry) {
          if (!currentEntry.institutionName && line.length > 5) {
            currentEntry.institutionName = line;
          } else if (!currentEntry.degree && line.length > 5) {
            currentEntry.degree = line;
          }
        }
      }

      if (currentEntry) {
        education.push(currentEntry);
      }

      if (dates.length > 0 && education.length > 0) {
        education[0].endDate = dates[dates.length - 1][0];
      }

      break;
    }
  }

  return education.slice(0, 5);
}

function extractCertifications(text: string) {
  const certifications: Array<{
    name: string;
    organization: string | null;
    date: string | null;
  }> = [];

  const certKeywords = ['certification', 'certificate', 'licenses'];
  const lowerText = text.toLowerCase();

  for (const keyword of certKeywords) {
    const keywordIndex = lowerText.indexOf(keyword);
    if (keywordIndex !== -1) {
      const sectionStart = keywordIndex;
      const sectionEnd = text.indexOf('\n\n', sectionStart);
      const certSection = text.substring(
        sectionStart,
        sectionEnd !== -1 ? sectionEnd : sectionStart + 500
      );

      const certLines = certSection.split('\n').slice(1);
      for (const line of certLines) {
        if (line.trim().length > 5) {
          const dateMatch = line.match(/\d{4}/);
          certifications.push({
            name: line.trim(),
            organization: null,
            date: dateMatch ? dateMatch[0] : null,
          });
        }
      }
      break;
    }
  }

  return certifications.slice(0, 10);
}

export function calculateConfidenceScore(parsedData: ParsedResume): number {
  let score = 0;
  let maxScore = 0;

  if (parsedData.personalInfo.fullName) score += 15;
  maxScore += 15;

  if (parsedData.personalInfo.email) score += 15;
  maxScore += 15;

  if (parsedData.personalInfo.phone) score += 10;
  maxScore += 10;

  if (parsedData.skills.length > 0) score += Math.min(20, parsedData.skills.length * 2);
  maxScore += 20;

  if (parsedData.workExperience.length > 0) score += Math.min(25, parsedData.workExperience.length * 8);
  maxScore += 25;

  if (parsedData.education.length > 0) score += Math.min(15, parsedData.education.length * 7);
  maxScore += 15;

  return Math.round((score / maxScore) * 100);
}
