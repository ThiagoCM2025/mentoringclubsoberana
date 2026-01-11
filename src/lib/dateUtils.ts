/**
 * Utilitários de data centralizados para o timezone de Brasília (GMT-3)
 * Este arquivo garante consistência de datas em todo o sistema
 */

// Timezone padrão do sistema
export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

/**
 * Obter data/hora atual no horário de Brasília
 */
export function getBrazilNow(): Date {
  const now = new Date();
  // Cria uma string no timezone de Brasília e converte de volta para Date
  const brazilTimeString = now.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE });
  return new Date(brazilTimeString);
}

/**
 * Obter data de hoje (meia-noite) no horário de Brasília
 */
export function getBrazilToday(): Date {
  const today = getBrazilNow();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Obter o ano atual no horário de Brasília
 */
export function getBrazilYear(): number {
  return getBrazilNow().getFullYear();
}

/**
 * Formatar data para exibição em pt-BR
 */
export function formatBrazilDate(
  date: Date | string, 
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    timeZone: BRAZIL_TIMEZONE,
    ...options
  });
}

/**
 * Formatar data e hora para exibição em pt-BR
 */
export function formatBrazilDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', { timeZone: BRAZIL_TIMEZONE });
}

/**
 * Formatar hora para exibição em pt-BR
 */
export function formatBrazilTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('pt-BR', { 
    timeZone: BRAZIL_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Verificar se uma data é hoje (no horário de Brasília)
 */
export function isTodayBrazil(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = getBrazilToday();
  
  // Converter a data de entrada para o timezone de Brasília
  const checkString = d.toLocaleString('en-US', { timeZone: BRAZIL_TIMEZONE });
  const check = new Date(checkString);
  check.setHours(0, 0, 0, 0);
  
  return check.getTime() === today.getTime();
}

/**
 * Verificar se uma data é no futuro (no horário de Brasília)
 */
export function isFutureBrazil(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d > getBrazilNow();
}

/**
 * Verificar se uma data é no passado (no horário de Brasília)
 */
export function isPastBrazil(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < getBrazilNow();
}

/**
 * Obter data X dias atrás no horário de Brasília
 */
export function getBrazilDaysAgo(days: number): Date {
  const date = getBrazilNow();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Obter data X meses atrás no horário de Brasília
 */
export function getBrazilMonthsAgo(months: number): Date {
  const date = getBrazilNow();
  date.setMonth(date.getMonth() - months);
  return date;
}

/**
 * Obter data X anos atrás no horário de Brasília
 */
export function getBrazilYearsAgo(years: number): Date {
  const date = getBrazilNow();
  date.setFullYear(date.getFullYear() - years);
  return date;
}

/**
 * Obter o início do mês atual no horário de Brasília
 */
export function getBrazilStartOfMonth(date?: Date): Date {
  const d = date || getBrazilNow();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Obter o fim do mês atual no horário de Brasília
 */
export function getBrazilEndOfMonth(date?: Date): Date {
  const d = date || getBrazilNow();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Calcular a diferença em dias entre duas datas
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcular a diferença em semanas entre duas datas
 */
export function getWeeksDifference(date1: Date, date2: Date): number {
  return Math.floor(getDaysDifference(date1, date2) / 7);
}

/**
 * Converter data para ISO string com timezone de Brasília
 */
export function toBrazilISOString(date?: Date): string {
  const d = date || getBrazilNow();
  // Formatar com offset -03:00
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}-03:00`;
}
