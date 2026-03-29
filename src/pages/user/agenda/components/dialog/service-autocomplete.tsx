import { useMemo, useState, type KeyboardEvent } from "react";
import { Check, Clock, Scissors, Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Service } from "@/pages/user/services/types";
import { translateServiceName } from "@/common/service-translations";

const normalizeText = (value?: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getCategoryLabel = (service: Service) => {
  if (typeof service.category === "string") {
    return service.category;
  }

  if (service.category && typeof service.category.name === "string") {
    return service.category.name;
  }

  return "";
};

interface ServiceAutocompleteProps {
  services: Service[];
  value: string;
  disabled?: boolean;
  placeholder: string;
  emptyLabel: string;
  onValueChange: (value: string) => void;
}

export function ServiceAutocomplete({
  services,
  value,
  disabled = false,
  placeholder,
  emptyLabel,
  onValueChange,
}: ServiceAutocompleteProps) {
  const { t } = useTranslation();
  const [draftQuery, setDraftQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedService = useMemo(
    () => services.find((service) => service.id === value) || null,
    [services, value],
  );

  const selectedLabel = useMemo(() => {
    if (!selectedService) {
      return "";
    }

    return translateServiceName(t, selectedService);
  }, [selectedService, t]);

  const query = useMemo(() => {
    if (disabled && !value) {
      return "";
    }

    if (selectedService) {
      return selectedLabel;
    }

    return draftQuery;
  }, [disabled, draftQuery, selectedLabel, selectedService, value]);

  const filteredServices = useMemo(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    const normalizedQuery = normalizeText(trimmedQuery);

    return services
      .filter((service) => {
        const searchableText = [
          translateServiceName(t, service),
          service.name,
          getCategoryLabel(service),
        ]
          .map((entry) => normalizeText(entry))
          .join(" ");

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 8);
  }, [query, services, t]);

  const showResults = useMemo(() => {
    if (disabled) {
      return false;
    }

    if (!isFocused) {
      return false;
    }

    if (!query.trim()) {
      return false;
    }

    if (!selectedService) {
      return true;
    }

    return query.trim() !== selectedLabel;
  }, [disabled, isFocused, query, selectedLabel, selectedService]);

  const handleSelect = (service: Service) => {
    onValueChange(service.id);
    setDraftQuery("");
    setIsFocused(false);
    setHighlightedIndex(0);
  };

  const handleClear = () => {
    onValueChange("");
    setDraftQuery("");
    setIsFocused(false);
    setHighlightedIndex(0);
  };

  const handleInputChange = (nextQuery: string) => {
    setDraftQuery(nextQuery);
    setHighlightedIndex(0);

    if (value) {
      onValueChange("");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showResults) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current >= filteredServices.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current <= 0 ? filteredServices.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      const selectedSuggestion = filteredServices[highlightedIndex];

      if (!selectedSuggestion) {
        return;
      }

      event.preventDefault();
      handleSelect(selectedSuggestion);
      return;
    }

    if (event.key === "Escape") {
      setIsFocused(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className="bg-white pe-10 ps-10 text-black"
        />
        {(query || value) && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute end-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showResults && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border bg-white shadow-lg">
          {filteredServices.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {emptyLabel}
            </div>
          )}

          {filteredServices.map((service, index) => {
            const isHighlighted = index === highlightedIndex;
            const categoryLabel = getCategoryLabel(service);

            return (
              <button
                key={service.id}
                type="button"
                className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left transition-colors ${
                  isHighlighted ? "bg-muted" : "hover:bg-muted/60"
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(service);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Scissors className="h-4 w-4 shrink-0 text-accent-pink" />
                    <span className="truncate text-sm font-medium text-foreground">
                      {translateServiceName(t, service)}
                    </span>
                    {service.isPack && (
                      <span className="rounded-full bg-accent-pink/10 px-2 py-0.5 text-[10px] font-medium text-accent-pink">
                        {t("services.pack")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.duration} min
                    </span>
                    {categoryLabel && <span>{categoryLabel}</span>}
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {service.price}
                  </span>
                  {service.id === value && (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
