import React, { Suspense } from 'react';

import { Models } from 'appwrite';
import PostCard from './PostCard';

export const PostCardSkeleton = () => (
  <div className="bg-dark-2 rounded-3xl border border-dark-4 p-5 lg:p-7 animate-pulse">
    <div className="flex-between mb-5">
      <div className="flex items-center gap-3">
        <div className="rounded-full w-12 h-12 bg-dark-3" />
        <div className="flex flex-col gap-2">
          <div className="h-4 bg-dark-3 rounded w-32" />
          <div className="h-3 bg-dark-3 rounded w-24" />
        </div>
      </div>
      <div className="w-5 h-5 bg-dark-3 rounded" />
    </div>
    
    <div className="mb-5">
      <div className="h-8 bg-dark-3 rounded w-3/4 mb-2" />
      <div className="h-6 bg-dark-3 rounded w-1/2" />
    </div>
    
    <div className="w-full h-80 bg-dark-3 rounded-[24px] mb-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dark-2/50 to-transparent animate-shimmer" />
    </div>
    
    {/* NOVO: Skeleton para player de áudio (50% chance de aparecer) */}
    {Math.random() > 0.5 && (
      <div className="mb-4 bg-dark-3 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-4 h-4 bg-dark-4 rounded" />
          <div className="h-3 bg-dark-4 rounded w-24" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-dark-4 rounded" />
          <div className="w-12 h-12 bg-dark-4 rounded-full" />
          <div className="w-8 h-8 bg-dark-4 rounded" />
          <div className="flex-1 h-2 bg-dark-4 rounded-full" />
          <div className="w-16 h-1 bg-dark-4 rounded" />
        </div>
      </div>
    )}
    
    <div className="space-y-2 mb-5">
      <div className="h-4 bg-dark-3 rounded w-full" />
      <div className="h-4 bg-dark-3 rounded w-5/6" />
      <div className="h-4 bg-dark-3 rounded w-4/6" />
      <div className="h-4 bg-dark-3 rounded w-3/6" />
    </div>
    
    <div className="flex gap-2 mb-5">
      <div className="h-6 bg-dark-3 rounded-full w-16" />
      <div className="h-6 bg-dark-3 rounded-full w-20" />
      <div className="h-6 bg-dark-3 rounded-full w-14" />
    </div>
    
    <div className="flex items-center justify-between">
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-dark-3 rounded-full" />
          <div className="w-8 h-4 bg-dark-3 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-dark-3 rounded-full" />
          <div className="w-6 h-4 bg-dark-3 rounded" />
        </div>
      </div>
      <div className="w-10 h-10 bg-dark-3 rounded-full" />
    </div>
  </div>
);

interface LazyPostCardProps {
  post: Models.Document;
}

const LazyPostCard: React.FC<LazyPostCardProps> = ({ post }) => (
  <Suspense fallback={<PostCardSkeleton />}>
    <PostCard post={post} />
  </Suspense>
);

export default LazyPostCard;