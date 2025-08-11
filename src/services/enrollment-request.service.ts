import { API } from "../api";
import axiosInstance from "./main.service";

export const EnrollmentRequestService = {
  enrollmentRequest: async (payload: {
    studentId: string;
    courseId: string;
  }) => {
    const response = await axiosInstance.post(
      `${API.ENROLLMENT_REQUEST}`,
      payload
    );
    return response.data;
  },
  enrollmentRequestStudent: async (studentId: string) => {
    const response = await axiosInstance.get(
      `${API.ENROLLMENT_REQUEST_STUDENT}/${studentId}/enrolled-courses`
    );
    return response.data;
  },
  getEnrolmentRequest: async () => {
    const response = await axiosInstance.get(`${API.GET_ENROLLMENT_REQUEST}`);
    return response.data;
  },
  acceptEnrollmentRequest: async (id: string) => {
    const response = await axiosInstance.put(
      `${API.ACCEPT_ENROLLMENT_REQUEST}/${id}`
    );
    return response.data;
  },
  deleteEnrollmentRequest: async (id: string) => {
    const response = await axiosInstance.delete(
      `${API.DELETE_ENROLLMENT_REQUEST}/${id}`
    );
    return response.data;
  },
};
