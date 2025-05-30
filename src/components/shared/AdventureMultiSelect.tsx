import { Check, ChevronDown, X } from "lucide-react";
import React, { useState } from "react";

import { Models } from "appwrite";
import { cn } from "@/lib/utils";

interface AdventureMultiSelectProps {
  adventures: Models.Document[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const AdventureMultiSelect: React.FC<AdventureMultiSelectProps> = ({
  adventures,
  value,
  onChange,
  placeholder = "Selecione as aventuras...",
  disabled = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (adventureId: string) => {
    if (disabled) return;

    const newValue = value.includes(adventureId)
      ? value.filter((id) => id !== adventureId)
      : [...value, adventureId];
    onChange(newValue);
  };

  const handleRemove = (adventureId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    const newValue = value.filter((id) => id !== adventureId);
    onChange(newValue);
  };

  const handleSelectAll = () => {
    if (disabled) return;

    if (value.length === adventures.length) {
      onChange([]);
    } else {
      onChange(adventures.map((adventure) => adventure.$id));
    }
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const selectedAdventures = adventures.filter((adventure) =>
    value.includes(adventure.$id)
  );

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active'
      ? 'bg-green-500/20 text-green-400'
      : 'bg-red-500/20 text-red-400';
  };

  const getVisibilityColor = (isPublic: boolean) => {
    return isPublic
      ? 'bg-blue-500/20 text-blue-400'
      : 'bg-orange-500/20 text-orange-400';
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex min-h-[48px] w-full items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-3",
          disabled
            ? "bg-dark-4/50 border-dark-4 cursor-not-allowed opacity-50"
            : "bg-dark-4 border-input hover:border-dark-3",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedAdventures.length > 0 ? (
            selectedAdventures.length <= 3 ? (
              selectedAdventures.map((adventure) => (
                <span
                  key={adventure.$id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary-500/20 text-primary-400 text-xs border border-primary-500/30"
                >
                  <img
                    src={adventure.imageUrl || '/assets/icons/profile-placeholder.svg'}
                    alt={adventure.title}
                    className="w-4 h-4 rounded object-cover"
                  />
                  <span className="max-w-[100px] truncate">{adventure.title}</span>
                  {adventure.isPublic && (
                    <span className="text-xs">🌍</span>
                  )}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => handleRemove(adventure.$id, e)}
                      className="hover:bg-primary-500/30 rounded p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-light-1 py-1">
                {selectedAdventures.length} aventuras selecionadas
              </span>
            )
          ) : (
            <span className="text-light-4 py-1">{placeholder}</span>
          )}
        </div>

        {!disabled && (
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform text-light-3 ml-2 flex-shrink-0",
              isOpen && "transform rotate-180"
            )}
          />
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-dark-3 border border-dark-4 rounded-md shadow-lg max-h-60 overflow-hidden">
          {adventures.length > 1 && (
            <div className="p-2 border-b border-dark-4 space-y-1">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 text-left px-2 py-1 text-sm text-light-2 hover:bg-dark-4 rounded transition-colors"
                  onClick={handleSelectAll}
                >
                  {value.length === adventures.length
                    ? "Desmarcar todas"
                    : "Selecionar todas"}
                </button>
                <button
                  type="button"
                  className="px-2 py-1 text-sm text-blue-400 hover:bg-dark-4 rounded transition-colors"
                  onClick={handleClearAll}
                >
                  Post Público
                </button>
              </div>
              <p className="text-xs text-light-4 px-2">
                💡 Deixe vazio para criar um post público visível para todos
              </p>
            </div>
          )}

          <div className="max-h-48 overflow-auto custom-scrollbar">
            {adventures.length === 0 ? (
              <div className="px-3 py-4 text-center text-light-4 text-sm">
                Nenhuma aventura disponível
              </div>
            ) : (
              adventures.map((adventure) => (
                <div
                  key={adventure.$id}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-dark-4 transition-colors"
                  onClick={() => handleToggle(adventure.$id)}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border mr-3 flex-shrink-0",
                      value.includes(adventure.$id)
                        ? "bg-primary-500 border-primary-500"
                        : "border-light-3"
                    )}
                  >
                    {value.includes(adventure.$id) && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>

                  <img
                    src={adventure.imageUrl || '/assets/icons/profile-placeholder.svg'}
                    alt={adventure.title}
                    className="w-8 h-8 rounded object-cover mr-3 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm text-light-1 truncate font-medium">
                        {adventure.title}
                      </span>
                      <div className="flex gap-1">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-xs flex-shrink-0",
                          getStatusColor(adventure.status)
                        )}>
                          {adventure.status === 'active' ? 'Ativa' : 'Inativa'}
                        </span>
                        {adventure.isPublic && (
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-xs flex-shrink-0",
                            getVisibilityColor(true)
                          )}>
                            🌍 Pública
                          </span>
                        )}
                      </div>
                    </div>

                    {adventure.description && (
                      <p className="text-xs text-light-3 truncate">
                        {adventure.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdventureMultiSelect;