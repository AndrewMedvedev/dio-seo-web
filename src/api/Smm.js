import { apiClient } from "./Promotion";

const asArray = (value) => (Array.isArray(value) ? value : []);
const asObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : {};
const asString = (value) => (value == null ? "" : String(value));
const asTrimmedString = (value) => asString(value).trim();
const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const readReasonMetric = (reason, metricName) => {
  const text = asString(reason);
  const pattern = new RegExp(`${metricName}:\\s*(\\d+)`, "i");
  const match = text.match(pattern);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
};

const formatSimilarity = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return number.toFixed(3);
};

function normalizeCompetitor(item) {
  const normalized = asObject(item);
  const screenName = asTrimmedString(
    normalized.screen_name || normalized.handle || normalized.domain,
  );
  const handle = screenName
    ? screenName.startsWith("@")
      ? screenName
      : `@${screenName}`
    : "";

  return {
    ...normalized,
    handle,
    similarity:
      asTrimmedString(normalized.similarity) ||
      formatSimilarity(normalized.similarity_score),
    description: asString(normalized.description || normalized.why_similar),
  };
}

function normalizeRecommendation(item) {
  const normalized = asObject(item);
  const action = asTrimmedString(normalized.action);
  const rationale = asTrimmedString(normalized.rationale);
  const legacyText = asTrimmedString(normalized.text);
  const text = legacyText || [action, rationale].filter(Boolean).join("\n\n");

  return {
    ...normalized,
    title: asString(normalized.title),
    text,
  };
}

/**
 * @typedef {Object} SmmAnalyzeResult
 * @property {Object} source
 * @property {Object} metrics
 * @property {Object} ai
 * @property {Object} ai_status
 * @property {Array<Object>} competitors_found
 * @property {Array<Object>} recommendations
 */

/**
 * @typedef {Object} SmmGenerateResult
 * @property {string} text
 * @property {string} content_type
 * @property {string} theme
 * @property {string} tone
 * @property {boolean} published
 * @property {Array<Object>} knowledge_chunks
 * @property {string} generated_image_base64
 * @property {string} generated_image_mime_type
 * @property {string} image_prompt
 */

function normalizeAnalyze(data) {
  const normalized = asObject(data);
  const metrics = asObject(normalized.metrics);

  return {
    ...normalized,
    source: asObject(normalized.source),
    metrics: {
      total_posts_analyzed: Number(metrics.total_posts_analyzed || 0),
      average_views: Number(metrics.average_views || 0),
      average_likes: Number(metrics.average_likes || 0),
      average_comments: Number(metrics.average_comments || 0),
      posts_per_day: Number(metrics.posts_per_day || 0),
      top_posts: asArray(metrics.top_posts),
    },
    ai: {
      summary: asString(normalized.ai?.summary),
      search_tags: asArray(normalized.ai?.search_tags),
      audience_interests: asArray(normalized.ai?.audience_interests),
      audience_activity: asArray(normalized.ai?.audience_activity),
    },
    ai_status: {
      available: Boolean(normalized.ai_status?.available),
      message: asString(normalized.ai_status?.message),
    },
    competitors_found: asArray(normalized.competitors_found).map(
      normalizeCompetitor,
    ),
    recommendations: asArray(normalized.recommendations).map(
      normalizeRecommendation,
    ),
  };
}

function normalizeGenerate(data) {
  const normalized = asObject(data);
  const knowledge_chunks = asArray(normalized.knowledge_chunks).map((item, index) => {
    const chunk = asObject(item);
    const reason = asString(chunk.reason);
    const snippetPreview = asString(chunk.snippet_preview || chunk.snippet || chunk.content);

    return {
      id:
        chunk.id ??
        `${asTrimmedString(chunk.title || chunk.filename || "kb-chunk")}-${index}`,
      title: asString(chunk.title || chunk.filename || "Материал базы знаний"),
      filename: asString(chunk.filename),
      source_type: asString(chunk.source_type),
      score: Number(chunk.score || 0),
      reason,
      matched_terms: asArray(chunk.matched_terms).map((term) => asString(term)),
      snippet_preview: snippetPreview,
      content: snippetPreview,
      tokenOverlap: readReasonMetric(reason, "token overlap"),
      phraseHits: readReasonMetric(reason, "phrase hits"),
      exactHits: readReasonMetric(reason, "exact term hits"),
    };
  });

  return {
    ...normalized,
    text: asString(normalized.text),
    content_type: asString(normalized.content_type || "text"),
    theme: asString(normalized.theme),
    tone: asString(normalized.tone),
    published: Boolean(normalized.published),
    knowledge_chunks,
    generated_image_base64: asString(normalized.generated_image_base64),
    generated_image_mime_type: asString(
      normalized.generated_image_mime_type || "image/png",
    ),
    image_prompt: asString(normalized.image_prompt),
    ai_provider: asString(
      normalized.ai_provider || normalized.ai_usage?.provider || "auto",
    ),
    use_kb_image_references: Boolean(
      normalized.use_kb_image_references ?? true,
    ),
  };
}

