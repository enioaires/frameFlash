import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  text, 
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const SpinnerLoader = () => (
    <div 
      className={`${sizeClasses[size]} border-2 border-light-4 border-t-primary-500 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Carregando..."
    />
  );

  const DotsLoader = () => (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'} bg-primary-500 rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const PulseLoader = () => (
    <div className={`${sizeClasses[size]} bg-primary-500 rounded-full animate-pulse ${className}`} />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {renderLoader()}
      {text && (
        <p className="text-light-3 text-sm animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-1/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-dark-2 p-6 rounded-lg border border-dark-4">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center w-full py-4">
      {content}
    </div>
  );
};

// Componente específico para listas
export const ListLoader: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="w-full space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-dark-2 rounded-3xl border border-dark-4 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-dark-3 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-dark-3 rounded w-1/3" />
            <div className="h-3 bg-dark-3 rounded w-1/2" />
          </div>
        </div>
        <div className="h-4 bg-dark-3 rounded mb-2" />
        <div className="h-64 bg-dark-3 rounded-lg mb-4" />
        <div className="space-y-2">
          <div className="h-3 bg-dark-3 rounded" />
          <div className="h-3 bg-dark-3 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

// Componente específico para grid
export const GridLoader: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid-container">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-dark-3 rounded-lg h-80 mb-3" />
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-dark-3 rounded-full" />
          <div className="h-3 bg-dark-3 rounded flex-1" />
        </div>
      </div>
    ))}
  </div>
);

// Componente para usuários
export const UserLoader: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="user-grid">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex-center flex-col gap-4 border border-dark-4 rounded-[20px] px-5 py-8 animate-pulse">
        <div className="w-14 h-14 bg-dark-3 rounded-full" />
        <div className="space-y-2 text-center">
          <div className="h-4 bg-dark-3 rounded w-24" />
          <div className="h-3 bg-dark-3 rounded w-20" />
        </div>
      </div>
    ))}
  </div>
);

export default Loader;