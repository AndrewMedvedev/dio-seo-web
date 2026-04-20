import { Wand2 } from "lucide-react";
import CustomSelect from "../CustomSelect";
import CollapsiblePanel from "./CollapsiblePanel";
import FieldGroup from "./FieldGroup";

const publishOptions = [
  { value: "no", label: "Нет" },
  { value: "yes", label: "Да" },
];
const providerOptions = [
  { value: "auto", label: "Auto" },
  { value: "gigachat", label: "GigaChat" },
  { value: "yandex", label: "YandexGPT" },
];
const kbImageReferencesOptions = [
  { value: "yes", label: "Да" },
  { value: "no", label: "Нет" },
];

export default function GenerateFiltersPanel({
  isKnowledgeExpanded,
  isGenerateFiltersOpen,
  onToggleFilters,
  generateForm,
  setGenerateForm,
  contentTypeOptions,
  lengthOptions,
  languageOptions,
}) {
  if (isKnowledgeExpanded) {
    return (
      <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl overflow-hidden">
        <div className="group relative p-5 flex flex-col items-center justify-center gap-2 hover:bg-neutral-800/70 transition-all rounded-3xl min-h-[92px]">
          <Wand2 className="w-9 h-9 text-red-400 group-hover:scale-110 transition-transform" />
          <div className="text-base font-medium text-neutral-400 text-center leading-tight">
            Фильтры
            <br />
            генерации
          </div>
        </div>
      </div>
    );
  }

  return (
    <CollapsiblePanel
      icon={Wand2}
      title="Фильтры генерации"
      isOpen={isGenerateFiltersOpen}
      onToggle={onToggleFilters}
    >
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FieldGroup label="Тема">
            <input
              value={generateForm.theme}
              onChange={(e) =>
                setGenerateForm((prev) => ({
                  ...prev,
                  theme: e.target.value,
                }))
              }
              placeholder="Например: маркетинг"
              className="w-full h-[50px] bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 text-base text-white placeholder:text-neutral-500"
            />
          </FieldGroup>

          <FieldGroup label="Тон">
            <input
              value={generateForm.tone}
              onChange={(e) =>
                setGenerateForm((prev) => ({
                  ...prev,
                  tone: e.target.value,
                }))
              }
              placeholder="Например: дружелюбный"
              className="w-full h-[50px] bg-dark-800 border border-neutral-700 focus:border-red-500 rounded-2xl px-4 text-base text-white placeholder:text-neutral-500"
            />
          </FieldGroup>

          <FieldGroup label="Тип контента">
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
          </FieldGroup>

          <FieldGroup label="Длина">
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
          </FieldGroup>

          <FieldGroup label="Язык">
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
          </FieldGroup>

          <FieldGroup label="Сразу публиковать">
            <CustomSelect
              value={generateForm.publish ? "yes" : "no"}
              onChange={(e) =>
                setGenerateForm((prev) => ({
                  ...prev,
                  publish: e.target.value === "yes",
                }))
              }
              options={publishOptions}
            />
          </FieldGroup>

          <FieldGroup label="AI провайдер">
            <CustomSelect
              value={generateForm.ai_provider || "auto"}
              onChange={(e) =>
                setGenerateForm((prev) => ({
                  ...prev,
                  ai_provider: e.target.value,
                }))
              }
              options={providerOptions}
            />
          </FieldGroup>

          <FieldGroup label="Исп. KB refs для image">
            <CustomSelect
              value={generateForm.use_kb_image_references ? "yes" : "no"}
              onChange={(e) =>
                setGenerateForm((prev) => ({
                  ...prev,
                  use_kb_image_references: e.target.value === "yes",
                }))
              }
              options={kbImageReferencesOptions}
            />
          </FieldGroup>
        </div>
      </div>
    </CollapsiblePanel>
  );
}
