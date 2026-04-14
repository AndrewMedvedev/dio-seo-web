import { useMemo, useState, useRef, useLayoutEffect } from "react";
import {
  Bot,
  Calendar,
  Clock,
  Copy,
  Image,
  MessageCircle,
  Send,
  Wand2,
  History,
  ChevronDown,
  ChevronLeft,
  Check,
  Upload,
  X,
} from "lucide-react";
import { SmmApi } from "../api/Smm";
import { createPortal } from "react-dom";

const initialAnalyzeForm = {
  source: "",
  post_limit: 30,
  language: "ru",
};

const initialGenerateForm = {
  prompt: "",
  theme: "",
  tone: "",
  content_type: "text",
  publish: false,
  length: "medium",
  language: "ru",
};

const languageOptions = [
  {
    value: "ru",
    label: "Русский",
    flag: "🇷🇺",
    description: "Русский язык",
  },
  {
    value: "en",
    label: "English",
    flag: "🇬🇧",
    description: "Английский язык",
  },
];

const contentTypeOptions = [
  { value: "text", label: "Текст" },
  { value: "story", label: "Сторис" },
  { value: "image", label: "Текст + изображение" },
  { value: "video", label: "Видео" },
];

const lengthOptions = [
  { value: "short", label: "Короткая", description: "До 500 символов" },
  { value: "medium", label: "Средняя", description: "500-1500 символов" },
  { value: "long", label: "Длинная", description: "Более 1500 символов" },
];

const formatNumber = (value) =>
  new Intl.NumberFormat("ru-RU").format(Number(value || 0));

