import { API } from "../api";
import axiosInstance from "./main.service";

export const CertificateService = {
  getMyCertificate: async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const response = await axiosInstance.get(
      `${API.GET_MY_CERTIFICATE}/${currentUser.id}`
    );
    return response.data;
  },
  certificateByCourseAndAccount: async (courseId: string) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const response = await axiosInstance.get(
      `${API.GET_CERTIFICATE_BY_COURSE_AND_ACCOUNT}/${currentUser.id}/${courseId}`
    );
    return response.data;
  },
};
