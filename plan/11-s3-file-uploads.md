# S3 File Upload Architecture

## Overview

Images are uploaded directly from the **frontend to S3**, then the public URL is sent to the backend for database storage. This approach:
- Reduces backend load (no file processing)
- Remains platform-agnostic (no local file storage)
- Simplifies deployment (no persistent volumes needed)
- Provides direct CDN access via S3

---

## Architecture Flow

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│ Frontend │──────▶│   S3     │       │ Backend  │
│          │upload │ Bucket   │       │   API    │
└──────────┘       └──────────┘       └──────────┘
     │                  │                   │
     │ 1. Upload file   │                   │
     │─────────────────▶│                   │
     │                  │                   │
     │ 2. Get public URL│                   │
     │◀─────────────────│                   │
     │                  │                   │
     │ 3. POST ticket with imageUrls        │
     │─────────────────────────────────────▶│
     │                  │                   │
     │                  │ 4. Store URL in DB│
     │                  │                   │
     │                  │◀──────────────────│
     │ 5. Response      │                   │
     │◀─────────────────────────────────────│
```

---

## S3 Bucket Setup

### 1. Create Bucket
- Name: `proptech-attachments` (or your preferred name)
- Region: Choose closest to your users
- Block all public access: **DISABLE** (we need public read)

### 2. Bucket Policy (Public Read)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::proptech-attachments/*"
    }
  ]
}
```

### 3. CORS Configuration
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. IAM User for Uploads
Create an IAM user with programmatic access and attach this policy:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::proptech-attachments/tickets/*"
    }
  ]
}
```

Save the Access Key ID and Secret Access Key.

---

## Frontend Implementation

### Environment Variables
Add to `frontend/.env`:
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_BUCKET=proptech-attachments
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

⚠️ **Security Note**: In production, use temporary credentials via AWS Cognito or STS instead of hardcoded keys.

### S3 Client Setup (`lib/s3.ts`)
```ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = import.meta.env.VITE_AWS_BUCKET;

export async function uploadToS3(
  file: File,
  folder: string = "tickets"
): Promise<string> {
  const filename = `${folder}/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: file,
    ContentType: file.type,
    ACL: "public-read", // Make object publicly readable
  });

  await s3Client.send(command);

  // Return public URL
  return `https://${BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${filename}`;
}

export async function uploadMultipleToS3(
  files: File[],
  folder: string = "tickets"
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadToS3(file, folder)));
}
```

### Upload Hook (`hooks/use-s3-upload.ts`)
```ts
import { useState } from "react";
import { uploadMultipleToS3 } from "@/lib/s3";
import { toast } from "sonner";

export function useS3Upload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      throw new Error("Too many files");
    }

    // Validate file sizes and types
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        throw new Error("File too large");
      }
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`${file.name} is not a supported image format`);
        throw new Error("Invalid file type");
      }
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const urls: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const url = await uploadMultipleToS3([files[i]]);
        urls.push(...url);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setIsUploading(false);
      return urls;
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to upload images");
      throw error;
    }
  };

  return { upload, isUploading, progress };
}
```

### Ticket Form Component Usage
```tsx
import { useS3Upload } from "@/hooks/use-s3-upload";
import { useDropzone } from "react-dropzone";

function CreateTicketForm() {
  const { upload, isUploading, progress } = useS3Upload();
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    try {
      const urls = await upload(acceptedFiles);
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (error) {
      // Error already toasted
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024,
  });

  const handleSubmit = async (data: TicketFormData) => {
    // Submit ticket with imageUrls
    await api.post("/tickets", {
      ...data,
      imageUrls, // Array of S3 URLs
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... other fields ... */}
      
      <div {...getRootProps()} className="border-2 border-dashed p-6">
        <input {...getInputProps()} />
        {isUploading ? (
          <div>Uploading... {progress}%</div>
        ) : isDragActive ? (
          <p>Drop images here...</p>
        ) : (
          <p>Drag & drop images, or click to select</p>
        )}
      </div>

      {/* Preview uploaded images */}
      <div className="grid grid-cols-3 gap-2">
        {imageUrls.map((url) => (
          <img key={url} src={url} alt="Preview" className="w-full h-24 object-cover" />
        ))}
      </div>
    </form>
  );
}
```

---

## Backend Implementation

### Validation (`validators/ticket.validator.ts`)
```ts
import { z } from "zod";

