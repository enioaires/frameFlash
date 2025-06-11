import { useCallback, useEffect, useMemo, useState } from "react";

export default function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  const updateDebouncedValue = useCallback((newValue: T) => {
    setDebouncedValue(newValue);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      updateDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay, updateDebouncedValue]);

  return debouncedValue;
}

export function useDebouncedSearch(searchTerm: string, posts: any[], delay: number = 300) {
  const debouncedTerm = useDebounce(searchTerm, delay);
  
  const searchResults = useMemo(() => {
    if (!debouncedTerm.trim()) return posts;
    
    const term = debouncedTerm.toLowerCase();
    return posts.filter(post => {
      const title = post.title?.toLowerCase() || '';
      const captions = Array.isArray(post.captions)
        ? post.captions.join(' ').toLowerCase()
        : (post.captions || '').toLowerCase();
      const tags = post.tags?.join(' ').toLowerCase() || '';

      return title.includes(term) || captions.includes(term) || tags.includes(term);
    });
  }, [debouncedTerm, posts]);

  return { searchResults, isSearching: searchTerm !== debouncedTerm };
}