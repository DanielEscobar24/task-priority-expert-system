import type {evaluate} from '../../priority-core';
import {formatCF} from './format';

type Props = {result: ReturnType<typeof evaluate>};

export default function EvaluationResult({result}: Props) {
  const {recommendation, initial, inferred, steps, excluded} = result;
  return (
    <section className="panel" aria-live="polite">
      <h2>3. Resultado y explicación</h2>
      <div className="result">
        <strong>{recommendation ? `Prioridad ${recommendation.valor}` : 'Sin recomendación'}</strong>
        <span>{recommendation ? `CF ${formatCF(recommendation.cf)}` : 'La tarea no se descarta.'}</span>
      </div>
      {!recommendation && <p>{inferred.length ? 'Hay conclusiones, pero ninguna del objetivo supera CF 0,20.' : 'No se escribió ninguna conclusión.'}</p>}
      <p>La prioridad de la regla decide el turno. La recomendación conserva el mayor CF final superior a 0,20; en empate, la primera alternativa.</p>
      <details>
        <summary>Hechos iniciales utilizados ({Object.keys(initial).length})</summary>
        <div className="tablewrap"><table>
          <thead><tr><th>Hecho</th><th>Valor</th><th>CF normalizado</th><th>Origen</th><th>Clase</th></tr></thead>
          <tbody>{Object.entries(initial).map(([name, fact]) => <tr key={name}><td>{name}</td><td>{String(fact.valor)}</td><td>{formatCF(fact.cf)}</td><td>{fact.origen}</td><td>{fact.clase}</td></tr>)}</tbody>
        </table></div>
      </details>
      <h3>Conclusiones conservadas</h3>
      {inferred.length ? <div className="tablewrap"><table>
        <thead><tr><th>Hecho</th><th>Valor</th><th>CF</th><th>Reglas de origen</th><th>Clase</th></tr></thead>
        <tbody>{inferred.map(fact => <tr key={`${fact.nombre}:${fact.valor}`}><td>{fact.nombre}</td><td>{String(fact.valor)}</td><td>{formatCF(fact.cf)}</td><td>{fact.origen.join(', ')}</td><td>{fact.clase}</td></tr>)}</tbody>
      </table></div> : <p>Sin alternativas inferidas.</p>}
      <h3>Reglas aplicadas ({steps.length})</h3>
      {steps.map(step => <article className="step" key={step.regla}>
        <b>{step.regla} · prioridad de regla {step.prioridad}</b>
        <p>{step.porque}</p>
        <p>CF del SI: {formatCF(step.cfSi)}. Aporte: {formatCF(step.cfRegla)} × {formatCF(step.cfSi)} = {formatCF(step.aporte)}.</p>
        <p>{step.conclusion[0]} = {String(step.conclusion[1])}. {step.antes === null ? 'Sin apoyo previo.' : `CF anterior: ${formatCF(step.antes)}.`} CF resultante: {formatCF(step.despues)}.</p>
      </article>)}
      <details>
        <summary>Reglas excluidas ({excluded.length})</summary>
        {excluded.map(item => <p key={item.regla}><b>{item.regla}:</b> {item.motivo}</p>)}
      </details>
    </section>
  );
}
