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
  acpEnrollmentRequest: async (id: string) => {
    const response = await axiosInstance.put(
      `${API.ACCEPT_ENROLLMENT_REQUEST}/${id}`
    );
    return response.data;
  },
  rejectEnrollmentRequest: async (id: string) => {
    const response = await axiosInstance.put(
      `${API.REJECT_ENROLLMENT_REQUEST}/${id}`
    );
    return response.data;
  },
  deleteEnrollmentRequest: async (id: string) => {
    const response = await axiosInstance.delete(
      `${API.DELETE_ENROLLMENT_REQUEST}/${id}`
    );
    return response.data;
  },
  getStudentsEnrollClass: async (classId: string) => {
    const response = await axiosInstance.get(
      `${API.GET_STUDENT_ENROLLMENT}/${classId}/students`
    );
    return response.data;
  },
  getStudentsEnrollClassCourse: async (courseId: string) => {
    const response = await axiosInstance.get(
      `${API.GET_STUDENT_ENROLLMENT_CLASS_COURSE}/${courseId}/students`
    );
    return response.data;
  },
  assignStudentToClass: async (studentId: string, classId: string) => {
    const response = await axiosInstance.put(
      `${API.ASSIGN_STUDENT_CLASS}/${studentId}`,
      {
        classId,
      }
    );
    return response.data;
  },
  getEnrolmentRequestByCourseId: async (courseId: string) => {
    const response = await axiosInstance.get(
      `${API.ENROLLMENT_REQUEST_COURSE}/${courseId}`
    );
    return response.data;
  },
};
