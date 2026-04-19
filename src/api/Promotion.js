import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json", // рекомендуется добавить
  },
  withCredentials: true, // ← Важно! Чтобы браузер отправлял cookies автоматически
});

// ========================
// Хелперы для работы с токенами
// ========================
export const tokenStorage = {
  getAccessToken() {
    // Сначала пытаемся взять из localStorage, потом из cookie
    return (
      localStorage.getItem("access_token") || getCookie("access_token") || null
    );
  },

  getRefreshToken() {
    return (
      localStorage.getItem("refresh_token") ||
      getCookie("refresh_token") ||
      null
    );
  },

  setTokens(accessToken, refreshToken, expiresAt) {
    // localStorage
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("token_expires_at", expiresAt.toString());

    // Cookies
    const accessExpires = new Date(expiresAt * 1000);
    const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    setCookie("access_token", accessToken, accessExpires);
    setCookie("refresh_token", refreshToken, refreshExpires);
  },

  clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("token_expires_at");

    deleteCookie("access_token");
    deleteCookie("refresh_token");
  },

  isTokenExpired() {
    const expiresAt = localStorage.getItem("token_expires_at");
    if (!expiresAt) return true;
    return Date.now() >= parseInt(expiresAt) * 1000;
  },
};

// ========================
// Вспомогательные функции для cookies (оставляем как есть)
// ========================
function setCookie(name, value, expires) {
  document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
}

function getCookie(name) {
  const matches = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)",
    ),
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

function decodeJwtPayload(token) {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(window.atob(padded));
  } catch {
    return null;
  }
}

function getCurrentUserId() {
  const token = tokenStorage.getAccessToken();
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const candidate = payload.user_id ?? payload.id ?? payload.sub ?? null;
  if (candidate === null || candidate === undefined) return null;

  const normalized = String(candidate).trim();
  return normalized.length > 0 ? normalized : null;
}

const asObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};
const asArray = (value) => (Array.isArray(value) ? value : []);
const asString = (value) => (value == null ? "" : String(value));

const MOCK_INTERLINKING_RESULT = {
  summary:
    "We could not get a fresh backend response, so a mock interlinking result is shown.",
  recommendations: [
    "Place a contextual internal link in the main content block.",
    "Add one link from a closely related article page.",
    "Use an anchor text that reflects the target page intent.",
  ],
  candidates: [
    {
      id: "mock-candidate-1",
      url: "https://example.com/blog/internal-linking-basics",
      reason: "High semantic overlap by URL/title/H1",
      depth: 2,
      priority: 1,
    },
  ],
};

const MOCK_INTERLINKING_HISTORY = [
  {
    id: "mock-interlinking-history-1",
    created_at: "2026-04-19T08:45:00Z",
    url: "https://example.com/promo-page",
    result: MOCK_INTERLINKING_RESULT,
  },
  {
    id: "mock-interlinking-history-2",
    created_at: "2026-04-18T14:30:00Z",
    url: "https://example.com/services/seo",
    result: {
      summary: "Mock history record: target page exists, link visibility should be improved.",
      recommendations: [
        "Move one internal link above the fold.",
        "Add one link from a commercial-intent sibling page.",
      ],
      candidates: [],
    },
  },
];

function normalizeInterlinkingResult(source) {
  const root = asObject(source);
  const nested =
    asObject(root.re_linking_result) ||
    asObject(root.relinking_result) ||
    asObject(root.internal_linking_result) ||
    asObject(root.interlinking_result) ||
    {};
  const base = Object.keys(nested).length > 0 ? nested : root;

  const recommendations = asArray(base.recommendations || base.tips).map((item) =>
    typeof item === "string"
      ? item
      : asString(item?.text || item?.recommendation || item?.description),
  );

  const candidates = asArray(base.candidates || base.urls || base.link_candidates).map(
    (item, index) => {
      const obj = asObject(item);
      return {
        id: asString(obj.id || `candidate-${index}`),
        url: asString(obj.url || obj.link || obj.page_url),
        reason: asString(obj.reason || obj.explanation || obj.comment),
        depth: obj.depth == null ? null : Number(obj.depth),
        priority: obj.priority == null ? index + 1 : Number(obj.priority),
      };
    },
  );

  return {
    summary: asString(base.summary || base.analysis || base.text || base.message),
    recommendations: recommendations.filter(Boolean),
    candidates: candidates.filter((item) => item.url || item.reason),
  };
}

