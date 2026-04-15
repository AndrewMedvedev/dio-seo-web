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

apiClient.interceptors.response.use(
  (response) => response, // успешные ответы пропускаем без изменений

  async (error) => {
    console.log(error.response.data)
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
      tokenStorage.clearTokens();
      window.location.href = "/login";
      window.showGlobalError({
        statusCode,
        message,
        variant: statusCode >= 500 ? "error" : "warning",
      });
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
