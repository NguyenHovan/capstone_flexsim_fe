// src/services/course.service.ts
import { API } from "../api";
import axiosInstance from "./main.service";
import type { Course } from "../types/course";

// Kiểu nới lỏng cho dữ liệu BE có thể trả
export type CourseLite = Course & {
  organizationId?: string;
  name?: string;
  courseName?: string;
};

export const CourseService = {
  getAllCourses: async (): Promise<CourseLite[]> => {
    const { data } = await axiosInstance.get(API.GET_ALL_COURSE);
    // BE có thể bọc trong { data: [...] } hoặc trả thẳng mảng
    return (data?.data ?? data) as CourseLite[];
  },

  getCourseById: async (id: string): Promise<Course> => {
    const response = await axiosInstance.get(`${API.GET_COURSE_ID}/${id}`);
    return (response.data?.data ?? response.data) as Course;
  },

  /** ✅ trả về các course thuộc orgId (lọc ở service, không để UI tự lọc) */
  getCoursesByOrg: async (orgId: string): Promise<Course[]> => {
    const all = await CourseService.getAllCourses();
    // lưu ý: nhiều BE đặt field organizationId trên course, nếu không có thì trả về all
    return all.filter((c: any) => !orgId ? true : (c?.organizationId ? c.organizationId === orgId : true));
  },

  createCourse: async (payload: any) => {
    const { data } = await axiosInstance.post(API.CREATE_COURSE, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  updateCourse: async (id: string, payload: any) => {
    const { data } = await axiosInstance.put(`${API.UPDATE_COURSE}/${id}`, payload);
    return data;
  },

  deleteCourse: async (id: string) => {
    const { data } = await axiosInstance.post(`${API.DELETE_COURSE}/${id}`);
    return data;
  },
};
