import { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onMultipleFilesSelect?: (files: File[]) => void;
  isProcessing: boolean;
  allowMultiple?: boolean;
}

export function FileUpload({ onFileSelect, onMultipleFilesSelect, isProcessing, allowMultiple = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const maxSize = 10 * 1024 * 1024;

    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidType && !hasValidExtension) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return false;
    }

    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return false;
    }

    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleMultipleFiles = (files: File[]) => {
    const validFiles: File[] = [];

    files.forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0 && onMultipleFilesSelect) {
      onMultipleFilesSelect(validFiles);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (isProcessing) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        if (allowMultiple && files.length > 1) {
          handleMultipleFiles(files);
        } else {
          handleFile(files[0]);
        }
      }
    },
    [isProcessing, allowMultiple]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (allowMultiple && files.length > 1) {
        handleMultipleFiles(files);
      } else {
        handleFile(files[0]);
      }
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card className="glass bg-white/90">
        <CardContent className="p-0">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300",
              isDragging && "border-gray-400 bg-gray-50",
              !isDragging && "border-gray-300 bg-gray-50",
              isProcessing && "opacity-50 cursor-not-allowed",
              !isProcessing && "hover:border-gray-400 hover:bg-gray-100 cursor-pointer"
            )}
          >
            <input
              type="file"
              id="file-upload"
              className="sr-only"
              accept=".pdf,.docx,.txt"
              multiple={allowMultiple}
              onChange={handleFileInput}
              disabled={isProcessing}
            />

            <label
              htmlFor="file-upload"
              className={cn(
                "flex flex-col items-center space-y-4",
                isProcessing ? "cursor-not-allowed" : "cursor-pointer"
              )}
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 border border-gray-300">
                {isProcessing ? (
                  <Loader2 className="w-8 h-8 text-gray-700 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-gray-700" />
                )}
              </div>

              <div className="space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  {isProcessing
                    ? 'Processing your resume...'
                    : isDragging
                      ? (allowMultiple ? 'Drop your resumes here' : 'Drop your resume here')
                      : (allowMultiple ? 'Upload your resumes' : 'Upload your resume')
                  }
                </p>
                <p className="text-sm text-gray-700">
                  {isProcessing
                    ? 'This may take a few moments'
                    : 'Drag and drop or click to browse'}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-gray-800">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gray-700" />
                  <span>PDF</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gray-700" />
                  <span>DOCX</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-gray-700" />
                  <span>TXT</span>
                </div>
              </div>

              <p className="text-xs text-gray-700">Maximum file size: 10MB</p>
            </label>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-start gap-3 p-4 glass border-red-400/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Upload Error</p>
            <p className="text-sm text-gray-700 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
