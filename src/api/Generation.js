import { apiClient } from "./Promotion";

export const GenerationApi = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/api/v1/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  listFiles: async () => {
    const response = await apiClient.get("/api/v1/knowledge-base/files");
    return response.data;
  },

  chat: async (text, generationId) => {
    const response = await apiClient.post("/api/v1/chat", {
      generation_id: generationId,
      role: "user",
      text,
    });

    return response.data;
  },

  resetChat: async () => {
    const response = await apiClient.post("/api/v1/chat/reset");
    return response.data;
  },
};
