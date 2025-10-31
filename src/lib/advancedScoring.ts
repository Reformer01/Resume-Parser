import type { ParsedResume } from './resumeParser';

export interface AdvancedScoreBreakdown {
  overallScore: number;
  categories: {
    contentQuality: {
      score: number;
      maxScore: number;
      details: {
        keywordDensity: number;
        actionVerbs: number;
        quantifiableAchievements: number;
      };
    };
    atsCompatibility: {
      score: number;
      maxScore: number;
      details: {
        formatConsistency: number;
        standardSections: number;
        noTablesGraphics: number;
        contactInfoFormat: number;
      };
    };
    completeness: {
      score: number;
      maxScore: number;
      details: {
        allSectionsPresent: number;
        contactInfoComplete: number;
        datesProvided: number;
        descriptionsProvided: number;
      };
    };
    experienceQuality: {
      score: number;
      maxScore: number;
      details: {
        yearsOfExperience: number;
        careerProgression: number;
        relevantSkills: number;
        achievementFocus: number;
      };
    };
    professionalPresence: {
      score: number;
      maxScore: number;
      details: {
        linkedinProfile: number;
        githubProfile: number;
        portfolioWebsite: number;
        professionalEmail: number;
      };
    };
  };
}

// ATS Keywords for different industries
export const ATS_KEYWORDS = {
  technical: [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker', 'kubernetes',
    'machine learning', 'data analysis', 'agile', 'scrum', 'devops', 'ci/cd', 'api', 'rest',
    'graphql', 'microservices', 'cloud computing', 'database', 'frontend', 'backend', 'full stack'
  ],
  marketing: [
    'seo', 'sem', 'ppc', 'social media', 'content marketing', 'email marketing', 'analytics',
    'google analytics', 'campaign management', 'brand management', 'digital marketing', 'crm',
    'lead generation', 'conversion optimization', 'a/b testing', 'market research'
  ],
  sales: [
    'lead generation', 'sales pipeline', 'crm', 'salesforce', 'cold calling', 'prospecting',
    'negotiation', 'account management', 'territory management', 'quota achievement',
    'client relations', 'sales strategy', 'revenue growth', 'customer acquisition'
  ],
  finance: [
    'financial analysis', 'budgeting', 'forecasting', 'financial modeling', 'excel', 'quickbooks',
    'gaap', 'financial reporting', 'risk management', 'investment analysis', 'audit', 'tax',
    'accounting', 'financial planning', 'cash flow', 'p&l'
  ],
  healthcare: [
    'patient care', 'medical records', 'hipaa', 'clinical', 'diagnosis', 'treatment', 'medication',
    'healthcare', 'nursing', 'pharmacy', 'medical coding', 'icd-10', 'cpt', 'healthcare management'
  ]
};

// Action verbs that indicate achievements
const ACTION_VERBS = [
  'achieved', 'increased', 'decreased', 'improved', 'developed', 'created', 'implemented',
  'managed', 'led', 'coordinated', 'designed', 'built', 'optimized', 'streamlined',
  'reduced', 'enhanced', 'delivered', 'executed', 'launched', 'established', 'generated',
  'produced', 'facilitated', 'initiated', 'collaborated', 'mentored', 'trained', 'supervised'
];

// Quantifiable achievement indicators
const QUANTIFIABLE_INDICATORS = [
  '%', '$', 'increase', 'decrease', 'revenue', 'profit', 'cost', 'time', 'efficiency',
  'customers', 'users', 'clients', 'projects', 'team', 'budget', 'sales', 'growth',
  'reduction', 'improvement', 'uptime', 'performance', 'satisfaction', 'score'
];

export function calculateAdvancedScore(resume: ParsedResume): AdvancedScoreBreakdown {
  const text = JSON.stringify(resume).toLowerCase();
  
  // Content Quality (30%)
  const contentQuality = calculateContentQuality(resume, text);
  
  // ATS Compatibility (25%)
  const atsCompatibility = calculateATSCompatibility(resume, text);
  
  // Completeness (20%)
  const completeness = calculateCompleteness(resume);
  
  // Experience Quality (15%)
  const experienceQuality = calculateExperienceQuality(resume);
  
  // Professional Presence (10%)
  const professionalPresence = calculateProfessionalPresence(resume);

  const overallScore = Math.round(
    (contentQuality.score * 0.30) +
    (atsCompatibility.score * 0.25) +
    (completeness.score * 0.20) +
    (experienceQuality.score * 0.15) +
    (professionalPresence.score * 0.10)
  );

  return {
    overallScore,
    categories: {
      contentQuality,
      atsCompatibility,
      completeness,
      experienceQuality,
      professionalPresence,
    },
  };
}

function calculateContentQuality(resume: ParsedResume, text: string) {
  let score = 0;
  let maxScore = 100;

  // Keyword density (40 points)
  const keywordScore = Math.min(40, countKeywords(text) * 4);
  score += keywordScore;

  // Action verbs (30 points)
  const actionVerbCount = ACTION_VERBS.reduce((count, verb) => {
    return count + (text.includes(verb) ? 1 : 0);
  }, 0);
  const actionVerbScore = Math.min(30, actionVerbCount * 3);
  score += actionVerbScore;

  // Quantifiable achievements (30 points)
  const quantifiableCount = QUANTIFIABLE_INDICATORS.reduce((count, indicator) => {
    return count + (text.includes(indicator) ? 1 : 0);
  }, 0);
  const quantifiableScore = Math.min(30, quantifiableCount * 2);
  score += quantifiableScore;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details: {
      keywordDensity: keywordScore,
      actionVerbs: actionVerbScore,
      quantifiableAchievements: quantifiableScore,
    },
  };
}