const formatDate = (unixTs) => {
  const value = Number(unixTs || 0);
  if (!value) return "-";
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function MetricsCard({ label, value }) {
  return (
    <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-4">
      <div className="text-xs uppercase tracking-wider text-neutral-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function CustomSelect({
  value,
  onChange,
  options,
  className = "",
  containerClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 101,
      });
    }
  }, [isOpen]);

  return (
    <div className={`relative ${containerClassName}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[50px] bg-dark-800 border border-neutral-700 hover:border-neutral-600 focus:border-red-500 rounded-2xl px-4 text-white transition-all flex items-center justify-between ${className}`}
      >
        <div className="flex items-center gap-3">
          {selectedOption?.flag && (
            <span className="text-xl">{selectedOption.flag}</span>
          )}
          {selectedOption?.icon && (
            <span className="text-lg">{selectedOption.icon}</span>
          )}
          <div className="text-left">
            <div className="font-medium">{selectedOption?.label}</div>
            {selectedOption?.description && (
              <div className="text-xs text-neutral-500">
                {selectedOption.description}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setIsOpen(false)}
            />
            <div
              style={dropdownStyle}
              className="bg-dark-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange({ target: { value: option.value } });
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-neutral-700/50 transition-colors flex items-center justify-between group ${
                    option.value === value ? "bg-red-500/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.flag && (
                      <span className="text-xl">{option.flag}</span>
                    )}
                    {option.icon && (
                      <span className="text-lg">{option.icon}</span>
                    )}
                    <div>
                      <div
                        className={`font-medium ${
                          option.value === value
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs text-neutral-500">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-red-400" />
                  )}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

export default function SmmPage() {
  const [mode, setMode] = useState("analyze");
  const [analyzeForm, setAnalyzeForm] = useState(initialAnalyzeForm);
  const [generateForm, setGenerateForm] = useState(initialGenerateForm);
  const [analyzeResult, setAnalyzeResult] = useState(null);
  const [generateResult, setGenerateResult] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [editedImagePrompt, setEditedImagePrompt] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [regenerateImageLoading, setRegenerateImageLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [regenerateImageError, setRegenerateImageError] = useState("");
  const [publishError, setPublishError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [isGenerateFiltersOpen, setIsGenerateFiltersOpen] = useState(true);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: "assistant-welcome",
      type: "ai",
      text: "SMM-помощник готов. Могу подсказать, как интерпретировать результат и что улучшить в контенте.",
    },
  ]);
  const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState(false);

  // === СОСТОЯНИЯ ДЛЯ БАЗЫ ЗНАНИЙ ===
  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFileListModal, setShowFileListModal] = useState(false);

  // === ОБНОВЛЁННЫЕ КЛАССЫ ДЛЯ ДИНАМИЧЕСКОЙ РАЗВЁРНУТОЙ РАСКЛАДКИ ===
  const mainColSpanClass =
    mode === "generate" && isKnowledgeExpanded
      ? "xl:col-span-10"
      : "xl:col-span-8";
  const sideColSpanClass =
    mode === "generate" && isKnowledgeExpanded
      ? "xl:col-span-2"
      : "xl:col-span-4";
  const kbColSpanClass =
    mode === "generate" && isKnowledgeExpanded
      ? "xl:col-span-10"
      : "xl:col-span-2";
  const rightColSpanClass =
    mode === "generate" && isKnowledgeExpanded
      ? "xl:col-span-2"
      : "xl:col-span-10";

  const imageDataUrl = useMemo(() => {
    if (!generateResult?.generated_image_base64) return "";
    const mime = generateResult.generated_image_mime_type || "image/png";
    return `data:${mime};base64,${generateResult.generated_image_base64}`;
  }, [generateResult]);

  const sendAssistantMessage = () => {
    const text = assistantInput.trim();
    if (!text) return;
    const userMessage = { id: `${Date.now()}-u`, type: "user", text };
    const aiReplyText =
      mode === "analyze"
        ? analyzeResult
          ? "Сфокусируйтесь на метриках вовлеченности и блоке рекомендаций. Начните с 1-2 действий с максимальным эффектом."
          : "Сначала запустите анализ VK-группы, после этого я помогу разобрать результат."
        : generateResult
          ? "Проверьте тональность и длину текста. Для image-постов можно уточнить prompt и перегенерировать изображение."
          : "Сначала сгенерируйте контент, затем можно обсудить финальную редактуру перед публикацией.";
    const aiMessage = { id: `${Date.now()}-a`, type: "ai", text: aiReplyText };
    setAssistantMessages((prev) => [...prev, userMessage, aiMessage]);
    setAssistantInput("");
  };

  const handleAnalyzeSubmit = async (event) => {
    event.preventDefault();
    setAnalyzeError("");
    setAnalyzeLoading(true);
    try {
      const data = await SmmApi.analyzeGroup({
        source: analyzeForm.source.trim(),
        post_limit: Number(analyzeForm.post_limit) || 30,
        language: analyzeForm.language,
      });
      setAnalyzeResult(data);
    } catch (error) {
      setAnalyzeError(error.message);
      setAnalyzeResult(null);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleGenerateSubmit = async (event) => {
    event.preventDefault();
    setGenerateError("");
    setPublishError("");
    setPublishSuccess("");
    setRegenerateImageError("");
    setGenerateLoading(true);
    try {
      const data = await SmmApi.generatePost({
        ...generateForm,
        prompt: generateForm.prompt.trim(),
        theme: generateForm.theme.trim() || null,
        tone: generateForm.tone.trim() || null,
      });
      setGenerateResult(data);
      setEditedText(data.text || "");
      setEditedImagePrompt(data.image_prompt || "");
    } catch (error) {
      setGenerateError(error.message);
      setGenerateResult(null);
    } finally {
      setGenerateLoading(false);
    }
  };

  const handleRegenerateImage = async () => {
    const postText = (editedText || generateResult?.text || "").trim();
    if (!postText) {
      setRegenerateImageError("Нет текста поста для генерации изображения.");
      return;
    }
    setRegenerateImageError("");
    setRegenerateImageLoading(true);
    try {
      const data = await SmmApi.regenerateImage({
        post_text: postText,
        image_prompt: editedImagePrompt.trim() || null,
        theme: generateResult?.theme || generateForm.theme || null,
        tone: generateResult?.tone || generateForm.tone || null,
        language: generateForm.language || "ru",
      });
      setEditedImagePrompt(data.image_prompt || "");
      setGenerateResult((prev) =>
        prev
          ? {
              ...prev,
              image_prompt: data.image_prompt,
              generated_image_base64: data.generated_image_base64,
              generated_image_mime_type: data.generated_image_mime_type,
            }
          : prev
      );
    } catch (error) {
      setRegenerateImageError(error.message);
    } finally {
      setRegenerateImageLoading(false);
    }
  };

  const handlePublish = async () => {
    const message = editedText.trim();
    if (!message) {
      setPublishError("Текст пустой, нечего публиковать.");
      return;
    }
    setPublishError("");
    setPublishSuccess("");
    setPublishLoading(true);
    try {
      const result = await SmmApi.publishPost({ message });
      setGenerateResult((prev) =>
        prev
          ? {
              ...prev,
              text: message,
              published: true,
              post_id: result?.post_id ?? prev.post_id,
              owner_id: result?.owner_id ?? prev.owner_id,
            }
          : prev
      );
      setPublishSuccess("Пост успешно опубликован.");
    } catch (error) {
      setPublishError(error.message);
    } finally {
      setPublishLoading(false);
    }
  };

  // === ОБРАБОТЧИКИ ФАЙЛОВ ===
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    const newFiles = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const analyzeTopPosts = analyzeResult?.metrics?.top_posts || [];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="pt-24 lg:pt-28 px-6 lg:px-12 max-w-screen-2xl mx-auto pb-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          {/* Основная область */}
          <div className={mainColSpanClass}>
            {mode === "analyze" ? (
              /* АНАЛИЗ — без изменений */
              <div className="flex flex-col gap-4">
                <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl">
                  <button
                    type="button"
                    onClick={() => setIsFiltersOpen((prev) => !prev)}
                    className="w-full h-14 px-5 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center">
                        <Bot className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="font-semibold">Фильтры анализа</div>
                    </div>
                    <span
                      className={`text-neutral-500 text-xs transition-transform duration-300 ${
                        isFiltersOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      isFiltersOpen
                        ? "mt-4 max-h-64 opacity-100"
                        : "mt-0 max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-neutral-400 mb-2">
                            Лимит постов
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={analyzeForm.post_limit}
                            onChange={(e) =>
                              setAnalyzeForm((prev) => ({
                                ...prev,
                                post_limit: e.target.value,
                              }))
                            }
                            className="w-full h-[50px] bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-neutral-400 mb-2">
                            Язык ответа
                          </label>
                          <CustomSelect
                            value={analyzeForm.language}
                            onChange={(e) =>
                              setAnalyzeForm((prev) => ({
                                ...prev,
                                language: e.target.value,
                              }))
                            }
                            options={languageOptions}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 lg:p-10 overflow-y-auto flex flex-col">
                  <h2 className="text-2xl font-semibold">Анализ VK-группы</h2>
                  <p className="mt-2 text-neutral-400 text-sm">
                    Введите ссылку или идентификатор группы, затем получите
                    разбор метрик, рекомендаций и конкурентов.
                  </p>
                  <form onSubmit={handleAnalyzeSubmit} className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-400 mb-2">
                        Ссылка / screen_name / id
                      </label>
                      <div className="flex gap-4 max-[1024px]:flex-wrap">
                        <input
                          value={analyzeForm.source}
                          onChange={(e) =>
                            setAnalyzeForm((prev) => ({
                              ...prev,
                              source: e.target.value,
                            }))
                          }
                          required
                          placeholder="https://vk.com/diocon"
                          className="flex-1 min-w-0 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-500"
                        />
                        <button
                          type="submit"
                          disabled={analyzeLoading}
                          className="bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 px-10 py-4 rounded-2xl font-medium transition-colors whitespace-nowrap"
                        >
                          {analyzeLoading
                            ? "Анализируем..."
                            : "Запустить анализ"}
                        </button>
                        <button
                          type="button"
                          className="px-6 py-4 rounded-2xl font-medium border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                        >
                          <History className="w-4 h-4" />
                          История
                        </button>
                      </div>
                    </div>
                  </form>
                  {analyzeError && (
                    <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                      {analyzeError}
                    </div>
                  )}
                  {analyzeResult ? (
                    <div className="mt-8 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <MetricsCard
                          label="Постов проанализировано"
                          value={formatNumber(
                            analyzeResult.metrics.total_posts_analyzed
                          )}
                        />
                        <MetricsCard
                          label="Средние просмотры"
                          value={formatNumber(
                            analyzeResult.metrics.average_views
                          )}
                        />
                        <MetricsCard
                          label="Средние лайки"
                          value={formatNumber(
                            analyzeResult.metrics.average_likes
                          )}
                        />
                        <MetricsCard
                          label="Средние комментарии"
                          value={formatNumber(
                            analyzeResult.metrics.average_comments
                          )}
                        />
                        <MetricsCard
                          label="Постов в день"
                          value={analyzeResult.metrics.posts_per_day}
                        />
                      </div>
                      <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-5">
                        <div className="text-sm text-neutral-500 mb-2">
                          Сводка
                        </div>
                        <p className="text-neutral-200 leading-relaxed">
                          {analyzeResult.ai.summary ||
                            "Сводка пока не предоставлена."}
                        </p>
                      </div>
                      <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-5">
                        <div className="text-sm text-neutral-500 mb-2">
                          Теги поиска конкурентов
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {analyzeResult.ai.search_tags.length ? (
                            analyzeResult.ai.search_tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 rounded-full text-xs bg-red-500/15 border border-red-500/30 text-red-200"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-500 text-sm">
                              Теги не найдены
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-5">
                          <div className="text-sm text-neutral-500 mb-2">
                            Интересы аудитории
                          </div>
                          {analyzeResult.ai.audience_interests.length ? (
                            <ul className="list-disc pl-5 space-y-1 text-neutral-200">
                              {analyzeResult.ai.audience_interests.map(
                                (item) => (
                                  <li key={item}>{item}</li>
                                )
                              )}
                            </ul>
                          ) : (
                            <span className="text-neutral-500 text-sm">
                              Нет данных
                            </span>
                          )}
                        </div>
                        <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-5">
                          <div className="text-sm text-neutral-500 mb-2">
                            Активность аудитории
                          </div>
                          {analyzeResult.ai.audience_activity.length ? (
                            <ul className="list-disc pl-5 space-y-1 text-neutral-200">
                              {analyzeResult.ai.audience_activity.map(
                                (item) => (
                                  <li key={item}>{item}</li>
                                )
                              )}
                            </ul>
                          ) : (
                            <span className="text-neutral-500 text-sm">
                              Нет данных
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-5 overflow-x-auto">
                        <div className="text-sm text-neutral-500 mb-3">
                          Топ постов
                        </div>
                        {analyzeTopPosts.length ? (
                          <table className="w-full text-sm">
                            <thead className="text-neutral-400">
                              <tr className="border-b border-neutral-800">
                                <th className="py-2 text-left font-medium">
                                  ID
                                </th>
                                <th className="py-2 text-left font-medium">
                                  Дата
                                </th>
                                <th className="py-2 text-left font-medium">
                                  Просмотры
                                </th>
                                <th className="py-2 text-left font-medium">
                                  Лайки
                                </th>
                                <th className="py-2 text-left font-medium">
                                  Комментарии
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {analyzeTopPosts.map((post) => (
                                <tr
                                  key={`${post.post_id}-${post.date}`}
                                  className="border-b border-neutral-800/80"
                                >
                                  <td className="py-2">{post.post_id}</td>
                                  <td className="py-2">{formatDate(post.date)}</td>
                                  <td className="py-2">{formatNumber(post.views)}</td>
                                  <td className="py-2">{formatNumber(post.likes)}</td>
                                  <td className="py-2">{formatNumber(post.comments)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-sm text-neutral-500">
                            Топ постов недоступен.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    !analyzeError && (
                      <div className="mt-8 border border-dashed border-neutral-700 rounded-2xl p-8 text-center text-neutral-500 flex-1 flex items-center justify-center min-h-[400px]">
                        <div>
                          <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg">Запустите анализ группы</p>
                          <p className="text-sm mt-2 opacity-75">
                            Результат появится здесь
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : (
              /* ГЕНЕРАЦИЯ */
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
                {/* База знаний */}
                <div className={`h-full ${kbColSpanClass}`}>
                  <div
                    className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl h-full flex flex-col overflow-hidden relative transition-all duration-500 ease-in-out"
                    style={{ cursor: isKnowledgeExpanded ? "default" : "pointer" }}
                    onClick={
                      isKnowledgeExpanded
                        ? undefined
                        : () => setIsKnowledgeExpanded(true)
                    }
                  >
                    {isKnowledgeExpanded ? (
                      <div className="p-8 flex-1 flex flex-col">
                        {/* Заголовок с кнопкой закрытия */}
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Upload className="w-5 h-5 text-red-400" />
                            База знаний
                          </h2>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsKnowledgeExpanded(false);
                            }}
                            className="p-1 rounded-lg hover:bg-neutral-700/50 transition-colors"
                            aria-label="Свернуть базу знаний"
                          >
                            <ChevronLeft className="w-5 h-5 text-neutral-400" />
                          </button>
                        </div>

                        {/* Зона drag & drop */}
                        <label
                          onClick={(e) => e.stopPropagation()}
                          className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-red-500/50 rounded-2xl py-12 cursor-pointer transition-colors flex-1"
                        >
                          <Upload className="w-12 h-12 text-neutral-500 mb-4" />
                          <p className="text-sm text-neutral-400 text-center">
                            Перетащите файлы сюда
                            <br />
                            или нажмите для выбора
                          </p>
                          <p className="text-xs text-neutral-500 mt-3">
                            PDF, DOCX, TXT, XLSX, PPTX, JPG, PNG
                          </p>
                          <input
                            ref={fileInputRef}
                            multiple
                            type="file"
                            className="hidden"
                            onChange={handleFileSelect}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </label>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openFileDialog();
                          }}
                          className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 rounded-2xl font-medium transition-all"
                        >
                          Загрузить файл
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowFileListModal(true);
                          }}
                          className="mt-3 w-full py-3 bg-[#131313] hover:bg-dark-700 border border-neutral-700 rounded-2xl text-sm font-medium transition-colors"
                        >
                          Посмотреть загруженные файлы
                        </button>

                        {/* Список файлов */}
                        <div className="mt-6 flex-1 overflow-y-auto space-y-2 pr-1">
                          {uploadedFiles.length === 0 ? (
                            <div className="text-sm text-neutral-500 text-center py-4">
                              База знаний пока пустая
                            </div>
                          ) : (
                            uploadedFiles.map((file) => (
                              <div
                                key={file.id}
                                className="bg-dark-800/50 border border-neutral-800 rounded-xl px-3 py-2 text-sm flex items-center justify-between"
                              >
                                <span className="truncate">{file.name}</span>
                                <span className="text-xs text-neutral-500">
                                  {(file.size / 1024).toFixed(0)} KB
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <Upload className="w-8 h-8 text-red-400" />
                        <span className="text-xs text-neutral-400">База знаний</span>
                        {/* Стрелка убрана */}
                      </div>
                    )}
                  </div>
                </div>

                {/* Правая колонка — улучшенные collapsed-блоки */}
                <div className={`flex flex-col gap-4 h-full ${rightColSpanClass}`}>
                  {/* Фильтры генерации — collapsed */}
                  <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl overflow-hidden">
                    {isKnowledgeExpanded ? (
                      <div className="group relative p-5 flex flex-col items-center justify-center gap-2 hover:bg-neutral-800/70 transition-all rounded-3xl min-h-[92px]">
                        <Wand2 className="w-9 h-9 text-red-400 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-medium text-neutral-400 text-center leading-tight">
                          Фильтры
                          <br />
                          генерации
                        </div>
                      </div>
                    ) : (
                      /* Полное состояние фильтров */
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setIsGenerateFiltersOpen((prev) => !prev)
                          }
                          className="w-full h-14 px-5 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center">
                              <Wand2 className="w-4 h-4 text-red-400" />
                            </div>
                            <div className="font-semibold">
                              Фильтры генерации
                            </div>
                          </div>
                          <span
                            className={`text-neutral-500 text-xs transition-transform duration-300 ${
                              isGenerateFiltersOpen ? "rotate-180" : ""
                            }`}
                          >
                            ▼
                          </span>
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ease-out ${
                            isGenerateFiltersOpen
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm text-neutral-400 mb-2">
                                  Тема
                                </label>
                                <input
                                  value={generateForm.theme}
                                  onChange={(e) =>
                                    setGenerateForm((prev) => ({
                                      ...prev,
                                      theme: e.target.value,
                                    }))
                                  }
                                  placeholder="Например: маркетинг"
                                  className="w-full h-[50px] bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 text-white placeholder:text-neutral-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-neutral-400 mb-2">
                                  Тон
                                </label>
                                <input
                                  value={generateForm.tone}
                                  onChange={(e) =>
                                    setGenerateForm((prev) => ({
                                      ...prev,
                                      tone: e.target.value,
                                    }))
                                  }
                                  placeholder="Например: дружелюбный"
                                  className="w-full h-[50px] bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 text-white placeholder:text-neutral-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-neutral-400 mb-2">
                                  Тип контента
                                </label>
                                <CustomSelect
                                  value={generateForm.content_type}
                                  onChange={(e) =>
                                    setGenerateForm((prev) => ({
                                      ...prev,
                                      content_type: e.target.value,
                                    }))
                                  }
                                  options={contentTypeOptions}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-neutral-400 mb-2">
                                  Длина
                                </label>
                                <CustomSelect
                                  value={generateForm.length}
                                  onChange={(e) =>
                                    setGenerateForm((prev) => ({
                                      ...prev,
                                      length: e.target.value,
                                    }))
                                  }
                                  options={lengthOptions}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-neutral-400 mb-2">
                                  Язык
                                </label>
                                <CustomSelect
                                  value={generateForm.language}
                                  onChange={(e) =>
                                    setGenerateForm((prev) => ({
                                      ...prev,
                                      language: e.target.value,
                                    }))
                                  }
                                  options={languageOptions}
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-neutral-400 mb-2">
                                  Сразу публиковать
                                </label>
                                <CustomSelect
                                  value={generateForm.publish ? "yes" : "no"}
                                  onChange={(e) =>
                                    setGenerateForm((prev) => ({
                                      ...prev,
                                      publish: e.target.value === "yes",
                                    }))
                                  }
                                  options={[
                                    { value: "no", label: "Нет" },
                                    { value: "yes", label: "Да" },
                                  ]}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Основной блок генерации — collapsed с улучшенным UX */}
                  <div className="flex-1 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl flex flex-col overflow-hidden">
                    {isKnowledgeExpanded ? (
                      <div className="group flex-1 p-6 flex flex-col items-center justify-center gap-4 hover:bg-neutral-800/70 transition-all min-h-[200px] rounded-3xl">
                        <Image className="w-14 h-14 text-red-400 group-hover:scale-110 transition-transform" />
                        <div className="text-sm font-semibold text-neutral-200 text-center">
                          Генерация контента
                        </div>
                        <div className="text-xs text-neutral-500 text-center max-w-[160px]">
                          Промпт + генерация поста
                        </div>
                      </div>
                    ) : (
                      /* Полное состояние генерации */
                      <div className="p-6 flex flex-col flex-1">
                        <h2 className="text-2xl font-semibold">
                          Генерация контента
                        </h2>
                        <p className="mt-2 text-neutral-400 text-sm">
                          Создайте пост, отредактируйте текст, при необходимости
                          перегенерируйте изображение и опубликуйте.
                        </p>
                        <form onSubmit={handleGenerateSubmit} className="mt-6">
                          <div>
                            <label className="block text-sm text-neutral-400 mb-2">
                              Промпт
                            </label>
                            <textarea
                              value={generateForm.prompt}
                              onChange={(e) =>
                                setGenerateForm((prev) => ({
                                  ...prev,
                                  prompt: e.target.value,
                                }))
                              }
                              rows={5}
                              required
                              placeholder="Напиши пост про автоматизацию бизнеса"
                              className="w-full bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 py-3 text-white placeholder:text-neutral-500"
                            />
                          </div>
                          <div className="mt-4 mb-6 flex gap-4">
                            <button
                              type="submit"
                              disabled={generateLoading}
                              className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 px-6 py-3 rounded-2xl font-medium"
                            >
                              {generateLoading
                                ? "Генерируем..."
                                : "Сгенерировать"}
                            </button>
                            <button
                              type="button"
                              className="flex-1 border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 px-6 py-3 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <History className="w-4 h-4" />
                              История
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className={sideColSpanClass}>
            <div className="flex flex-col h-full">
              {mode === "analyze" ? (
                /* Анализ */
                <div className="flex flex-col h-full gap-4">
                  <button
                    type="button"
                    onClick={() => setMode("generate")}
                    className="w-full h-14 rounded-3xl bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-3"
                  >
                    <Wand2 className="w-5 h-5" />
                    <span className="font-medium">Генерация контента</span>
                  </button>
                  <div className="flex-1 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-4 flex flex-col">
                    <div className="text-sm text-neutral-400 mb-3">
                      AI-помощник
                    </div>
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scroll">
                      {assistantMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`rounded-2xl px-4 py-3 text-sm ${
                            message.type === "user"
                              ? "bg-red-600 text-white ml-6"
                              : "bg-neutral-800 text-neutral-200 mr-6"
                          }`}
                        >
                          {message.text}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4 pt-2 border-t border-neutral-800">
                      <input
                        value={assistantInput}
                        onChange={(e) => setAssistantInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            sendAssistantMessage();
                          }
                        }}
                        placeholder="Спросите про SMM"
                        className="flex-1 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 py-2.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={sendAssistantMessage}
                        className="w-10 h-10 rounded-2xl bg-red-600 hover:bg-red-500 flex items-center justify-center"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Генерация — улучшенные collapsed-блоки */
                <div className="flex flex-col h-full gap-4">
                  {/* Кнопка переключения на анализ — collapsed с улучшенным UX */}
                  {isKnowledgeExpanded ? (
                    <div
                      onClick={() => setMode("analyze")}
                      className="group bg-red-600 hover:bg-red-500 transition-all rounded-3xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer min-h-[92px]"
                    >
                      <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      <div className="text-xs font-medium text-white text-center">
                        Анализ
                        <br />
                        VK-групп
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMode("analyze")}
                      className="w-full py-4 rounded-3xl bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-3"
                    >
                      <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Анализ VK-групп</span>
                    </button>
                  )}

                  {/* AI-помощник — collapsed с улучшенным UX */}
                  {assistantOpen && (
                    isKnowledgeExpanded ? (
                      <div className="group flex-1 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-neutral-800/70 transition-all min-h-[200px] overflow-hidden rounded-3xl">
                        <MessageCircle className="w-14 h-14 text-red-400 group-hover:scale-110 transition-transform" />
                        <div className="text-sm font-semibold text-neutral-200 text-center">
                          AI-помощник
                        </div>
                        <div className="text-xs text-neutral-500 text-center max-w-[160px]">
                          Советы по контенту
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-4 flex flex-col">
                        <div className="text-sm text-neutral-400 mb-3">
                          AI-помощник
                        </div>
                        <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scroll">
                          {assistantMessages.map((message) => (
                            <div
                              key={message.id}
                              className={`rounded-2xl px-4 py-3 text-sm ${
                                message.type === "user"
                                  ? "bg-red-600 text-white ml-6"
                                  : "bg-neutral-800 text-neutral-200 mr-6"
                              }`}
                            >
                              {message.text}
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-4 pt-2 border-t border-neutral-800">
                          <input
                            value={assistantInput}
                            onChange={(e) => setAssistantInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                sendAssistantMessage();
                              }
                            }}
                            placeholder="Спросите про SMM"
                            className="flex-1 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 py-2.5 text-sm"
                          />
                          <button
                            type="button"
                            onClick={sendAssistantMessage}
                            className="w-10 h-10 rounded-2xl bg-red-600 hover:bg-red-500 flex items-center justify-center"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно со списком загруженных файлов */}
      {showFileListModal &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-dark-800 border border-neutral-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Загруженные файлы</h3>
                <button
                  onClick={() => setShowFileListModal(false)}
                  className="p-1 rounded-full hover:bg-neutral-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {uploadedFiles.length === 0 ? (
                  <p className="text-neutral-400 text-center py-8">
                    Нет загруженных файлов
                  </p>
                ) : (
                  uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm"
                    >
                      <div className="font-medium truncate">{file.name}</div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {(file.size / 1024).toFixed(1)} KB ·{" "}
                        {file.type || "неизвестный тип"}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowFileListModal(false)}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl font-medium transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}