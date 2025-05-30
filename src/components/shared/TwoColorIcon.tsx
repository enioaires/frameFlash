import React from 'react';
import { cn } from '@/lib/utils';

interface TwoColorIconProps {
  src: string;
  alt: string;
  className?: string;
  isActive?: boolean;
  size?: number;
  hoverEffect?: 'glow' | 'scale' | 'brightness' | 'none';
}

export const TwoColorIcon: React.FC<TwoColorIconProps> = ({
  src,
  alt,
  className = "",
  isActive = false,
  size = 40,
  hoverEffect = 'glow'
}) => {
  const getHoverClasses = () => {
    switch (hoverEffect) {
      case 'glow':
        return 'group-hover:drop-shadow-[0_0_8px_rgba(219,78,2,0.8)]';
      case 'scale':
        return 'group-hover:scale-110';
      case 'brightness':
        return 'group-hover:brightness-125';
      case 'none':
      default:
        return '';
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn(
        "transition-all duration-300 ease-in-out flex-shrink-0",
        isActive 
          ? "brightness-110 drop-shadow-[0_0_6px_rgba(219,78,2,0.6)]" 
          : "brightness-90",
        getHoverClasses(),
        className
      )}
    />
  );
};