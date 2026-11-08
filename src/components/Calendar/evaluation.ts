import {evaluateTask, type TaskEvaluation} from '../../priority-core';
import type {CalendarTask} from './types';

export type CalendarEvaluation =
  | {status: 'evaluated'; evaluation: TaskEvaluation}
  | {status: 'error'; message: string};

/** Adaptador de UI: no consulta ubicación, orden, DOM ni reloj implícito. */
export function evaluateCalendarTask(knowledge: unknown, task: CalendarTask, referenceDate: string): CalendarEvaluation {
  try {
    const fecha_entrega = task.hechos.fecha_entrega ?? {
      valor: task.deliveryDate || 'sin_fecha',
      cf: 1,
      origen: 'Fecha de entrega declarada en el formulario, o ausencia declarada; CF 1 por convención de captura.',
      clase: 'inicial' as const,
    };
    // El formato genérico exige rol académico; este metadato no interviene en la inferencia.
    const input = {caso: task.caso, rol: 'no_concluye', hechos: {...task.hechos, fecha_entrega}};
    return {status: 'evaluated', evaluation: evaluateTask(knowledge, input, referenceDate)};
  } catch (cause) {
    return {status: 'error', message: cause instanceof Error ? cause.message : 'No se pudo evaluar la tarea.'};
  }
}

/** Proyección de lectura: la tarjeta muestra el plazo calculado sin sobrescribir los hechos guardados. */
export function taskForCalendarDisplay(task: CalendarTask, outcome?: CalendarEvaluation): CalendarTask {
  if (!outcome || outcome.status === 'error') return task;
  const {evaluation} = outcome;
  const plazo = evaluation.result?.initial.plazo ?? {
    valor: evaluation.plazo,
    cf: task.hechos.fecha_entrega?.cf ?? 1,
    origen: 'Estado temporal preparado para la referencia visible; no es prioridad inferida.',
    clase: 'inicial' as const,
  };
  return {...task, hechos: {...task.hechos, plazo}};
}
