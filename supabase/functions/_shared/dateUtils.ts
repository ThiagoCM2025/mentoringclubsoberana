/**
 * Utilitários de data para Edge Functions - Timezone de Brasília (GMT-3)
 * Este arquivo garante consistência de datas em todas as funções do servidor
 */

// Offset de Brasília em minutos (-3 horas)
const BRAZIL_OFFSET_MINUTES = -3 * 60;

/**
 * Obter data/hora atual no horário de Brasília (GMT-3)
 */
export function getBrazilNow(): Date {
  const now = new Date();
  // Converter UTC para GMT-3 (Brasília)
  const utcOffset = now.getTimezoneOffset(); // Offset local em minutos (positivo a oeste de UTC)
  const diff = BRAZIL_OFFSET_MINUTES + utcOffset;
  return new Date(now.getTime() + diff * 60 * 1000);
}

/**
 * Obter o ano atual no horário de Brasília
 */
export function getBrazilYear(): number {
  return getBrazilNow().getFullYear();
}

/**
 * Obter ISO string com horário de Brasília
 */
export function getBrazilISOString(): string {
  return getBrazilNow().toISOString();
}

/**
 * Obter data de hoje (meia-noite) no horário de Brasília em ISO
 */
export function getBrazilTodayISO(): string {
  const now = getBrazilNow();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00.000Z`;
}

/**
 * Obter data X horas atrás em ISO
 */
export function getBrazilHoursAgoISO(hours: number): string {
  const date = getBrazilNow();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

/**
 * Obter data X dias atrás em ISO
 */
export function getBrazilDaysAgoISO(days: number): string {
  const date = getBrazilNow();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/**
 * Formatar data para exibição em pt-BR
 */
export function formatBrazilDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

/**
 * Formatar data e hora para exibição em pt-BR
 */
export function formatBrazilDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

/**
 * Obter dia da semana atual em inglês (para comparações)
 */
export function getBrazilWeekdayEnglish(): string {
  const dayMap: Record<number, string> = {
    0: "sunday",
    1: "monday",
    2: "tuesday",
    3: "wednesday",
    4: "thursday",
    5: "friday",
    6: "saturday",
  };
  return dayMap[getBrazilNow().getDay()];
}

/**
 * Obter hora atual de Brasília
 */
export function getBrazilHour(): number {
  return getBrazilNow().getHours();
}

/**
 * Obter minuto atual de Brasília
 */
export function getBrazilMinute(): number {
  return getBrazilNow().getMinutes();
}
