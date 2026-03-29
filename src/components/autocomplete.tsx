import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronDown, Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_OPTIONS = 50;

const normalizeText = (value?: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

interface AutocompleteProps<T> {
  options: T[];
  value: string | null;
  onChange: (value: string | null) => void;
  getOptionValue: (option: T) => string;
  getOptionSearchText: (option: T) => string;
  renderOption: (option: T, selected: boolean) => ReactNode;
  renderValue?: (option: T | null) => ReactNode;
  placeholder: string;
  emptyMessage: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function Autocomplete<T>({
  options,
  value,
  onChange,
  getOptionValue,
  getOptionSearchText,
  renderOption,
  renderValue,
  placeholder,
  emptyMessage,
  searchPlaceholder,
  disabled = false,
  className,
}: Readonly<AutocompleteProps<T>>) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => getOptionValue(option) === value) || null,
    [getOptionValue, options, value],
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    return options
      .filter((option) => {
        if (!normalizedSearch) {
          return true;
        }

        return normalizeText(getOptionSearchText(option)).includes(
          normalizedSearch,
        );
      })
      .slice(0, MAX_VISIBLE_OPTIONS);
  }, [getOptionSearchText, options, search]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
        setHighlightedIndex(0);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) {
      return;
    }

    if (isOpen) {
      setIsOpen(false);
      setSearch("");
      setHighlightedIndex(0);
      return;
    }

    setIsOpen(true);
  };

  const handleSelect = (option: T) => {
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearch("");
    setHighlightedIndex(0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!filteredOptions.length) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current >= filteredOptions.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current <= 0 ? filteredOptions.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      const highlightedOption = filteredOptions[highlightedIndex];

      if (!highlightedOption) {
        return;
      }

      event.preventDefault();
      handleSelect(highlightedOption);
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setSearch("");
      setHighlightedIndex(0);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button
        type="button"
        variant="outline"
        onClick={toggleOpen}
        disabled={disabled}
        className={cn(
          "w-full justify-between bg-white text-black",
          !selectedOption && "text-muted-foreground",
          className,
        )}
      >
        <span className="truncate text-left">
          {selectedOption
            ? (renderValue?.(selectedOption) ?? placeholder)
            : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border bg-white shadow-lg">
          <div className="border-b px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={
                  searchPlaceholder || String(t("search.searchPlaceholder"))
                }
                autoComplete="off"
                className="bg-white ps-10 text-black"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto py-1">
            {!filteredOptions.length && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}

            {filteredOptions.map((option, index) => {
              const optionValue = getOptionValue(option);
              const isSelected = optionValue === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={optionValue}
                  type="button"
                  className={cn(
                    "block w-full px-3 py-2 text-left transition-colors",
                    isHighlighted ? "bg-muted" : "hover:bg-muted/60",
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(option);
                  }}
                >
                  {renderOption(option, isSelected)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
