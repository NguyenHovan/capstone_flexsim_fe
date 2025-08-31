import axiosInstance from "./main.service";

export const ChatService = {
  gemini: async (message: string) => {
    const response = await axiosInstance.post(`/chat`, { message });
    return response.data;
  },
  gpt: async (message: string) => {
    const response = await axiosInstance.post(`/chat`, { message });
    return response.data;
  },
};
