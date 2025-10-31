import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2, Trash2, Play, Pause } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { cn } from '../lib/utils';

interface QueuedFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  progress?: number;
}

interface BulkUploadQueueProps {
  files: QueuedFile[];
  onProcessQueue: () => void;
  onRemoveFile: (fileId: string) => void;
  onClearQueue: () => void;
  isProcessing: boolean;
  currentProcessingIndex: number;
}

export function BulkUploadQueue({ 
  files, 
  onProcessQueue, 
  onRemoveFile, 
  onClearQueue, 
  isProcessing,
  currentProcessingIndex 
}: BulkUploadQueueProps) {
  const completedCount = files.filter(f => f.status === 'completed').length;
  const failedCount = files.filter(f => f.status === 'failed').length;
  const pendingCount = files.filter(f => f.status === 'pending').length;
  const progress = files.length > 0 ? (completedCount + failedCount) / files.length * 100 : 0;

  const getStatusIcon = (status: QueuedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: QueuedFile['status']) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-emerald-100 text-emerald-800">Completed</Badge>;
      case 'processing':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Processing</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Upload Queue
            </CardTitle>
            <CardDescription>
              {files.length} file{files.length !== 1 ? 's' : ''} in queue
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Button
                onClick={onProcessQueue}
                disabled={isProcessing}
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Processing
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={onClearQueue}
              variant="outline"
              size="sm"
              disabled={isProcessing}
            >
              Clear Queue
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Overall Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{completedCount} completed</span>
            <span>{failedCount} failed</span>
            <span>{pendingCount} pending</span>
          </div>
        </div>

        {/* File List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {files.map((queuedFile, index) => (
            <div
              key={queuedFile.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border",
                queuedFile.status === 'processing' && "border-blue-200 bg-blue-50",
                queuedFile.status === 'completed' && "border-emerald-200 bg-emerald-50",
                queuedFile.status === 'failed' && "border-red-200 bg-red-50",
                queuedFile.status === 'pending' && "border-slate-200 bg-slate-50"
              )}
            >
              <div className="flex-shrink-0">
                {getStatusIcon(queuedFile.status)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-slate-900 truncate">
                    {queuedFile.file.name}
                  </h4>
                  {getStatusBadge(queuedFile.status)}
                  {index === currentProcessingIndex && isProcessing && (
                    <Badge variant="secondary" className="animate-pulse">
                      Current
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{queuedFile.file.type || 'Unknown type'}</span>
                  <span>•</span>
                  <span>{formatFileSize(queuedFile.file.size)}</span>
                  {queuedFile.progress && queuedFile.status === 'processing' && (
                    <>
                      <span>•</span>
                      <span>{queuedFile.progress}%</span>
                    </>
                  )}
                </div>

                {queuedFile.error && (
                  <p className="text-xs text-red-600 mt-1">{queuedFile.error}</p>
                )}
              </div>

              <div className="flex-shrink-0">
                {queuedFile.status === 'pending' && (
                  <Button
                    onClick={() => onRemoveFile(queuedFile.id)}
                    variant="ghost"
                    size="sm"
                    disabled={isProcessing}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-800">
              Processing file {currentProcessingIndex + 1} of {files.length}...
            </span>
            <div className="ml-auto">
              <div className="text-xs text-blue-600">
                {Math.round(((completedCount + failedCount) / files.length) * 100)}% Complete
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {!isProcessing && completedCount === files.length && files.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-800">
              All files processed successfully! {completedCount} resume{completedCount !== 1 ? 's' : ''} ready.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
