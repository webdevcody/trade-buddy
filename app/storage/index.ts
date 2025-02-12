import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "~/lib/s3";
import { env } from "~/utils/env";

export async function storeFile(key: string, data: Blob) {
  try {
    const command = new PutObjectCommand({
      Bucket: env.STORAGE_BUCKET_NAME,
      Key: key,
      Body: data,
      ContentType: data.type,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}
