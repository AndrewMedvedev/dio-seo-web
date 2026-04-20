import axios from "axios";

// Базовый URL для всех запросов
const API_BASE_URL = "http://localhost:8000";

// Создаём экземпляр axios (apiClient)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// ========================
// Хелперы для работы с токенами
// ========================
export const tokenStorage = {
  getAccessToken() {
    return localStorage.getItem("access_token") || getCookie("access_token");
  },

  getRefreshToken() {
    return localStorage.getItem("refresh_token") || getCookie("refresh_token");
  },

  setTokens(accessToken, refreshToken, expiresAt) {
    // Сохраняем в localStorage
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("token_expires_at", expiresAt.toString());

    // Сохраняем в cookies (для большей надёжности)
    const accessExpires = new Date(expiresAt * 1000);
    const refreshExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 дней

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
// Вспомогательные функции для работы с cookies
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

// ========================
// Interceptors (перехватчики запросов и ответов)
// ========================

// 1. Request Interceptor — добавляем токен в каждый запрос
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

// ==== Флаг для предотвращения множественных refresh запросов ====
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token && promise.config.headers) {
      promise.config.headers.Authorization = `Bearer ${token}`;
      promise.resolve(api(promise.config));
    } else {
      promise.reject(new Error("No token provided"));
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response, // успешные ответы пропускаем без изменений

  async (error) => {
    console.log(error.response.data);
    const statusCode = error.response?.status || 500;
    let message = "Неизвестная ошибка сервера";

    if (error.response?.data?.error?.message) {
      message = error.response.data.error.message;
    }

    // Специальная обработка 401
    if (statusCode === 401) {
      if (window.location.pathname === "/login") {
        window.showGlobalError({
          statusCode,
          message,
          variant: statusCode >= 500 ? "error" : "warning",
        });
        return Promise.reject(error);
      }
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      tokenStorage.clearTokens();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    try {
      // Запрос на обновление токена
      const response = await axios.post(`${API_URL}/api/v1/auth/refresh`, {
        refresh_token: refreshToken,
      });

      const { access_token, refresh_token, expires_at } = response.data;

      // Сохраняем новые токены
      tokenStorage.setTokens(access_token, refresh_token, expires_at);

      // Обновляем заголовок для текущего запроса
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }

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

      // Обрабатываем все запросы, которые ждали обновления
      processQueue(null, access_token);

      // Повторяем оригинальный запрос
      return api(originalRequest);
    } catch (refreshError) {
      console.error("Refresh token failed:", refreshError);
      tokenStorage.clearTokens();
      processQueue(refreshError, null);
      window.location.href = "/login";
      window.showGlobalError({
        statusCode,
        message,
        variant: statusCode >= 500 ? "error" : "warning",
      });
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