function normalizeHistoryItem(item) {
  const normalized = asObject(item);
  const rawResult = asObject(normalized.result);
  const fallbackResult = rawResult && Object.keys(rawResult).length ? rawResult : normalized;
  const result = normalizeAnalyze(fallbackResult);
  const source = asObject(normalized.source);
  const metrics = asObject(normalized.metrics);
  const ai = asObject(normalized.ai);

  return {
    ...normalized,
    id:
      normalized.id ??
      normalized.history_id ??
      normalized.uuid ??
      `${normalized.created_at || Date.now()}`,
    created_at: asString(normalized.created_at || normalized.createdAt),
    source: {
      ...asObject(result.source),
      ...source,
      name: asString(
        source.name || source.title || normalized.group_name || result.group_name || result.title,
      ),
      handle: asString(
        source.handle || source.screen_name || source.domain || normalized.handle || normalized.screen_name,
      ),
      url: asString(source.url || normalized.url),
    },
    metrics: {
      ...asObject(result.metrics),
      total_posts_analyzed: Number(
        metrics.total_posts_analyzed || result.metrics?.total_posts_analyzed || 0,
      ),
      average_likes: Number(metrics.average_likes || result.metrics?.average_likes || 0),
      average_comments: Number(
        metrics.average_comments || result.metrics?.average_comments || 0,
      ),
    },
    ai: {
      ...asObject(result.ai),
      ...ai,
      summary: asString(ai.summary || result.ai?.summary || normalized.summary),
    },
    post_limit: Number(normalized.post_limit || result.post_limit || 0) || null,
    result: {
      ...result,
      post_limit:
        Number(normalized.post_limit || result.post_limit || 0) || undefined,
    },
  };
}

function normalizeHistoryResponse(data) {
  const normalized = asObject(data);
  const list = Array.isArray(normalized.results)
    ? normalized.results
    : Array.isArray(data)
      ? data
      : asArray(normalized.items);
  const results = list.map(normalizeHistoryItem);

  return {
    results,
    count: Number(normalized.count || results.length),
    next: normalized.next || null,
    previous: normalized.previous || null,
  };
}

function normalizeHistoryDetailResponse(data) {
  const normalized = asObject(data);
  const historyId = Number(normalized.id || normalized.history_id || 0) || null;
  const postLimit = Number(normalized.post_limit || 0) || null;
  const report = normalizeAnalyze(asObject(normalized.report));

  return {
    ...normalized,
    id:
      normalized.id ??
      normalized.history_id ??
      normalized.uuid ??
      `${normalized.created_at || Date.now()}`,
    created_at: asString(normalized.created_at || normalized.createdAt),
    post_limit: postLimit,
    report: {
      ...report,
      post_limit: Number(report.post_limit || postLimit || 0) || undefined,
      history_id: report.history_id ?? historyId ?? undefined,
    },
  };
}

