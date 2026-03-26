import { useState, useEffect, useRef } from "react";
import {
  X,
  MessageCircle,
  Send,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  History,
} from "lucide-react";
import Header from "./layout/Header";

const MOCK_CONTENT_HISTORY = [
  {
    id: "hist-1",
    title: "Генерация для diocon.ru",
    createdAt: "26.03.2026, 14:22",
    status: "Готово",
    messages: [
      {
        id: "h1-m1",
        role: "user",
        text: "Подготовь SEO-текст для страницы услуг по автоматизации 1С.",
      },
      {
        id: "h1-m2",
        role: "assistant",
        text: "Сгенерировал структуру с H1, meta title, description и блоком преимуществ компании.",
      },
      {
        id: "h1-m3",
        role: "assistant",
        text: "Добавил рекомендации по размещению контента и alt-теги для изображений.",
      },
    ],
  },
  {
    id: "hist-2",
    title: "Генерация для bitrix-проекта",
    createdAt: "25.03.2026, 18:09",
    status: "Выполнено",
    messages: [
      {
        id: "h2-m1",
        role: "user",
        text: "Нужен вариант контента для главной страницы с акцентом на внедрение 1С ERP.",
      },
      {
        id: "h2-m2",
        role: "assistant",
        text: "Готово. Подготовил продающий блок, FAQ и описание кейсов внедрения.",
      },
    ],
  },
];

