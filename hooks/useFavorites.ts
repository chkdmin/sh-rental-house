'use client';

import { useCallback, useSyncExternalStore, useMemo } from 'react';

const STORAGE_KEY = 'sh-rentl-house-favorites';

function getStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load favorites:', error);
  }
  return [];
}

function saveFavorites(favorites: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
}

const FAVORITES_CHANGE_EVENT = 'favorites-change';

function subscribe(callback: () => void): () => void {
  window.addEventListener(FAVORITES_CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(FAVORITES_CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): string {
  return localStorage.getItem(STORAGE_KEY) || '[]';
}

function getServerSnapshot(): string {
  return '[]';
}

export function useFavorites() {
  const storeValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const favorites = useMemo(() => JSON.parse(storeValue) as string[], [storeValue]);
  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const toggleFavorite = useCallback((propertyId: string) => {
    const current = getStoredFavorites();
    if (current.includes(propertyId)) {
      saveFavorites(current.filter(id => id !== propertyId));
    } else {
      saveFavorites([...current, propertyId]);
    }
    window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
  }, []);

  const isFavorite = useCallback((propertyId: string) => {
    return favoritesSet.has(propertyId);
  }, [favoritesSet]);

  const clearFavorites = useCallback(() => {
    saveFavorites([]);
    window.dispatchEvent(new Event(FAVORITES_CHANGE_EVENT));
  }, []);

  return {
    favorites,
    favoritesSet,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  };
}
