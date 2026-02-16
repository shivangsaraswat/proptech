import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { AWS_CONFIG } from "./constants";

/**
 * S3 Client for direct file uploads
 * Supports both AWS S3 and S3-compatible services (Supabase, MinIO, etc.)
 */
const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey,
  },
  // Support custom S3-compatible endpoints (like Supabase)
  ...(import.meta.env.VITE_AWS_ENDPOINT && {
    endpoint: import.meta.env.VITE_AWS_ENDPOINT,
    forcePathStyle: true, // Required for Supabase S3 compatibility
  }),
});

/**
 * Get public URL for uploaded file
 */
function getPublicUrl(fileName: string): string {
  const publicUrl = import.meta.env.VITE_S3_PUBLIC_URL;
  
  if (publicUrl) {
    // Use custom public URL (for Supabase or custom CDN)
    return `${publicUrl}/${fileName}`;
  }
  
  // Fallback to standard S3 URL format
  return `https://${AWS_CONFIG.bucketName}.s3.${AWS_CONFIG.region}.amazonaws.com/${fileName}`;
}

/**
 * Upload file to S3 and return public URL
 */
export async function uploadToS3(
  file: File,
  folder: string = "tickets"
): Promise<string> {
  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split(".").pop();
  const fileName = `${folder}/${timestamp}-${randomString}.${extension}`;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: AWS_CONFIG.bucketName,
    Key: fileName,
    Body: file,
    ContentType: file.type,
    ACL: "public-read", // Make file publicly accessible
  });

  await s3Client.send(command);

  // Return public URL
  return getPublicUrl(fileName);
}

/**
 * Upload multiple files to S3
 */
export async function uploadMultipleToS3(
  files: Array<File>,
  folder: string = "tickets"
): Promise<Array<string>> {
  const uploadPromises = files.map((file) => uploadToS3(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 5MB" };
  }

  // Check file type (images only)
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only JPEG, PNG, and WebP images are allowed" };
  }

  return { valid: true };
}
