import { useState } from "react";
import { X, MessageCircle, Send, History } from "lucide-react";
import Header from "../components/layout/Header";
import SeoReport from "../components/SeoReport";
import AioContentView from "../components/AioContentView";
import { mockData, aiMock } from "../components/constants";

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
  const [showHistory, setShowHistory] = useState(false); // ← добавлено
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "Анализ сайта завершён. Чем я могу помочь с продвижением?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");

  // ==================== Анализ сайта ====================
  const handleAnalyze = () => {
    if (!url.trim()) return;
    setLoading(true);
    setTimeout(() => {
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
      setAiContent(aiMock);
      setShowAiContent(true);
      setAiGenerating(false);
    }, 1300);
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

  // ← добавлено
  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
  };

  const getMainButtonText = () => {
    if (aiGenerating) return "Генерируем AIO-контент...";
    if (!aiContent) return "Сгенерировать AIO контент";
    return showAiContent
      ? "← Вернуться к SEO отчёту"
      : "Посмотреть AIO контент";
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col">
      <Header />
      <div className="flex-1 flex pt-24 lg:pt-28 px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
        <div className="flex flex-1 gap-8">
          {/* ====================== ЛЕВАЯ КОЛОНКА (скроллится) ====================== */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Панель ввода URL + кнопка истории */}
            <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 shrink-0">
              {!showHistory ? (
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
                      className="flex-1 min-w-0 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-500 focus:outline-none transition-all"
                    />
                    <button
                      onClick={handleAnalyze}
                      disabled={!url.trim() || loading}
                      className="bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 disabled:cursor-not-allowed px-10 py-4 rounded-2xl font-medium transition-colors whitespace-nowrap"
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
              ) : (
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
                      className="bg-dark-800 border border-neutral-800 rounded-3xl p-6 space-y-5"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-semibold text-lg">
                            {historyItem.title}
                          </div>
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
                <div className="h-full flex items-center justify-center text-neutral-500 text-center py-20">
                  После анализа сайта здесь появится детальный отчёт
                </div>
              ) : showAiContent && aiContent ? (
                <AioContentView aiContent={aiContent} />
              ) : (
                <SeoReport content={content} />
              )}
            </div>
          </div>

          {/* ====================== ПРАВАЯ КОЛОНКА — ПРИКРЕПЛЕНА СПРАВА ====================== */}
          {content &&
            !showHistory && ( // ← скрываем правую колонку в режиме истории
              <div className="w-96 shrink-0 hidden lg:block">
                <div className="sticky top-28 flex flex-col gap-4 h-[calc(100vh-7rem)]">
                  {/* Кнопка "Сгенерировать AIO контент" */}
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

                  {/* Кнопка открытия чата (видна только когда чат закрыт) */}
                  {!chatOpen && (
                    <button
                      onClick={openChat}
                      className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-red-500/50 rounded-3xl font-medium flex items-center justify-center gap-3 transition-all group"
                    >
                      <div className="w-8 h-8 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                        <MessageCircle className="w-5 h-5 text-red-400" />
                      </div>
                      <span>Задать вопрос AI помощнику</span>
                    </button>
                  )}

                  {/* ==================== ЧАТ (фиксированный по высоте) ==================== */}
                  {chatOpen && (
                    <div className="flex-1 flex flex-col min-h-0">
                      <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl flex flex-col h-full overflow-hidden shadow-xl">
                        {/* Заголовок чата */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-red-500/10 rounded-2xl flex items-center justify-center">
                              <MessageCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                              <div className="font-semibold">AI Помощник</div>
                            </div>
                          </div>
                          <button
                            onClick={closeChat}
                            className="text-neutral-400 hover:text-white p-2 hover:bg-neutral-800 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        {/* Сообщения */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm custom-scroll">
                          {messages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                                  msg.type === "user"
                                    ? "bg-red-600 text-white"
                                    : "bg-neutral-800 text-neutral-200"
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* Поле ввода */}
                        <div className="p-4 border-t border-neutral-800 shrink-0">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder="Напишите сообщение..."
                              className="flex-1 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-5 py-3.5 text-white placeholder:text-neutral-500 focus:outline-none transition-all"
                            />
                            <button
                              onClick={sendMessage}
                              disabled={!inputMessage.trim()}
                              className="bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
