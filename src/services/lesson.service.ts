import axiosInstance from './main.service';
import { API } from '../api';
import type { Lesson } from '../types/lesson';
import { getErrorMessage } from '../utils/errorHandler';

type MaybeFormData = FormData | Record<string, any>;
const unwrap = (d: any) => (d?.data ?? d);

export const LessonService = {
  async getAll(): Promise<Lesson[]> {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_LESSON);
      return unwrap(data) as Lesson[];
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error fetching lessons:', msg);
      throw new Error(msg);
    }
  },
  getAllLessonsById: async (id: string) => {
    const res = await axiosInstance.get(`${API.GET_LESSON_ID}/${id}`);
    return res.data;
  },

  createLesson: async (payload: any) => {
    const res = await axiosInstance.post(`${API.CREATE_LESSON}`, payload);
    return res.data;
  },
  getLessonByTopic: async (topicId: string) => {
    const res = await axiosInstance.get(`${API.GET_LESSON_TOPIC}/${topicId}`);
    return res.data;
  },
  getQuizzLesson: async (lessonId: string) => {
    const res = await axiosInstance.get(
      `${API.GET_LESSON_QUIZZ}/${lessonId}/quizzes`
    );
    return res.data;
  },
  deleteLesson: async (lessonId: string) => {
    const res = await axiosInstance.delete(
      `${API.DELETE_LESSON_QUIZZ}/${lessonId}`
    );
    return res.data;
  },
  updateLesson: async (lessonId: string, payload: any) => {
    const res = await axiosInstance.put(
      `${API.UPDATE_LESSON_QUIZZ}/${lessonId}`,
      payload
    );
    return res.data;
  },
};
