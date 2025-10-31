import { useState, useEffect } from 'react';
import { Eye, EyeOff, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { extractTextFromFile } from '../lib/textExtraction';

interface FilePreviewProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FilePreview({ file, onConfirm, onCancel }: FilePreviewProps) {
  const [previewText, setPreviewText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  const [extractionSuccess, setExtractionSuccess] = useState(false);

  useEffect(() => {
    const extractPreview = async () => {
      try {
        setLoading(true);
        setError(null);
        const text = await extractTextFromFile(file);
        setPreviewText(text);
        setExtractionSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to extract text');
        setExtractionSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    extractPreview();
  }, [file]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📄';
    }
  };

  const truncateText = (text: string, maxLength: number = 1000) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Extracting Preview
          </CardTitle>
          <CardDescription>
            Reading content from {file.name}...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
              <p className="text-sm text-slate-600">This may take a few moments...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            Preview Error
          </CardTitle>
          <CardDescription className="text-red-600">
            Unable to extract text from {file.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">Error Details:</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline">
              Cancel Upload
            </Button>
            <Button onClick={onConfirm} variant="default">
              Continue Anyway
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <span className="text-lg">{getFileTypeIcon(file.name)}</span>
              File Preview
              {extractionSuccess && (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </CardTitle>
            <CardDescription>
              Review the extracted content before processing
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {formatFileSize(file.size)}
            </Badge>
            <Badge variant="outline">
              {file.type || file.name.split('.').pop()?.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Info */}
        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
          <FileText className="w-5 h-5 text-slate-600" />
          <div className="flex-1">
            <p className="font-medium text-slate-900">{file.name}</p>
            <p className="text-sm text-slate-600">
              {previewText.length} characters extracted
            </p>
          </div>
        </div>

        {/* Preview Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">Extracted Content</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullText(!showFullText)}
              className="text-xs"
            >
              {showFullText ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  Show More
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <pre className={`
              text-sm font-mono bg-slate-50 border rounded-lg p-4 overflow-auto
              ${showFullText ? 'max-h-none' : 'max-h-96'}
              whitespace-pre-wrap break-words
            `}>
              {showFullText ? previewText : truncateText(previewText)}
            </pre>

            {!showFullText && previewText.length > 1000 && (
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none rounded-b-lg" />
            )}
          </div>

          {!showFullText && previewText.length > 1000 && (
            <p className="text-xs text-slate-500 text-center">
              Showing first 1,000 characters. Click "Show More" to see full content.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Continue Processing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