function normalizeGenerateHistoryItem(item) {
  const normalized = asObject(item);
  const rawResult = asObject(normalized.result);
  const fallbackResult = rawResult && Object.keys(rawResult).length ? rawResult : normalized;
  const result = normalizeGenerate(fallbackResult);

  return {
    ...normalized,
    id:
      normalized.id ??
      normalized.history_id ??
      normalized.uuid ??
      `${normalized.created_at || Date.now()}`,
    created_at: asString(normalized.created_at || normalized.createdAt),
    prompt: asString(normalized.prompt || normalized.input_prompt || normalized.request_prompt),
    theme: asString(normalized.theme || result.theme),
    tone: asString(normalized.tone || result.tone),
    content_type: asString(normalized.content_type || result.content_type || "text"),
    publish_requested: Boolean(normalized.publish_requested),
    language: asString(normalized.language || "ru"),
    length: asString(normalized.length || "medium"),
    ai_provider: asString(normalized.ai_provider || result.ai_provider || "auto"),
    use_kb_image_references: Boolean(
      normalized.use_kb_image_references ?? result.use_kb_image_references ?? true,
    ),
    result,
  };
}

function normalizeGenerateHistoryResponse(data) {
  const normalized = asObject(data);
  const list = Array.isArray(normalized.results)
    ? normalized.results
    : Array.isArray(data)
      ? data
      : asArray(normalized.items);
  const results = list.map(normalizeGenerateHistoryItem);

  return {
    results,
    count: Number(normalized.count || results.length),
    next: normalized.next || null,
    previous: normalized.previous || null,
  };
}

function normalizeGenerateHistoryDetailResponse(data) {
  const normalized = asObject(data);
  const historyId = Number(normalized.id || normalized.history_id || 0) || null;
  const report = normalizeGenerate(asObject(normalized.report));

  return {
    ...normalized,
    id:
      normalized.id ??
      normalized.history_id ??
      normalized.uuid ??
      `${normalized.created_at || Date.now()}`,
    created_at: asString(normalized.created_at || normalized.createdAt),
    prompt: asString(normalized.prompt || normalized.input_prompt || normalized.request_prompt),
    theme: asString(normalized.theme || report.theme),
    tone: asString(normalized.tone || report.tone),
    content_type: asString(normalized.content_type || report.content_type || "text"),
    publish_requested: Boolean(normalized.publish_requested),
    language: asString(normalized.language || "ru"),
    length: asString(normalized.length || "medium"),
    ai_provider: asString(
      normalized.ai_provider || report.ai_provider || report.ai_usage?.provider || "auto",
    ),
    use_kb_image_references: Boolean(
      normalized.use_kb_image_references ?? report.use_kb_image_references ?? true,
    ),
    report: {
      ...report,
      history_id: report.history_id ?? historyId ?? undefined,
    },
  };
}

export function buildGeneratePostPayload(payload) {
  const normalized = asObject(payload);

  return {
    prompt: asTrimmedString(normalized.prompt),
    theme: asTrimmedString(normalized.theme) || null,
    tone: asTrimmedString(normalized.tone) || null,
    content_type: asString(normalized.content_type || "text"),
    publish: Boolean(normalized.publish),
    length: asString(normalized.length || "medium"),
    language: asString(normalized.language || "ru"),
    ai_provider: asString(normalized.ai_provider || "auto"),
    use_kb_image_references: Boolean(
      normalized.use_kb_image_references ?? true,
    ),
  };
}

export function buildAnalyzeGroupPayload(payload) {
  const normalized = asObject(payload);
  const dateFrom = asTrimmedString(normalized.date_from);
  const dateTo = asTrimmedString(normalized.date_to);

  const result = {
    source: asTrimmedString(normalized.source),
    post_limit: Number(normalized.post_limit) || 30,
    language: asString(normalized.language || "ru"),
  };

  if (dateFrom && isIsoDate(dateFrom)) {
    result.date_from = dateFrom;
  }

  if (dateTo && isIsoDate(dateTo)) {
    result.date_to = dateTo;
  }

  return result;
}

const toError = (error, fallback) => {
  const message =
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    error?.message ||
    fallback;
  return new Error(message);
};

function normalizeRecommendationsChatResponse(data) {
  const normalized = asObject(data);
  const chat_messages = asArray(normalized.chat_messages).map((item, index) => {
    const message = asObject(item);
    const role = asTrimmedString(message.role).toLowerCase() === "user" ? "user" : "assistant";

    return {
      id: asTrimmedString(message.id) || `${Date.now()}-${index}`,
      role,
      text: asString(message.text),
      created_at: asTrimmedString(message.created_at) || null,
    };
  });

  return {
    answer: asString(normalized.answer),
    chat_messages,
  };
}

