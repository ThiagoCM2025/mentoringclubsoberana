import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Shorten a long name to fit in limited space
 * "Fabiana Duarte Advogada e Mentora" → "Fabiana Duarte"
 * "Maria Santos Silva Costa" → "Maria S. Costa"
 */
export function shortenName(name: string | null, maxLength = 25): string {
  if (!name) return "";
  if (name.length <= maxLength) return name;
  
  const parts = name.split(" ").filter(p => p.length > 0);
  if (parts.length <= 2) return name.substring(0, maxLength);
  
  // Keep first name + abbreviated middle + last name
  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, -1);
  
  // Try with abbreviated middle names
  const abbreviated = `${first} ${middle.map(m => m[0] + ".").join(" ")} ${last}`;
  if (abbreviated.length <= maxLength) return abbreviated;
  
  // Just first + last name
  const simple = `${first} ${last}`;
  if (simple.length <= maxLength) return simple;
  
  // Truncate with ellipsis
  return name.substring(0, maxLength - 1) + "…";
}
