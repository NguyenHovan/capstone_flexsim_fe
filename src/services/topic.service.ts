// src/services/topic.service.ts
import axiosInstance from './main.service';
import { API } from '../api';
import type { Topic } from '../types/topic';
import { getErrorMessage } from '../utils/errorHandler';

export const TopicService = {
  getAllTopics: async (): Promise<Topic[]> => {
    try {
      const { data } = await axiosInstance.get(API.GET_ALL_TOPIC);
      return (data?.data ?? data) as Topic[];
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error('Error fetching topics:', msg, err?.response?.data);
      throw new Error(msg);
    }
  },

  getTopicById: async (id: string): Promise<Topic> => {
    try {
      const { data } = await axiosInstance.get(`${API.GET_TOPIC_ID}/${id}`);
      return (data?.data ?? data) as Topic;
    } catch (err: any) {
      const msg = getErrorMessage(err);
      console.error('Error fetching topic by ID:', msg, err?.response?.data);
      throw new Error(msg);
    }
  },

  // ❗ KHÔNG set 'Content-Type' ở đây; để browser tự thêm boundary cho FormData
  createTopic: async (payload: FormData) => {
    const res = await axiosInstance.post(API.CREATE_TOPIC, payload);
    return res.data;
  },

  updateTopic: async (id: string, payload: FormData) => {
    const res = await axiosInstance.put(`${API.UPDATE_TOPIC}/${id}`, payload);
    return res.data;
  },

  deleteTopic: async (id: string) => {
    const res = await axiosInstance.delete(`${API.DELETE_TOPIC}/${id}`);
    return res.data;
  },
};
