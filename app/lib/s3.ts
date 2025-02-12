import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/utils/env";

const isProduction = env.NODE_ENV === "production";

export const s3Client = new S3Client({
  region: "us-east-1",
  ...(!isProduction && {
    endpoint: "http://localhost:9000",
    credentials: {
      accessKeyId: "S3RVER",
      secretAccessKey: "S3RVER",
    },
    forcePathStyle: true,
  }),
});
