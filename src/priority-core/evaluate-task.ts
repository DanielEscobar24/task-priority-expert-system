import type {EvaluationResult} from './engine';
import {evaluate} from './engine';
import {classifyDeadline} from './dates';
import {parseKnowledge} from './validation';
import {parseTaskCase} from './task-domain';

type DeadlineInfo = ReturnType<typeof classifyDeadline> & {referenceDate: string};
export type TaskEvaluation = DeadlineInfo & (
  | {status: 'overdue'; result: null}
  | {status: 'evaluated'; result: EvaluationResult}
);

/** Adaptador de fechas del dominio; la inferencia genérica permanece independiente. */
export function evaluateTask(knowledge: unknown, raw: unknown, referenceDate: string): TaskEvaluation {
  const kb = parseKnowledge(knowledge);
  const input = parseTaskCase(raw);
  const dateFact = input.hechos.fecha_entrega;
  if (!dateFact) throw Error('Indica fecha_entrega o declara sin_fecha antes de evaluar con fechas.');
  const deadline = classifyDeadline(String(dateFact.valor), referenceDate);
  // Una fecha pasada no participa en la priorización, ni siquiera en reglas sin plazo.
  if (deadline.plazo === 'vencida') return {...deadline, referenceDate, status: 'overdue', result: null};
  const prepared = {...input, hechos: {...input.hechos, plazo: {
    valor: deadline.plazo,
    cf: dateFact.cf,
    origen: `Preparación desde fecha_entrega=${dateFact.valor}, referencia=${referenceDate}; CF conservado del dato de fecha. Fuente: ${dateFact.origen}`,
    clase: 'inicial' as const,
  }}};
  return {...deadline, referenceDate, status: 'evaluated', result: evaluate(kb, prepared)};
}
