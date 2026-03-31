import { PromotionApi } from "../../api/Promotion";

export function usePromotionActions(
  userId,
  url,
  generationId, // текущее значение
  setContent,
  setAiContent,
  setShowAiContent,
  setLoading,
  setAiGenerating,
  setGenerationId, // setter
) {
  const handleAnalyze = async () => {
    if (!url?.trim() || !userId) return;

    setLoading(true);
    setContent(null);
    setAiContent(null);
    setShowAiContent(false);
    setGenerationId(null); // сбрасываем перед новым запросом

    try {
      const data = await PromotionApi.seo(userId, url.trim());
      setContent(data);

      // Извлечение generation_id — можно расширить при необходимости
      const newGenerationId =
        data?.generation_id ||
        data?.data?.generation_id ||
        data?.result?.generation_id ||
        data?.seo_result?.generation_id; // на всякий случай

      if (newGenerationId) {
        setGenerationId(newGenerationId);
        console.log("✅ Получен generation_id:", newGenerationId);
      } else {
        console.warn("⚠️ generation_id не найден в ответе от SEO API:", data);
      }
    } catch (error) {
      console.error("Ошибка анализа SEO:", error);
      alert("Не удалось проанализировать сайт. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const generateAIContent = async () => {
    if (!url?.trim() || !userId) {
      alert("Введите URL сайта");
      return;
    }

    if (!generationId) {
      alert("Сначала выполните SEO-анализ, чтобы получить generation_id");
      return;
    }

    setAiGenerating(true);

    try {
      const data = await PromotionApi.aio(userId, url.trim(), generationId);
      setAiContent(data);
      setShowAiContent(true);
    } catch (error) {
      console.error("Ошибка генерации AIO:", error);
      alert("Не удалось сгенерировать AIO-контент. Попробуйте позже.");
    } finally {
      setAiGenerating(false);
    }
  };

  return {
    handleAnalyze,
    generateAIContent,
  };
}
