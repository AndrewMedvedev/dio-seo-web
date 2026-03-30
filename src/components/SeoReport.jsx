import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import ScoreCircle from "./ScoreCircle";

export default function SeoReport({ content }) {
  const data = content || {};

  const seoScore = data.seo_result?.seo?.score || 0;
  const performanceScore = data.seo_result?.performance?.score || 0;

  const getSeverityStyle = (severity) => {
    if (severity === "critical") return "bg-red-600 text-white border-red-600";
    if (severity === "high")
      return "bg-orange-600 text-white border-orange-600";
    return "bg-yellow-600 text-white border-yellow-600";
  };

  return (
    <div className="space-y-16">
      {/* Общие оценки */}
      <div>
        <h3 className="text-xl font-semibold mb-8 flex items-center gap-3">
          <TrendingUp className="text-red-400" /> Общие оценки сайта
        </h3>
        <div className="grid grid-cols-2 gap-10">
          <ScoreCircle score={seoScore} label="SEO Score" />
          <ScoreCircle score={performanceScore} label="Performance Score" />
        </div>
      </div>

      {/* Общий обзор */}
      <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-8">
        <h3 className="text-xl font-semibold mb-4">Общий обзор</h3>
        <p className="text-neutral-300 leading-relaxed">
          {data.seo_result?.overall_summary}
        </p>
      </div>

      {/* Анализ структуры сайта */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Анализ структуры сайта</h3>
        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-8 text-neutral-300 leading-relaxed">
          {data.seo_result?.sitemap_analysis}
        </div>
      </div>

      {/* Анализ контента */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Анализ контента</h3>
        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-8 text-neutral-300 leading-relaxed">
          {data.seo_result?.content_analysis}
        </div>
      </div>

      {/* Core Web Vitals */}
      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
          <TrendingUp className="text-red-400" /> Core Web Vitals
        </h3>
        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-8 text-neutral-300 leading-relaxed">
          {data.seo_result?.core_web_vitals_analysis}
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-6 text-center">
            <div className="text-neutral-400 text-sm">LCP</div>
            <div className="text-5xl font-semibold mt-2">
              {data.seo_result?.performance?.lcp
                ? `${data.seo_result.performance.lcp}с`
                : "—"}
            </div>
            <div className="text-red-400 text-xs mt-3">Очень медленно</div>
          </div>
          <div className="bg-dark-800border border-neutral-800 rounded-3xl p-6 text-center">
            <div className="text-neutral-400 text-sm">CLS</div>
            <div className="text-5xl font-semibold mt-2">
              {data.seo_result?.performance?.cls ?? "—"}
            </div>
            <div className="text-emerald-400 text-xs mt-3">Отлично ✓</div>
          </div>
          <div className="bg-dark-800border border-neutral-800 rounded-3xl p-6 text-center">
            <div className="text-neutral-400 text-sm">FID</div>
            <div className="text-5xl font-semibold mt-2">
              {data.seo_result?.performance?.fid
                ? `${data.seo_result.performance.fid} мс`
                : "—"}
            </div>
            <div className="text-neutral-400 text-xs mt-3">Нет данных</div>
          </div>
        </div>
      </div>

      {/* Специализация компании */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Специализация компании</h3>
        <div className="bg-dark-800border border-neutral-800 rounded-3xl p-8 text-neutral-200 leading-relaxed">
          {data.analyst_result?.specialization?.specialization}
        </div>
      </div>

      {/* Основная область экспертизы */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          Основная область экспертизы
        </h3>
        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-8 text-neutral-200 leading-relaxed">
          {data.analyst_result?.expertise?.main_area}
        </div>
      </div>

      {/* Ключевые проблемы клиентов */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          Ключевые проблемы клиентов
        </h3>
        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-8 text-neutral-300 leading-relaxed">
          {data.analyst_result?.expertise?.key_user_problem}
        </div>
      </div>

      {/* Преимущества для клиента */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Преимущества для клиента</h3>
        <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-8 text-neutral-300 leading-relaxed">
          {data.analyst_result?.expertise?.benefit_to_the_user}
        </div>
      </div>

      {/* Семантическое ядро */}
      <div>
        <h3 className="text-xl font-semibold mb-6">Семантическое ядро</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-emerald-400 font-medium mb-3">
              Высокая частота
            </div>
            <div className="flex flex-wrap gap-2">
              {data.analyst_result?.semantic_core?.high_frequency?.map(
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
              {data.analyst_result?.semantic_core?.medium_frequency?.map(
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
              {data.analyst_result?.semantic_core?.low_frequency?.map(
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

      {/* ==================== НАЙДЕННЫЕ ПРОБЛЕМЫ ==================== */}
      <div>
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
          <AlertTriangle className="text-red-400" /> Найденные проблемы
        </h3>

        <div className="space-y-6">
          {data.seo_result?.issues?.map((issue, index) => (
            <div
              key={index}
              className="bg-dark-800 border border-neutral-800 rounded-3xl p-8"
            >
              <div className="flex items-start gap-5">
                {/* Бейдж уровня важности */}
                <div
                  className={`px-6 py-1.5 text-xs font-semibold rounded-2xl border uppercase tracking-wider self-start ${getSeverityStyle(
                    issue.severity,
                  )}`}
                >
                  {issue.severity.toUpperCase()}
                </div>

                {/* Контент проблемы */}
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-3">
                    {issue.title}
                  </div>

                  <p className="text-neutral-400 leading-relaxed mb-5">
                    {issue.description}
                  </p>

                  <div className="text-emerald-400 text-sm leading-relaxed">
                    <span className="font-medium">Рекомендация: </span>
                    {issue.recommendation}
                  </div>
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
          {data.seo_result?.recommendations?.map((rec, i) => (
            <div
              key={i}
              className="bg-dark-800 border border-neutral-800/70 rounded-3xl p-6 flex gap-4"
            >
              <div className="w-6 h-6 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-neutral-200">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Сгенерированный SEO-контент */}
      <div className="border border-neutral-800 rounded-3xl p-8 bg-dark-900">
        <h3 className="text-xl font-semibold mb-8">
          Сгенерированный SEO-контент
        </h3>
        <div className="space-y-10">
          <div>
            <div className="uppercase text-xs tracking-widest text-neutral-500 mb-3">
              H1 заголовок
            </div>
            <p className="text-2xl font-medium">
              {data.conent_generation_result?.h1 ||
                data.content_generation_result?.h1 ||
                "—"}
            </p>
          </div>
          <div>
            <div className="uppercase text-xs tracking-widest text-neutral-500 mb-3">
              Title
            </div>
            <p className="text-lg">
              {data.conent_generation_result?.title ||
                data.content_generation_result?.title ||
                "—"}
            </p>
          </div>
          <div>
            <div className="uppercase text-xs tracking-widest text-neutral-500 mb-3">
              Description
            </div>
            <p className="text-neutral-300 leading-relaxed">
              {data.conent_generation_result?.description ||
                data.content_generation_result?.description ||
                "—"}
            </p>
          </div>
          <div>
            <div className="uppercase text-xs tracking-widest text-neutral-500 mb-4">
              Alt-тексты изображений
            </div>
            <div className="space-y-4">
              {(
                data.conent_generation_result?.alt_tags?.[0] ||
                data.content_generation_result?.alt_tags?.[0] ||
                []
              ).map((item, i) => (
                <div
                  key={i}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5"
                >
                  <div className="font-medium mb-1">{item.alt}</div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-neutral-400 hover:text-white break-all"
                  >
                    {item.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Стоимость анализа */}
      <div className="bg-dark-800 border border-neutral-800 rounded-3xl p-8 flex justify-between items-center">
        <div>
          <div className="text-sm text-neutral-400">Стоимость анализа</div>
          <div className="text-3xl font-bold text-emerald-400">
            {data.total_money ? data.total_money.toFixed(2) : "0.00"} ₽
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-neutral-400">Использовано токенов</div>
          <div className="text-3xl font-bold">
            {data.total_tokens
              ? data.total_tokens.toLocaleString("ru-RU")
              : "0"}
          </div>
        </div>
      </div>
    </div>
  );
}
