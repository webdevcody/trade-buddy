import { getAttachment } from "~/data-access/attachments";
import { deleteAttachment } from "~/data-access/segments";
import { deleteFile } from "~/storage";

export async function deleteAttachmentUseCase(attachmentId: number) {
  const attachment = await getAttachment(attachmentId);

  if (!attachment) {
    throw new Error("Attachment not found");
  }

  await deleteFile(attachment.fileKey);
  return deleteAttachment(attachmentId);
}