function calculateATSCompatibility(resume: ParsedResume, text: string) {
  let score = 0;
  let maxScore = 100;

  // Format consistency (25 points) - check for consistent formatting
  const hasConsistentFormatting = text.includes('\n') && !text.includes('\t');
  score += hasConsistentFormatting ? 25 : 0;

  // Standard sections (25 points)
  const standardSections = ['experience', 'education', 'skills', 'summary'];
  const sectionsFound = standardSections.filter(section => text.includes(section)).length;
  score += (sectionsFound / standardSections.length) * 25;

  // No tables/graphics references (25 points)
  const hasNoTablesGraphics = !text.includes('table') && !text.includes('figure') && !text.includes('chart');
  score += hasNoTablesGraphics ? 25 : 0;

  // Contact info format (25 points)
  const hasProperContactFormat = resume.personalInfo.email && resume.personalInfo.phone;
  score += hasProperContactFormat ? 25 : 0;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details: {
      formatConsistency: hasConsistentFormatting ? 25 : 0,
      standardSections: (sectionsFound / standardSections.length) * 25,
      noTablesGraphics: hasNoTablesGraphics ? 25 : 0,
      contactInfoFormat: hasProperContactFormat ? 25 : 0,
    },
  };
}

function calculateCompleteness(resume: ParsedResume) {
  let score = 0;
  let maxScore = 100;

  // All sections present (40 points)
  const sections = [
    resume.personalInfo.fullName,
    resume.personalInfo.email,
    resume.skills.length > 0,
    resume.workExperience.length > 0,
    resume.education.length > 0,
  ];
  const sectionsPresent = sections.filter(Boolean).length;
  score += (sectionsPresent / sections.length) * 40;

  // Contact info complete (20 points)
  const contactFields = [
    resume.personalInfo.fullName,
    resume.personalInfo.email,
    resume.personalInfo.phone,
  ];
  const contactComplete = contactFields.filter(Boolean).length;
  score += (contactComplete / contactFields.length) * 20;

  // Dates provided (20 points)
  const hasDates = resume.workExperience.some(exp => exp.startDate) || 
                   resume.education.some(edu => edu.startDate);
  score += hasDates ? 20 : 0;

  // Descriptions provided (20 points)
  const hasDescriptions = resume.workExperience.some(exp => exp.description && exp.description.length > 10) ||
                          resume.summary && resume.summary.length > 20;
  score += hasDescriptions ? 20 : 0;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details: {
      allSectionsPresent: (sectionsPresent / sections.length) * 40,
      contactInfoComplete: (contactComplete / contactFields.length) * 20,
      datesProvided: hasDates ? 20 : 0,
      descriptionsProvided: hasDescriptions ? 20 : 0,
    },
  };
}

function calculateExperienceQuality(resume: ParsedResume) {
  let score = 0;
  let maxScore = 100;

  // Years of experience (40 points)
  const yearsOfExperience = calculateYearsOfExperience(resume.workExperience);
  const experienceScore = Math.min(40, yearsOfExperience * 4);
  score += experienceScore;

  // Career progression (20 points)
  const hasProgression = resume.workExperience.length > 1;
  score += hasProgression ? 20 : 0;

  // Relevant skills (20 points)
  const hasRelevantSkills = resume.skills.length >= 5;
  score += hasRelevantSkills ? 20 : 0;

  // Achievement focus (20 points)
  const hasAchievements = resume.workExperience.some(exp => 
    exp.description && exp.description.toLowerCase().includes('achieved')
  );
  score += hasAchievements ? 20 : 0;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details: {
      yearsOfExperience: experienceScore,
      careerProgression: hasProgression ? 20 : 0,
      relevantSkills: hasRelevantSkills ? 20 : 0,
      achievementFocus: hasAchievements ? 20 : 0,
    },
  };
}

function calculateProfessionalPresence(resume: ParsedResume) {
  let score = 0;
  let maxScore = 100;

  // LinkedIn profile (25 points)
  score += resume.personalInfo.linkedinUrl ? 25 : 0;

  // GitHub profile (25 points)
  score += resume.personalInfo.githubUrl ? 25 : 0;

  // Portfolio website (25 points)
  score += resume.personalInfo.portfolioUrl ? 25 : 0;

  // Professional email (25 points)
  const hasProfessionalEmail = resume.personalInfo.email && 
                               (resume.personalInfo.email.includes('@gmail.com') || 
                                resume.personalInfo.email.includes('@outlook.com') ||
                                !resume.personalInfo.email.includes('@'));
  score += hasProfessionalEmail ? 25 : 0;

  return {
    score: Math.min(score, maxScore),
    maxScore,
    details: {
      linkedinProfile: resume.personalInfo.linkedinUrl ? 25 : 0,
      githubProfile: resume.personalInfo.githubUrl ? 25 : 0,
      portfolioWebsite: resume.personalInfo.portfolioUrl ? 25 : 0,
      professionalEmail: hasProfessionalEmail ? 25 : 0,
    },
  };
}

function countKeywords(text: string): number {
  const allKeywords = Object.values(ATS_KEYWORDS).flat();
  return allKeywords.reduce((count, keyword) => {
    return count + (text.includes(keyword) ? 1 : 0);
  }, 0);
}

function calculateYearsOfExperience(workExperience: ParsedResume['workExperience']): number {
  if (workExperience.length === 0) return 0;
  
  let totalMonths = 0;
  workExperience.forEach(exp => {
    if (exp.startDate && exp.endDate) {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent ? new Date() : new Date(exp.endDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  });
  
  return Math.round(totalMonths / 12 * 10) / 10;
}
