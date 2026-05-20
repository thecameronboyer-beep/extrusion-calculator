import { useEffect, useState } from 'react';

export function usePersistentState(storageKey, initialValue) {
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const savedValue = window.localStorage.getItem(storageKey);

      if (!savedValue) {
        return initialValue;
      }

      const parsedValue = JSON.parse(savedValue);

      const shouldMergeObjects =
        initialValue &&
        typeof initialValue === 'object' &&
        !Array.isArray(initialValue) &&
        parsedValue &&
        typeof parsedValue === 'object' &&
        !Array.isArray(parsedValue);

      if (shouldMergeObjects) {
        return { ...initialValue, ...parsedValue };
      }

      if (initialValue && typeof initialValue === 'object') {
        return initialValue;
      }

      return parsedValue ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage can be unavailable in restricted browser modes.
    }
  }, [state, storageKey]);

  return [state, setState];
}
