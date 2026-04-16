import { useMemo, useState, useRef, useLayoutEffect, useEffect } from "react";
import {
  Bot,
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

const knowledgeTabOptions = [
  { value: "text", label: "Текст" },
  { value: "link", label: "Ссылка" },
  { value: "file", label: "Файл" },
  { value: "image", label: "Картинка" },
];

const mockedKnowledgeFiles = [
  {
    id: "1",
    title: "Директор фирмы",
    typeLabel: "file",
    fileName: "Директор фирмы.txt",
  },
  {
    id: "2",
    title: "Анекдоты про Котов",
    typeLabel: "file",
    fileName: "Анекдоты про Котов.txt",
  },
  {
    id: "3",
    title: "Официально-деловой стиль-2",
    typeLabel: "file",
    fileName: "Официально-деловой стиль-2.pdf",
  },
  {
    id: "4",
    title: "дополнения к котам",
    typeLabel: "file",
    fileName: "дополнения к котам.txt",
  },
  {
    id: "5",
    title: "Все о компании ДИО-Консалт",
    typeLabel: "file",
    fileName: "Все о компании ДИО-Консалт.txt",
  },
  {
    id: "6",
    title: "футболка 1 с желтая",
    typeLabel: "image",
    fileName: "футболка 1 с желтая.png",
  },
  {
    id: "7",
    title: "Сравнение аппаратов лазерной сварки 3в1 на жидкостном и воздушном охлаждении",
    typeLabel: "url",
    fileName: "url___savinsname.ru___statii___2008",
  },
];

const mockCompetitors = [
  {
    name: "1С Курсы программирования на 8.X. Курсы 1С",
    handle: "@workprogrammist1c",
    similarity: "0.424",
    description:
      "Найден по пересечению запросов: курсы 1с. Совпавшие теги: 1с, курсы 1с.",
  },
  {
    name: "IRONSKILLS | Курсы по 1С",
    handle: "@ironskillsby",
    similarity: "0.424",
    description:
      "Найден по пересечению запросов: курсы 1с. Совпавшие теги: 1с, курсы 1с.",
  },
  {
    name: 'Курсы бухгалтеров, аудиторов, 1С - центр "СТЕК"',
    handle: "@stekaudit",
    similarity: "0.424",
    description:
      "Найден по пересечению запросов: курсы 1с. Совпавшие теги: 1с, курсы 1с.",
  },
  {
    name: "Тюмень-Софт, Бухгалтерия, Партнер фирмы 1С",
    handle: "@tm_soft",
    similarity: "0.401",
    description:
      "Найден по пересечению запросов: 1с бухгалтерия. Совпавшие теги: 1с, 1с бухгалтерия, 1с тюмень, бухгалтерия.",
  },
  {
    name: "ФЭС для Бизнеса: 1С, налоги, отчетность",
    handle: "@fes1c",
    similarity: "0.377",
    description:
      "Найден по пересечению запросов: 1с бухгалтерия, курсы 1с. Совпавшие теги: 1с, 1с бухгалтерия, бухгалтерия, курсы 1с.",
  },
];

const mockRecommendations = [
  {
    title: "Улучшить контент-стратегию",
    text: "Добавлять больше увлекательного и полезного контента, ориентированного на аудиторию (рецепты, советы по питанию, скидки и акции).\n\nПовышение вовлечённости аудитории и увеличение числа просмотров и лайков.",
  },
  {
    title: "Активизировать взаимодействие с аудиторией",
    text: "Запускать опросы, конкурсы и викторины, стимулирующие комментарии и обсуждения.\n\nПовышение активности аудитории и укрепление лояльности.",
  },
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
    <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-5">
      <div className="text-sm text-neutral-400">{label}</div>
      <div className="mt-4 text-5xl font-bold tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}

function RecommendationCard({ title, text }) {
  return (
    <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6">
      <div className="text-[22px] md:text-[26px] font-semibold text-white leading-snug">
        {title}
      </div>
      <div className="mt-4 text-neutral-200 text-lg md:text-xl leading-relaxed whitespace-pre-line">
        {text}
      </div>
    </div>
  );
}

function CompetitorCard({ item }) {
  return (
    <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-4">
      <div className="text-white text-xl font-semibold leading-snug">
        {item.name}
      </div>
      <div className="mt-1 text-neutral-400">{item.handle}</div>
      <div className="mt-3 text-neutral-300">Схожесть: {item.similarity}</div>
      <div className="mt-3 text-neutral-400 leading-relaxed">
        {item.description}
      </div>
    </div>
  );
}

function KnowledgeTabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 h-11 rounded-2xl text-sm font-medium border transition-all ${
        active
          ? "bg-neutral-800 border-red-500/40 text-white shadow-[0_0_0_1px_rgba(239,68,68,0.18)]"
          : "bg-[#151515] border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function KnowledgeListItem({ item, onDelete }) {
  return (
    <div className="bg-[#141414] border border-neutral-800 rounded-2xl px-4 py-3 flex items-center justify-between gap-4">
      <div className="min-w-0">
        <div className="text-white font-medium truncate">{item.title}</div>
        <div className="text-neutral-500 text-sm mt-1 truncate">
          {item.typeLabel} · {item.fileName}
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 px-4 h-11 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-red-500/20 text-white transition-colors"
      >
        Удалить
      </button>
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
  const [assistantOpen] = useState(true);
  const [isGenerateFiltersOpen, setIsGenerateFiltersOpen] = useState(true);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([
    {
      id: "assistant-welcome",
      type: "ai",
      text: "Я изучил результаты анализа. Задайте вопрос, и я помогу с улучшением группы.",
    },
  ]);
  const [isKnowledgeExpanded, setIsKnowledgeExpanded] = useState(false);

  const fileInputRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showFileListModal, setShowFileListModal] = useState(false);

  const [knowledgeTab, setKnowledgeTab] = useState("text");
  const [knowledgeText, setKnowledgeText] = useState("");
  const [knowledgeLink, setKnowledgeLink] = useState("");
  const [knowledgeItems, setKnowledgeItems] = useState(mockedKnowledgeFiles);
  const [knowledgeBaseMeta, setKnowledgeBaseMeta] = useState({
    name: "Основная база знаний",
    language: "ru",
    filesCount: mockedKnowledgeFiles.length,
    charsCount: 16053,
    isActive: true,
  });

  const [improvementQuestion, setImprovementQuestion] = useState("");
  const [improvementPlan, setImprovementPlan] = useState("");

  const mockAnalyzeResult = {
    group_name: "Красное и Белое",
    metrics: {
      total_posts_analyzed: 20,
      average_views: 0,
      average_likes: 19,
      average_comments: 0,
      posts_per_day: 1.818,
      top_posts: [
        {
          post_id: 2001676,
          date: 1771592700,
          views: 0,
          likes: 82,
          comments: 0,
        },
        {
          post_id: 2001272,
          date: 1771418700,
          views: 0,
          likes: 17,
          comments: 0,
        },
      ],
    },
    ai: {
      summary:
        "Группа Красное и Белое собрана вокруг интересов food и drink, акцентируется внимание на магазинах и продуктах повседневного спроса.",
      search_tags: [
        "продуктовые магазины",
        "супермаркеты",
        "дешёвые продукты",
        "скидки и акции",
        "товары повседневного спроса",
        "быстрая доставка продуктов",
        "магазины у дома",
        "продуктовые сети россии",
        "продукты и напитки",
        "ритейл продуктов питания",
        "сеть магазинов красное и белое",
        "онлайн акции красное и белое",
        "торговля продуктами онлайн",
        "бренды продуктов питания",
        "конкуренты красное и белое",
      ],
      audience_interests: ["food", "drink", "магазины"],
      audience_activity: ["низкая активность комментариев"],
      competitors: mockCompetitors,
      recommendations: mockRecommendations,
    },
  };

  const mainColSpanClass =
    mode === "generate" && isKnowledgeExpanded
      ? "xl:col-span-11"
      : "xl:col-span-9";

  const sideColSpanClass =
    mode === "generate" && isKnowledgeExpanded
      ? "xl:col-span-1"
      : "xl:col-span-3";

  const kbColSpanClass =
    mode === "generate" && isKnowledgeExpanded
      ? "xl:col-span-9"
      : "xl:col-span-2";

  const rightColSpanClass =
    mode === "generate" && isKnowledgeExpanded
      ? "xl:col-span-3"
      : "xl:col-span-10";

  const imageDataUrl = useMemo(() => {
    if (!generateResult?.generated_image_base64) return "";
    const mime = generateResult.generated_image_mime_type || "image/png";
    return `data:${mime};base64,${generateResult.generated_image_base64}`;
  }, [generateResult]);

  useEffect(() => {
    setKnowledgeBaseMeta((prev) => ({
      ...prev,
      filesCount: knowledgeItems.length,
    }));
  }, [knowledgeItems]);

  const sendAssistantMessage = () => {
    const text = assistantInput.trim();
    if (!text) return;

    const userMessage = { id: `${Date.now()}-u`, type: "user", text };

    const aiReplyText =
      mode === "analyze"
        ? analyzeResult
          ? "Сфокусируйтесь на метриках вовлеченности, найденных конкурентах и рекомендациях. Начните с 1–2 действий с максимальным эффектом."
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
  setImprovementPlan("");

  try {
    const data = await SmmApi.analyzeGroup({
      source: analyzeForm.source.trim(),
      post_limit: Number(analyzeForm.post_limit) || 30,
      language: analyzeForm.language,
    });

    setAnalyzeResult(data);
  } catch (error) {
    const message = error?.message || "";

    const isConnectionError =
      message.includes("ERR_CONNECTION_REFUSED") ||
      message.includes("Network Error") ||
      message.includes("Failed to fetch") ||
      message.includes("fetch");

    if (isConnectionError) {
      setAnalyzeResult({
        ...mockAnalyzeResult,
        group_name: analyzeForm.source.trim() || mockAnalyzeResult.group_name,
      });

      setAnalyzeError(
        "Бэкенд недоступен, поэтому показан демонстрационный результат. Как только API снова станет доступен, будет использоваться реальный ответ сервера."
      );
    } else {
      setAnalyzeError(error.message);
      setAnalyzeResult(null);
    }
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

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    const mappedKnowledgeItems = files.map((file) => ({
      id: `${Date.now()}-${file.name}-kb`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      typeLabel: file.type.startsWith("image/") ? "image" : "file",
      fileName: file.name,
    }));

    setKnowledgeItems((prev) => [...mappedKnowledgeItems, ...prev]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleKnowledgeDelete = (id) => {
    setKnowledgeItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleKnowledgeRefresh = () => {
    setKnowledgeBaseMeta((prev) => ({
      ...prev,
      charsCount: prev.charsCount + 128,
    }));
  };

  const handleKnowledgeSave = () => {
    if (knowledgeTab === "text" && knowledgeText.trim()) {
      const newItem = {
        id: `${Date.now()}`,
        title: knowledgeText.trim().slice(0, 40) || "Новый текст",
        typeLabel: "text",
        fileName: "Вставленный текст",
      };
      setKnowledgeItems((prev) => [newItem, ...prev]);
      setKnowledgeText("");
      return;
    }

    if (knowledgeTab === "link" && knowledgeLink.trim()) {
      const newItem = {
        id: `${Date.now()}`,
        title: knowledgeLink.trim(),
        typeLabel: "url",
        fileName: knowledgeLink.trim(),
      };
      setKnowledgeItems((prev) => [newItem, ...prev]);
      setKnowledgeLink("");
    }
  };

  const handleImprovementQuestion = () => {
    const text = improvementQuestion.trim();
    if (!text) return;

    const aiText =
      "Рекомендую начать с контента, который легче вовлекает аудиторию: опросы, короткие полезные посты, регулярные рубрики и более явные призывы к действию. После этого можно сравнить, какие темы дают больше лайков и комментариев, и масштабировать их.";

    setImprovementPlan(aiText);

    setAssistantMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-u-plan`, type: "user", text },
      {
        id: `${Date.now()}-a-plan`,
        type: "ai",
        text: aiText,
      },
    ]);

    setImprovementQuestion("");
  };

  const analyzeTopPosts = analyzeResult?.metrics?.top_posts || [];
  const analyzeCompetitors = analyzeResult?.ai?.competitors || [];
  const analyzeRecommendations = analyzeResult?.ai?.recommendations || [];
  const groupTitle =
    analyzeResult?.group_name ||
    analyzeResult?.title ||
    analyzeForm.source ||
    "VK-группа";

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="pt-24 lg:pt-28 px-6 lg:px-12 max-w-screen-2xl mx-auto pb-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          <div className={mainColSpanClass}>
            {mode === "analyze" ? (
              <div className="flex flex-col gap-4 overflow-visible">
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

                <div className="xl:w-[calc(100%+346px)] xl:max-w-none">
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
                            {analyzeLoading ? "Анализируем..." : "Запустить анализ"}
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
                      <div className="mt-8 space-y-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div>
                            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                              {groupTitle}
                            </h1>
                          </div>

                          <div className="px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-medium">
                            GigaChat analysis completed
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <MetricsCard
                            label="Постов проанализировано"
                            value={formatNumber(
                              analyzeResult.metrics.total_posts_analyzed
                            )}
                          />
                          <MetricsCard
                            label="Средние лайки"
                            value={formatNumber(
                              analyzeResult.metrics.average_likes
                            )}
                          />
                          <MetricsCard
                            label="Постов в день"
                            value={analyzeResult.metrics.posts_per_day}
                          />
                        </div>

                        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6">
                          <div className="text-2xl font-semibold text-white mb-4">
                            Сводка
                          </div>
                          <p className="text-neutral-200 text-lg md:text-xl leading-relaxed">
                            {analyzeResult.ai.summary ||
                              "Сводка пока не предоставлена."}
                          </p>
                        </div>

                        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6">
                          <div className="text-2xl font-semibold text-white mb-4">
                            Теги поиска конкурентов
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {analyzeResult.ai.search_tags.length ? (
                              analyzeResult.ai.search_tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-5 py-2 rounded-full text-base md:text-lg bg-red-500/15 border border-red-500/30 text-red-200"
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

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6">
                            <div className="text-2xl font-semibold text-white mb-4">
                              Интересы аудитории
                            </div>
                            {analyzeResult.ai.audience_interests.length ? (
                              <ul className="list-disc pl-6 space-y-3 text-neutral-200 text-lg md:text-xl">
                                {analyzeResult.ai.audience_interests.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-neutral-500 text-sm">
                                Нет данных
                              </span>
                            )}
                          </div>

                          <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6">
                            <div className="text-2xl font-semibold text-white mb-4">
                              Активность аудитории
                            </div>
                            {analyzeResult.ai.audience_activity.length ? (
                              <ul className="list-disc pl-6 space-y-3 text-neutral-200 text-lg md:text-xl">
                                {analyzeResult.ai.audience_activity.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-neutral-500 text-sm">
                                Нет данных
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6 overflow-x-auto">
                          <div className="text-2xl font-semibold text-white mb-4">
                            Топ постов
                          </div>
                          {analyzeTopPosts.length ? (
                            <table className="w-full text-base md:text-lg">
                              <thead className="text-neutral-400">
                                <tr className="border-b border-neutral-800">
                                  <th className="py-3 text-left font-medium">ID</th>
                                  <th className="py-3 text-left font-medium">
                                    Дата
                                  </th>
                                  <th className="py-3 text-left font-medium">
                                    Просмотры
                                  </th>
                                  <th className="py-3 text-left font-medium">
                                    Лайки
                                  </th>
                                  <th className="py-3 text-left font-medium">
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
                                    <td className="py-3">{post.post_id}</td>
                                    <td className="py-3">{formatDate(post.date)}</td>
                                    <td className="py-3">
                                      {formatNumber(post.views)}
                                    </td>
                                    <td className="py-3">
                                      {formatNumber(post.likes)}
                                    </td>
                                    <td className="py-3">
                                      {formatNumber(post.comments)}
                                    </td>
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

                        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6">
                          <div className="text-2xl font-semibold text-white mb-4">
                            Найденные конкуренты
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {(analyzeCompetitors.length
                              ? analyzeCompetitors
                              : mockCompetitors
                            ).map((competitor, index) => (
                              <CompetitorCard
                                key={`${competitor.name}-${index}`}
                                item={competitor}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6">
                          <div className="text-2xl font-semibold text-white mb-4">
                            Рекомендации
                          </div>

                          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                            {(analyzeRecommendations.length
                              ? analyzeRecommendations
                              : mockRecommendations
                            ).map((item, index) => (
                              <RecommendationCard
                                key={`${item.title}-${index}`}
                                title={item.title}
                                text={item.text}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6">
                          <div className="text-2xl font-semibold text-white mb-4">
                            AI-помощник
                          </div>

                          <p className="text-neutral-300 text-lg md:text-xl mb-6">
                            {improvementPlan ||
                              "Задайте вопрос по улучшению группы, и помощник предложит следующий шаг."}
                          </p>

                          <div className="space-y-3 mb-6 max-h-[320px] overflow-y-auto pr-1 custom-scroll">
                            {assistantMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`rounded-2xl px-4 py-3 text-sm ${
                                  message.type === "user"
                                    ? "bg-red-600 text-white ml-6"
                                    : "bg-neutral-900 text-neutral-200 mr-6 border border-neutral-800"
                                }`}
                              >
                                {message.text}
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-4 items-end max-lg:flex-col">
                            <textarea
                              value={improvementQuestion}
                              onChange={(e) => setImprovementQuestion(e.target.value)}
                              rows={4}
                              placeholder="Введите вопрос по улучшению"
                              className="flex-1 w-full bg-neutral-900 border border-neutral-700 focus:border-red-500 rounded-2xl px-6 py-4 text-white text-lg placeholder:text-neutral-500 resize-none"
                            />
                            <button
                              type="button"
                              onClick={handleImprovementQuestion}
                              className="bg-red-600 hover:bg-red-500 px-10 py-4 rounded-2xl font-medium transition-colors whitespace-nowrap min-w-[180px]"
                            >
                              Отправить
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      !analyzeError && (
                        <div className="mt-8 border border-dashed border-neutral-700 rounded-2xl p-8 text-center text-neutral-500 flex-1 flex items-center justify-center min-h-[420px]">
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
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
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
                      <div
                        className="p-6 lg:p-7 flex-1 flex flex-col min-h-[780px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div>
                            <h2 className="text-[32px] leading-none font-semibold text-white">
                              База знаний
                            </h2>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleKnowledgeRefresh}
                              className="px-5 h-12 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-red-500/20 text-white font-medium transition-colors"
                            >
                              Обновить
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsKnowledgeExpanded(false);
                              }}
                              className="w-12 h-12 rounded-2xl hover:bg-neutral-700/50 transition-colors flex items-center justify-center"
                              aria-label="Свернуть базу знаний"
                              type="button"
                            >
                              <ChevronLeft className="w-5 h-5 text-neutral-400" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-[#111111] border border-neutral-800 rounded-[28px] p-5 lg:p-6 flex-1 flex flex-col min-h-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="text-2xl font-semibold text-white">
                                База знаний
                              </div>
                              <div className="mt-3 text-neutral-300 text-xl lg:text-[28px] leading-tight font-semibold">
                                Активная база: {knowledgeBaseMeta.name}
                                <span className="text-neutral-500 font-medium">
                                  {" "}
                                  · язык: {knowledgeBaseMeta.language} · файлов:{" "}
                                  {knowledgeBaseMeta.filesCount}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3">
                            {knowledgeTabOptions.map((tab) => (
                              <KnowledgeTabButton
                                key={tab.value}
                                active={knowledgeTab === tab.value}
                                onClick={() => setKnowledgeTab(tab.value)}
                              >
                                {tab.label}
                              </KnowledgeTabButton>
                            ))}
                          </div>

                          <div className="mt-6">
                            {knowledgeTab === "text" && (
                              <>
                                <div className="text-2xl font-semibold text-white mb-4">
                                  Добавить текст
                                </div>
                                <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                                  Текст
                                </div>
                                <textarea
                                  value={knowledgeText}
                                  onChange={(e) => setKnowledgeText(e.target.value)}
                                  rows={8}
                                  placeholder="Правила, шаблоны, ограничения..."
                                  className="w-full bg-[#171717] border border-neutral-800 focus:border-red-500 rounded-[26px] px-6 py-5 text-white placeholder:text-neutral-600 resize-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleKnowledgeSave}
                                  className="mt-5 w-full h-16 rounded-[24px] bg-red-600 hover:bg-red-500 text-white text-xl lg:text-2xl font-semibold transition-colors"
                                >
                                  Сохранить текст
                                </button>
                              </>
                            )}

                            {knowledgeTab === "link" && (
                              <>
                                <div className="text-2xl font-semibold text-white mb-4">
                                  Добавить ссылку
                                </div>
                                <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                                  Ссылка
                                </div>
                                <input
                                  value={knowledgeLink}
                                  onChange={(e) => setKnowledgeLink(e.target.value)}
                                  placeholder="https://example.com/article"
                                  className="w-full h-[60px] bg-[#171717] border border-neutral-800 focus:border-red-500 rounded-[22px] px-5 text-white placeholder:text-neutral-600"
                                />
                                <button
                                  type="button"
                                  onClick={handleKnowledgeSave}
                                  className="mt-5 w-full h-14 rounded-[22px] bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
                                >
                                  Сохранить ссылку
                                </button>
                              </>
                            )}

                            {knowledgeTab === "file" && (
                              <>
                                <div className="text-2xl font-semibold text-white mb-4">
                                  Добавить файл
                                </div>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-red-500/50 rounded-[26px] py-12 px-6 cursor-pointer transition-colors bg-[#171717]">
                                  <Upload className="w-12 h-12 text-neutral-500 mb-4" />
                                  <p className="text-sm text-neutral-400 text-center">
                                    Перетащите файлы сюда
                                    <br />
                                    или нажмите для выбора
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-3">
                                    PDF, DOCX, TXT, XLSX, PPTX
                                  </p>
                                  <input
                                    ref={fileInputRef}
                                    multiple
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                  />
                                </label>
                              </>
                            )}

                            {knowledgeTab === "image" && (
                              <>
                                <div className="text-2xl font-semibold text-white mb-4">
                                  Добавить картинку
                                </div>
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-red-500/50 rounded-[26px] py-12 px-6 cursor-pointer transition-colors bg-[#171717]">
                                  <Image className="w-12 h-12 text-neutral-500 mb-4" />
                                  <p className="text-sm text-neutral-400 text-center">
                                    Загрузите изображение в базу знаний
                                  </p>
                                  <p className="text-xs text-neutral-500 mt-3">
                                    JPG, PNG, WEBP
                                  </p>
                                  <input
                                    ref={fileInputRef}
                                    multiple
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileSelect}
                                  />
                                </label>
                              </>
                            )}
                          </div>

                          <div className="mt-7 pt-6 border-t border-neutral-800 min-h-0 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <div className="text-white text-[26px] font-semibold">
                                  {knowledgeBaseMeta.name}
                                  <span className="text-neutral-400 font-medium">
                                    {" "}
                                    · активная
                                  </span>
                                </div>
                                <div className="text-neutral-400 text-lg lg:text-xl mt-1">
                                  Язык: {knowledgeBaseMeta.language} · символов:{" "}
                                  {formatNumber(knowledgeBaseMeta.charsCount)}
                                </div>
                              </div>
                            </div>

                            <div className="overflow-y-auto pr-1 space-y-3">
                              {knowledgeItems.length === 0 ? (
                                <div className="text-neutral-500 text-sm text-center py-8">
                                  Файлов пока нет
                                </div>
                              ) : (
                                knowledgeItems.map((item) => (
                                  <KnowledgeListItem
                                    key={item.id}
                                    item={item}
                                    onDelete={() => handleKnowledgeDelete(item.id)}
                                  />
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-2">
                        <Upload className="w-8 h-8 text-red-400" />
                        <span className="text-xs text-neutral-400">
                          База знаний
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`flex flex-col gap-4 h-full ${rightColSpanClass}`}>
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
                              {generateLoading ? "Генерируем..." : "Сгенерировать"}
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

                        {generateError && (
                          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                            {generateError}
                          </div>
                        )}

                        {generateResult && (
                          <div className="space-y-4 overflow-y-auto">
                            <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-4">
                              <div className="text-sm text-neutral-500 mb-2">
                                Текст поста
                              </div>
                              <textarea
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                rows={8}
                                className="w-full bg-transparent text-white resize-none outline-none"
                              />
                            </div>

                            {(generateResult.content_type === "image" ||
                              imageDataUrl) && (
                              <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-4">
                                <div className="text-sm text-neutral-500 mb-2">
                                  Prompt для изображения
                                </div>
                                <textarea
                                  value={editedImagePrompt}
                                  onChange={(e) =>
                                    setEditedImagePrompt(e.target.value)
                                  }
                                  rows={4}
                                  className="w-full bg-transparent text-white resize-none outline-none"
                                />

                                <button
                                  type="button"
                                  onClick={handleRegenerateImage}
                                  disabled={regenerateImageLoading}
                                  className="mt-4 w-full bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800/60 px-4 py-3 rounded-2xl font-medium transition-colors"
                                >
                                  {regenerateImageLoading
                                    ? "Перегенерируем..."
                                    : "Перегенерировать изображение"}
                                </button>

                                {regenerateImageError && (
                                  <div className="mt-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                                    {regenerateImageError}
                                  </div>
                                )}

                                {imageDataUrl && (
                                  <img
                                    src={imageDataUrl}
                                    alt="Сгенерированное изображение"
                                    className="mt-4 rounded-2xl border border-neutral-800 w-full object-cover"
                                  />
                                )}
                              </div>
                            )}

                            <div className="flex flex-col gap-3">
                              <button
                                type="button"
                                onClick={handlePublish}
                                disabled={publishLoading}
                                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 px-4 py-3 rounded-2xl font-medium transition-colors"
                              >
                                {publishLoading ? "Публикуем..." : "Опубликовать"}
                              </button>

                              {publishError && (
                                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                                  {publishError}
                                </div>
                              )}

                              {publishSuccess && (
                                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300 text-sm">
                                  {publishSuccess}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={sideColSpanClass}>
            <div className="flex flex-col h-full">
              {mode === "analyze" ? (
                <div className="flex flex-col h-full gap-4">
                  <button
                    type="button"
                    onClick={() => setMode("generate")}
                    className="w-full h-14 rounded-3xl bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-3"
                  >
                    <Wand2 className="w-5 h-5" />
                    <span className="font-medium">Генерация контента</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full gap-4">
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

                  {assistantOpen &&
                    (isKnowledgeExpanded ? (
                      <div className="group flex-1 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-center gap-4 hover:bg-neutral-800/70 transition-all min-h-[200px] overflow-hidden">
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
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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