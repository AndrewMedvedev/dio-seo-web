import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  X,
  MessageCircle,
  Send,
  History,
  Loader2,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

import Header from "../components/layout/Header";
import SeoReport from "../components/SeoReport";
import AioContentView from "../components/AioContentView";
import { PromotionApi } from "../api/Promotion";

const CHAT_STORAGE_KEY = "promotion_chat_history";

export default function PromotionPage() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState(null);
  const [aiContent, setAiContent] = useState(null);
  const [showAiContent, setShowAiContent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Чат
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatHistory, setChatHistory] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const userId = "d9cb70ab-9403-4e62-9f17-225cc00176aa";

  // ==================== Состояния для истории ====================
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Загрузка истории чата из localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      try {
        setChatHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Ошибка загрузки истории чата:", e);
      }
    }
  }, []);

  // Сохранение истории чата в localStorage
  useEffect(() => {
    if (Object.keys(chatHistory).length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Загрузка сообщений при смене URL
  useEffect(() => {
    if (url.trim()) {
      const savedMessages = chatHistory[url] || [
        {
          id: Date.now(),
          type: "ai",
          text: `Анализ сайта **${url}** завершён. Чем я могу помочь с продвижением?`,
        },
      ];
      setMessages(savedMessages);
    } else {
      setMessages([]);
    }
  }, [url, chatHistory]);

  // ==================== Загрузка истории генераций ====================
  const fetchHistory = async () => {
    if (!userId) return;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const data = await PromotionApi.history(userId, 1, 20); // загружаем первые 20 записей
      setHistoryData(data.results || data || []);
    } catch (error) {
      console.error("Ошибка загрузки истории:", error);
      setHistoryError("Не удалось загрузить историю генераций");
    } finally {
      setHistoryLoading(false);
    }
  };

  // Загружаем историю при открытии вкладки "История"
  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  // ==================== Анализ сайта ====================
  const handleAnalyze = async () => {
    if (!url.trim() || !userId) return;
    setLoading(true);
    setContent(null);
    setAiContent(null);
    setShowAiContent(false);
    setChatOpen(false);
    try {
      const data = await PromotionApi.seo(userId, url.trim());
      console.log(data);
      setContent(data);
    } catch (error) {
      console.error("Ошибка анализа SEO:", error);
      alert("Не удалось проанализировать сайт. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== Генерация AIO ====================
  const generateAIContent = async () => {
    if (!content || !userId) return;
    setAiGenerating(true);
    try {
      const data = await PromotionApi.aio(userId, url.trim());
      console.log(data);
      setAiContent(data);
      setShowAiContent(true);
    } catch (error) {
      console.error("Ошибка генерации AIO:", error);
      alert("Не удалось сгенерировать AIO-контент");
    } finally {
      setAiGenerating(false);
    }
  };

  // ==================== Отправка сообщения в чат ====================
  const sendMessage = async () => {
    if (!inputMessage.trim() || !url || isSending) return;
    const userText = inputMessage.trim();
    const userMsg = {
      id: Date.now(),
      type: "user",
      text: userText,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setIsSending(true);

    try {
      const response = await PromotionApi.chat(userId, userText);
      const aiMsg = {
        id: Date.now() + 1,
        type: "ai",
        text:
          response.response ||
          response.text ||
          response.message ||
          "Извините, я не смог обработать запрос.",
      };
      const updatedMessages = [...newMessages, aiMsg];
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Ошибка отправки сообщения в чат:", error);
      const errorMsg = {
        id: Date.now() + 1,
        type: "ai",
        text: "⚠️ Произошла ошибка при обработке вашего запроса. Попробуйте ещё раз.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);

  const toggleHistory = () => {
    setShowHistory((prev) => !prev);
    if (!showHistory) setChatOpen(false);
  };

  const clearCurrentChat = () => {
    if (!url) return;
    setChatHistory((prev) => {
      const updated = { ...prev };
      delete updated[url];
      return updated;
    });
    setMessages([
      {
        id: Date.now(),
        type: "ai",
        text: `Чат очищен. Чем я могу помочь с сайтом **${url}**?`,
      },
    ]);
  };

  const getMainButtonText = () => {
    if (aiGenerating) return "Генерируем AIO-контент...";
    if (!aiContent) return "Сгенерировать AIO контент";
    return showAiContent
      ? "← Вернуться к SEO отчёту"
      : "Посмотреть AIO контент";
  };

  // ==================== Обработчик выбора записи из истории ====================
  const handleHistorySelect = (item) => {
    setContent(item.result);
    setAiContent(item.result); // можно убрать, если не нужно сразу показывать AIO
    setShowAiContent(false);
    setShowHistory(false);
    setUrl(item.result?.url || url); // опционально — подставляем URL
  };

  return (
    <div className="min-h-screen bg-dark-900 text-white flex flex-col">
      <Header />
      <div className="flex-1 flex pt-24 lg:pt-28 px-6 lg:px-12 max-w-screen-2xl mx-auto w-full">
        <div className="flex flex-1 gap-8">
          {/* Левая колонка */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Панель ввода URL */}
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
                      className="px-6 py-4 rounded-2xl font-medium border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <History className="w-4 h-4" />
                      История
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <p className="text-neutral-400 text-sm">
                    История предыдущих генераций
                  </p>
                  <button
                    onClick={toggleHistory}
                    className="px-6 py-3 rounded-2xl font-medium border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 transition-colors"
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
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <History className="text-red-400" /> История генераций
                  </h2>

                  {historyLoading && historyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <p>Загружаем историю...</p>
                    </div>
                  ) : historyError ? (
                    <div className="text-red-400 text-center py-10">
                      {historyError}
                    </div>
                  ) : historyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                      <History className="w-16 h-16 mb-4 opacity-40" />
                      <p className="text-lg">История генераций пока пуста</p>
                    </div>
                  ) : (
                    historyData.map((item, index) => {
                      const date = new Date(item.created_at);
                      const seoScore =
                        item.result?.seo_result?.seo?.score ?? null;
                      let h1 = "Анализ сайта";

                      if (item.result?.content_generation_result?.h1) {
                        h1 = item.result.content_generation_result.h1;
                      } else if (
                        item.result?.new_content?.transformed_content
                      ) {
                        const match =
                          item.result.new_content.transformed_content.match(
                            /^#\s(.+)$/m,
                          );
                        if (match) h1 = match[1];
                      }

                      const summary =
                        item.result?.seo_result?.overall_summary ||
                        item.result?.new_content?.transformed_content?.slice(
                          0,
                          220,
                        ) + "..." ||
                        "SEO анализ и генерация контента";

                      return (
                        <div
                          key={item.id || index}
                          onClick={() => handleHistorySelect(item)}
                          className="group bg-dark-800 border border-neutral-800 hover:border-red-500/50 rounded-3xl p-6 transition-all cursor-pointer hover:shadow-xl"
                        >
                          <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="px-3 py-1 text-xs bg-neutral-700 rounded-full text-neutral-400 flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {format(date, "dd MMMM yyyy", { locale: ru })}
                                </div>
                                <div className="px-3 py-1 text-xs bg-neutral-700 rounded-full text-neutral-400 flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {format(date, "HH:mm")}
                                </div>
                              </div>

                              <h3 className="text-xl font-semibold mb-2 group-hover:text-red-400 transition-colors line-clamp-2">
                                {h1}
                              </h3>

                              <p className="text-neutral-400 text-sm line-clamp-3">
                                {summary}
                              </p>

                              {seoScore && (
                                <div className="mt-4 text-sm">
                                  SEO:{" "}
                                  <span
                                    className={`font-semibold ${seoScore >= 70 ? "text-emerald-400" : "text-amber-400"}`}
                                  >
                                    {seoScore}/100
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="lg:w-40 flex items-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleHistorySelect(item);
                                }}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
                              >
                                Открыть
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-neutral-700 text-xs text-neutral-500 truncate font-mono">
                            {item.result?.url}
                          </div>
                        </div>
                      );
                    })
                  )}
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

          {/* Правая колонка — ЧАТ */}
          {content && !showHistory && (
            <div className="w-96 shrink-0 hidden lg:block">
              <div className="sticky top-28 flex flex-col gap-4 h-[calc(100vh-7rem)]">
                {/* Кнопка AIO */}
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

                {/* Кнопка открытия чата */}
                {!chatOpen && (
                  <button
                    onClick={openChat}
                    className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-red-500/50 rounded-3xl font-medium flex items-center justify-center gap-3 transition-all group"
                  >
                    <div className="w-8 h-8 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20">
                      <MessageCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <span>Задать вопрос AI помощнику</span>
                  </button>
                )}

                {/* ЧАТ */}
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
                            <div className="text-xs text-neutral-500">
                              по сайту {url}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={clearCurrentChat}
                            className="text-neutral-400 hover:text-red-400 px-3 py-1 text-xs hover:bg-neutral-800 rounded-lg transition-colors"
                          >
                            Очистить
                          </button>
                          <button
                            onClick={closeChat}
                            className="text-neutral-400 hover:text-white p-2 hover:bg-neutral-800 rounded-xl transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Сообщения чата */}
                      <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm custom-scroll">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-3xl px-5 py-3.5 ${
                                msg.type === "user"
                                  ? "bg-red-600 text-white"
                                  : "bg-neutral-800 text-neutral-200"
                              }`}
                            >
                              {msg.type === "user" ? (
                                <p className="whitespace-pre-wrap wrap-break-word">
                                  {msg.text}
                                </p>
                              ) : (
                                <div className="prose prose-invert prose-sm max-w-full dark:prose-invert wrap-break-word prose-pre:overflow-x-auto prose-pre:max-w-full prose-code:break-words">
                                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                        {isSending && (
                          <div className="flex justify-start">
                            <div className="bg-neutral-800 rounded-3xl px-5 py-3 flex items-center gap-3">
                              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                              <span className="text-neutral-400 text-sm">
                                AI думает...
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Поле ввода */}
                      <div className="p-4 border-t border-neutral-800 shrink-0">
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Задайте вопрос по SEO, контенту или продвижению..."
                            disabled={isSending}
                            className="flex-1 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-5 py-3.5 text-white placeholder:text-neutral-500 focus:outline-none transition-all disabled:opacity-70"
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isSending}
                            className="bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0"
                          >
                            {isSending ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Send className="w-5 h-5" />
                            )}
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
