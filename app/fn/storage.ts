import { createServerFn } from "@tanstack/start";
import { authenticatedMiddleware } from "~/lib/auth";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { env } from "~/utils/env";
import { z } from "zod";
import { s3Client } from "~/lib/s3";
import { v4 as uuidv4 } from "uuid";

export const getPresignedPostUrlFn = createServerFn()
  .middleware([authenticatedMiddleware])
  .validator(
    z.object({
      contentType: z.string(),
    })
  )
  .handler(async ({ data }) => {
    const uuid = uuidv4();
    const fileExtension = data.contentType.split("/").pop() || "";
    const key = `${uuid}.${fileExtension}`;

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: env.STORAGE_BUCKET_NAME,
      Key: key,
      Conditions: [
        ["content-length-range", 0, 5 * 1024 * 1024], // up to 5MB
        ["eq", "$Content-Type", data.contentType],
      ],
      Fields: {
        "Content-Type": data.contentType,
      },
      Expires: 600, // 10 minutes
    });

    return { url, fields, key };
  });
