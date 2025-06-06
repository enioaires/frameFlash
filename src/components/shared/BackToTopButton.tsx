import { ArrowUp } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';

interface BackToTopButtonProps {
  className?: string;
  postsCount?: number;
}

const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  className = '',
  postsCount = 0
}) => {
  const scrollToTop = () => {
    // Método específico para a página Home
    const homeContainer = document.querySelector('.flex.flex-col.flex-1.items-center.gap-10.overflow-scroll');
    
    if (homeContainer) {
      homeContainer.scrollTo({
        top: 550,
        behavior: 'smooth'
      });
      return;
    }
    
    // Método 2: Tentar pela classe comum-container
    const commonContainer = document.querySelector('.common-container');
    
    if (commonContainer && commonContainer.parentElement) {
      commonContainer.parentElement.scrollTo({
        top: 550,
        behavior: 'smooth'
      });
      return;
    }
    
    // Método 3: Window scroll
    window.scrollTo({
      top: 550,
      behavior: 'smooth'
    });
  };

  // Só mostra se tem posts
  if (postsCount === 0) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40',
        'p-3 rounded-full shadow-lg transition-all duration-300',
        'bg-primary-500 hover:bg-primary-600 text-white',
        'hover:scale-110 active:scale-95',
        'border border-primary-400/30',
        'hover:shadow-xl hover:shadow-primary-500/20',
        className
      )}
      title="Voltar ao topo"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default BackToTopButton;