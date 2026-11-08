/** Fechas civiles sin hora: reloj explícito, sin Date.now ni dependencia de zona local. */
export type DeadlineCategory = 'urgente' | 'proximo' | 'con_tiempo' | 'sin_fecha' | 'vencida';
const DAY_MS = 86_400_000;

export function calendarDay(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw Error('La fecha debe usar AAAA-MM-DD.');
  const [year, month, day] = value.split('-').map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  if (year < 1000 || parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    throw Error(`Fecha no válida: ${value}.`);
  }
  return timestamp / DAY_MS;
}

/** Umbrales provisionales del proyecto, no una escala validada por un experto. */
export function classifyDeadline(delivery: string, referenceDate: string): {
  plazo: DeadlineCategory; daysRemaining: number | null; deliveryDate: string | null;
} {
  const today = calendarDay(referenceDate);
  if (delivery === 'sin_fecha') return {plazo: 'sin_fecha', daysRemaining: null, deliveryDate: null};
  const daysRemaining = calendarDay(delivery) - today;
  const plazo = daysRemaining < 0 ? 'vencida' : daysRemaining <= 2 ? 'urgente' : daysRemaining <= 7 ? 'proximo' : 'con_tiempo';
  return {plazo, daysRemaining, deliveryDate: delivery};
}
