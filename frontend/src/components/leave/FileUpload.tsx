import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  acceptedTypes?: string;
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect, 
  acceptedTypes = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxSize = 5 * 1024 * 1024 // 5MB
}) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`);
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError(`Invalid file type. Allowed: ${acceptedTypes}`);
      }
      return;
    }
    
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile);
    onFileSelect(selectedFile);
  }, [onFileSelect, acceptedTypes, maxSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.split(',').reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false
  });

  const removeFile = () => {
    setFile(null);
    onFileSelect(null);
    setError('');
  };

  return (
    <div>
      {!file ? (
        <div
          {...getRootProps()}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-1 text-center">
            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <div className="flex text-sm text-gray-600 dark:text-gray-400">
              <span className="relative font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
                Upload a file
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              PDF, DOC, DOCX, JPG, PNG up to 5MB
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex items-center gap-2">
            <DocumentIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({(file.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default FileUpload;