// components/resume/FileUpload.tsx
'use client';

import { useCallback } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept: string;
  maxSize: number;
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export default function FileUpload({
  accept,
  maxSize,
  onFileSelect,
  selectedFile,
}: FileUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.size <= maxSize) {
          onFileSelect(file);
        } else {
          alert(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
        }
      }
    },
    [maxSize, onFileSelect]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size <= maxSize) {
        onFileSelect(file);
      } else {
        alert(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
      }
    }
  };

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            'hover:border-ink/35 hover:bg-paper'
          )}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-ink-soft" />
          <p className="text-sm font-medium mb-1">
            Drop your resume here or click to browse
          </p>
          <p className="text-xs text-ink-soft">
            {accept.toUpperCase()} • Max {maxSize / 1024 / 1024}MB
          </p>
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="mt-4" asChild>
              <span>Browse Files</span>
            </Button>
          </label>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-ink-muted" />
            <div>
              <p className="text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-ink-soft">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFileSelect(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
