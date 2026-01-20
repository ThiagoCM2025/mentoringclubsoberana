import { cn } from "@/lib/utils";

interface HighlightedTextProps {
  text: string;
  searchQuery: string;
  isCurrentResult?: boolean;
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function HighlightedText({ 
  text, 
  searchQuery, 
  isCurrentResult = false 
}: HighlightedTextProps) {
  if (!searchQuery.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(`(${escapeRegex(searchQuery)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className={cn(
              "rounded px-0.5 transition-colors",
              isCurrentResult
                ? "bg-orange-400 dark:bg-orange-500 ring-2 ring-orange-500"
                : "bg-yellow-300 dark:bg-yellow-600"
            )}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
