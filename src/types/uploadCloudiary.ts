export interface UploadResponse {
  url?: string;
  secure_url?: string;
  data?: string | { url?: string; secure_url?: string };
  [key: string]: any;
}
