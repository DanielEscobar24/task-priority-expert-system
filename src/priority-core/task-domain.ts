import type {Case} from './types';
import {parseCase} from './validation';
import {calendarDay} from './dates';

export type TaskCase = Case & {fecha_referencia?: string};

/** Validador de dominio separado del mecanismo genérico de inferencia. */
export function parseTaskCase(raw: unknown): TaskCase {
 const input = parseCase(raw) as TaskCase;
 const vocabulary: Record<string,string[]> = {plazo:['urgente','proximo','con_tiempo','sin_fecha'],importancia:['alta','media','baja'],esfuerzo:['alto','medio','bajo']};
 if (!input.hechos.importancia || !input.hechos.esfuerzo) throw Error('La tarea necesita importancia y esfuerzo; plazo es opcional.');
 if (Object.keys(input.hechos).some(n=>n !== 'fecha_entrega' && !(n in vocabulary))) throw Error('Hecho de tarea desconocido.');
 for (const [n,allowed] of Object.entries(vocabulary)) {
  const f=input.hechos[n];
  if (n === 'plazo' && !f) continue;
  if (!f || typeof f.valor !== 'string' || !allowed.includes(f.valor)) throw Error(`Valor no válido para ${n}.`);
 }
 const delivery = input.hechos.fecha_entrega;
 if (delivery) {
   if (typeof delivery.valor !== 'string') throw Error('fecha_entrega debe ser AAAA-MM-DD o sin_fecha.');
   if (delivery.valor !== 'sin_fecha') calendarDay(delivery.valor);
 }
 if (input.fecha_referencia !== undefined) {
   if (typeof input.fecha_referencia !== 'string') throw Error('fecha_referencia debe ser AAAA-MM-DD.');
   calendarDay(input.fecha_referencia);
 }
 return input;
}
