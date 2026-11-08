import {validDateKey} from '../../lib/calendar';
import type {CalendarTask} from './types';

/** Ubicación inicial desde entregas declaradas; nunca inventa fechas ni cambia los hechos. */
export function initialTaskDates(tasks: CalendarTask[]): Record<number, string> {
  return Object.fromEntries(tasks.flatMap((task, index) => {
    const value = task.hechos.fecha_entrega?.valor ?? task.deliveryDate;
    return typeof value === 'string' && validDateKey(value) ? [[index, value]] : [];
  }));
}

/** Abre la semana de la primera entrega disponible para que los casos fechados sean visibles. */
export function initialCalendarAnchor(dates: Record<number, string>, fallback: Date): Date {
  const first = Object.values(dates).sort()[0];
  if (!first) return fallback;
  const [year, month, day] = first.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}
