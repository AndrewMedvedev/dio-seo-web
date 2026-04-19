import { useEffect, useState } from "react";
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
import SeoReport from "../components/SeoReport";
import AioContentView from "../components/AioContentView";
import { usePromotionState } from "./hooks/usePromotionState";
import { useChat } from "./hooks/useChat";
import { useHistory } from "./hooks/useHistory";
import { usePromotionActions } from "./hooks/usePromotionActions";
import MarkdownMessage from "../components/Message";
import { PromotionApi } from "../api/Promotion";

export default function PromotionPage() {
  const state = usePromotionState();
  const history = useHistory();
  const chat = useChat(state.url, state.generationId);
  const actions = usePromotionActions(state.url, state.generationId);
  const [interlinkingResult, setInterlinkingResult] = useState(null);
  const [interlinkingLoading, setInterlinkingLoading] = useState(false);
  const [interlinkingNotice, setInterlinkingNotice] = useState("");
  const [interlinkingHistoryData, setInterlinkingHistoryData] = useState([]);
  const [showInterlinkingHistory, setShowInterlinkingHistory] = useState(false);

  const getMainButtonText = () => {
    if (state.aiGenerating) {
      return "Генерируем AIO-контент. Примерное время — не более 3 минут.";
    }

    if (!state.aiContent) {
      return "Сгенерировать AIO-контент";
    }

    return state.showAiContent ? "Вернуться к SEO-отчёту" : "Посмотреть AIO-контент";
  };

  const getInterlinkingButtonText = () => {
    return state.showInterlinking ? "Вернуться к SEO-отчёту" : "Перелинковка страницы";
  };

  const getInterlinkingResult = () => {
    if (interlinkingResult) return interlinkingResult;
    if (!state.content) return null;

    return (
      state.content?.re_linking_result ||
      state.content?.relinking_result ||
      state.content?.internal_linking_result ||
      null
    );
  };

  const runInterlinkingCheck = async () => {
    if (!state.url.trim() || state.urlError || interlinkingLoading) return;

    setShowInterlinkingHistory(false);
    setInterlinkingLoading(true);
    setInterlinkingNotice("");

    try {
      const data = await PromotionApi.interlinkingCheck(state.url.trim(), state.generationId);
      setInterlinkingResult(data.result || null);
      if (data.isMock) {
        setInterlinkingNotice("Mock data is shown because backend response is unavailable.");
      }

      if (data.result) {
        const historyItem = {
          id: data.id || `local-${Date.now()}`,
          created_at: data.created_at || new Date().toISOString(),
          url: data.url || state.url.trim(),
          result: data.result,
        };
        setInterlinkingHistoryData((prev) => [historyItem, ...prev.filter((x) => x.id !== historyItem.id)]);
      }
    } finally {
      setInterlinkingLoading(false);
    }
  };

  const loadInterlinkingHistory = async () => {
    const data = await PromotionApi.interlinkingHistory(1, 10);
    const items = data.results || [];
    setInterlinkingHistoryData(items);
    if (data.isMock) {
      setInterlinkingNotice("History is shown from mock data because backend response is unavailable.");
    }
    return items;
  };

  const handleHistorySelect = (item) => {
    state.setContent(item.result);
    state.setAiContent(item.result);
    state.setShowAiContent(false);
    state.setShowInterlinking(false);
    history.toggleHistory();

    if (item.result?.url) {
      state.setUrl(item.result.url);
    }
  };

  const onAnalyze = () => {
    if (state.showInterlinking) {
      runInterlinkingCheck();
      return;
    }

    actions.handleAnalyze(
      state.setContent,
      state.setAiContent,
      state.setShowAiContent,
      state.setLoading,
      state.setGenerationId,
    );
    state.setShowInterlinking(false);
    setShowInterlinkingHistory(false);
    setInterlinkingResult(null);
    setInterlinkingNotice("");
  };

  const handleHistoryAction = async () => {
    if (!state.showInterlinking) {
      history.toggleHistory();
      return;
    }

    setShowInterlinkingHistory(true);
    const items = await loadInterlinkingHistory();
    if (items.length === 0) {
      setInterlinkingNotice("No interlinking history yet.");
    }
  };

  const onGenerateAIContent = () => {
    actions.generateAIContent(
      state.setAiContent,
      state.setShowAiContent,
      state.setAiGenerating,
      state.generationId,
    );
    state.setShowInterlinking(false);
  };

  const handleMainAction = () => {
    if (state.showAiContent) {
      state.setShowAiContent(false);
      state.setShowInterlinking(false);
      return;
    }

    if (state.aiContent) {
      state.setShowAiContent(true);
      state.setShowInterlinking(false);
      return;
    }

    onGenerateAIContent();
  };

  const handleInterlinkingAction = () => {
    if (state.showInterlinking) {
      state.setShowInterlinking(false);
      state.setShowAiContent(false);
      setShowInterlinkingHistory(false);
      return;
    }

    state.setShowInterlinking(true);
    state.setShowAiContent(false);
    setShowInterlinkingHistory(false);
  };

  useEffect(() => {
    if (!state.showInterlinking || history.showHistory) return;
    if (interlinkingHistoryData.length > 0) return;
    loadInterlinkingHistory();
  }, [state.showInterlinking, history.showHistory, interlinkingHistoryData.length]);

  const showRightPanel = !!state.content || state.chatOpen;
  const isInterlinkingView = state.showInterlinking && !history.showHistory;
  const isSeoView =
    !history.showHistory && !state.showAiContent && !state.showInterlinking;
  const isAiView = !history.showHistory && state.showAiContent && state.aiContent;

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      <div className="pt-24 lg:pt-28 px-6 lg:px-12 max-w-screen-2xl mx-auto w-full pb-10">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {!history.showHistory && (
              <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 shrink-0">
                <p className="text-neutral-400 text-sm mb-4">
                  {isInterlinkingView
                    ? "Введите URL страницы для перелинковки"
                    : "Введите URL сайта для анализа"}
                </p>

                <div className="flex flex-wrap gap-4">
                  <input
                    type="url"
                    value={state.url}
                    onChange={state.handleUrlChange}
                    placeholder="https://example.com"
                    className={`flex-[1_1_360px] min-w-0 bg-dark-800 border rounded-2xl px-6 py-4 text-white placeholder:text-neutral-500 focus:outline-none transition-all ${
                      state.urlError ? "border-red-500" : "border-neutral-700 focus:border-red-500"
                    }`}
                  />

                  <button
                    onClick={onAnalyze}
                    disabled={!state.url.trim() || (state.showInterlinking ? interlinkingLoading : state.loading)}
                    className="bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 disabled:cursor-not-allowed px-8 py-4 rounded-2xl font-medium transition-colors whitespace-normal wrap-break-word flex-[1_1_280px] lg:flex-[0_0_auto]"
                  >
                    {state.loading
                      ? "Выполняется анализ. Примерное время — не более 3 минут."
                      : "Анализировать"}
                  </button>

                  <button
                    onClick={handleHistoryAction}
                    className="px-6 py-4 rounded-2xl font-medium border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 transition-colors whitespace-nowrap flex items-center justify-center gap-2 flex-[0_0_auto]"
                  >
                    <History className="w-4 h-4" />
                    История
                  </button>
                </div>
              </div>
            )}

            <div className="w-full bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl p-8 lg:p-10 overflow-auto min-h-135">
              {history.showHistory ? (
                <div className="space-y-8">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-3xl font-bold flex items-center gap-4">
                      <History className="text-red-400" />
                      История генераций
                    </h2>

                    <button
                      onClick={history.toggleHistory}
                      className="px-6 py-3 rounded-2xl font-medium border border-neutral-700 hover:border-red-500/50 hover:text-white text-neutral-200 transition-colors"
                    >
                      Вернуться к анализу
                    </button>
                  </div>

                  {history.historyLoading && history.historyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                      <Loader2 className="w-10 h-10 animate-spin mb-4" />
                      <p>Загружаем историю...</p>
                    </div>
                  ) : history.historyError ? (
                    <div className="text-red-400 text-center py-10">{history.historyError}</div>
                  ) : history.historyData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                      <History className="w-16 h-16 mb-4 opacity-40" />
                      <p className="text-lg">История генераций пока пуста</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-6">
                        {history.historyData.map((item, index) => {
                          const date = new Date(item.created_at);
                          const seoScore = item.result?.seo_result?.seo?.score ?? null;
                          const h1 =
                            item.result?.content_generation_result?.h1 ||
                            item.result?.new_content?.title ||
                            "Анализ сайта";
                          const summary =
                            item.result?.seo_result?.overall_summary ||
                            "SEO-анализ и генерация контента";

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

                                  <p className="text-neutral-400 text-sm line-clamp-3">{summary}</p>

                                  {seoScore && (
                                    <div className="mt-4 text-sm">
                                      SEO:{" "}
                                      <span
                                        className={`font-semibold ${
                                          seoScore >= 70 ? "text-emerald-400" : "text-amber-400"
                                        }`}
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
                        })}
                      </div>

                      {history.hasMore ? (
                        <div className="flex justify-center mt-8">
                          <button
                            onClick={history.loadMore}
                            disabled={history.loadingMore}
                            className="px-8 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl flex items-center gap-2 disabled:opacity-70 transition-colors"
                          >
                            {history.loadingMore ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Загрузка...
                              </>
                            ) : (
                              "Загрузить ещё"
                            )}
                          </button>
                        </div>
                      ) : (
                        history.historyData.length > 0 && (
                          <div className="text-center text-neutral-500 py-6 text-sm">
                            Это вся история генераций
                          </div>
                        )
                      )}
                    </>
                  )}
                </div>
              ) : !state.content && !state.loading ? (
                <div className="h-full flex items-center justify-center text-neutral-500 text-center py-20">
                  После анализа сайта здесь появится детальный отчёт
                </div>
              ) : isAiView ? (
                <AioContentView aiContent={state.aiContent} />
              ) : isInterlinkingView ? (
                <div className="h-full flex flex-col">
                  {showInterlinkingHistory ? (
                    interlinkingHistoryData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-neutral-500 text-center py-20">
                        История перелинковки пока пуста
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h2 className="text-2xl lg:text-3xl font-bold">История перелинковки</h2>
                        <div className="grid gap-4">
                          {interlinkingHistoryData.map((item, index) => {
                            const date = new Date(item.created_at);
                            return (
                              <button
                                type="button"
                                key={item.id || index}
                                onClick={() => {
                                  setInterlinkingResult(item.result || null);
                                  setShowInterlinkingHistory(false);
                                }}
                                className="text-left w-full rounded-2xl border border-neutral-800 hover:border-red-500/50 bg-dark-800/60 p-5 transition-colors"
                              >
                                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {format(date, "dd MMMM yyyy", { locale: ru })}
                                  <Clock className="w-3.5 h-3.5 ml-2" />
                                  {format(date, "HH:mm")}
                                </div>
                                <p className="text-sm text-neutral-500 mb-2 truncate font-mono">{item.url}</p>
                                <p className="text-sm text-neutral-300 line-clamp-3">
                                  {item.result?.summary || "Результат без краткого описания"}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="h-full">
                      <div className="mb-6">
                        <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                          Перелинковка страницы
                        </h2>
                        <p className="text-neutral-400 text-sm">
                          Используется текущий URL и данные последнего отчёта.
                        </p>
                      </div>

                      {!getInterlinkingResult() ? (
                        <div className="h-full flex items-center justify-center text-neutral-500 text-center py-20">
                          После получения данных перелинковки результат появится в этом блоке
                        </div>
                      ) : (
                        <div className="rounded-3xl border border-neutral-800 bg-dark-800/50 p-6 lg:p-8 h-full">
                          <h3 className="text-2xl font-bold mb-4">Результат</h3>
                          {interlinkingNotice && (
                            <div className="mb-4 text-xs text-amber-300">{interlinkingNotice}</div>
                          )}
                          <p className="text-neutral-300 leading-8 whitespace-pre-wrap wrap-break-word">
                            {getInterlinkingResult()?.summary ||
                              "Результат получен, но текстовое описание отсутствует."}
                          </p>

                          {Array.isArray(getInterlinkingResult()?.candidates) &&
                            getInterlinkingResult().candidates.length > 0 && (
                              <div className="mt-6 space-y-2">
                                {getInterlinkingResult().candidates.map((item, idx) => (
                                  <p
                                    key={item.id || `${item.url}-${idx}`}
                                    className="text-neutral-300 whitespace-pre-wrap wrap-break-word"
                                  >
                                    {idx + 1}) {item.url}
                                    {item.depth != null ? ` (глубина: ${item.depth}` : ""}
                                    {item.reason ? `; ${item.reason}` : ""}
                                    {item.depth != null ? ")" : ""}
                                  </p>
                                ))}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : isSeoView ? (
                <SeoReport content={state.content} />
              ) : (
                <SeoReport content={state.content} />
              )}
            </div>
          </div>

          {showRightPanel && (
            <div className="w-full lg:w-105 lg:shrink-0">
              <div className="lg:sticky lg:top-28 flex flex-col gap-4 h-auto lg:h-[calc(100vh-8rem)]">
                <button
                  onClick={handleMainAction}
                  disabled={state.aiGenerating}
                  className="w-full h-14 px-5 py-5 bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 rounded-3xl font-medium text-base transition-all active:scale-[0.985] justify-center flex items-center"
                >
                  {getMainButtonText()}
                </button>

                <button
                  onClick={handleInterlinkingAction}
                  className="w-full h-14 px-5 py-5 bg-red-600 hover:bg-red-500 rounded-3xl font-medium text-base transition-all active:scale-[0.985] justify-center flex items-center"
                >
                  {getInterlinkingButtonText()}
                </button>

                {!state.showInterlinking && (
                  <div className="flex-1 min-h-105 lg:min-h-0">
                    {state.chatOpen ? (
                      <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl flex flex-col h-full overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-red-500/10 rounded-2xl flex items-center justify-center">
                              <MessageCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                              <div className="font-semibold">AI Помощник</div>
                              <div className="text-xs text-neutral-500">по сайту {state.url || "—"}</div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={chat.clearCurrentChat}
                              className="text-neutral-400 hover:text-red-400 px-3 py-1 text-xs hover:bg-neutral-800 rounded-lg transition-colors"
                            >
                              Очистить
                            </button>

                            <button
                              onClick={() => state.setChatOpen(false)}
                              className="text-neutral-400 hover:text-white p-2 hover:bg-neutral-800 rounded-xl transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm custom-scroll">
                          {chat.messages.map((msg) => (
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
                                  <p className="whitespace-pre-wrap wrap-break-word">{msg.text}</p>
                                ) : (
                                  <MarkdownMessage text={msg.text} />
                                )}
                              </div>
                            </div>
                          ))}

                          {chat.isSending && (
                            <div className="flex justify-start">
                              <div className="bg-neutral-800 rounded-3xl px-5 py-3 flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                                <span className="text-neutral-400 text-sm">AI думает...</span>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-4 border-t border-neutral-800 shrink-0">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={chat.inputMessage}
                              onChange={(e) => chat.setInputMessage(e.target.value)}
                              onKeyPress={chat.handleKeyPress}
                              placeholder="Задайте вопрос по SEO, контенту или продвижению..."
                              disabled={chat.isSending}
                              className="flex-1 bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-5 py-3.5 text-white placeholder:text-neutral-500 focus:outline-none transition-all disabled:opacity-70"
                            />

                            <button
                              onClick={chat.sendMessage}
                              disabled={!chat.inputMessage.trim() || chat.isSending}
                              className="bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shrink-0"
                            >
                              {chat.isSending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Send className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => state.setChatOpen(true)}
                        className="w-full py-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-red-500/50 rounded-3xl font-medium flex items-center justify-center gap-3 transition-all group"
                      >
                        <div className="w-8 h-8 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20">
                          <MessageCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <span>Задать вопрос AI-помощнику</span>
                      </button>
                    )}
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
