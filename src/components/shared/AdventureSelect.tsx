import React, { useState } from "react";

import { ChevronDown } from "lucide-react";
import { Models } from "appwrite";
import { cn } from "@/lib/utils";

interface AdventureSelectProps {
  adventures: Models.Document[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  showAll?: boolean;
  showStatus?: boolean;
  className?: string;
}

const AdventureSelect: React.FC<AdventureSelectProps> = ({
  adventures,
  value,
  onChange,
  placeholder = "Selecione uma aventura...",
  disabled = false,
  error,
  showAll = true,
  showStatus = true,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedAdventure = adventures.find(adventure => adventure.$id === value);

  const handleSelect = (adventureId: string) => {
    if (disabled) return;

    onChange(adventureId);
    setIsOpen(false);
  };

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active'
      ? 'bg-green-500/20 text-green-400'
      : 'bg-red-500/20 text-red-400';
  };

  // Organizar aventuras: ativas primeiro, depois inativas
  const sortedAdventures = [...adventures].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 ring-offset-light-3",
          disabled
            ? "bg-dark-4/50 border-dark-4 cursor-not-allowed opacity-50"
            : "bg-dark-4 border-input hover:border-dark-3",
          error && "border-red-500 focus-visible:ring-red-500"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedAdventure ? (
            <>
              <img
                src={selectedAdventure.imageUrl || '/assets/icons/profile-placeholder.svg'}
                alt={selectedAdventure.title}
                className="w-6 h-6 rounded object-cover flex-shrink-0"
              />
              <span className="text-light-1 truncate font-medium">
                {selectedAdventure.title}
              </span>
              {showStatus && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-xs flex-shrink-0",
                  getStatusColor(selectedAdventure.status)
                )}>
                  {selectedAdventure.status === 'active' ? 'Ativa' : 'Inativa'}
                </span>
              )}
            </>
          ) : (
            <span className="text-light-4">{placeholder}</span>
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
        <div className="absolute z-50 w-full mt-1 bg-dark-3 border border-dark-4 rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto custom-scrollbar">
            {showAll && (
              <div
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-dark-4 transition-colors border-b border-dark-4"
                onClick={() => handleSelect("")}
              >
                <div className="w-6 h-6 mr-2 flex-shrink-0" />
                <span className="text-sm text-light-2">
                  Todas as aventuras
                </span>
              </div>
            )}

            {sortedAdventures.length === 0 ? (
              <div className="px-3 py-4 text-center text-light-4 text-sm">
                Nenhuma aventura disponível
              </div>
            ) : (
              sortedAdventures.map((adventure) => (
                <div
                  key={adventure.$id}
                  className={cn(
                    "flex items-center px-3 py-2 cursor-pointer hover:bg-dark-4 transition-colors",
                    value === adventure.$id && "bg-dark-4"
                  )}
                  onClick={() => handleSelect(adventure.$id)}
                >
                  <img
                    src={adventure.imageUrl || '/assets/icons/profile-placeholder.svg'}
                    alt={adventure.title}
                    className="w-6 h-6 rounded object-cover mr-2 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-light-1 truncate font-medium">
                        {adventure.title}
                      </span>
                      {showStatus && (
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-xs flex-shrink-0",
                          getStatusColor(adventure.status)
                        )}>
                          {adventure.status === 'active' ? 'Ativa' : 'Inativa'}
                        </span>
                      )}
                    </div>

                    {adventure.description && (
                      <p className="text-xs text-light-3 truncate mt-0.5">
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

// Versão compacta para filtros
export const CompactAdventureSelect: React.FC<{
  adventures: Models.Document[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}> = ({ adventures, value, onChange, className = "" }) => {
  return (
    <AdventureSelect
      adventures={adventures}
      value={value}
      onChange={onChange}
      placeholder="Filtrar por aventura"
      showAll={true}
      showStatus={false}
      className={cn("w-48", className)}
    />
  );
};

export default AdventureSelect;