import { useMemo, useState, type KeyboardEvent } from "react";
import { Check, Phone, Search, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Client } from "@/pages/user/clients/types";

const normalizeText = (value?: string) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizeDigits = (value?: string) => (value || "").replace(/\D/g, "");

const getClientName = (client: Client) =>
  `${client.firstName || ""} ${client.lastName || ""}`.trim();

const getClientLabel = (client: Client) => {
  const name = getClientName(client);

  if (name && client.phone) {
    return `${name} - ${client.phone}`;
  }

  if (name) {
    return name;
  }

  if (client.phone) {
    return client.phone;
  }

  if (client.email) {
    return client.email;
  }

  return client.id;
};

const matchesClient = (client: Client, query: string) => {
  if (!query) {
    return false;
  }

  const normalizedQuery = normalizeText(query);
  const digitQuery = normalizeDigits(query);

  const searchableText = [
    getClientName(client),
    client.phone,
    client.email,
  ]
    .map((value) => normalizeText(value))
    .join(" ");

  if (searchableText.includes(normalizedQuery)) {
    return true;
  }

  if (!digitQuery) {
    return false;
  }

  return normalizeDigits(client.phone).includes(digitQuery);
};

interface ClientAutocompleteProps {
  clients: Client[];
  value: string;
  disabled?: boolean;
  placeholder: string;
  emptyLabel: string;
  onValueChange: (value: string) => void;
}

export function ClientAutocomplete({
  clients,
  value,
  disabled = false,
  placeholder,
  emptyLabel,
  onValueChange,
}: ClientAutocompleteProps) {
  const [draftQuery, setDraftQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const selectedClient = useMemo(
    () => clients.find((client) => client.id === value) || null,
    [clients, value],
  );

  const selectedLabel = useMemo(() => {
    if (!selectedClient) {
      return "";
    }

    return getClientLabel(selectedClient);
  }, [selectedClient]);

  const query = useMemo(() => {
    if (disabled && !value) {
      return "";
    }

    if (selectedClient) {
      return selectedLabel;
    }

    return draftQuery;
  }, [disabled, draftQuery, selectedClient, selectedLabel, value]);

  const filteredClients = useMemo(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return [];
    }

    return clients
      .filter((client) => matchesClient(client, trimmedQuery))
      .slice(0, 8);
  }, [clients, query]);

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

    if (!selectedClient) {
      return true;
    }

    return query.trim() !== selectedLabel;
  }, [disabled, isFocused, query, selectedClient, selectedLabel]);

  const handleSelect = (client: Client) => {
    onValueChange(client.id);
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
        current >= filteredClients.length - 1 ? 0 : current + 1,
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) =>
        current <= 0 ? filteredClients.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter") {
      const selectedSuggestion = filteredClients[highlightedIndex];

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
          {filteredClients.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {emptyLabel}
            </div>
          )}

          {filteredClients.map((client, index) => {
            const isHighlighted = index === highlightedIndex;
            const clientName = getClientName(client);

            return (
              <button
                key={client.id}
                type="button"
                className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left transition-colors ${
                  isHighlighted ? "bg-muted" : "hover:bg-muted/60"
                }`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  handleSelect(client);
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm font-medium text-foreground">
                      {clientName || client.email || client.phone || client.id}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {client.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    )}
                    {client.email && <span className="truncate">{client.email}</span>}
                  </div>
                </div>
                {client.id === value && (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-pink" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
