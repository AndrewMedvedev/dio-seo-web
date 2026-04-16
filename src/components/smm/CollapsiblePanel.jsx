import { createElement } from "react";

export default function CollapsiblePanel({
  icon: Icon,
  title,
  isOpen,
  onToggle,
  children,
}) {
  const iconElement = Icon
    ? createElement(Icon, { className: "w-4 h-4 text-red-400" })
    : null;

  return (
    <div className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 rounded-3xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full h-14 px-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500/10 rounded-xl flex items-center justify-center">
            {iconElement}
          </div>
          <div className="font-semibold">{title}</div>
        </div>
        <span
          className={`text-neutral-500 text-xs transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          v
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
