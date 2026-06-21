"use client";

import { useCallback, useState } from "react";

/**
 * Persists state to localStorage with SSR safety.
 * Handles JSON parse errors gracefully by falling back to the initial value.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const resolved = typeof value === "function" ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // Quota exceeded or private mode — silently ignore
        }
        return resolved;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