// ========================
// Interceptors
// ========================

// Request Interceptor — автоматически добавляем токен в заголовок
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response, // успешные ответы пропускаем без изменений

  async (error) => {
    const statusCode = error.response?.status || 500;
    let message = "Неизвестная ошибка сервера";

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.detail) {
      message = error.response.data.detail;
    } else if (error.message) {
      message = error.message;
    }

    // Специальная обработка 401
    if (statusCode === 401) {
      tokenStorage.clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Показываем тост об ошибке
    if (window.showGlobalError) {
      window.showGlobalError({
        statusCode,
        message,
        variant: statusCode >= 500 ? "error" : "warning",
      });
    } else {
      console.warn(
        "window.showGlobalError не зарегистрирован. Ошибка:",
        statusCode,
        message,
      );
    }

    return Promise.reject(error);
  },
);

// ========================
// API методы (остаются почти без изменений)
// ========================
export const PromotionApi = {
  seo: async (url) => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error("Не удалось определить user_id для SEO-запроса.");
    }

    const response = await apiClient.get(
      `/api/v1/seo/${encodeURIComponent(userId)}?url=${encodeURIComponent(url)}`,
    );
    return response.data;
  },

  aio: async (url, generationId) => {
    const response = await apiClient.get(
      `/api/v1/aio/${generationId}?url=${url}`,
    );
    return response.data;
  },

  history: async (page = 1, limit = 10) => {
    const response = await apiClient.get(
      `/api/v1/results?page=${page}&limit=${limit}`,
    );
    return response.data;
  },

  chat: async (text, generationId) => {
    const response = await apiClient.post(`/api/v1/chat`, {
      generation_id: generationId,
      role: "user",
      text: text,
    });
    return response.data;
  },

  interlinkingCheck: async (url, generationId) => {
    const payload = { url: asString(url).trim() };
    if (generationId) payload.generation_id = generationId;

    try {
      const response = await apiClient.post(`/api/v1/relinking/check`, payload);
      const raw = asObject(response.data);
      const result = normalizeInterlinkingResult(raw.result || raw.data || raw);
      const isEmpty =
        !result.summary &&
        result.recommendations.length === 0 &&
        result.candidates.length === 0;

      if (isEmpty) {
        return {
          id: `mock-${Date.now()}`,
          created_at: new Date().toISOString(),
          url: payload.url,
          result: MOCK_INTERLINKING_RESULT,
          isMock: true,
        };
      }

      return {
        id: asString(raw.id || raw.generation_id || `interlinking-${Date.now()}`),
        created_at: asString(raw.created_at || new Date().toISOString()),
        url: asString(raw.url || payload.url),
        result,
        isMock: false,
      };
    } catch (error) {
      return {
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        url: payload.url,
        result: MOCK_INTERLINKING_RESULT,
        isMock: true,
      };
    }
  },

  interlinkingHistory: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(
        `/api/v1/relinking/history?page=${page}&limit=${limit}`,
      );
      const raw = asObject(response.data);
      const list = asArray(raw.results || raw.items || response.data);
      const results = list.map((item, index) => {
        const obj = asObject(item);
        return {
          id: asString(obj.id || `history-${index}`),
          created_at: asString(obj.created_at || new Date().toISOString()),
          url: asString(obj.url),
          result: normalizeInterlinkingResult(obj.result || obj.data || obj),
        };
      });

      if (results.length === 0) {
        return { results: MOCK_INTERLINKING_HISTORY, isMock: true };
      }

      return { results, isMock: false };
    } catch (error) {
      return { results: MOCK_INTERLINKING_HISTORY, isMock: true };
    }
  },
};
