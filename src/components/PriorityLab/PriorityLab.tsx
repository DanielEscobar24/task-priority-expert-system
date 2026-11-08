'use client';
import Link from 'next/link';
import {useState} from 'react';
import {cases, kb} from '../../lib/data';
import {evaluateTask, type TaskCase, type TaskEvaluation} from '../../priority-core';
import {PriorityLabRoot} from './slots/styled';
import FactsEditor from './FactsEditor';
import EvaluationResult from './EvaluationResult';
import KnowledgeTable from './KnowledgeTable';

export default function PriorityLab() {
  const [selected, setSelected] = useState(0);
  const [input, setInput] = useState<TaskCase>(() => structuredClone(cases[0]));
  const [referenceDate, setReferenceDate] = useState((cases[0] as TaskCase).fecha_referencia ?? '');
  const [evaluation, setEvaluation] = useState<TaskEvaluation | null>(null);
  const [error, setError] = useState('');
  const [modified, setModified] = useState(false);

  function load(index: number) {
    setSelected(index);
    setInput(structuredClone(cases[index]));
    setReferenceDate((cases[index] as TaskCase).fecha_referencia ?? '');
    setEvaluation(null);
    setError('');
    setModified(false);
  }
  function clearEvaluation() {
    setEvaluation(null);
    setError('');
    setModified(true);
  }
  function change(name: string, field: 'valor' | 'cf', value: string) {
    setInput(previous => ({...previous, hechos: {...previous.hechos, [name]: {
      ...previous.hechos[name],
      [field]: field === 'cf' ? (value.trim() ? Number(value) : NaN) : value,
      origen: 'Modificado manualmente en este laboratorio; simulación, no dato confirmado.',
    }}}));
    clearEvaluation();
  }
  function changeReference(value: string) {
    setReferenceDate(value);
    clearEvaluation();
  }
  function run() {
    try {
      setEvaluation(evaluateTask(kb, input, referenceDate));
      setError('');
    } catch (cause) {
      setEvaluation(null);
      setError(cause instanceof Error ? cause.message : 'No se pudo evaluar la entrada.');
    }
  }

  return (
    <PriorityLabRoot><main>
      <header>
        <Link href="/">Volver al calendario</Link>
        <p className="eyebrow">SISTEMA EXPERTO · LABORATORIO</p>
        <h1>De los hechos a una prioridad.</h1>
        <p>Explora los tres casos académicos con la base vigente. Evaluar no modifica el calendario ni los archivos originales.</p>
        <span className="tag">Motor independiente · Sesión 6</span>
      </header>
      <section className="panel">
        <h2>1. Selecciona un caso</h2>
        <div className="casegrid">{cases.map((item, index) => (
          <button key={item.caso} onClick={() => load(index)} className={selected === index ? 'selected' : undefined} aria-pressed={selected === index}>
            <small>Caso {index + 1} · {item.rol.replaceAll('_', ' ')}</small>{item.caso}
          </button>
        ))}</div>
        <p className="muted">{modified ? 'Simulación modificada: el rol original puede dejar de cumplirse.' : 'Datos originales del caso seleccionado.'}</p>
      </section>
      <section className="panel">
        <h2>2. Revisa los hechos</h2>
        <FactsEditor input={input} referenceDate={referenceDate} onReferenceChange={changeReference} onChange={change} />
        <div className="lab-actions">
          <button className="primary" onClick={run}>Evaluar caso</button>
          <button onClick={() => load(selected)} disabled={!modified}>Restaurar caso original</button>
        </div>
        {error && <p role="alert" className="error"><b>Entrada no válida:</b> {error} No se generó un resultado; esto no equivale a «Sin recomendación».</p>}
      </section>
      {evaluation && <section className="panel" aria-live="polite">
        <h2>Fecha y plazo calculado</h2>
        <p>Referencia: <b>{evaluation.referenceDate}</b>. Entrega: <b>{evaluation.deliveryDate ?? 'Sin fecha'}</b>.</p>
        <p>Días restantes: <b>{evaluation.daysRemaining ?? 'No aplica'}</b>. Plazo: <b>{evaluation.plazo.replaceAll('_', ' ')}</b>.</p>
        {evaluation.status === 'overdue' && <div className="result"><strong>Tarea vencida</strong><span>Fuera de priorización</span></div>}
        {evaluation.status === 'overdue' && <p>No se ejecutaron las reglas de prioridad. Este estado no es un error de entrada ni un caso sin recomendación del motor.</p>}
      </section>}
      {evaluation?.status === 'evaluated' && evaluation.result && <EvaluationResult result={evaluation.result} />}
      <KnowledgeTable knowledge={kb} />
      <footer>Solo hechos iniciales: no hay encadenamiento de inferidos. Pendientes: lista de recomendaciones para tareas y conexión con el calendario. El plazo se deriva de entrega y referencia mediante una convención explícita; no se calculan horas ni se modifica el calendario. Los cambios se pierden al recargar; este laboratorio no pertenece al ZIP académico.</footer>
    </main></PriorityLabRoot>
  );
}
