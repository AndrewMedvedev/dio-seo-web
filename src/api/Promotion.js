import axios from "axios";

const API_URL = "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
export const PromotionApi = {
  /** Анализ SEO */
  seo: async (userId, url) => {
    const response = await apiClient.get(
      `/api/v1/seo/${userId}?url=${encodeURIComponent(url)}`,
    );
    return response.data;
  },

  /** Генерация AIO контента */
  aio: async (userId, url, generationId) => {
    const response = await apiClient.get(
      `/api/v1/aio/${userId}/${generationId}?url=${url}`,
    );
    return response.data;
  },

  /** Получение истории */
  history: async (userId, page = 1, limit = 10) => {
    const response = await apiClient.get(
      `/api/v1/results/${userId}?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  /** Отправка сообщения в чат */
  chat: async (userId, text, generationId) => {
    const response = await apiClient.post(`/api/v1/chat`, {
      user_id: userId,
      generation_id: generationId,
      role: "user",
      text: text,
    });
    return response.data;
  },
};
