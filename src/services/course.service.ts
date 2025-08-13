import { API } from "../api";
import axiosInstance from "./main.service";

export const CourseService = {
  getAllCourses: async () => {
    const response = await axiosInstance.get(`${API.GET_ALL_COURSE}`);
    return response.data;
  },

  getCourseById: async (id: string) => {
    const response = await axiosInstance.get(`${API.GET_COURSE_ID}/${id}`);
    return response.data;
  },

  // searchCourses: async (name: string, description: string) => {
  //   const response = await axiosInstance.get(
  //     `${API.GET_COURSE_SEARCH}/${name},${description}`
  //   );
  //   return response.data;
  // },
  getCourseByOrgId: async (orgId: string) => {
    const response = await axiosInstance.get(`${API. GET_ALL_COURSE_ORGID}/${orgId}`);
    return response.data;
  },
  createCourse: async (payload: any) => {
    const response = await axiosInstance.post(`${API.CREATE_COURSE}`, payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  updateCourse: async (id: string, payload: any) => {
    const response = await axiosInstance.put(
      `${API.UPDATE_COURSE}/${id}`,
      payload
    );
    return response.data;
  },
  deleteCourse: async (id: string) => {
    const response = await axiosInstance.post(`${API.DELETE_COURSE}/${id}`);
    return response.data;
  },
};
