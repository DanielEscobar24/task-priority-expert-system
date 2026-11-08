import type {TaskCase} from '../../priority-core';
import {factChoices} from './format';

type Props = {
  input: TaskCase;
  referenceDate: string;
  onReferenceChange: (value: string) => void;
  onChange: (name: string, field: 'valor' | 'cf', value: string) => void;
};

export default function FactsEditor({input, referenceDate, onReferenceChange, onChange}: Props) {
  return (
    <>
      <h3>{input.caso}</h3>
      <p className="muted">Los cambios son una simulación. CF expresa apoyo, no probabilidad. El rol del archivo no fuerza el resultado.</p>
      <label htmlFor="reference-date">Fecha de referencia de la evaluación</label>
      <input id="reference-date" type="date" required value={referenceDate} onChange={event => onReferenceChange(event.target.value)} />
      <p className="muted">La referencia es explícita para reproducir el caso; no se toma del reloj ni de la posición de una tarjeta.</p>
      <div className="factgrid">
        {Object.entries(input.hechos).filter(([name]) => name !== 'plazo').map(([name, fact]) => (
          <article key={name}>
            <h3>{name === 'fecha_entrega' ? 'Fecha de entrega' : name}</h3>
            {name === 'fecha_entrega' ? <>
              <label className="checkbox-label">
                <input type="checkbox" checked={fact.valor === 'sin_fecha'} onChange={event => onChange(name, 'valor', event.target.checked ? 'sin_fecha' : '')} />
                Sin fecha de entrega
              </label>
              {fact.valor !== 'sin_fecha' && <>
                <label htmlFor="delivery-date">Fecha</label>
                <input id="delivery-date" type="date" required value={String(fact.valor)} onChange={event => onChange(name, 'valor', event.target.value)} />
              </>}
            </> : <>
              <label htmlFor={`fact-${name}-value`}>Valor</label>
              <select id={`fact-${name}-value`} value={String(fact.valor)} onChange={event => onChange(name, 'valor', event.target.value)}>
                {factChoices[name as keyof typeof factChoices].map(value => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
              </select>
            </>}
            <label htmlFor={`fact-${name}-cf`}>Factor de certeza (−1 a 1)</label>
            <input id={`fact-${name}-cf`} type="number" min={-1} max={1} step="0.0001"
              value={Number.isFinite(fact.cf) ? fact.cf : ''}
              onChange={event => onChange(name, 'cf', event.target.value)} />
            <p><b>Origen:</b> {fact.origen}</p>
            <small>Clase: {fact.clase}</small>
          </article>
        ))}
      </div>
      <p className="muted">Plazo registrado en el archivo: {input.hechos.plazo ? String(input.hechos.plazo.valor).replaceAll('_', ' ') : 'No incluido'}. No se edita: al evaluar se recalcula a partir de la fecha de entrega y la referencia.</p>
      <p className="muted">Convención revisable: de hoy a 2 días, urgente; de 3 a 7, próximo; más de 7, con tiempo. Una fecha anterior a la referencia se considera vencida y queda fuera de priorización.</p>
    </>
  );
}
