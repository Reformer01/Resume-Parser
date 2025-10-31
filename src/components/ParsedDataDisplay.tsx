import { useState } from 'react';
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Briefcase, GraduationCap, Award, Code, Check, X, Calendar, Edit2, FileText } from 'lucide-react';
import type { ParsedResume } from '../lib/resumeParser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { cn } from '../lib/utils';

interface ParsedDataDisplayProps {
  data: ParsedResume;
  onUpdate: (data: ParsedResume) => void;
  confidenceScore: number;
}

export function ParsedDataDisplay({ data, onUpdate, confidenceScore }: ParsedDataDisplayProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEdit = (field: string) => {
    const updatedData = { ...data };
    const fieldPath = field.split('.');

    if (fieldPath.length === 2) {
      (updatedData as any)[fieldPath[0]][fieldPath[1]] = editValue;
    }

    onUpdate(updatedData);
    setEditingField(null);
  };

  const EditableField = ({
    label,
    value,
    icon: Icon,
    field,
  }: {
    label: string;
    value: string | null;
    icon: any;
    field: string;
  }) => {
    const isEditing = editingField === field;

    return (
      <div className="flex items-start gap-3 py-2 group">
        <Icon className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                autoFocus
              />
              <Button size="icon" variant="ghost" onClick={() => saveEdit(field)}>
                <Check className="w-4 h-4 text-emerald-600" />
              </Button>
              <Button size="icon" variant="ghost" onClick={cancelEdit}>
                <X className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-slate-900 truncate">
                {value || <span className="text-slate-400 italic">Not found</span>}
              </p>
              {value && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => startEdit(field, value)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="glass bg-white/90">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-black" />
                <h3 className="text-black font-semibold text-lg">Parsed Resume Data</h3>
              </div>
              <p className="text-sm text-gray-800 mt-1">Review and edit the extracted information</p>
            </div>
            <Badge variant="default" className="text-base px-4 py-2">
              {confidenceScore}% Match
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
          <TabsTrigger value="experience" className="flex-1">Experience</TabsTrigger>
          <TabsTrigger value="education" className="flex-1">Education</TabsTrigger>
          <TabsTrigger value="skills" className="flex-1">Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card className="glass bg-white/90">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-black" />
                <span className="text-black font-semibold">Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <EditableField
                label="Full Name"
                value={data.personalInfo.fullName}
                icon={User}
                field="personalInfo.fullName"
              />
              <EditableField
                label="Email"
                value={data.personalInfo.email}
                icon={Mail}
                field="personalInfo.email"
              />
              <EditableField
                label="Phone"
                value={data.personalInfo.phone}
                icon={Phone}
                field="personalInfo.phone"
              />
              <EditableField
                label="Location"
                value={data.personalInfo.location}
                icon={MapPin}
                field="personalInfo.location"
              />
              <Separator className="my-4" />
              <EditableField
                label="LinkedIn"
                value={data.personalInfo.linkedinUrl}
                icon={Linkedin}
                field="personalInfo.linkedinUrl"
              />
              <EditableField
                label="GitHub"
                value={data.personalInfo.githubUrl}
                icon={Github}
                field="personalInfo.githubUrl"
              />
              <EditableField
                label="Portfolio"
                value={data.personalInfo.portfolioUrl}
                icon={Globe}
                field="personalInfo.portfolioUrl"
              />
            </CardContent>
          </Card>

          {data.summary && (
            <Card className="glass bg-white/90">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-black" />
                  <span className="text-black font-semibold">Professional Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-800 leading-relaxed">{data.summary}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          {data.workExperience.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {data.workExperience.map((exp, index) => (
                  <div key={index} className={cn("pb-6", index !== data.workExperience.length - 1 && "border-b border-slate-200")}>
                    <div className="space-y-1 mb-3">
                      <h4 className="font-semibold text-slate-900">{exp.jobTitle}</h4>
                      <p className="text-sm font-medium text-slate-600">{exp.companyName}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                      {(exp.startDate || exp.endDate) && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate || 'Unknown'}
                          </span>
                        </div>
                      )}
                      {exp.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{exp.location}</span>
                        </div>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-sm text-slate-700 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-sm text-slate-500">No work experience found</p>
              </CardContent>
            </Card>
          )}

          {data.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.certifications.map((cert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <Award className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900">{cert.name}</p>
                      {cert.organization && (
                        <p className="text-xs text-slate-600 mt-0.5">{cert.organization}</p>
                      )}
                      {cert.date && (
                        <p className="text-xs text-slate-500 mt-1">{cert.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="education" className="space-y-4">
          {data.education.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900">{edu.degree}</h4>
                    <p className="text-sm font-medium text-slate-600 mt-1">{edu.institutionName}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-sm text-slate-500 mt-1">{edu.fieldOfStudy}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                      {(edu.startDate || edu.endDate) && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {edu.startDate || ''} {edu.startDate && edu.endDate ? '-' : ''} {edu.endDate || ''}
                          </span>
                        </div>
                      )}
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-sm text-slate-500">No education history found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          {data.skills.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Skills & Technologies
                </CardTitle>
                <CardDescription>{data.skills.length} skills identified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant={skill.category === 'Technical' ? 'default' : 'secondary'}
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-sm text-slate-500">No skills found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
