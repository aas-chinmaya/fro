"use client";

import { SearchIcon } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
  disabled?: boolean;
}

export default function Search({
  placeholder = "Search",
  value,
  onChange,
  onDebouncedChange,
  debounceMs = 400,
  disabled = false,
}: Props) {
  const timerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const callbackRef = useRef(onDebouncedChange);

  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    callbackRef.current = onDebouncedChange;
  }, [onDebouncedChange]);

  useEffect(() => {
    /*
     * Do not trigger search on initial mount.
     *
     * This is important because the list may restore
     * page/search state from sessionStorage.
     */
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    if (!callbackRef.current) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      callbackRef.current?.(value);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, debounceMs]);

  return (
    <div className="relative">
      <SearchIcon
        className="
          absolute
          left-3
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-gray-400
        "
      />

      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="
          h-10
          w-full
          rounded-lg
          border
          border-gray-200
          bg-white
          pl-10
          pr-3
          text-sm
          outline-none
          transition
          focus:border-primary
          focus:ring-2
          focus:ring-primary/20
          disabled:cursor-not-allowed
          disabled:bg-gray-100
        "
      />
    </div>
  );
}