const s3UrlSchema = z
  .string()
  .url()
  .refine(
    (url) => url.startsWith(`https://${process.env.AWS_BUCKET}.s3.`),
    "Invalid S3 URL"
  );

export const createTicketSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().min(10).max(5000),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  unitNumber: z.string().max(50).optional(),
  building: z.string().max(255).optional(),
  imageUrls: z.array(s3UrlSchema).max(5).optional(),
});
```

### Service (`services/ticket.service.ts`)
```ts
async createTicket(data: CreateTicketInput, userId: string) {
  const ticket = await db.insert(tickets).values({
    title: data.title,
    description: data.description,
    priority: data.priority || "medium",
    status: "open",
    createdBy: userId,
    unitNumber: data.unitNumber,
    building: data.building,
  }).returning();

  // If images provided, save them
  if (data.imageUrls && data.imageUrls.length > 0) {
    const imageRecords = data.imageUrls.map((url) => ({
      ticketId: ticket[0].id,
      url,
      filename: url.split("/").pop() || "image.jpg",
      uploadedBy: userId,
    }));

    await db.insert(ticketImages).values(imageRecords);
  }

  // Log activity
  await activityService.logActivity({
    ticketId: ticket[0].id,
    actorId: userId,
    action: "created",
  });

  return ticket[0];
}
```

---

## Alternative: Presigned URLs (Production Recommended)

For better security, use presigned URLs instead of exposing AWS credentials in frontend.

### Backend Endpoint: `POST /api/upload/presigned-url`
```ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function generatePresignedUrl(req: Request, res: Response) {
  const { filename, contentType } = req.body;
  
  const key = `tickets/${Date.now()}-${crypto.randomUUID()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    ContentType: contentType,
    ACL: "public-read",
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const publicUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  res.json({ presignedUrl, publicUrl });
}
```

### Frontend Upload with Presigned URL
```ts
async function uploadWithPresignedUrl(file: File): Promise<string> {
  // 1. Request presigned URL from backend
  const { presignedUrl, publicUrl } = await api.post("/upload/presigned-url", {
    filename: file.name,
    contentType: file.type,
  });

  // 2. Upload directly to S3 using presigned URL
  await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  // 3. Return public URL
  return publicUrl;
}
```

---

## Environment Variables Summary

### Frontend
```env
VITE_AWS_REGION=us-east-1
VITE_AWS_BUCKET=proptech-attachments
VITE_AWS_ACCESS_KEY_ID=AKIA... (only if not using presigned URLs)
VITE_AWS_SECRET_ACCESS_KEY=... (only if not using presigned URLs)
VITE_API_URL=http://localhost:4000/api
```

### Backend (for presigned URL approach)
```env
AWS_REGION=us-east-1
AWS_BUCKET=proptech-attachments
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

---

## Testing S3 Upload

### Manual Test
```bash
# 1. Upload a file via frontend
# 2. Check S3 console for the object
# 3. Verify the public URL is accessible
curl https://proptech-attachments.s3.us-east-1.amazonaws.com/tickets/123456-uuid-image.jpg

# 4. Check database for stored URL
psql> SELECT * FROM ticket_images;
```

---

## Cost Considerations

- **Storage**: ~$0.023/GB/month (S3 Standard)
- **Requests**: PUT = $0.005 per 1,000 requests
- **Data Transfer**: First 100GB/month free, then $0.09/GB
- **Typical cost**: < $5/month for moderate usage

---

## Production Recommendations

1. ✅ **Use presigned URLs** instead of frontend AWS credentials
2. ✅ **Enable S3 versioning** for accidental deletes
3. ✅ **Set lifecycle rules** to delete old files after X days (optional)
4. ✅ **Use CloudFront CDN** for faster global access
5. ✅ **Add image optimization** (resize/compress before upload)
6. ✅ **Implement virus scanning** for uploaded files (AWS Lambda + ClamAV)
7. ✅ **Add watermarks** to prevent unauthorized reuse (optional)
