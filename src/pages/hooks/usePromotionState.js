import { useState, useEffect } from "react";

const PAGE_STORAGE_KEY = "promotion_page_state";

export function usePromotionState() {
  const [url, setUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(`${PAGE_STORAGE_KEY}_url`) || "";
  });

  const [content, setContent] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(`${PAGE_STORAGE_KEY}_content`);
    return saved ? JSON.parse(saved) : null;
  });

  const [aiContent, setAiContent] = useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem(`${PAGE_STORAGE_KEY}_aiContent`);
    return saved ? JSON.parse(saved) : null;
  });

  const [generationId, setGenerationId] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`${PAGE_STORAGE_KEY}_generationId`) || null;
  });

  const [showAiContent, setShowAiContent] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`${PAGE_STORAGE_KEY}_showAiContent`) === "true";
  });

  const [showInterlinking, setShowInterlinking] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`${PAGE_STORAGE_KEY}_showInterlinking`) === "true";
  });

  const [chatOpen, setChatOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(`${PAGE_STORAGE_KEY}_chatOpen`);
    return stored === null ? true : stored === "true";
  });

  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    localStorage.setItem(`${PAGE_STORAGE_KEY}_url`, url);
  }, [url]);

  useEffect(() => {
    if (content) {
      localStorage.setItem(`${PAGE_STORAGE_KEY}_content`, JSON.stringify(content));
    } else {
      localStorage.removeItem(`${PAGE_STORAGE_KEY}_content`);
    }
  }, [content]);

  useEffect(() => {
    if (aiContent) {
      localStorage.setItem(`${PAGE_STORAGE_KEY}_aiContent`, JSON.stringify(aiContent));
    } else {
      localStorage.removeItem(`${PAGE_STORAGE_KEY}_aiContent`);
    }
  }, [aiContent]);

  useEffect(() => {
    if (generationId) {
      localStorage.setItem(`${PAGE_STORAGE_KEY}_generationId`, generationId);
    } else {
      localStorage.removeItem(`${PAGE_STORAGE_KEY}_generationId`);
    }
  }, [generationId]);

  useEffect(() => {
    localStorage.setItem(`${PAGE_STORAGE_KEY}_showAiContent`, String(showAiContent));
  }, [showAiContent]);

  useEffect(() => {
    localStorage.setItem(`${PAGE_STORAGE_KEY}_showInterlinking`, String(showInterlinking));
  }, [showInterlinking]);

  useEffect(() => {
    localStorage.setItem(`${PAGE_STORAGE_KEY}_chatOpen`, String(chatOpen));
  }, [chatOpen]);

  const validateUrl = (value) => {
    if (!value) {
      setUrlError("");
      return;
    }

    try {
      const urlToCheck = value.startsWith("http") ? value : `https://${value}`;
      new URL(urlToCheck);
      setUrlError("");
    } catch {
      setUrlError("Введите корректный URL (например: https://example.com)");
    }
  };

  const handleUrlChange = (e) => {
    const value = e.target.value;
    setUrl(value);
    validateUrl(value);
  };

  return {
    url,
    setUrl,
    content,
    setContent,
    aiContent,
    setAiContent,
    generationId,
    setGenerationId,
    showAiContent,
    setShowAiContent,
    showInterlinking,
    setShowInterlinking,
    chatOpen,
    setChatOpen,
    loading,
    setLoading,
    aiGenerating,
    setAiGenerating,
    urlError,
    handleUrlChange,
  };
}