export default function PromotionPage() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState(null);
  const [aiContent, setAiContent] = useState(null);
  const [showAiContent, setShowAiContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "Анализ сайта завершён. Чем я могу помочь с продвижением?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const seoCircleRef = useRef(null);
  const perfCircleRef = useRef(null);

  // ==================== Анализ сайта ====================
  const handleAnalyze = () => {
    if (!url.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const mockData = {
        url: "http://www.diocon.ru",
        analyst_result: {
          specialization: {
            specialization:
              "Внедрение и сопровождение программных продуктов «1С», консалтинг и автоматизация бизнес-процессов",
          },
          expertise: {
            main_area:
              "Внедрение комплексных корпоративных решений на основе программных продуктов '1С'",
            key_user_problem:
              "Автоматизация бизнес-процессов и управление корпоративной информационной системой",
            benefit_to_the_user:
              "Комплексная автоматизация деятельности, включая бухгалтерский и налоговый учёт, управление персоналом, документооборот и другие функциональные области",
          },
          semantic_core: {
            high_frequency: ["1с", "1с:предприятие"],
            medium_frequency: [
              "1с документооборот первый бит",
              "внедрение 1с первый бит",
              "обновление 1с первый бит",
              "1с первый бит",
              "цена 1с бухгалтерия базовая",
              "1с бухгалтерия цена",
              "первый бит",
              "1с управление торговлей",
            ],
            low_frequency: [
              "отзывы о первом бите",
              "переход на 1с с первого бита",
              "1с отчетность первый бит",
              "аренда 1с в облаке первый бит",
              "купить 1с в первом бите",
              "1с комплексная автоматизация первый бит",
              "курсы 1с первый бит",
              "обслуживание 1с первый бит",
            ],
          },
        },
        seo_result: {
          overall_summary:
            "Сайт требует оптимизации как в плане производительности, так и SEO. Основные проблемы связаны с медленной загрузкой страниц и отсутствием атрибутов alt у изображений.",
          sitemap_analysis:
            "На сайте представлена структурированная информация о компании, услугах, программах и контактах. Однако есть повторяющиеся разделы и ссылки, что может усложнить навигацию для пользователей.",
          content_analysis:
            "Анализ markdown и HTML показывает наличие избыточного количества H1 тегов и отсутствие атрибутов alt у изображений. Также обнаружены проблемы с заголовком и описанием страницы.",
          core_web_vitals_analysis:
            "Основные показатели производительности сайта (FCP и LCP) находятся в категории 'SLOW', что указывает на необходимость оптимизации времени загрузки страниц. Показатель CLS находится в категории 'FAST'.",
          issues: [
            {
              title: "Медленная загрузка страниц",
              description:
                "Время до первого содержательного отображения (FCP) и время загрузки основного контента (LCP) слишком велики.",
              severity: "critical",
              recommendation:
                "Оптимизировать серверную обработку и уменьшить размер ресурсов для ускорения загрузки страниц.",
            },
            {
              title: "Отсутствие атрибутов alt у изображений",
              description:
                "Множество изображений на сайте не имеют атрибутов alt, что ухудшает доступность и SEO.",
              severity: "high",
              recommendation:
                "Добавить атрибуты alt ко всем изображениям на сайте.",
            },
            {
              title: "Слишком короткий заголовок страницы",
              description:
                "Заголовок страницы слишком короткий и не содержит достаточно информации для поисковых систем.",
              severity: "medium",
              recommendation:
                "Расширить заголовок страницы, включив в него ключевые слова и описание услуг.",
            },
            {
              title: "Слишком длинное мета-описание",
              description:
                "Мета-описание страницы слишком длинное, что может привести к его усечению в результатах поиска.",
              severity: "medium",
              recommendation:
                "Сократить мета-описание до рекомендуемой длины 120-160 символов.",
            },
          ],
          recommendations: [
            "Оптимизировать серверную обработку для улучшения времени ответа сервера.",
            "Добавить атрибуты alt ко всем изображениям.",
            "Сократить время до первого содержательного отображения и загрузки основного контента.",
          ],
          seo: { score: 83 },
          performance: { score: 57, lcp: 13.5, fid: null, cls: 0.0 },
        },
        conent_generation_result: {
          title: "Автоматизация бизнес-процессов на базе 1С | ДИО-Консалт",
          description:
            "«ДИО-Консалт» предлагает комплексные решения для автоматизации бизнес-процессов на базе «1С». Получите профессиональную поддержку и консультации. Узнайте больше и заказывайте услуги прямо сейчас!",
          h1: "Комплексные решения и услуги по автоматизации 1С",
          alt_tags: [
            [
              {
                alt: "Кран и станки на производственной площадке",
                url: "http://www.diocon.ru/upload/iblock/7b3/7b3fca9fc102d3be03d93b0e30dc05f8.jpg",
              },
              {
                alt: "Логотип и название птицефабрики 'Боровская'",
                url: "http://www.diocon.ru/upload/iblock/91c/91c177a23f0ebf5e4ae1b2f80bb5d0c4.png",
              },
              {
                alt: "Промышленный объект, трубы и факел",
                url: "http://www.diocon.ru/upload/iblock/82a/82a3f5a8540b3ed99a0808f24c929150.jpg",
              },
            ],
          ],
        },
        total_tokens: 139676,
        total_money: 86.4512,
      };

      setContent(mockData);
      setAiContent(null);
      setShowAiContent(false);
      setLoading(false);
    }, 900);
  };

  // ==================== Генерация AI контента ====================
  const generateAIContent = () => {
    if (!content) return;
    setAiGenerating(true);

    setTimeout(() => {
      const aiMock = {
        transformed_content: `# ДИО‑Консалт – комплексные решения на базе 1С

**Что решаем:**
- Автоматизация бухгалтерского и налогового учёта;
- Внедрение и сопровождение информационных систем 1С любой сложности;
- Обеспечение качества и соответствия ISO 9001:2015.

> По данным исследования Gartner (2023), более 70 % компаний среднего роста повышают эффективность за счёт автоматизации на платформах 1С.

---

## Навигация (для боковой панели)
- **О компании**
 - [История](/company/history/)
 - [Команда](/company/team/)
 - [Вакансии](/company/vacancies/)
 - [Сертификаты](/company/certificates/)
 - [Система качества](/company/sistema-kachestva/sistema-kachestva.php/)
 - [Партнеры](/company/partners/)
 - [Новости](/company/news/)
 - [Реальная автоматизация](/company/realnaya-avtomatizatsiya/)
- **Услуги**
 - [Консалтинг и автоматизация](/services/consulting/)
 - [Сопровождение 1C](/services/maintenance_1c/)
 - [Обучение 1С](/services/learning/)
- **Программы**
 - [Программные продукты 1C](/programs/programmnye-produkty-1c/)
 - [Телефония МИКО](/programs/panel-telefonii-dlya-1c/)
 - [Продукты АСКОН](/programs/programmnye-produkty-askon/)
 - [VMI](/programs/VMI/)
 - [DataMobile](/programs/datamobile/)
- **Контакты** – [Контакты](/contacts/)

---

## Услуги компании

### Сопровождение 1C
- **Настройка 1С**, **Поддержка 1С**, **Удалённое сопровождение**, **Обновление**, **Установка**, **ЭДО**, **Отчётность**, **ИТС**

### Консалтинг и автоматизация
- Управление документооборотом, бюджетирование, бухгалтерский учёт, кадровый учёт и др.

### Обучение 1C
- Курсы и сертификационные программы

---

## Программные продукты 1C
(список продуктов + сравнительная таблица)

---

## Система качества и сертификаты
В 2022 году прошла сертификацию ISO 9001:2015.

---

## Часто задаваемые вопросы (FAQ)
**Q1:** Какие услуги включает сопровождение 1C?  
**A:** ...`,

        placement_recommendation:
          "1. H1‑заголовок разместить в верхней части страницы...\n2. Блок «Что решаем» под H1...\n3. Навигацию — в левом сайдбаре...\n... (полные рекомендации по размещению)",

        json_ld: `{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "ДИО-Консалт",\n  "address": { ... }\n}`,

        robots_txt: `# Общие правила для всех ботов\nUser-Agent: *\nDisallow: /bitrix/\n...`,

        llms_txt: `# «ДИО-Консалт»\n> Компания специализируется на внедрении комплексных решений на базе 1С...`,

        total_tokens: 27203,
        total_money: 8.8719,
      };

      setAiContent(aiMock);
      setShowAiContent(true);
      setAiGenerating(false);
    }, 1300);
  };

  // Анимация кругов
  useEffect(() => {
    if (!content || showAiContent) return;

    const animateCircle = (ref, score) => {
      if (!ref.current) return;
      const circle = ref.current.querySelector("circle:last-child");
      if (!circle) return;
      circle.style.transition = "none";
      circle.style.strokeDasharray = "0 100";
      void circle.offsetWidth;
      circle.style.transition = "stroke-dasharray 1.8s ease-in-out";
      circle.style.strokeDasharray = `${score} 100`;
    };

    setTimeout(() => {
      animateCircle(seoCircleRef, content.seo_result.seo.score);
      animateCircle(perfCircleRef, content.seo_result.performance.score);
    }, 300);
  }, [content, showAiContent]);

  const getScoreColor = (score) => {
    if (score >= 65) return "#10b981";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  const getSeverityColor = (severity) => {
    if (severity === "critical")
      return "bg-red-500/20 text-red-400 border-red-500/30";
    if (severity === "high")
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    const userMessage = {
      id: Date.now(),
      type: "user",
      text: inputMessage.trim(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "ai",
          text: "Спасибо за вопрос! Я готов помочь с текстами, заголовками и стратегией продвижения.",
        },
      ]);
    }, 700);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  // Динамический текст основной кнопки
  const getMainButtonText = () => {
    if (aiGenerating) return "Генерируем AI-контент...";
    if (!aiContent) return "Сгенерировать AI контент";
    return showAiContent ? "← Вернуться к SEO отчёту" : "Посмотреть AI контент";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col pt-24 lg:pt-28 px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Левая колонка */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Ввод URL / Переключение истории */}
            <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 shrink-0">
                {!showHistory && (
                <>
                  <p className="text-neutral-400 text-sm mb-4">
                    Введите URL сайта для анализа
                  </p>
                  <div className="flex gap-4 max-[1024px]:flex-wrap">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="flex-1 min-w-0 bg-[#0f0f0f] border border-neutral-700 focus:border-red-500 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-500 focus:outline-none transition-all max-[1024px]:basis-full"
                    />
                    <button
                      onClick={handleAnalyze}
                      disabled={!url.trim() || loading}
                      className="bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 disabled:cursor-not-allowed px-10 py-4 rounded-2xl font-medium transition-colors whitespace-nowrap max-[1024px]:w-full"
                    >
                      {loading ? "Анализируем..." : "Анализировать"}
                    </button>
                    <button
                      onClick={toggleHistory}
                      className="px-6 py-4 rounded-2xl font-medium border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 transition-colors whitespace-nowrap flex items-center justify-center gap-2 max-[1024px]:w-full"
                    >
                      <History className="w-4 h-4" />
                      Посмотреть историю
                    </button>
                  </div>
                </>
              )}

              {showHistory && (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-neutral-400 text-sm">
                    В режиме истории доступны прошлые генерации контента
                  </p>
                  <button
                    onClick={toggleHistory}
                    className="px-6 py-3 rounded-2xl font-medium border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 transition-colors whitespace-nowrap"
                  >
                    Вернуться к анализу
                  </button>
                </div>
              )}              
            </div>

            {/* Основной контент */}
            <div className="flex-1 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 lg:p-10 overflow-auto">
              {showHistory ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <History className="text-red-400" /> История генераций
                    </h2>
                  </div>

                  {MOCK_CONTENT_HISTORY.map((historyItem) => (
                    <div
                      key={historyItem.id}
                      className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 space-y-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-lg">{historyItem.title}</div>
                          <div className="text-sm text-neutral-500 mt-1">
                            {historyItem.createdAt}
                          </div>
                        </div>
                        <div className="text-xs px-3 py-1.5 rounded-2xl border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
                          {historyItem.status}
                        </div>
                      </div>

                      <div className="space-y-3">
                        {historyItem.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm ${message.role === "user" ? "bg-red-600 text-white" : "bg-neutral-800 text-neutral-200"}`}
                            >
                              {message.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !content ? (
                <div className="h-full flex items-center justify-center text-neutral-500 text-center">
                  После анализа сайта здесь появится детальный отчёт с графиками
                </div>
              ) : showAiContent && aiContent ? (
                /* ==================== AI КОНТЕНТ ==================== */
                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <CheckCircle className="text-emerald-400" />{" "}
                      Сгенерированный AI-контент
                    </h2>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-10 text-neutral-200 leading-relaxed whitespace-pre-wrap">
                      {aiContent.transformed_content}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Рекомендации по размещению
                    </h3>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 text-neutral-300 whitespace-pre-wrap">
                      {aiContent.placement_recommendation}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6">
                      <div className="uppercase text-xs tracking-widest text-neutral-500 mb-3">
                        JSON-LD
                      </div>
                      <pre className="text-xs text-neutral-400 overflow-auto bg-black/50 p-4 rounded-2xl">
                        {aiContent.json_ld}
                      </pre>
                    </div>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6">
                      <div className="uppercase text-xs tracking-widest text-neutral-500 mb-3">
                        robots.txt
                      </div>
                      <pre className="text-xs text-neutral-400 overflow-auto bg-black/50 p-4 rounded-2xl">
                        {aiContent.robots_txt}
                      </pre>
                    </div>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6">
                      <div className="uppercase text-xs tracking-widest text-neutral-500 mb-3">
                        llms.txt
                      </div>
                      <pre className="text-xs text-neutral-400 overflow-auto bg-black/50 p-4 rounded-2xl">
                        {aiContent.llms_txt}
                      </pre>
                    </div>
                  </div>

                  <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 flex justify-between items-center">
                    <div>
                      <div className="text-sm text-neutral-400">
                        Стоимость генерации
                      </div>
                      <div className="text-3xl font-bold text-emerald-400">
                        {aiContent.total_money.toFixed(2)} ₽
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-neutral-400">
                        Использовано токенов
                      </div>
                      <div className="text-3xl font-bold">
                        {aiContent.total_tokens.toLocaleString("ru-RU")}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ==================== SEO ОТЧЁТ ==================== */
                <div className="space-y-16">
                  {/* Общие оценки */}
                  <div>
                    <h3 className="text-xl font-semibold mb-8 flex items-center gap-3">
                      <TrendingUp className="text-red-400" /> Общие оценки сайта
                    </h3>
                    <div className="grid grid-cols-2 gap-10">
                      <div
                        className="flex flex-col items-center"
                        ref={seoCircleRef}
                      >
                        <div className="relative w-44 h-44">
                          <svg
                            className="w-full h-full -rotate-90"
                            viewBox="0 0 42 42"
                          >
                            <circle
                              cx="21"
                              cy="21"
                              r="15"
                              fill="none"
                              stroke="#27272a"
                              strokeWidth="6"
                            />
                            <circle
                              cx="21"
                              cy="21"
                              r="15"
                              fill="none"
                              stroke={getScoreColor(
                                content.seo_result.seo.score,
                              )}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray="0 100"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="text-6xl font-bold"
                              style={{
                                color: getScoreColor(
                                  content.seo_result.seo.score,
                                ),
                              }}
                            >
                              {content.seo_result.seo.score}
                            </div>
                          </div>
                        </div>
                        <p className="mt-6 text-xl font-medium text-white">
                          SEO Score
                        </p>
                      </div>

                      <div
                        className="flex flex-col items-center"
                        ref={perfCircleRef}
                      >
                        <div className="relative w-44 h-44">
                          <svg
                            className="w-full h-full -rotate-90"
                            viewBox="0 0 42 42"
                          >
                            <circle
                              cx="21"
                              cy="21"
                              r="15"
                              fill="none"
                              stroke="#27272a"
                              strokeWidth="6"
                            />
                            <circle
                              cx="21"
                              cy="21"
                              r="15"
                              fill="none"
                              stroke={getScoreColor(
                                content.seo_result.performance.score,
                              )}
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeDasharray="0 100"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className="text-6xl font-bold"
                              style={{
                                color: getScoreColor(
                                  content.seo_result.performance.score,
                                ),
                              }}
                            >
                              {content.seo_result.performance.score}
                            </div>
                          </div>
                        </div>
                        <p className="mt-6 text-xl font-medium text-white">
                          Performance Score
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Общий обзор */}
                  <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8">
                    <h3 className="text-xl font-semibold mb-4">Общий обзор</h3>
                    <p className="text-neutral-300 leading-relaxed">
                      {content.seo_result.overall_summary}
                    </p>
                  </div>

                  {/* Анализ структуры */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Анализ структуры сайта
                    </h3>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 text-neutral-300 leading-relaxed">
                      {content.seo_result.sitemap_analysis}
                    </div>
                  </div>

                  {/* Анализ контента */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Анализ контента
                    </h3>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 text-neutral-300 leading-relaxed">
                      {content.seo_result.content_analysis}
                    </div>
                  </div>

                  {/* Core Web Vitals */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                      <TrendingUp className="text-red-400" /> Core Web Vitals
                    </h3>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 text-neutral-300">
                      {content.seo_result.core_web_vitals_analysis}
                    </div>

                    <div className="grid grid-cols-3 gap-6 mt-6">
                      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 text-center">
                        <div className="text-neutral-400 text-sm">LCP</div>
                        <div className="text-5xl font-semibold mt-2">
                          {content.seo_result.performance.lcp}с
                        </div>
                        <div className="text-red-400 text-xs mt-3">
                          Очень медленно
                        </div>
                      </div>
                      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 text-center">
                        <div className="text-neutral-400 text-sm">CLS</div>
                        <div className="text-5xl font-semibold mt-2">
                          {content.seo_result.performance.cls}
                        </div>
                        <div className="text-emerald-400 text-xs mt-3">
                          Отлично ✓
                        </div>
                      </div>
                      <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-6 text-center">
                        <div className="text-neutral-400 text-sm">FID</div>
                        <div className="text-5xl font-semibold mt-2">
                          {content.seo_result.performance.fid
                            ? content.seo_result.performance.fid + " мс"
                            : "—"}
                        </div>
                        <div className="text-neutral-400 text-xs mt-3">
                          Нет данных
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Специализация компании */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Специализация компании
                    </h3>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 text-neutral-200 leading-relaxed">
                      {content.analyst_result.specialization.specialization}
                    </div>
                  </div>

                  {/* Основная область экспертизы */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Основная область экспертизы
                    </h3>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 text-neutral-200 leading-relaxed">
                      {content.analyst_result.expertise.main_area}
                    </div>
                  </div>

                  {/* Ключевые проблемы клиентов */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Ключевые проблемы клиентов
                    </h3>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 text-neutral-300">
                      {content.analyst_result.expertise.key_user_problem}
                    </div>
                  </div>

                  {/* Преимущества для клиента */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Преимущества для клиента
                    </h3>
                    <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 text-neutral-300">
                      {content.analyst_result.expertise.benefit_to_the_user}
                    </div>
                  </div>

                  {/* Семантическое ядро */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6">
                      Семантическое ядро
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-emerald-400 font-medium mb-3">
                          Высокая частота
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {content.analyst_result.semantic_core.high_frequency.map(
                            (kw, i) => (
                              <span
                                key={i}
                                className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-3xl text-sm"
                              >
                                {kw}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-yellow-400 font-medium mb-3">
                          Средняя частота
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {content.analyst_result.semantic_core.medium_frequency.map(
                            (kw, i) => (
                              <span
                                key={i}
                                className="bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-3xl text-sm"
                              >
                                {kw}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-orange-400 font-medium mb-3">
                          Низкая частота
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {content.analyst_result.semantic_core.low_frequency.map(
                            (kw, i) => (
                              <span
                                key={i}
                                className="bg-orange-500/10 text-orange-400 px-4 py-2 rounded-3xl text-sm"
                              >
                                {kw}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Найденные проблемы */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                      <AlertTriangle className="text-red-400" /> Найденные
                      проблемы
                    </h3>
                    <div className="space-y-5">
                      {content.seo_result.issues.map((issue, index) => (
                        <div
                          key={index}
                          className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-7 flex gap-6"
                        >
                          <div
                            className={`px-4 py-1.5 text-xs font-medium rounded-2xl border self-start mt-1 ${getSeverityColor(issue.severity)}`}
                          >
                            {issue.severity.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold">{issue.title}</div>
                            <p className="text-neutral-400 mt-2">
                              {issue.description}
                            </p>
                            <div className="text-red-400 text-sm mt-4">
                              Рекомендация: {issue.recommendation}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Рекомендации */}
                  <div>
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                      <CheckCircle className="text-emerald-400" /> Рекомендации
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {content.seo_result.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="bg-[#0f0f0f] border border-neutral-800/70 rounded-3xl p-6 flex gap-4"
                        >
                          <div className="w-6 h-6 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                            ✓
                          </div>
                          <p className="text-neutral-200">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Сгенерированный SEO-контент */}
                  <div className="border border-neutral-800 rounded-3xl p-8 bg-[#0a0a0a]">
                    <h3 className="text-xl font-semibold mb-8">
                      Сгенерированный SEO-контент
                    </h3>
                    <div className="space-y-10">
                      <div>
                        <div className="uppercase text-xs tracking-widest text-neutral-500 mb-3">
                          H1 заголовок
                        </div>
                        <p className="text-2xl font-medium">
                          {content.conent_generation_result.h1}
                        </p>
                      </div>
                      <div>
                        <div className="uppercase text-xs tracking-widest text-neutral-500 mb-3">
                          Title
                        </div>
                        <p className="text-lg">
                          {content.conent_generation_result.title}
                        </p>
                      </div>
                      <div>
                        <div className="uppercase text-xs tracking-widest text-neutral-500 mb-3">
                          Description
                        </div>
                        <p className="text-neutral-300 leading-relaxed">
                          {content.conent_generation_result.description}
                        </p>
                      </div>
                      <div>
                        <div className="uppercase text-xs tracking-widest text-neutral-500 mb-4">
                          Alt-тексты изображений
                        </div>
                        <div className="space-y-4">
                          {content.conent_generation_result.alt_tags[0].map(
                            (item, i) => (
                              <div
                                key={i}
                                className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5"
                              >
                                <div className="font-medium mb-1">
                                  {item.alt}
                                </div>
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-neutral-400 hover:text-white break-all"
                                >
                                  {item.url}
                                </a>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Стоимость анализа */}
                  <div className="bg-[#0f0f0f] border border-neutral-800 rounded-3xl p-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <DollarSign className="w-9 h-9 text-emerald-400" />
                      <div>
                        <div className="text-sm text-neutral-400">
                          Стоимость анализа
                        </div>
                        <div className="text-3xl font-bold text-emerald-400">
                          {content.total_money.toFixed(2)} ₽
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-neutral-400">
                        Использовано токенов
                      </div>
                      <div className="text-3xl font-bold">
                        {content.total_tokens.toLocaleString("ru-RU")}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка — одна динамическая кнопка + чат */}
          {content && (
            <div className="lg:w-96 flex-shrink-0 flex flex-col gap-4">
              <button
                onClick={
                  showAiContent
                    ? () => setShowAiContent(false)
                    : aiContent
                      ? () => setShowAiContent(true)
                      : generateAIContent
                }
                disabled={aiGenerating}
                className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 rounded-3xl font-medium text-base transition-all active:scale-[0.985]"
              >
                {getMainButtonText()}
              </button>

              {/* Чат */}
              <div className="flex-1">
                {chatOpen ? (
                  <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl h-full flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-red-500/10 rounded-2xl flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <div className="font-semibold">
                            AI Помощник продвижения
                          </div>
                          <div className="text-xs text-neutral-500">Онлайн</div>
                        </div>
                      </div>
                      <button
                        onClick={closeChat}
                        className="text-neutral-400 hover:text-white p-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.type === "user" ? "bg-red-600 text-white" : "bg-neutral-800/70 text-neutral-200"}`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-neutral-800 shrink-0">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Напишите сообщение..."
                          className="flex-1 bg-[#0f0f0f] border border-neutral-700 focus:border-red-500 rounded-2xl px-5 py-3 text-white placeholder:text-neutral-500 focus:outline-none"
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim()}
                          className="bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={openChat}
                    className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-4 bg-neutral-900/70 backdrop-blur-md border border-neutral-800 hover:border-red-500/50 rounded-3xl transition-all group"
                  >
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                      <MessageCircle className="w-9 h-9 text-red-400" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-lg">
                        Открыть AI Помощник
                      </div>
                      <div className="text-neutral-500 text-sm mt-1">
                        Задайте вопросы по отчёту
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
