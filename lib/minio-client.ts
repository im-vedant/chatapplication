import { S3Client } from "@aws-sdk/client-s3";
import AWS from 'aws-sdk';

// Common MinIO configuration
const minioConfig = {
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  region: process.env.MINIO_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
};

// AWS SDK v3 client (for signed URLs and modern operations)
export const s3Client = new S3Client(minioConfig);


// Common bucket name
export const BUCKET_NAME = process.env.MINIO_BUCKET || 'uploads';

// Helper function to check if MinIO is properly configured
export function isMinIOConfigured(): boolean {
  return !!(
    process.env.MINIO_ENDPOINT &&
    process.env.MINIO_ACCESS_KEY &&
    process.env.MINIO_SECRET_KEY &&
    process.env.MINIO_BUCKET
  );
}
