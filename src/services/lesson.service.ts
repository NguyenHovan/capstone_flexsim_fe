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

  async getById(id: string): Promise<Lesson> {
    try {
      const { data } = await axiosInstance.get(`${API.GET_LESSON_ID}/${id}`);
      return unwrap(data) as Lesson;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error fetching lesson by id:', msg);
      throw new Error(msg);
    }
  },

  async getByTopicId(topicId: string): Promise<Lesson[]> {
    try {
      const { data } = await axiosInstance.get(`${API.GET_LESSON_TOPIC_ID}/${topicId}`);
      return unwrap(data) as Lesson[];
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error fetching lessons by topic:', msg);
      throw new Error(msg);
    }
  },

  async create(payload: MaybeFormData): Promise<Lesson> {
    try {
      const isFD = typeof FormData !== 'undefined' && payload instanceof FormData;
      const { data } = await axiosInstance.post(API.CREATE_LESSON, payload as any, {
        ...(isFD && {
          transformRequest: [(form, headers) => {
            delete headers['Content-Type'];
            delete (headers as any)['content-type'];
            return form as any;
          }],
        }),
      });
      return unwrap(data) as Lesson;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error creating lesson:', msg);
      throw new Error(msg);
    }
  },

  async update(id: string, payload: MaybeFormData): Promise<Lesson> {
    try {
      const isFD = typeof FormData !== 'undefined' && payload instanceof FormData;
      const { data } = await axiosInstance.put(`${API.UPDATE_LESSON}/${id}`, payload as any, {
        ...(isFD && {
          transformRequest: [(form, headers) => {
            delete headers['Content-Type'];
            delete (headers as any)['content-type'];
            return form as any;
          }],
        }),
      });
      return unwrap(data) as Lesson;
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error updating lesson:', msg);
      throw new Error(msg);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`${API.DELETE_LESSON}/${id}`);
    } catch (err) {
      const msg = getErrorMessage(err);
      console.error('Error deleting lesson:', msg);
      throw new Error(msg);
    }
  },

  getAllLessons(): Promise<Lesson[]> { return this.getAll(); },
  getLessonById(id: string): Promise<Lesson> { return this.getById(id); },
  createLesson(payload: MaybeFormData): Promise<Lesson> { return this.create(payload); },
  updateLesson(id: string, payload: MaybeFormData): Promise<Lesson> { return this.update(id, payload); },
  deleteLesson(id: string): Promise<void> { return this.delete(id); },
};
