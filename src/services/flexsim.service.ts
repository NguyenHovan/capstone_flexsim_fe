import axiosInstance from "./main.service";

export type UploadOptions = {
  maxQuestions?: number;
  lang?: string;
};
export const FlexsimService = {
  flexsimUpload: async (
    file: File,
    opts: UploadOptions = {},
    onProgress?: (percent: number) => void
  ) => {
    const fd = new FormData();
    fd.append("file", file);
    if (opts.maxQuestions !== undefined) {
      fd.append("maxQuestions", String(opts.maxQuestions));
    }
    if (opts.lang) fd.append("lang", opts.lang);

    const res = await axiosInstance.post("/flexsim/upload", fd, {
      onUploadProgress: (e) => {
        if (onProgress && e.total)
          onProgress(Math.round((e.loaded / e.total) * 100));
      },
      headers: { "Content-Type": undefined as any },
    });

    return res.data;
  },
};
