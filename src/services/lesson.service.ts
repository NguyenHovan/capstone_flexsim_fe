import axiosInstance from './main.service';
import { API } from '../api';
import type { Lesson } from '../types/lesson';
import { getErrorMessage } from '../utils/errorHandler';

export const LessonService = {
  getAll: async (): Promise<Lesson[]> => {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_LESSON);
      return (data?.data ?? data) as Lesson[];
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error('Error fetching lessons:', msg, err?.response?.data);
      throw new Error(msg);
    }
  },

 
};
