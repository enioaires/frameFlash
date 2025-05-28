import { Check, ChevronDown } from "lucide-react";
import React, { useState } from "react";

import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Selecione as tags...",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((option) => option.value));
    }
  };

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  return (
    <div className="relative">
      <div
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-md border border-input bg-dark-4 px-3 py-2 text-sm cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-3"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selectedLabels.length > 0 ? (
            selectedLabels.length <= 3 ? (
              selectedLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-primary-500 text-xs text-white"
                >
                  {label}
                </span>
              ))
            ) : (
              <span className="text-light-1">
                {selectedLabels.length} tags selecionadas
              </span>
            )
          ) : (
            <span className="text-light-4">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform text-light-3",
            isOpen && "transform rotate-180"
          )}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-dark-3 border border-dark-4 rounded-md shadow-lg">
          <div className="p-2 border-b border-dark-4">
            <button
              type="button"
              className="w-full text-left px-2 py-1 text-sm text-light-2 hover:bg-dark-4 rounded"
              onClick={handleSelectAll}
            >
              {value.length === options.length
                ? "Desmarcar todas"
                : "Selecionar todas"}
            </button>
          </div>
          <div className="max-h-60 overflow-auto">
            {options.map((option) => (
              <div
                key={option.value}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-dark-4"
                onClick={() => handleToggle(option.value)}
              >
                <div
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded border mr-2",
                    value.includes(option.value)
                      ? "bg-primary-500 border-primary-500"
                      : "border-light-3"
                  )}
                >
                  {value.includes(option.value) && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <span className="text-sm text-light-1">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { MultiSelect };