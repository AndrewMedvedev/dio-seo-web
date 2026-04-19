import { useMemo, useState, useRef, useEffect } from "react";
import {
  Bot,
  Image,
  Wand2,
  History,
  Loader2,
  ArrowRight,
  ChevronLeft,
  Upload,
  X,
} from "lucide-react";
import { SmmApi } from "../api/Smm";
import { createPortal } from "react-dom";
import CustomSelect from "../components/CustomSelect";
import { formatNumber, formatDate, getImageDataUrl } from "../utils/smmUtils";
import GenerateFiltersPanel from "../components/smm/GenerateFiltersPanel";
import GenerateResultPanel from "../components/smm/GenerateResultPanel";

const HISTORY_PAGE_LIMIT = 10;

const isConnectionErrorMessage = (message = "") =>
  ["ERR_CONNECTION_REFUSED", "Network Error", "Failed to fetch", "fetch"].some(
    (token) => message.includes(token),
  );

const formatHistoryDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const initialAnalyzeForm = {
  source: "",
  post_limit: 30,
  language: "ru",
  date_from: "",
  date_to: "",
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
  {
    value: "zh",
    label: "中文",
    flag: "🇨🇳",
    description: "Китайский язык",
  },
  {
    value: "es",
    label: "Español",
    flag: "🇪🇸",
    description: "Испанский язык",
  },
  {
    value: "de",
    label: "Deutsch",
    flag: "🇩🇪",
    description: "Немецкий язык",
  },
  {
    value: "fr",
    label: "Français",
    flag: "🇫🇷",
    description: "Французский язык",
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

const createMockImageSvgDataUrl = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f4efe8"/>
          <stop offset="100%" stop-color="#d9d1c7"/>
        </linearGradient>
        <linearGradient id="desk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="100%" stop-color="#ece7e0"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)"/>
      <rect x="0" y="0" width="1200" height="140" fill="#d7d4cf"/>
      <rect x="70" y="60" width="260" height="34" rx="8" fill="#efefef"/>
      <rect x="920" y="70" width="180" height="300" rx="24" fill="#1f1f1f"/>
      <rect x="945" y="100" width="130" height="205" rx="12" fill="#2f2f2f"/>
      <rect x="170" y="520" width="840" height="220" rx="28" fill="url(#desk)"/>
      <rect x="780" y="260" width="120" height="220" rx="14" fill="#2b2b2b"/>
      <rect x="825" y="285" width="30" height="165" rx="6" fill="#101010"/>
      <ellipse cx="420" cy="435" rx="118" ry="120" fill="#ffcf32"/>
      <rect x="340" y="445" width="220" height="190" rx="44" fill="#e0b328"/>
      <rect x="415" y="450" width="70" height="82" rx="12" fill="#2f78ff"/>
      <text x="450" y="505" font-family="Arial, sans-serif" font-size="42" text-anchor="middle" fill="white">1C</text>
      <circle cx="455" cy="292" r="80" fill="#f2c8a8"/>
      <path d="M378 300c10-80 155-120 180-15 6 28 3 53-8 76-55 5-117-12-172-61z" fill="#3a261e"/>
      <rect x="292" y="630" width="320" height="38" rx="12" fill="#2e2e2e"/>
      <rect x="618" y="645" width="110" height="18" rx="8" fill="#d7d7d7"/>
      <rect x="748" y="615" width="110" height="58" rx="10" fill="#151515"/>
      <rect x="76" y="226" width="180" height="400" rx="24" fill="#efeae2" opacity="0.65"/>
      <rect x="986" y="420" width="96" height="18" rx="9" fill="#dbd4ca"/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const mockGenerateKnowledgeMaterials = [
  {
    id: "gm-1",
    title: "Все о компании ДИО-Консалт",
    score: 0.5065,
    tokenOverlap: 1,
    content:
      '**5. Имиджевые посты**\n\n* О компании\n* О команде\n* О процессе работы\n\n---\n\n### 4.3 Требования к постам\n\n* Короткие абзацы (2–4 строки)\n* Чёткая структура\n* Заголовок обязателен\n* Без орфографических ошибок',
  },
  {
    id: "gm-2",
    title: "Все о компании ДИО-Консалт",
    score: 0.4886,
    tokenOverlap: 2,
    content:
      '## 4. Инструкция по ведению группы (соцсети)\n\n### 4.1 Общий стиль\n\n* Пишем простым и понятным языком\n* Избегаем сложных технических терминов без объяснения\n* Общаемся дружелюбно, но профессионально\n* Не используем канцеляризм',
  },
  {
    id: "gm-3",
    title: "Все о компании ДИО-Консалт",
    score: 0.4744,
    tokenOverlap: 1,
    content:
      '# Инструкция для сотрудников и контент-менеджеров\n\n## Компания «ДИО Консалт»\n\nМы помогаем клиентам наводить порядок в бизнес-процессах, автоматизировать учёт и выстраивать устойчивую работу компании.',
  },
  {
    id: "gm-4",
    title: "футболка 1 с желтая",
    score: 2.0059,
    tokenOverlap: 1,
    exactHits: 1,
    content:
      'Описание изображения:\nФутболка 1C жёлтая',
  },
];

const mockGenerateResult = {
  text:
    "Наши 1С-ники — настоящие супергерои нашего офиса! Каждый день они превращают хаос цифр в порядок и помогают нашим клиентам достигать новых высот в бизнесе. Благодаря их профессионализму и вдохновляющему подходу мы уверенно движемся вперед. Спасибо вам за вашу работу и поддержку!",
  image_prompt:
    "Персонажи в жёлтых футболках с эмблемой 1С работают за компьютерами, сосредоточенно глядя в экраны, вокруг аккуратный офис с современным интерьером, освещённый мягким светом ламп дневного света, атмосфера спокойная и деловая, подчёркивающая профессионализм героев.",
  content_type: "image",
  status: "draft",
  published: false,
  generated_image_base64: "",
  generated_image_mime_type: "",
  mock_image_data_url: createMockImageSvgDataUrl(),
  knowledge_matches: mockGenerateKnowledgeMaterials,
};

function MetricsCard({ label, value }) {
  return (
    <div className="bg-dark-800 border border-neutral-800 rounded-2xl p-5">
      <div className="text-base text-neutral-400">{label}</div>
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
  const [showAnalyzeHistory, setShowAnalyzeHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [historyUsingMock, setHistoryUsingMock] = useState(false);
  const [historyHasLoaded, setHistoryHasLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [historyMutationLoading, setHistoryMutationLoading] = useState(false);
  const [generateError, setGenerateError] = useState("");
  const [showGenerateHistory, setShowGenerateHistory] = useState(false);
  const [generateHistoryData, setGenerateHistoryData] = useState([]);
  const [generateHistoryLoading, setGenerateHistoryLoading] = useState(false);
  const [generateHistoryError, setGenerateHistoryError] = useState("");
  const [generateHistoryUsingMock, setGenerateHistoryUsingMock] = useState(false);
  const [generateHistoryHasLoaded, setGenerateHistoryHasLoaded] = useState(false);
  const [generateHistoryPage, setGenerateHistoryPage] = useState(1);
  const [generateHistoryHasMore, setGenerateHistoryHasMore] = useState(true);
  const [generateHistoryLoadingMore, setGenerateHistoryLoadingMore] = useState(false);
  const [generateHistoryMutationLoading, setGenerateHistoryMutationLoading] = useState(false);
  const [regenerateImageError, setRegenerateImageError] = useState("");
  const [publishError, setPublishError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isGenerateFiltersOpen, setIsGenerateFiltersOpen] = useState(true);
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

  const createMockAnalyzeHistory = () => [
    {
      id: "mock-vk-1",
      created_at: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
      source: { name: "Красное и Белое", handle: "@krasnoebeloe" },
      metrics: { total_posts_analyzed: 20, average_likes: 9, average_comments: 0 },
      ai: {
        summary:
          "Группа Красное и Белое: низкая активность комментариев, умеренная публикационная активность.",
      },
      result: {
        ...mockAnalyzeResult,
        group_name: "Красное и Белое",
        metrics: {
          ...mockAnalyzeResult.metrics,
          total_posts_analyzed: 20,
          average_likes: 9,
          average_comments: 0,
        },
      },
    },
    {
      id: "mock-vk-2",
      created_at: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
      source: { name: "ДИО-Консалт", handle: "@diocon" },
      metrics: { total_posts_analyzed: 20, average_likes: 0, average_comments: 13 },
      ai: {
        summary:
          "Группа ДИО-Консалт ориентирована на бухгалтеров, учителей и школьников, интересующихся налоговым законодательством и обучением IT.",
      },
      result: {
        ...mockAnalyzeResult,
        group_name: "ДИО-Консалт - официальный партнер фирмы 1С",
        metrics: {
          ...mockAnalyzeResult.metrics,
          total_posts_analyzed: 20,
          average_likes: 0,
          average_comments: 13,
        },
      },
    },
  ];

  const createMockGenerateHistory = () => [
    {
      id: "mock-generate-1",
      created_at: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
      prompt: "пост про наших сотрудников 1с компании",
      content_type: "text",
      result: {
        ...mockGenerateResult,
        content_type: "text",
        text: mockGenerateResult.text,
      },
    },
    {
      id: "mock-generate-2",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      prompt: "напиши пост про наших любимых 1с-ников в компании",
      content_type: "image",
      result: {
        ...mockGenerateResult,
        content_type: "image",
        text: "Наши 1С-ники — команда, которая каждый день превращает сложные процессы в понятные решения и помогает бизнесу расти.",
      },
    },
  ];

  const mainColSpanClass =
    mode === "analyze" || (mode === "generate" && !isKnowledgeExpanded)
      ? "xl:col-span-12"
      : mode === "generate" && isKnowledgeExpanded
      ? "xl:col-span-12"
      : "xl:col-span-9";

  const sideColSpanClass =
    mode === "analyze" || (mode === "generate" && !isKnowledgeExpanded)
      ? "hidden"
      : mode === "generate" && isKnowledgeExpanded
      ? "xl:hidden"
      : "xl:col-span-3";

  const imageDataUrl = useMemo(() => {
    if (!generateResult) return "";

    const apiImage = getImageDataUrl(generateResult);
    return apiImage || generateResult.mock_image_data_url || "";
  }, [generateResult]);

  useEffect(() => {
    setKnowledgeBaseMeta((prev) => ({
      ...prev,
      filesCount: knowledgeItems.length,
    }));
  }, [knowledgeItems]);

  const fetchAnalyzeHistory = async (page = 1, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setHistoryLoading(true);
    setHistoryError("");

    try {
      const data = await SmmApi.history(page, HISTORY_PAGE_LIMIT);
      const newItems = data?.results || [];

      if (isLoadMore) {
        setHistoryData((prev) => [...prev, ...newItems]);
      } else {
        setHistoryData(newItems);
      }

      setCurrentPage(page);
      setHasMore(Boolean(data?.next) || newItems.length === HISTORY_PAGE_LIMIT);
      setHistoryUsingMock(false);
    } catch (error) {
      const message = error?.message || "";

      if (isConnectionErrorMessage(message)) {
        const mockItems = createMockAnalyzeHistory();
        setHistoryUsingMock(true);
        setHistoryError("");

        if (isLoadMore) {
          setHasMore(false);
        } else {
          setHistoryData(mockItems);
          setCurrentPage(1);
          setHasMore(false);
        }
      } else {
        if (!isLoadMore) {
          setHistoryData([]);
          setHasMore(false);
        }
        setHistoryUsingMock(false);
        setHistoryError(error.message || "Не удалось загрузить историю анализов.");
      }
    } finally {
      setHistoryLoading(false);
      setLoadingMore(false);
    }
  };

  const openAnalyzeHistory = () => {
    setShowAnalyzeHistory(true);

    if (!historyHasLoaded) {
      setHistoryHasLoaded(true);
      fetchAnalyzeHistory(1, false);
    }
  };

  const hideAnalyzeHistory = () => {
    setShowAnalyzeHistory(false);
  };

  const loadMoreAnalyzeHistory = () => {
    if (!hasMore || loadingMore) return;
    fetchAnalyzeHistory(currentPage + 1, true);
  };

  const openAnalyzeHistoryItem = (item) => {
    if (!item?.result) return;
    setAnalyzeResult(item.result);
    setAnalyzeError("");
    setShowAnalyzeHistory(false);
  };

  const deleteAnalyzeHistoryItem = async (id) => {
    if (historyMutationLoading) return;

    setHistoryMutationLoading(true);
    setHistoryError("");

    try {
      await SmmApi.deleteHistoryItem(id);
      setHistoryData((prev) => prev.filter((item) => String(item.id) !== String(id)));
      setHistoryUsingMock(false);
    } catch (error) {
      if (isConnectionErrorMessage(error?.message || "")) {
        setHistoryUsingMock(true);
        setHistoryData((prev) => prev.filter((item) => String(item.id) !== String(id)));
      } else {
        setHistoryError(error.message || "Не удалось удалить запись истории.");
      }
    } finally {
      setHistoryMutationLoading(false);
    }
  };

  const clearAnalyzeHistory = async () => {
    if (historyMutationLoading) return;

    setHistoryMutationLoading(true);
    setHistoryError("");

    try {
      await SmmApi.clearHistory();
      setHistoryData([]);
      setHasMore(false);
      setHistoryUsingMock(false);
    } catch (error) {
      if (isConnectionErrorMessage(error?.message || "")) {
        setHistoryUsingMock(true);
        setHistoryData([]);
        setHasMore(false);
      } else {
        setHistoryError(error.message || "Не удалось очистить историю.");
      }
    } finally {
      setHistoryMutationLoading(false);
    }
  };

  const fetchGenerateHistory = async (page = 1, isLoadMore = false) => {
    if (isLoadMore) setGenerateHistoryLoadingMore(true);
    else setGenerateHistoryLoading(true);
    setGenerateHistoryError("");

    try {
      const data = await SmmApi.generateHistory(page, HISTORY_PAGE_LIMIT);
      const newItems = data?.results || [];

      if (isLoadMore) {
        setGenerateHistoryData((prev) => [...prev, ...newItems]);
      } else {
        setGenerateHistoryData(newItems);
      }

      setGenerateHistoryPage(page);
      setGenerateHistoryHasMore(Boolean(data?.next) || newItems.length === HISTORY_PAGE_LIMIT);
      setGenerateHistoryUsingMock(false);
    } catch (error) {
      const message = error?.message || "";

      if (isConnectionErrorMessage(message)) {
        const mockItems = createMockGenerateHistory();
        setGenerateHistoryUsingMock(true);
        setGenerateHistoryError("");

        if (isLoadMore) {
          setGenerateHistoryHasMore(false);
        } else {
          setGenerateHistoryData(mockItems);
          setGenerateHistoryPage(1);
          setGenerateHistoryHasMore(false);
        }
      } else {
        if (!isLoadMore) {
          setGenerateHistoryData([]);
          setGenerateHistoryHasMore(false);
        }
        setGenerateHistoryUsingMock(false);
        setGenerateHistoryError(error.message || "Не удалось загрузить историю генераций.");
      }
    } finally {
      setGenerateHistoryLoading(false);
      setGenerateHistoryLoadingMore(false);
    }
  };

  const openGenerateHistory = () => {
    setShowGenerateHistory(true);

    if (!generateHistoryHasLoaded) {
      setGenerateHistoryHasLoaded(true);
      fetchGenerateHistory(1, false);
    }
  };

  const hideGenerateHistory = () => {
    setShowGenerateHistory(false);
  };

  const loadMoreGenerateHistory = () => {
    if (!generateHistoryHasMore || generateHistoryLoadingMore) return;
    fetchGenerateHistory(generateHistoryPage + 1, true);
  };

  const openGenerateHistoryItem = (item) => {
    if (!item?.result) return;
    setGenerateResult(item.result);
    setEditedText(item.result.text || "");
    setEditedImagePrompt(item.result.image_prompt || "");
    setGenerateError("");
    setShowGenerateHistory(false);
  };

  const deleteGenerateHistoryItem = async (id) => {
    if (generateHistoryMutationLoading) return;

    setGenerateHistoryMutationLoading(true);
    setGenerateHistoryError("");

    try {
      await SmmApi.deleteGenerateHistoryItem(id);
      setGenerateHistoryData((prev) => prev.filter((item) => String(item.id) !== String(id)));
      setGenerateHistoryUsingMock(false);
    } catch (error) {
      if (isConnectionErrorMessage(error?.message || "")) {
        setGenerateHistoryUsingMock(true);
        setGenerateHistoryData((prev) => prev.filter((item) => String(item.id) !== String(id)));
      } else {
        setGenerateHistoryError(error.message || "Не удалось удалить запись истории генераций.");
      }
    } finally {
      setGenerateHistoryMutationLoading(false);
    }
  };

  const clearGenerateHistory = async () => {
    if (generateHistoryMutationLoading) return;

    setGenerateHistoryMutationLoading(true);
    setGenerateHistoryError("");

    try {
      await SmmApi.clearGenerateHistory();
      setGenerateHistoryData([]);
      setGenerateHistoryHasMore(false);
      setGenerateHistoryUsingMock(false);
    } catch (error) {
      if (isConnectionErrorMessage(error?.message || "")) {
        setGenerateHistoryUsingMock(true);
        setGenerateHistoryData([]);
        setGenerateHistoryHasMore(false);
      } else {
        setGenerateHistoryError(error.message || "Не удалось очистить историю генераций.");
      }
    } finally {
      setGenerateHistoryMutationLoading(false);
    }
  };

  const handleAnalyzeSubmit = async (event) => {
    event.preventDefault();
    setShowAnalyzeHistory(false);
    setAnalyzeError("");

    const dateFrom = String(analyzeForm.date_from || "").trim();
    const dateTo = String(analyzeForm.date_to || "").trim();
    if (dateFrom && dateTo && dateFrom > dateTo) {
      setAnalyzeError("Дата начала периода не может быть позже даты окончания.");
      return;
    }

    setAnalyzeLoading(true);

    try {
      const payload = {
        source: analyzeForm.source.trim(),
        post_limit: Number(analyzeForm.post_limit) || 30,
        language: analyzeForm.language,
      };
      if (dateFrom) payload.date_from = dateFrom;
      if (dateTo) payload.date_to = dateTo;

      const data = await SmmApi.analyzeGroup(payload);

      setAnalyzeResult(data);
    } catch (error) {
      const message = error?.message || "";

      if (isConnectionErrorMessage(message)) {
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
    setShowGenerateHistory(false);
    setGenerateError("");
    setPublishError("");
    setPublishSuccess("");
    setRegenerateImageError("");
    setGenerateLoading(true);

    try {
      const payload = {
        prompt: generateForm.prompt.trim(),
        theme: generateForm.theme.trim() || null,
        tone: generateForm.tone.trim() || null,
        content_type: String(generateForm.content_type || "text"),
        publish: Boolean(generateForm.publish),
        length: String(generateForm.length || "medium"),
        language: String(generateForm.language || "ru"),
      };
      const data = await SmmApi.generatePost(payload);

      setGenerateResult(data);
      setEditedText(data.text || "");
      setEditedImagePrompt(data.image_prompt || "");
    } catch (error) {
      const message = error?.message || "";

      if (isConnectionErrorMessage(message)) {
        const fallbackResult = {
          ...mockGenerateResult,
          content_type:
            generateForm.content_type === "image"
              ? "image"
              : mockGenerateResult.content_type,
        };

        setGenerateResult(fallbackResult);
        setEditedText(fallbackResult.text || "");
        setEditedImagePrompt(fallbackResult.image_prompt || "");
        setGenerateError(
          "Бэкенд недоступен, поэтому показан демонстрационный результат. Как только API снова станет доступен, будет использоваться реальный ответ сервера."
        );
      } else {
        setGenerateError(error.message);
        setGenerateResult(null);
      }
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
              mock_image_data_url: "",
            }
          : prev
      );
    } catch (error) {
      const message = error?.message || "";

      const isConnectionError =
        message.includes("ERR_CONNECTION_REFUSED") ||
        message.includes("Network Error") ||
        message.includes("Failed to fetch") ||
        message.includes("fetch");

      if (isConnectionError) {
        setGenerateResult((prev) =>
          prev
            ? {
                ...prev,
                image_prompt: editedImagePrompt.trim() || prev.image_prompt,
                mock_image_data_url: createMockImageSvgDataUrl(),
              }
            : prev
        );
        setRegenerateImageError(
          "Сервер недоступен, поэтому показано демонстрационное изображение."
        );
      } else {
        setRegenerateImageError(error.message);
      }
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
      const messageText = error?.message || "";

      const isConnectionError =
        messageText.includes("ERR_CONNECTION_REFUSED") ||
        messageText.includes("Network Error") ||
        messageText.includes("Failed to fetch") ||
        messageText.includes("fetch");

      if (isConnectionError) {
        setGenerateResult((prev) =>
          prev
            ? {
                ...prev,
                text: message,
                published: true,
              }
            : prev
        );
        setPublishSuccess(
          "Сервер недоступен, поэтому публикация показана в демонстрационном режиме."
        );
      } else {
        setPublishError(error.message);
      }
    } finally {
      setPublishLoading(false);
    }
  };

  const handleCopyText = async () => {
    const text = editedText.trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setPublishSuccess("Текст скопирован в буфер обмена.");
      setPublishError("");
    } catch {
      setPublishError("Не удалось скопировать текст.");
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
  const hasHistoryItems = historyData.length > 0;
  const hasGenerateHistoryItems = generateHistoryData.length > 0;
  const groupTitle =
    analyzeResult?.group_name ||
    analyzeResult?.title ||
    analyzeForm.source ||
    "VK-группа";

  const knowledgeMatches =
    generateResult?.knowledge_matches?.length
      ? generateResult.knowledge_matches
      : mockGenerateKnowledgeMaterials;

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <div className="pt-24 lg:pt-28 px-6 lg:px-12 max-w-screen-2xl mx-auto pb-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          <div className={mainColSpanClass}>
            {mode === "analyze" ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start overflow-visible">
                <div className="xl:col-span-9">
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
                      <div className="font-semibold text-2xl">Фильтры анализа</div>
                    </div>
                    <span
                      className={`text-neutral-500 text-sm transition-transform duration-300 ${
                        isFiltersOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  <div
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      isFiltersOpen
                        ? "mt-4 max-h-105 opacity-100"
                        : "mt-0 max-h-0 opacity-0"
                    }`}
                  >
                    <div className="px-5 pb-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-base text-neutral-400 mb-2">
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
                            className="w-full h-12.5 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-base text-neutral-400 mb-2">
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

                        <div className="sm:col-span-2">
                          <label className="block text-base text-neutral-400 mb-2">
                            Период постов
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-base text-neutral-500 mb-2">
                                С
                              </label>
                              <input
                                type="date"
                                value={analyzeForm.date_from}
                                onChange={(e) =>
                                  setAnalyzeForm((prev) => ({
                                    ...prev,
                                    date_from: e.target.value,
                                  }))
                                }
                                className="w-full h-12.5 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-base text-neutral-500 mb-2">
                                По
                              </label>
                              <input
                                type="date"
                                value={analyzeForm.date_to}
                                onChange={(e) =>
                                  setAnalyzeForm((prev) => ({
                                    ...prev,
                                    date_to: e.target.value,
                                  }))
                                }
                                className="w-full h-12.5 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                <div className="xl:col-span-3">
                  <button
                    type="button"
                    onClick={() => setMode("generate")}
                    className="w-full h-14 rounded-3xl bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-3"
                  >
                    <Wand2 className="w-5 h-5" />
                    <span className="font-medium">Генерация контента</span>
                  </button>
                </div>

                <div className="xl:col-span-12 w-full">
                  <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 lg:p-10 overflow-y-auto flex flex-col">
                    <h2 className="text-2xl font-semibold">Анализ VK-группы</h2>
                    <p className="mt-2 text-neutral-400 text-base">
                      Введите ссылку или идентификатор группы, затем получите
                      разбор метрик, рекомендаций и конкурентов.
                    </p>

                    <form onSubmit={handleAnalyzeSubmit} className="mt-6 space-y-4">
                      <div>
                        <label className="block text-base text-neutral-400 mb-2">
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
                            onClick={showAnalyzeHistory ? hideAnalyzeHistory : openAnalyzeHistory}
                            className="px-6 py-4 rounded-2xl font-medium border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                          >
                            <History className="w-4 h-4" />
                            {showAnalyzeHistory ? "Скрыть историю" : "История"}
                          </button>
                        </div>
                      </div>
                    </form>

                    {showAnalyzeHistory ? (
                      <div className="mt-8 space-y-5">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <h3 className="text-3xl font-semibold">История анализов</h3>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={clearAnalyzeHistory}
                              disabled={historyMutationLoading || historyLoading || !hasHistoryItems}
                              className="px-5 py-2 rounded-2xl border border-neutral-700 text-neutral-200 hover:border-red-500/50 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                            >
                              Очистить историю
                            </button>
                          </div>
                        </div>

                        {historyUsingMock && (
                          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
                            Бэкенд недоступен, поэтому показаны демонстрационные данные истории.
                          </div>
                        )}

                        {historyError && (
                          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                            {historyError}
                          </div>
                        )}

                        {historyLoading && !hasHistoryItems ? (
                          <div className="py-16 flex flex-col items-center justify-center text-neutral-500">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p>Загружаем историю анализов...</p>
                          </div>
                        ) : !historyError && !hasHistoryItems ? (
                          <div className="py-16 border border-dashed border-neutral-700 rounded-2xl text-center text-neutral-500">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">История анализов пока пуста</p>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                              {historyData.map((item, index) => {
                                const itemTitle =
                                  item?.source?.name ||
                                  item?.result?.group_name ||
                                  item?.group_name ||
                                  "VK-группа";
                                const itemHandle =
                                  item?.source?.handle ||
                                  item?.source?.screen_name ||
                                  item?.screen_name ||
                                  "";
                                const itemSummary =
                                  item?.ai?.summary ||
                                  item?.result?.ai?.summary ||
                                  "Сводка недоступна.";

                                return (
                                  <div
                                    key={`${item.id || "history"}-${index}`}
                                    className="bg-dark-800 border border-neutral-800 rounded-3xl p-5"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <div className="text-2xl font-semibold text-white leading-snug">
                                          {itemTitle}
                                        </div>
                                        <div className="mt-1 text-neutral-400">
                                          {itemHandle || "-"} · {formatHistoryDateTime(item.created_at)}
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => deleteAnalyzeHistoryItem(item.id)}
                                        disabled={historyMutationLoading}
                                        className="px-4 py-2 rounded-2xl border border-red-500/30 text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                      >
                                        Удалить
                                      </button>
                                    </div>

                                    <div className="mt-4 text-neutral-300 text-sm">
                                      Постов: {formatNumber(item?.metrics?.total_posts_analyzed || 0)} · Лайки:{" "}
                                      {formatNumber(item?.metrics?.average_likes || 0)} · Комм.:{" "}
                                      {formatNumber(item?.metrics?.average_comments || 0)}
                                    </div>

                                    <div className="mt-3 text-neutral-200 text-sm leading-relaxed">
                                      {itemSummary}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => openAnalyzeHistoryItem(item)}
                                      className="mt-5 px-5 py-2 rounded-2xl bg-red-600 hover:bg-red-500 transition-colors inline-flex items-center gap-2"
                                    >
                                      Открыть результат
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {hasMore && !historyUsingMock && (
                              <div className="flex justify-center pt-2">
                                <button
                                  type="button"
                                  onClick={loadMoreAnalyzeHistory}
                                  disabled={loadingMore}
                                  className="px-8 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                                >
                                  {loadingMore ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      Загрузка...
                                    </>
                                  ) : (
                                    "Загрузить ещё"
                                  )}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <>
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

                          <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1 custom-scroll">
                            {assistantMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`rounded-2xl px-4 py-3 text-base ${
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
                            <div className="flex-1 w-full">
                              <label className="block text-base text-neutral-400 mb-2">
                                Введите вопрос по улучшению
                              </label>
                              <textarea
                                value={improvementQuestion}
                                onChange={(e) => setImprovementQuestion(e.target.value)}
                                rows={4}
                                placeholder="Введите вопрос по улучшению"
                                className="w-full bg-neutral-900 border border-neutral-700 focus:border-red-500 rounded-2xl px-6 py-4 text-white text-lg placeholder:text-neutral-500 resize-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleImprovementQuestion}
                              className="bg-red-600 hover:bg-red-500 px-10 py-4 rounded-2xl font-medium transition-colors whitespace-nowrap min-w-45"
                            >
                              Отправить
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      !analyzeError && (
                        <div className="mt-8 border border-dashed border-neutral-700 rounded-2xl p-8 text-center text-neutral-500 flex-1 flex items-center justify-center min-h-105">
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 gap-6 h-full ${
                  isKnowledgeExpanded
                    ? "xl:grid-cols-[9fr_4fr] xl:items-start"
                    : "xl:grid-cols-12"
                }`}
              >
                <div
                  className={`h-full ${
                    !isKnowledgeExpanded
                      ? "xl:col-span-2 xl:row-span-2"
                      : "xl:col-span-1"
                  }`}
                >
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
                        className="p-6 lg:p-7 flex-1 flex flex-col min-h-195"
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
                                <div className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
                                  Текст
                                </div>
                                <textarea
                                  value={knowledgeText}
                                  onChange={(e) => setKnowledgeText(e.target.value)}
                                  rows={8}
                                  placeholder="Правила, шаблоны, ограничения..."
                                  className="w-full bg-dark-700 border border-neutral-800 focus:border-red-500 rounded-[26px] px-6 py-5 text-white placeholder:text-neutral-600 resize-none"
                                />
                                <button
                                  type="button"
                                  onClick={handleKnowledgeSave}
                                  className="mt-5 w-full h-16 rounded-3xl bg-red-600 hover:bg-red-500 text-white text-xl lg:text-2xl font-semibold transition-colors"
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
                                <div className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
                                  Ссылка
                                </div>
                                <input
                                  value={knowledgeLink}
                                  onChange={(e) => setKnowledgeLink(e.target.value)}
                                  placeholder="https://example.com/article"
                                  className="w-full h-15 bg-dark-700 border border-neutral-800 focus:border-red-500 rounded-[22px] px-5 text-white placeholder:text-neutral-600"
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
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-red-500/50 rounded-[26px] py-12 px-6 cursor-pointer transition-colors bg-dark-700">
                                  <Upload className="w-12 h-12 text-neutral-500 mb-4" />
                                  <p className="text-sm text-neutral-400 text-center">
                                    Перетащите файлы сюда
                                    <br />
                                    или нажмите для выбора
                                  </p>
                                  <p className="text-sm text-neutral-500 mt-3">
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
                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-700 hover:border-red-500/50 rounded-[26px] py-12 px-6 cursor-pointer transition-colors bg-dark-700">
                                  <Image className="w-12 h-12 text-neutral-500 mb-4" />
                                  <p className="text-sm text-neutral-400 text-center">
                                    Загрузите изображение в базу знаний
                                  </p>
                                  <p className="text-sm text-neutral-500 mt-3">
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
                        <span className="text-sm text-neutral-400">
                          База знаний
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`flex flex-col gap-4 h-full ${
                    !isKnowledgeExpanded
                      ? "xl:col-span-7"
                      : "xl:col-span-1 xl:min-w-0 xl:self-stretch"
                  }`}
                >
                  <div
                    className={
                      isKnowledgeExpanded
                        ? "xl:grid xl:grid-cols-[3fr_1fr] xl:gap-4 xl:items-start"
                        : ""
                    }
                  >
                    <GenerateFiltersPanel
                      isKnowledgeExpanded={isKnowledgeExpanded}
                      isGenerateFiltersOpen={isGenerateFiltersOpen}
                      onToggleFilters={() =>
                        setIsGenerateFiltersOpen((prev) => !prev)
                      }
                      generateForm={generateForm}
                      setGenerateForm={setGenerateForm}
                      contentTypeOptions={contentTypeOptions}
                      lengthOptions={lengthOptions}
                      languageOptions={languageOptions}
                    />

                    {isKnowledgeExpanded && (
                      <div className="hidden xl:block">
                        <button
                          type="button"
                          onClick={() => setMode("analyze")}
                          className="w-full h-28.75 rounded-3xl bg-red-600 hover:bg-red-500 transition-all p-5 flex flex-col items-center justify-center gap-2"
                        >
                          <Bot className="w-8 h-8 text-white transition-transform" />
                          <div className="text-sm font-medium text-white text-center leading-tight">
                            Анализ
                            <br />
                            VK-групп
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {isKnowledgeExpanded && (
                    <div className="flex-1 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl flex flex-col overflow-hidden min-h-50">
                      <div className="group flex-1 p-6 flex flex-col items-center justify-center gap-4 hover:bg-neutral-800/70 transition-all rounded-3xl">
                        <Image className="w-14 h-14 text-red-400 group-hover:scale-110 transition-transform" />
                        <div className="text-sm font-semibold text-neutral-200 text-center">
                          Генерация контента
                        </div>
                        <div className="text-sm text-neutral-500 text-center max-w-40">
                          Промпт + генерация поста
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {!isKnowledgeExpanded && (
                  <div className="xl:col-span-3">
                    <button
                      type="button"
                      onClick={() => setMode("analyze")}
                      className="w-full h-14 py-4 rounded-3xl bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-3"
                    >
                      <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Анализ VK-групп</span>
                    </button>
                  </div>
                )}

                {!isKnowledgeExpanded && (
                  <div className="xl:col-span-10">
                    <div className="flex-1 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl flex flex-col overflow-hidden">
                      <div className="p-6 flex flex-col flex-1 overflow-y-auto">
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
                              onClick={showGenerateHistory ? hideGenerateHistory : openGenerateHistory}
                              className="flex-1 border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 px-6 py-3 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <History className="w-4 h-4" />
                              {showGenerateHistory ? "Скрыть историю" : "История"}
                            </button>
                          </div>
                        </form>

                        {showGenerateHistory ? (
                          <div className="mt-6 space-y-5">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <h3 className="text-3xl font-semibold">История генераций</h3>
                              <button
                                type="button"
                                onClick={clearGenerateHistory}
                                disabled={
                                  generateHistoryMutationLoading ||
                                  generateHistoryLoading ||
                                  !hasGenerateHistoryItems
                                }
                                className="px-5 py-2 rounded-2xl border border-neutral-700 text-neutral-200 hover:border-red-500/50 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                              >
                                Очистить историю
                              </button>
                            </div>

                            {generateHistoryUsingMock && (
                              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200 text-sm">
                                Бэкенд недоступен, поэтому показаны демонстрационные данные истории.
                              </div>
                            )}

                            {generateHistoryError && (
                              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                                {generateHistoryError}
                              </div>
                            )}

                            {generateHistoryLoading && !hasGenerateHistoryItems ? (
                              <div className="py-16 flex flex-col items-center justify-center text-neutral-500">
                                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                                <p>Загружаем историю генераций...</p>
                              </div>
                            ) : !generateHistoryError && !hasGenerateHistoryItems ? (
                              <div className="py-16 border border-dashed border-neutral-700 rounded-2xl text-center text-neutral-500">
                                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg">История генераций пока пуста</p>
                              </div>
                            ) : (
                              <>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                  {generateHistoryData.map((item, index) => {
                                    const itemResult = item?.result || {};
                                    const itemText = String(itemResult.text || "").trim();
                                    const prompt = String(item?.prompt || "").trim();
                                    const contentType = String(
                                      item?.content_type || itemResult.content_type || "text",
                                    );
                                    const contentTypeLabel =
                                      contentTypeOptions.find((option) => option.value === contentType)
                                        ?.label || "Текст";
                                    const preview = itemText || "Содержимое генерации отсутствует.";
                                    const charCount = itemText.length;
                                    const wordCount = itemText
                                      ? itemText.split(/\s+/).filter(Boolean).length
                                      : 0;

                                    return (
                                      <div
                                        key={`${item.id || "generate-history"}-${index}`}
                                        className="bg-dark-800 border border-neutral-800 rounded-3xl p-5"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <div>
                                            <div className="text-2xl font-semibold text-white leading-snug">
                                              {prompt || "Сгенерированный контент"}
                                            </div>
                                            <div className="mt-1 text-neutral-400">
                                              {formatHistoryDateTime(item.created_at)} · {contentTypeLabel}
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => deleteGenerateHistoryItem(item.id)}
                                            disabled={generateHistoryMutationLoading}
                                            className="px-4 py-2 rounded-2xl border border-red-500/30 text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                          >
                                            Удалить
                                          </button>
                                        </div>

                                        <div className="mt-3 text-neutral-300 text-sm">
                                          Символов: {charCount} · Слов: {wordCount}
                                        </div>

                                        <div className="mt-3 text-neutral-200 text-sm leading-relaxed line-clamp-4">
                                          {preview}
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => openGenerateHistoryItem(item)}
                                          className="mt-5 px-5 py-2 rounded-2xl bg-red-600 hover:bg-red-500 transition-colors inline-flex items-center gap-2"
                                        >
                                          Открыть
                                          <ArrowRight className="w-4 h-4" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>

                                {generateHistoryHasMore && !generateHistoryUsingMock && (
                                  <div className="flex justify-center pt-2">
                                    <button
                                      type="button"
                                      onClick={loadMoreGenerateHistory}
                                      disabled={generateHistoryLoadingMore}
                                      className="px-8 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                                    >
                                      {generateHistoryLoadingMore ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin" />
                                          Загрузка...
                                        </>
                                      ) : (
                                        "Загрузить ещё"
                                      )}
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <GenerateResultPanel
                            generateResult={generateResult}
                            generateLoading={generateLoading}
                            generateError={generateError}
                            contentTypeOptions={contentTypeOptions}
                            editedText={editedText}
                            setEditedText={setEditedText}
                            onCopyText={handleCopyText}
                            onPublish={handlePublish}
                            publishLoading={publishLoading}
                            publishError={publishError}
                            publishSuccess={publishSuccess}
                            imageDataUrl={imageDataUrl}
                            editedImagePrompt={editedImagePrompt}
                            setEditedImagePrompt={setEditedImagePrompt}
                            onRegenerateImage={handleRegenerateImage}
                            regenerateImageLoading={regenerateImageLoading}
                            regenerateImageError={regenerateImageError}
                            knowledgeMatches={knowledgeMatches}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
                      className="group bg-red-600 hover:bg-red-500 transition-all rounded-3xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer min-h-23"
                    >
                      <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      <div className="text-sm font-medium text-white text-center">
                        Анализ
                        <br />
                        VK-групп
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setMode("analyze")}
                      className="w-full h-14 py-4 rounded-3xl bg-red-600 hover:bg-red-500 transition-colors flex items-center justify-center gap-3"
                    >
                      <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Анализ VK-групп</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFileListModal &&
        createPortal(
          <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                      <div className="text-sm text-neutral-500 mt-1">
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
