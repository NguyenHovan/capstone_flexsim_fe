import axiosInstance from "./main.service";
import { API } from "../api";

export const UploadService = {
  uploadImage: async (file: File | Blob): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file); // phải là "image"

    const { data } = await axiosInstance.post(API.UPLOAD_FILE, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const url =
      (typeof data === "string" && data) ||
      data?.url ||
      data?.secure_url ||
      data?.data?.url ||
      data?.data?.secure_url;

    if (!url) throw new Error("Upload image OK nhưng không thấy URL trả về.");
    return url as string;
  },
};
