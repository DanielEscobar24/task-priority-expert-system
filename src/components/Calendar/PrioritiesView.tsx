'use client';
import {useId, useState} from 'react';
import {PriorityCard} from './slots/styled';
import type {CalendarTask} from './types';
import type {CalendarEvaluation} from './evaluation';

type Props = {
  tasks: CalendarTask[];
  outcomes: CalendarEvaluation[];
  referenceDate: string;
  onEdit: (index: number) => void;
};

const formatCF = (value: number) => value.toFixed(4).replace('.', ',');

/** Ordena solo esta vista: nunca muta las tareas ni el orden manual del calendario. */
function rank(outcome: CalendarEvaluation | undefined): [number, number] {
  if (!outcome || outcome.status === 'error') return [5, 0];
  const {evaluation} = outcome;
  if (evaluation.status === 'overdue') return [4, 0];
  const recommendation = evaluation.result?.recommendation;
  if (!recommendation) return [3, 0];
  const category = {alta: 0, media: 1, baja: 2}[String(recommendation.valor) as 'alta' | 'media' | 'baja'] ?? 3;
  return [category, -recommendation.cf];
}

function presentation(task: CalendarTask, outcome: CalendarEvaluation | undefined) {
  const evaluation = outcome?.status === 'evaluated' ? outcome.evaluation : null;
  const result = evaluation?.status === 'evaluated' ? evaluation.result : null;
  const recommendation = result?.recommendation;
  const title = !outcome ? 'Pendiente de referencia' : outcome.status === 'error' ? 'No se pudo evaluar' : evaluation?.status === 'overdue' ? 'Vencida' : recommendation ? `Prioridad ${recommendation.valor}` : 'Sin recomendación';
  const winningStep = result?.steps.find(step => step.conclusion[0] === recommendation?.nombre && step.conclusion[1] === recommendation?.valor);
  const declaredDelivery = task.hechos.fecha_entrega?.valor ?? task.deliveryDate;
  const delivery = evaluation ? evaluation.deliveryDate ?? 'Sin fecha' : declaredDelivery && declaredDelivery !== 'sin_fecha' ? String(declaredDelivery) : 'Sin fecha';
  const explanation = outcome?.status === 'error' ? outcome.message
    : evaluation?.status === 'overdue' ? 'Entrega anterior a la referencia. Se conserva fuera de priorización.'
    : recommendation ? winningStep?.porque ?? 'Recomendación obtenida de los hechos de la tarea.'
    : result ? 'No hay una recomendación con certeza suficiente. La tarea se conserva.'
    : 'La evaluación aparecerá al preparar la referencia.';
  return {evaluation, result, recommendation, title, delivery, explanation};
}

export default function PrioritiesView({tasks, outcomes, referenceDate, onEdit}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const panelId = useId();
  const indexes = tasks.map((_, index) => index).sort((a, b) => {
    const left = rank(outcomes[a]);
    const right = rank(outcomes[b]);
    return left[0] - right[0] || left[1] - right[1] || a - b;
  });
  const activeIndex = selectedIndex !== null && tasks[selectedIndex] ? selectedIndex : indexes[0];
  const task = activeIndex === undefined ? undefined : tasks[activeIndex];
  const active = task ? presentation(task, outcomes[activeIndex]) : null;

  return (
    <section className="priorities-view" aria-label="Recomendaciones de prioridad">
      <div className="priorities-toolbar">
        <span><strong>{tasks.length}</strong> {tasks.length === 1 ? 'tarea' : 'tareas'}</span>
        <span>Referencia <time dateTime={referenceDate || undefined}>{referenceDate || '…'}</time></span>
      </div>
      <p className="priorities-context">Se actualiza al guardar · Tu calendario mantiene su orden.</p>
      {!tasks.length && <p>No hay tareas para evaluar.</p>}
      <div className="priorities-layout">
        <ol className="priorities-list" aria-label="Tareas por prioridad">
          {indexes.map(index => {
            const item = presentation(tasks[index], outcomes[index]);
            return (
              <PriorityCard taskIndex={index} key={index} data-selected={index === activeIndex}>
                <button type="button" className="priority-select" aria-pressed={index === activeIndex} aria-controls={panelId} onClick={() => setSelectedIndex(index)}>
                  <span className="priority-topline">
                    <strong className="priority-result">{item.title}</strong>
                    {item.recommendation && <span className="priority-certainty"><small>CF</small> {formatCF(item.recommendation.cf)}</span>}
                  </span>
                  <strong className="priority-task-title">{tasks[index].caso}</strong>
                  <span className="priority-date">Entrega <strong>{item.delivery}</strong></span>
                </button>
              </PriorityCard>
            );
          })}
        </ol>
        {task && active && <section id={panelId} className="priority-panel" aria-labelledby={`${panelId}-title`}>
          <div className="priority-panel-heading">
            <div><p className="priority-panel-eyebrow">Detalle de tarea</p><h2 id={`${panelId}-title`}>{task.caso}</h2></div>
            <button type="button" onClick={() => onEdit(activeIndex)} aria-label={`Editar ${task.caso}`}>Editar</button>
          </div>
          <div className="priority-panel-result">
            <strong>{active.title}</strong>
            {active.recommendation && <span title="Factor de certeza: apoyo, no probabilidad">CF {formatCF(active.recommendation.cf)}</span>}
          </div>
          <div className="priority-panel-facts">
            <span>Importancia · {String(task.hechos.importancia?.valor ?? 'Sin dato')}</span>
            <span>Esfuerzo · {String(task.hechos.esfuerzo?.valor ?? 'Sin dato')}</span>
            <span>Entrega · {active.delivery}</span>
            {active.evaluation && <span>Plazo · {active.evaluation.plazo.replaceAll('_', ' ')}</span>}
          </div>
          <p>{active.explanation}</p>
          {task.description && <p className="priority-description">{task.description}</p>}
          <p className="priority-panel-note">CF expresa apoyo, no probabilidad. Este orden no mueve las tareas del calendario.</p>
          <div className="priority-detail-content">
            {active.result && <>
              <h3>Reglas aplicadas</h3>
              {active.result.steps.length ? active.result.steps.map(step => <p key={step.regla}><strong>{step.regla}</strong> · {step.porque}</p>) : <p>Ninguna regla produjo conclusión.</p>}
            </>}
            <h3>{active.result ? 'Hechos utilizados' : 'Hechos declarados'}</h3>
            <dl>{Object.entries(active.result?.initial ?? task.hechos).map(([name, fact]) => <div key={name}>
              <dt>{name.replaceAll('_', ' ')} <strong>{String(fact.valor).replaceAll('_', ' ')}</strong></dt>
              <dd>CF {formatCF(fact.cf)} · {fact.origen}</dd>
            </div>)}</dl>
            {active.result && <>
              <h3>Alternativas</h3>
              {active.result.inferred.length ? active.result.inferred.map(fact => <p key={`${fact.nombre}:${fact.valor}`}><strong>{String(fact.valor)}</strong> · CF {formatCF(fact.cf)} · {fact.origen.join(', ')}</p>) : <p>Sin alternativas inferidas.</p>}
              <p>Reglas excluidas: {active.result.excluded.map(item => item.regla).join(', ') || 'ninguna'}.</p>
            </>}
          </div>
        </section>}
      </div>
    </section>
  );
}
