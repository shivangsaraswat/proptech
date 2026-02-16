import { useState } from "react";
import { uploadMultipleToS3, uploadToS3, validateFile } from "../lib/s3";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Hook for S3 file uploads with progress tracking
 */
export function useS3Upload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const uploadFile = async (file: File, folder?: string): Promise<string | null> => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setState({ isUploading: false, progress: 0, error: validation.error || null });
      return null;
    }

    setState({ isUploading: true, progress: 0, error: null });

    try {
      const url = await uploadToS3(file, folder);
      setState({ isUploading: false, progress: 100, error: null });
      return url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setState({ isUploading: false, progress: 0, error: errorMessage });
      return null;
    }
  };

  const uploadFiles = async (
    files: Array<File>,
    folder?: string
  ): Promise<Array<string> | null> => {
    // Validate all files
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setState({ isUploading: false, progress: 0, error: validation.error || null });
        return null;
      }
    }

    setState({ isUploading: true, progress: 0, error: null });

    try {
      const urls = await uploadMultipleToS3(files, folder);
      setState({ isUploading: false, progress: 100, error: null });
      return urls;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setState({ isUploading: false, progress: 0, error: errorMessage });
      return null;
    }
  };

  const reset = () => {
    setState({ isUploading: false, progress: 0, error: null });
  };

  return {
    ...state,
    uploadFile,
    uploadFiles,
    reset,
  };
}
