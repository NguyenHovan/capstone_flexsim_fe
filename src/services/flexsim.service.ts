import axiosInstance from "./main.service";

export type UploadOptions = {
  maxQuestions?: number;
  lang?: string;
  filename?: string;
};

export const FlexsimService = {
  flexsimUpload: async (
    file: File | Blob,
    opts: UploadOptions = {},
    onProgress?: (percent: number) => void
  ) => {
    const fd = new FormData();
    const filename =
      (file as any).name || opts.filename || `dataset_${Date.now()}.bin`;

    fd.append("file", file, filename);

    if (opts.maxQuestions !== undefined)
      fd.append("maxQuestions", String(opts.maxQuestions));
    if (opts.lang) fd.append("lang", opts.lang);

    const res = await axiosInstance.post("/flexsim/upload", fd, {
      headers: { "Content-Type": undefined as any },
      onUploadProgress: (e) => {
        if (!onProgress || !e.total) return;
        onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });

    return res.data;
  },
};
