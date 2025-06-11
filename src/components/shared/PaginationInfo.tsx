import { ChevronLeft, ChevronRight } from 'lucide-react';

import React from 'react';
import { cn } from '@/lib/utils';

interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onLoadMore?: () => void;
  className?: string;
  compact?: boolean;
}

const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  totalPages,
  hasMore,
  isLoading = false,
  onPageChange,
  onLoadMore,
  className = '',
  compact = false
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getVisiblePages = () => {
    if (compact && totalPages > 5) {
      // Versão compacta: apenas página atual e vizinhas
      const pages = [];
      if (currentPage > 1) pages.push(currentPage - 1);
      pages.push(currentPage);
      if (currentPage < totalPages) pages.push(currentPage + 1);
      return pages;
    }

    // Versão completa
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) {
    return hasMore && onLoadMore ? (
      <div className={cn("flex justify-center", className)}>
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className={cn(
            "px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white rounded-lg transition-colors flex items-center gap-2",
            isLoading && "cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Carregando...
            </>
          ) : (
            "Carregar mais posts"
          )}
        </button>
      </div>
    ) : null;
  }

  if (compact) {
    return (
      <div className={cn("flex items-center justify-between gap-4", className)}>
        {/* Info compacta */}
        <div className="flex items-center gap-2 text-sm text-light-4 bg-dark-3 px-3 py-2 rounded-lg">
          <span>Página</span>
          <span className="font-semibold text-primary-500">{currentPage}</span>
          <span>de</span>
          <span className="font-semibold text-light-1">{totalPages}</span>
        </div>

        {/* Navegação básica */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canGoPrevious || isLoading}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              canGoPrevious && !isLoading
                ? "border-dark-4 hover:border-primary-500 text-light-3 hover:text-primary-500 hover:bg-dark-3"
                : "border-dark-4 text-light-4 cursor-not-allowed opacity-50"
            )}
            title="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1">
            {getVisiblePages().map((page, index) => (
              <button
                key={index}
                onClick={() => onPageChange(page as number)}
                disabled={isLoading}
                className={cn(
                  "w-8 h-8 rounded-lg border transition-colors text-sm font-medium",
                  page === currentPage
                    ? "border-primary-500 bg-primary-500 text-white"
                    : "border-dark-4 text-light-3 hover:border-primary-500 hover:text-primary-500 hover:bg-dark-3",
                  isLoading && "cursor-not-allowed opacity-50"
                )}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canGoNext || isLoading}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              canGoNext && !isLoading
                ? "border-dark-4 hover:border-primary-500 text-light-3 hover:text-primary-500 hover:bg-dark-3"
                : "border-dark-4 text-light-4 cursor-not-allowed opacity-50"
            )}
            title="Próxima página"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center gap-4", className)}>
      {/* Info da página */}
      <div className="hidden sm:flex items-center gap-2 text-sm text-light-4 bg-dark-3 px-3 py-2 rounded-lg">
        <span>Página</span>
        <span className="font-semibold text-primary-500">{currentPage}</span>
        <span>de</span>
        <span className="font-semibold text-light-1">{totalPages}</span>
      </div>

      {/* Controles de navegação */}
      <div className="flex items-center gap-1">
        {/* Botão anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrevious || isLoading}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            canGoPrevious && !isLoading
              ? "border-dark-4 hover:border-primary-500 text-light-3 hover:text-primary-500 hover:bg-dark-3"
              : "border-dark-4 text-light-4 cursor-not-allowed opacity-50"
          )}
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Números das páginas */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-3 py-2 text-light-4">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  disabled={isLoading}
                  className={cn(
                    "w-10 h-10 rounded-lg border transition-colors text-sm font-medium",
                    page === currentPage
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-dark-4 text-light-3 hover:border-primary-500 hover:text-primary-500 hover:bg-dark-3",
                    isLoading && "cursor-not-allowed opacity-50"
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Botão próximo */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext || isLoading}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            canGoNext && !isLoading
              ? "border-dark-4 hover:border-primary-500 text-light-3 hover:text-primary-500 hover:bg-dark-3"
              : "border-dark-4 text-light-4 cursor-not-allowed opacity-50"
          )}
          title="Próxima página"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Botão carregar mais (se disponível) */}
      {hasMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className={cn(
            "px-4 py-2 bg-dark-3 hover:bg-dark-2 border border-dark-4 hover:border-primary-500 text-light-3 hover:text-primary-500 rounded-lg transition-colors text-sm",
            isLoading && "cursor-not-allowed opacity-50"
          )}
        >
          + Carregar mais
        </button>
      )}
    </div>
  );
};

export default PaginationInfo;