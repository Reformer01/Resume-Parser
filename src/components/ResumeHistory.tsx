import { useEffect, useMemo, useState } from 'react';
import { History, FileText, Trash2, Eye, Loader2, Search, CheckSquare, Square, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DatabaseService } from '../lib/databaseService';
import type { Database } from '../lib/database.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { cn } from '../lib/utils';

type Resume = Database['public']['Tables']['resumes']['Row'];

interface ResumeHistoryProps {
  onSelectResume: (resumeId: string) => void;
  refreshTrigger: number;
  comparisonMode?: boolean;
  selectedForComparison?: string[];
  onToggleComparison?: (resumeId: string) => void;
  onResumeDeleted?: () => void;
}

export function ResumeHistory({
  onSelectResume,
  refreshTrigger,
  comparisonMode = false,
  selectedForComparison = [],
  onToggleComparison,
  onResumeDeleted
}: ResumeHistoryProps) {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [filteredResumes, setFilteredResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'failed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'score'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [hiddenResumes, setHiddenResumes] = useState<Set<string>>(new Set());
  const [showHidden, setShowHidden] = useState(false);
  const [showAllResumes, setShowAllResumes] = useState(false);

  useEffect(() => {
    loadResumes();
  }, [refreshTrigger]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      // Load more resumes to support pagination (50 instead of 20)
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setResumes(data || []);
      setFilteredResumes(data || []);
    } catch (error) {
      console.error('Error loading resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = resumes;

    // Filter out hidden resumes unless showHidden is true
    if (!showHidden) {
      filtered = filtered.filter(resume => !hiddenResumes.has(resume.id));
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(resume =>
        resume.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(resume => resume.parsing_status === filterStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.file_name.localeCompare(b.file_name);
          break;
        case 'score':
          const scoreA = a.confidence_score || 0;
          const scoreB = b.confidence_score || 0;
          comparison = scoreA - scoreB;
          break;
        case 'date':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    // Save full filtered set; display slicing handled below
    setFilteredResumes(filtered);
  }, [searchQuery, filterStatus, sortBy, sortOrder, resumes, hiddenResumes, showHidden]);

  // Recent vs All display control
  const recentCount = 3;
  const displayedResumes = useMemo(() => {
    if (showAllResumes) return filteredResumes;
    return filteredResumes.slice(0, recentCount);
  }, [filteredResumes, showAllResumes]);
  const hasMoreResumes = filteredResumes.length > recentCount;

  const deleteResume = async (id: string) => {
    try {
      await DatabaseService.deleteResume(id);
      setResumes(resumes.filter(r => r.id !== id));
      setFilteredResumes(filteredResumes.filter(r => r.id !== id));
      onResumeDeleted?.();
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deleteAllResumes = async () => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      setIsDialogOpen(false);

      await DatabaseService.deleteAllResumes();

      await loadResumes();
      onResumeDeleted?.();
    } catch (error) {
      console.error('Fatal error during batch delete:', error);
      alert('An error occurred while deleting resumes. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const hideResume = (id: string) => {
    setHiddenResumes(prev => new Set(prev).add(id));
  };

  const unhideResume = (id: string) => {
    setHiddenResumes(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Reset view mode when filters change
  useEffect(() => {
    setShowAllResumes(false);
  }, [searchQuery, filterStatus, sortBy, sortOrder, showHidden]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-white/70 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (resumes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Uploads
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 glass rounded-full">
              <FileText className="w-8 h-8 text-white/70" />
            </div>
          </div>
          <p className="text-sm font-medium text-white">No resumes uploaded yet</p>
          <p className="text-sm text-white/70 mt-1">Upload your first resume to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass bg-white/90">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-black" />
              <span className="text-black font-semibold text-lg">Recent Uploads</span>
            </CardTitle>
            <CardDescription className="text-gray-700">
              {resumes.length} resume{resumes.length !== 1 ? 's' : ''} processed
              {hiddenResumes.size > 0 && (
                <span className="ml-2 text-amber-400 font-medium">
                  • {hiddenResumes.size} hidden
                </span>
              )}
              {comparisonMode && (
                <span className="ml-2 text-red-500 font-medium">
                  • Select up to 4 resumes to compare
                </span>
              )}
            </CardDescription>
          </div>
          {resumes.length > 0 && (
            <div>
              <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full sm:w-auto mt-2 sm:mt-0"
                    data-variant="destructive"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="whitespace-nowrap">Clear All</span>
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Resumes</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete all {resumes.length} resumes? This action cannot be undone and will permanently remove all resume data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel 
                      disabled={isDeleting}
                      data-variant="cancel"
                    >
                      {isDeleting ? 'Working...' : 'Cancel'}
                    </AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={async (e) => {
                        e.preventDefault();
                        await deleteAllResumes();
                      }}
                      className="bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white"
                      data-variant="destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete All'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
            <Input
              placeholder="Search resumes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gray-400"
            />
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className="flex-1"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('completed')}
                className="flex-1"
              >
                Completed
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'failed' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('failed')}
                className="flex-1"
              >
                Failed
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowHidden(!showHidden)}
                className="flex-1"
              >
                {showHidden ? 'Hide Hidden' : 'Show Hidden'}
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={sortBy === 'date' ? 'default' : 'outline'}
                onClick={() => setSortBy('date')}
                className="flex-1"
              >
                Date
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'name' ? 'default' : 'outline'}
                onClick={() => setSortBy('name')}
                className="flex-1"
              >
                Name
              </Button>
              <Button
                size="sm"
                variant={sortBy === 'score' ? 'default' : 'outline'}
                onClick={() => setSortBy('score')}
                className="flex-1"
              >
                Score
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

        {filteredResumes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-700">No resumes match your search</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedResumes.map((resume) => (
                <div
                  key={resume.id}
                  className={cn(
                    "group relative flex items-center gap-3 p-3 rounded-lg glass border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300 cursor-pointer",
                    resume.parsing_status === 'completed' && "border-l-4 border-l-emerald-400",
                    resume.parsing_status === 'failed' && "border-l-4 border-l-red-400",
                    resume.parsing_status === 'processing' && "border-l-4 border-l-amber-400",
                    comparisonMode && selectedForComparison.includes(resume.id) && "border-2 border-blue-400 bg-blue-500/10"
                  )}
                  onClick={() => onSelectResume(resume.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-700" />
                      <span className="font-medium text-gray-900 truncate">
                        {resume.file_name || 'Untitled Resume'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-700">
                        {formatDate(resume.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {comparisonMode && onToggleComparison && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComparison(resume.id);
                        }}
                        title={selectedForComparison.includes(resume.id) ? "Remove from comparison" : "Add to comparison"}
                        className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      >
                        {selectedForComparison.includes(resume.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-700" />
                        )}
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectResume(resume.id);
                      }}
                      title="View Details"
                      className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </Button>
                    {hiddenResumes.has(resume.id) ? (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          unhideResume(resume.id);
                        }}
                        title="Unhide Resume"
                        className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4 text-gray-700" />
                      </Button>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          hideResume(resume.id);
                        }}
                        title="Hide Resume"
                        className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      >
                        <EyeOff className="w-4 h-4 text-gray-700" />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Delete"
                          className="text-gray-700 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-gray-700" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{resume.file_name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteResume(resume.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>

            {/* View toggle and link to dedicated history */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div>
                {hasMoreResumes && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllResumes((v) => !v)}
                    className="flex items-center gap-1"
                  >
                    {showAllResumes ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        View All ({filteredResumes.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-gray-700 hover:text-gray-900"
                  onClick={() => {
                    // Placeholder for future full history route
                    // Intentionally no routing added here
                    console.info('Open full History clicked');
                  }}
                >
                  Open full History
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
