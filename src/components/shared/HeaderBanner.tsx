import React, { useState } from 'react';

import BannerEditor from './BannerEditor';
import { Edit3 } from 'lucide-react';
import Loader from './Loader';
import { isAdmin } from '@/lib/adventures';
import { useGetBannerByTypeAndIdentifier } from '@/lib/react-query/banners';
import { useUserContext } from '@/context/AuthContext';

interface HeaderBannerProps {
  type: 'home' | 'tag';
  identifier: string;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Default fallback image
const DEFAULT_BANNER_IMAGE = "https://fra.cloud.appwrite.io/v1/storage/buckets/6838e3a400362003b2ce/files/6838e3c700212167feae/view?project=653bbdb36f4fd0fbd9f7&mode=admin";

const HeaderBanner: React.FC<HeaderBannerProps> = ({
  type,
  identifier,
  height = 'md',
  className = ''
}) => {
  const { user } = useUserContext();
  const [showEditor, setShowEditor] = useState(false);
  const userIsAdmin = isAdmin(user);

  const { data: banner, isLoading } = useGetBannerByTypeAndIdentifier(type, identifier);

  const heightClasses = {
    sm: 'h-32 md:h-40',
    md: 'h-40 md:h-56',
    lg: 'h-56 md:h-72'
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`relative w-full ${heightClasses[height]} bg-dark-3 rounded-lg mb-6 overflow-hidden animate-pulse ${className}`}>
        <div className="flex items-center justify-center h-full">
          <Loader size="md" />
        </div>
      </div>
    );
  }

  // Get banner image URL with fallback
  const bannerImage = banner?.imageUrl || DEFAULT_BANNER_IMAGE;

  return (
    <>
      <div className={`relative w-full ${heightClasses[height]} overflow-hidden rounded-lg mb-6 group ${className}`}>
        {/* Banner Image */}
        <img 
          src={bannerImage} 
          alt={banner?.title || `Banner ${identifier}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default image if banner image fails to load
            (e.target as HTMLImageElement).src = DEFAULT_BANNER_IMAGE;
          }}
        />

        {/* Edit Button for Admins */}
        {userIsAdmin && (
          <button
            onClick={() => setShowEditor(true)}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            <span className="text-sm font-medium">Editar Banner</span>
          </button>
        )}

        {/* Subtle overlay for better readability if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>

      {/* Banner Editor Modal */}
      {showEditor && userIsAdmin && banner && (
        <BannerEditor
          type={type}
          identifier={identifier}
          currentBanner={banner}
          onClose={() => setShowEditor(false)}
        />
      )}
    </>
  );
};

// Hook para facilitar o uso em diferentes páginas
export const usePageBanner = (type: 'home' | 'tag', identifier: string) => {
  const { data: banner, isLoading, isError } = useGetBannerByTypeAndIdentifier(type, identifier);
  
  return {
    banner,
    isLoading,
    isError,
    bannerUrl: banner?.imageUrl || DEFAULT_BANNER_IMAGE
  };
};

export default HeaderBanner;