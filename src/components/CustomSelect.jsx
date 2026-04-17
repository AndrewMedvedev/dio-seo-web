import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options,
  className = "",
  containerClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);
  const selectedOption = options.find((opt) => opt.value === value);

  useLayoutEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
        zIndex: 101,
      });
    }
  }, [isOpen]);

  return (
    <div className={`relative ${containerClassName}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-[50px] bg-dark-800 border border-neutral-700 hover:border-neutral-600 focus:border-red-500 rounded-2xl px-4 text-white transition-all flex items-center justify-between ${className}`}
      >
        <div className="flex items-center gap-3">
          {selectedOption?.flag && (
            <span className="text-xl">{selectedOption.flag}</span>
          )}
          {selectedOption?.icon && (
            <span className="text-lg">{selectedOption.icon}</span>
          )}
          <div className="text-left">
            <div className="text-base font-medium">{selectedOption?.label}</div>
            {selectedOption?.description && (
              <div className="text-base text-neutral-500">
                {selectedOption.description}
              </div>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setIsOpen(false)}
            />
            <div
              style={dropdownStyle}
              className="bg-dark-800 border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange({ target: { value: option.value } });
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-neutral-700/50 transition-colors flex items-center justify-between group ${
                    option.value === value ? "bg-red-500/10" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.flag && (
                      <span className="text-xl">{option.flag}</span>
                    )}
                    {option.icon && (
                      <span className="text-lg">{option.icon}</span>
                    )}
                    <div>
                      <div
                        className={`text-base font-medium ${
                          option.value === value
                            ? "text-red-400"
                            : "text-white"
                        }`}
                      >
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-base text-neutral-500">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {option.value === value && (
                    <Check className="w-4 h-4 text-red-400" />
                  )}
                </button>
              ))}
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
