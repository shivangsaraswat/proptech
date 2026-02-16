import "dotenv/config";

const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: toNumber(process.env.PORT, 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",

  // JWT
  jwtSecret: process.env.JWT_SECRET ?? "your-secret-key-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  // AWS S3 (optional - only if using presigned URLs from backend)
  awsRegion: process.env.AWS_REGION ?? "us-east-1",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsBucketName: process.env.AWS_BUCKET_NAME ?? "",
  awsEndpoint: process.env.AWS_ENDPOINT ?? "", // For S3-compatible services (Supabase, MinIO)

  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS ?? "",
};

if (!env.databaseUrl) {
  throw new Error("Missing DATABASE_URL in environment variables");
}

if (!env.jwtSecret || env.jwtSecret === "your-secret-key-change-in-production") {
  console.warn("⚠️  WARNING: Using default JWT_SECRET. Set JWT_SECRET in .env for production!");
}
