import { useState, useEffect } from 'react';

/**
 * A custom hook that tracks the state of a media query.
 * @param query The media query string to watch.
 * @returns `true` if the media query matches, otherwise `false`.
 */
export function useMediaQuery(query: string): boolean {
  const [value, setValue] = useState(false);

  useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    const result = window.matchMedia(query);
    // Set the initial value
    setValue(result.matches);
    // Add listener for changes
    result.addEventListener('change', onChange);

    // Cleanup listener on component unmount
    return () => result.removeEventListener('change', onChange);
  }, [query]);

  return value;
}