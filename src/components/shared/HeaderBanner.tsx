import React from 'react';

interface HeaderBannerProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  height?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  className?: string;
}

const HeaderBanner: React.FC<HeaderBannerProps> = ({
  title = "FrameFlash",
  subtitle = "Compartilhe suas aventuras épicas",
  backgroundImage,
  height = 'md',
  overlay = true,
  className = ''
}) => {
  const heightClasses = {
    sm: 'h-32 md:h-40',
    md: 'h-40 md:h-56',
    lg: 'h-56 md:h-72'
  };

  return (
    <div className={`relative w-full ${heightClasses[height]} overflow-hidden rounded-lg mb-6 ${className}`}>
      {/* Background - Gradiente padrão ou imagem se fornecida */}
      <div 
        className={`absolute inset-0 ${
          backgroundImage 
            ? 'bg-cover bg-center bg-no-repeat' 
            : 'bg-gradient-to-r from-dark-2 via-primary-500/20 to-dark-2'
        }`}
        style={backgroundImage ? {
          backgroundImage: `url(${backgroundImage})`,
        } : {}}
      >
        {/* Gradient Overlay */}
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-r from-dark-1/60 via-dark-1/40 to-primary-500/20" />
        )}
      </div>

      {/* Pattern overlay para dar textura */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 text-6xl">✨</div>
        <div className="absolute top-8 right-8 text-4xl">🎮</div>
        <div className="absolute bottom-4 left-8 text-5xl">⚔️</div>
        <div className="absolute bottom-8 right-4 text-3xl">🏰</div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center h-full px-6 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-light-2 max-w-2xl drop-shadow-md">
            {subtitle}
          </p>
        )}
        
        {/* Decorative elements */}
        <div className="flex items-center gap-2 mt-4">
          <div className="w-8 h-px bg-primary-500"></div>
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          <div className="w-8 h-px bg-primary-500"></div>
        </div>
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-dark-1/20 to-transparent" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer opacity-30" />
    </div>
  );
};

// Versão simples sem imagem de fundo
export const SimpleBanner: React.FC<{ title: string; subtitle?: string }> = ({ 
  title, 
  subtitle 
}) => (
  <div className="relative w-full h-32 md:h-40 bg-gradient-to-r from-dark-2 via-dark-3 to-dark-2 rounded-lg mb-6 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-500/5" />
    <div className="relative z-10 flex flex-col justify-center items-center h-full px-6 text-center">
      <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
        {title}
      </h1>
      {subtitle && (
        <p className="text-md md:text-lg text-light-3">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);

// Banner específico para páginas de tags
export const TagBanner: React.FC<{ tagName: string; postCount?: number }> = ({ 
  tagName, 
  postCount 
}) => {
  const getTagIcon = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('item')) return '⚔️';
    if (tagLower.includes('lore')) return '📚';
    if (tagLower.includes('aventura')) return '🏰';
    if (tagLower.includes('classe')) return '🎭';
    if (tagLower.includes('raca') || tagLower.includes('raça')) return '👥';
    if (tagLower.includes('regiao') || tagLower.includes('região')) return '🗺️';
    if (tagLower.includes('magia')) return '✨';
    if (tagLower.includes('talento')) return '🌟';
    if (tagLower.includes('personagem')) return '🧙‍♂️';
    if (tagLower.includes('relato')) return '📖';
    if (tagLower.includes('deus') || tagLower.includes('deuses')) return '⚡';
    return '🎯';
  };

  const getTagColor = (tag: string) => {
    const tagLower = tag.toLowerCase();
    if (tagLower.includes('item')) return 'from-orange-500/20 to-red-500/20';
    if (tagLower.includes('lore')) return 'from-blue-500/20 to-purple-500/20';
    if (tagLower.includes('aventura')) return 'from-green-500/20 to-emerald-500/20';
    if (tagLower.includes('classe')) return 'from-purple-500/20 to-pink-500/20';
    if (tagLower.includes('raca') || tagLower.includes('raça')) return 'from-yellow-500/20 to-orange-500/20';
    if (tagLower.includes('regiao') || tagLower.includes('região')) return 'from-teal-500/20 to-cyan-500/20';
    if (tagLower.includes('magia')) return 'from-indigo-500/20 to-purple-500/20';
    if (tagLower.includes('talento')) return 'from-amber-500/20 to-yellow-500/20';
    if (tagLower.includes('personagem')) return 'from-rose-500/20 to-pink-500/20';
    if (tagLower.includes('relato')) return 'from-slate-500/20 to-gray-500/20';
    if (tagLower.includes('deus') || tagLower.includes('deuses')) return 'from-violet-500/20 to-purple-500/20';
    return 'from-primary-500/20 to-primary-600/20';
  };

  const getTagTitle = (tag: string) => {
    const tagLower = tag.toLowerCase();
    const tagMap: { [key: string]: string } = {
      'item': 'Itens e Equipamentos',
      'items': 'Itens e Equipamentos',
      'lore': 'História e Lore',
      'classe': 'Classes de Personagem',
      'classes': 'Classes de Personagem',
      'raca': 'Raças Disponíveis',
      'racas': 'Raças Disponíveis',
      'raça': 'Raças Disponíveis',
      'raças': 'Raças Disponíveis',
      'regiao': 'Regiões do Mundo',
      'regioes': 'Regiões do Mundo',
      'região': 'Regiões do Mundo',
      'regiões': 'Regiões do Mundo',
      'magia': 'Magias e Feitiços',
      'magias': 'Magias e Feitiços',
      'talento': 'Talentos e Habilidades',
      'talentos': 'Talentos e Habilidades',
      'personagem': 'Personagens',
      'personagens': 'Personagens',
      'relato': 'Relatos de Aventura',
      'relatos': 'Relatos de Aventura',
      'deus': 'Deuses e Divindades',
      'deuses': 'Deuses e Divindades',
    };
    
    return tagMap[tagLower] || `${tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase()}`;
  };

  return (
    <div className={`relative w-full h-36 md:h-44 bg-gradient-to-r from-dark-2 to-dark-3 rounded-lg mb-6 overflow-hidden`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${getTagColor(tagName)}`} />
      
      {/* Decorative pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 text-6xl animate-float">{getTagIcon(tagName)}</div>
        <div className="absolute bottom-4 right-4 text-6xl opacity-30 animate-float" style={{animationDelay: '1s'}}>{getTagIcon(tagName)}</div>
      </div>
      
      <div className="relative z-10 flex flex-col justify-center items-center h-full px-6 text-center">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl animate-bounce">{getTagIcon(tagName)}</span>
          <h1 className="text-2xl md:text-4xl font-bold text-white">
            {getTagTitle(tagName)}
          </h1>
        </div>
        {postCount !== undefined && (
          <p className="text-sm md:text-base text-light-3">
            {postCount} post{postCount !== 1 ? 's' : ''} encontrado{postCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer opacity-20" />
    </div>
  );
};

export default HeaderBanner;