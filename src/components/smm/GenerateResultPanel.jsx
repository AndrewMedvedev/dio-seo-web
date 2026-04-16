import { Copy, Image } from "lucide-react";
import StatusAlert from "./StatusAlert";

function ResultTypeBadge({ contentType, contentTypeOptions }) {
  const label =
    contentTypeOptions.find((item) => item.value === contentType)?.label ||
    "Текст";

  return (
    <div className="inline-flex items-center rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-sm text-red-200">
      Тип: {label}
    </div>
  );
}

function KnowledgeMaterialCard({ item }) {
  return (
    <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-5 min-h-[240px]">
      <div className="text-[22px] leading-snug font-semibold text-white">
        {item.title}
      </div>

      <div className="mt-2 text-neutral-300 text-[15px]">Оценка: {item.score}</div>

      <div className="mt-1 text-neutral-500 text-[15px]">
        token overlap: {item.tokenOverlap}
        {typeof item.exactHits === "number" ? `, exact term hits: ${item.exactHits}` : ""}
      </div>

      <div className="mt-4 whitespace-pre-line text-neutral-200 text-sm leading-6">
        {item.content}
      </div>
    </div>
  );
}

export default function GenerateResultPanel({
  generateResult,
  generateLoading,
  generateError,
  contentTypeOptions,
  editedText,
  setEditedText,
  onCopyText,
  onPublish,
  publishLoading,
  publishError,
  publishSuccess,
  imageDataUrl,
  editedImagePrompt,
  setEditedImagePrompt,
  onRegenerateImage,
  regenerateImageLoading,
  regenerateImageError,
  knowledgeMatches,
}) {
  if (!generateResult) {
    if (generateLoading) return null;
    return (
      <>
        {generateError && (
          <StatusAlert variant="error" className="mb-4">
            {generateError}
          </StatusAlert>
        )}
        <div className="mt-2 border border-dashed border-neutral-700 rounded-2xl p-8 text-center text-neutral-500 flex-1 flex items-center justify-center min-h-[420px]">
          <div>
            <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Сгенерируйте контент</p>
            <p className="text-sm mt-2 opacity-75">
              Текст, изображение и использованные материалы появятся здесь
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5">
      {generateError && <StatusAlert variant="error">{generateError}</StatusAlert>}
      <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-5 lg:p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[28px] md:text-[34px] leading-tight font-semibold text-white">
              Готовый контент
            </div>
            <div className="mt-3">
              <ResultTypeBadge
                contentType={generateResult.content_type}
                contentTypeOptions={contentTypeOptions}
              />
            </div>
          </div>

          <div className="px-4 py-2 rounded-full bg-neutral-800 text-neutral-300 text-sm border border-neutral-700">
            {generateResult.published ? "Опубликовано" : "Черновик"}
          </div>
        </div>

        <div className="mt-6 bg-[#141414] border border-neutral-800 rounded-[28px] p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div className="text-xl font-semibold text-white">Текст</div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="text-sm text-neutral-400">Символов: {editedText.length}</div>
              <button
                type="button"
                onClick={onCopyText}
                className="h-11 px-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white transition-colors inline-flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Копировать
              </button>
              <button
                type="button"
                onClick={onPublish}
                disabled={publishLoading}
                className="h-11 px-5 rounded-2xl bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 text-white font-medium transition-colors"
              >
                {publishLoading ? "Публикуем..." : "Опубликовать"}
              </button>
            </div>
          </div>

          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            rows={7}
            className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-2xl px-4 py-4 text-white resize-none outline-none placeholder:text-neutral-500"
          />
        </div>

        {(generateResult.content_type === "image" || imageDataUrl) && (
          <div className="mt-5 bg-[#141414] border border-neutral-800 rounded-[28px] p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <div className="text-xl font-semibold text-white">Промпт для изображения</div>

              <button
                type="button"
                onClick={onRegenerateImage}
                disabled={regenerateImageLoading}
                className="h-11 px-5 rounded-2xl bg-red-600 hover:bg-red-500 disabled:bg-neutral-700 text-white font-medium transition-colors"
              >
                {regenerateImageLoading ? "Перегенерируем..." : "Перегенерировать изображение"}
              </button>
            </div>

            <textarea
              value={editedImagePrompt}
              onChange={(e) => setEditedImagePrompt(e.target.value)}
              rows={4}
              className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-2xl px-4 py-4 text-white resize-none outline-none placeholder:text-neutral-500"
            />

            {regenerateImageError && (
              <StatusAlert variant="error" className="mt-4">
                {regenerateImageError}
              </StatusAlert>
            )}

            {imageDataUrl && (
              <div className="mt-5">
                <div className="text-sm text-neutral-500 mb-3">
                  Фото-референсы не были прикреплены в запросе генерации
                </div>
                <img
                  src={imageDataUrl}
                  alt="Сгенерированное изображение"
                  className="w-full max-w-[760px] rounded-3xl border border-neutral-800 object-cover"
                />
              </div>
            )}
          </div>
        )}

        {(publishError || publishSuccess) && (
          <div className="mt-5 space-y-3">
            {publishError && <StatusAlert variant="error">{publishError}</StatusAlert>}
            {publishSuccess && <StatusAlert variant="success">{publishSuccess}</StatusAlert>}
          </div>
        )}
      </div>

      <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-5 lg:p-6">
        <div className="text-[28px] md:text-[34px] leading-tight font-semibold text-white">
          Использованные материалы базы знаний
        </div>

        <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-4">
          {knowledgeMatches.map((item) => (
            <KnowledgeMaterialCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
