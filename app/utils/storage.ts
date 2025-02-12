import { env } from "./env";

export function getStorageUrl(key: string) {
  return `${import.meta.env.VITE_FILE_URL}/${key}`;
}
