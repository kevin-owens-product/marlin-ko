'use client';

import React, { useRef, useState, useCallback, useId } from 'react';
import styles from './FileUpload.module.css';

export interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
  description?: string;
}

interface FileItem {
  file: File;
  preview?: string;
  error?: string;
}

export function FileUpload({
  accept,
  maxSize,
  multiple = false,
  onFiles,
  label = 'Upload files',
  description,
}: FileUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<FileItem[]>([]);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const isImage = (file: File): boolean => {
    return file.type.startsWith('image/');
  };

  const validateFile = (file: File): string | undefined => {
    if (accept) {
      const acceptedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const fileType = file.type.toLowerCase();
      const matched = acceptedTypes.some(
        (t) =>
          t === fileType ||
          t === fileExt ||
          (t.endsWith('/*') && fileType.startsWith(t.replace('/*', '/')))
      );
      if (!matched) {
        return `File type not accepted. Expected: ${accept}`;
      }
    }
    if (maxSize && file.size > maxSize) {
      return `File too large. Maximum size: ${formatSize(maxSize)}`;
    }
    return undefined;
  };

  const processFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const processed: FileItem[] = fileArray.map((file) => {
        const error = validateFile(file);
        const preview = !error && isImage(file) ? URL.createObjectURL(file) : undefined;
        return { file, preview, error };
      });

      const updated = multiple ? [...files, ...processed] : processed;
      setFiles(updated);

      const validFiles = updated.filter((f) => !f.error).map((f) => f.file);
      if (validFiles.length > 0) {
        onFiles(validFiles);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files, multiple, accept, maxSize, onFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const item = files[index];
    if (item.preview) {
      URL.revokeObjectURL(item.preview);
    }
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);

    const validFiles = updated.filter((f) => !f.error).map((f) => f.file);
    onFiles(validFiles);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      inputRef.current?.click();
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={[styles.dropzone, dragOver ? styles.dropzoneActive : '']
          .filter(Boolean)
          .join(' ')}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={label}
      >
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className={styles.hiddenInput}
          aria-hidden="true"
          tabIndex={-1}
        />
        <div className={styles.dropzoneContent}>
          <div className={styles.uploadIcon} aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className={styles.dropzoneText}>
            <span className={styles.dropzoneLabel}>{label}</span>
            <span className={styles.dropzoneSub}>
              Drag & drop or{' '}
              <span className={styles.browseLink}>browse files</span>
            </span>
            {description && (
              <span className={styles.dropzoneDesc}>{description}</span>
            )}
            {maxSize && (
              <span className={styles.dropzoneDesc}>
                Max file size: {formatSize(maxSize)}
              </span>
            )}
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <ul className={styles.fileList} aria-label="Uploaded files">
          {files.map((item, index) => (
            <li
              key={`${item.file.name}-${index}`}
              className={[
                styles.fileItem,
                item.error ? styles.fileItemError : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {item.preview && (
                <img
                  src={item.preview}
                  alt={`Preview of ${item.file.name}`}
                  className={styles.filePreview}
                />
              )}
              {!item.preview && (
                <div className={styles.fileIcon} aria-hidden="true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
              )}
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{item.file.name}</span>
                {item.error ? (
                  <span className={styles.fileError}>{item.error}</span>
                ) : (
                  <span className={styles.fileSize}>
                    {formatSize(item.file.size)}
                  </span>
                )}
              </div>
              <button
                className={styles.removeBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(index);
                }}
                type="button"
                aria-label={`Remove ${item.file.name}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
