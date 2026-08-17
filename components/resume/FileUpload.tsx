// components/resume/FileUpload.tsx
'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, File as FileIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  /** Comma separated extension list, e.g. ".pdf,.docx" */
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extensions = accept
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  /** Extension + size are both checked here; the API re-checks them server-side. */
  const accept_ = useCallback(
    (file: File) => {
      const name = file.name.toLowerCase();

      if (extensions.length && !extensions.some((extension) => name.endsWith(extension))) {
        setError(`Only ${extensions.join(' or ')} files are supported`);
        return;
      }

      if (file.size > maxSize) {
        setError(`File is larger than ${Math.round(maxSize / 1024 / 1024)} MB`);
        return;
      }

      setError(null);
      onFileSelect(file);
    },
    [extensions, maxSize, onFileSelect]
  );

  if (selectedFile) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex min-w-0 items-center gap-3">
            <FileIcon className="h-8 w-8 shrink-0 text-ink-muted" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-xs text-ink-soft">{(selectedFile.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Remove file"
            onClick={() => {
              onFileSelect(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/*
        The whole drop zone is the click target. Previously only the small "Browse"
        button opened the picker even though the box showed a pointer cursor.
      */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) accept_(file);
        }}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
          isDragging ? 'border-ink bg-paper' : 'hover:border-ink/35 hover:bg-paper'
        )}
      >
        <Upload className="mx-auto mb-4 h-12 w-12 text-ink-soft" />
        <p className="mb-1 text-sm font-medium">Drop your resume here, or click to browse</p>
        <p className="text-xs text-ink-soft">
          {extensions.join(' / ').toUpperCase()} · max {Math.round(maxSize / 1024 / 1024)} MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) accept_(file);
          }}
        />
      </div>

      {error && <p className="text-sm text-crimson">{error}</p>}
    </div>
  );
}