function buildRecommendationsChatPayload(payload) {
  const normalized = asObject(payload);
  const result = {
    report: asObject(normalized.report),
    message: asTrimmedString(normalized.message),
    language: asTrimmedString(normalized.language) || "ru",
  };

  if (normalized.history_id != null && normalized.history_id !== "") {
    const historyId = Number(normalized.history_id);
    if (Number.isFinite(historyId) && historyId > 0) {
      result.history_id = historyId;
    }
  }

  return result;
}

export const SmmApi = {
  analyzeGroup: async (payload) => {
    try {
      const response = await apiClient.post(
        "/vk/group/analyze",
        buildAnalyzeGroupPayload(payload),
      );
      return normalizeAnalyze(response.data);
    } catch (error) {
      throw toError(error, "Не удалось выполнить анализ VK-группы.");
    }
  },

  generatePost: async (payload) => {
    try {
      const response = await apiClient.post(
        "/vk/posts/generate",
        buildGeneratePostPayload(payload),
      );
      return normalizeGenerate(response.data);
    } catch (error) {
      throw toError(error, "Не удалось сгенерировать контент.");
    }
  },

  regenerateImage: async (payload) => {
    try {
      const response = await apiClient.post("/vk/posts/regenerate-image", payload);
      return {
        image_prompt: asString(response.data?.image_prompt),
        generated_image_base64: asString(response.data?.generated_image_base64),
        generated_image_mime_type: asString(
          response.data?.generated_image_mime_type || "image/png",
        ),
      };
    } catch (error) {
      throw toError(error, "Не удалось перегенерировать изображение.");
    }
  },

  publishPost: async (payload) => {
    try {
      const response = await apiClient.post("/vk/posts/publish", payload);
      return asObject(response.data);
    } catch (error) {
      throw toError(error, "Не удалось опубликовать пост.");
    }
  },

  history: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/vk/group/history?page=${page}&limit=${limit}`);
      return normalizeHistoryResponse(response.data);
    } catch (error) {
      throw toError(error, "Не удалось загрузить историю анализов.");
    }
  },

  historyItem: async (id) => {
    try {
      const response = await apiClient.get(`/vk/group/history/${id}`);
      return normalizeHistoryDetailResponse(response.data);
    } catch (error) {
      throw toError(error, "Не удалось загрузить запись истории анализа.");
    }
  },

  deleteHistoryItem: async (id) => {
    try {
      const response = await apiClient.delete(`/vk/group/history/${id}`);
      return asObject(response.data);
    } catch (error) {
      throw toError(error, "Не удалось удалить запись истории.");
    }
  },

  clearHistory: async () => {
    try {
      const response = await apiClient.delete("/vk/group/history");
      return asObject(response.data);
    } catch (error) {
      throw toError(error, "Не удалось очистить историю.");
    }
  },

  recommendationsChat: async (payload) => {
    try {
      const response = await apiClient.post(
        "/vk/group/recommendations/chat",
        buildRecommendationsChatPayload(payload),
      );
      return normalizeRecommendationsChatResponse(response.data);
    } catch (error) {
      throw toError(error, "Не удалось получить ответ AI-помощника.");
    }
  },

  generateHistory: async (page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/vk/posts/history?page=${page}&limit=${limit}`);
      return normalizeGenerateHistoryResponse(response.data);
    } catch (error) {
      throw toError(error, "Не удалось загрузить историю генераций.");
    }
  },

  generateHistoryItem: async (id) => {
    try {
      const response = await apiClient.get(`/vk/posts/history/${id}`);
      return normalizeGenerateHistoryDetailResponse(response.data);
    } catch (error) {
      throw toError(error, "Не удалось загрузить запись истории генераций.");
    }
  },

  deleteGenerateHistoryItem: async (id) => {
    try {
      const response = await apiClient.delete(`/vk/posts/history/${id}`);
      return asObject(response.data);
    } catch (error) {
      throw toError(error, "Не удалось удалить запись истории генераций.");
    }
  },

  clearGenerateHistory: async () => {
    try {
      const response = await apiClient.delete("/vk/posts/history");
      return asObject(response.data);
    } catch (error) {
      throw toError(error, "Не удалось очистить историю генераций.");
    }
  },
};
