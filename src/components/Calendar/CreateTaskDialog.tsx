import Tooltip from '@mui/material/Tooltip';
import {useEffect, useRef, useState, type FormEvent} from 'react';
import {validDateKey} from '../../lib/calendar';
import type {Fact} from '../../priority-core';
import type {CalendarTask} from './types';
import {ScheduleDialog} from './slots/styled';

const fields = [
  {name: 'importancia', label: 'Importancia', help: 'Indica cuánto afecta esta tarea a tus objetivos o compromisos. No es la prioridad recomendada por el motor.', options: [['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja']]},
  {name: 'esfuerzo', label: 'Esfuerzo', help: 'Valora el trabajo que requiere: alto, medio o bajo. No se convierte en horas ni duración.', options: [['alto', 'Alto'], ['medio', 'Medio'], ['bajo', 'Bajo']]},
] as const;

type Props = {
  date: string;
  taskIndex: number;
  task?: CalendarTask;
  onCreate: (task: CalendarTask, date: string) => void;
  onClose: () => void;
};

export default function CreateTaskDialog({date, taskIndex, task, onCreate, onClose}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState('');
  const storedDelivery = task?.hechos.fecha_entrega?.valor ?? task?.deliveryDate ?? '';
  const initialDelivery = storedDelivery === 'sin_fecha' ? '' : String(storedDelivery);
  useEffect(() => {dialog.current?.showModal();}, []);

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const title = String(data.get('title') ?? '').trim();
    const description = String(data.get('description') ?? '').trim();
    const selectedDate = String(data.get('date') ?? '');
    if (!title || (selectedDate && !validDateKey(selectedDate))) {
      setError('Indica un título y, si corresponde, una fecha válida.');
      return;
    }
    const hechos: Record<string, Fact> = {};
    for (const field of fields) {
      const valor = String(data.get(field.name) ?? '');
      if (!field.options.some(option => option[0] === valor)) {
        setError('Selecciona la importancia y el esfuerzo de la tarea.');
        return;
      }
      // Convención de entrada declarada, no certeza medida ni inferida.
      const previous = task?.hechos[field.name];
      hechos[field.name] = previous?.valor === valor ? {...previous} : {valor, cf: 1, origen: 'Declaración del usuario en el formulario; CF 1 por convención de entrada, no medición.', clase: 'inicial'};
    }
    const deliveryValue = selectedDate || 'sin_fecha';
    const previousDelivery = task?.hechos.fecha_entrega;
    hechos.fecha_entrega = previousDelivery?.valor === deliveryValue ? {...previousDelivery} : {
      valor: deliveryValue, cf: 1, clase: 'inicial',
      origen: 'Fecha de entrega declarada por el usuario en el formulario; CF 1 por convención de captura, no medición.',
    };
    // Editar la entrega nunca reubica una tarea existente. El padre conserva su ubicación.
    onCreate({caso: title, hechos, ...(description ? {description} : {})}, task ? date : date || selectedDate);
    onClose();
  }

  return (
    <ScheduleDialog taskIndex={taskIndex} ref={dialog} aria-labelledby="create-task-title" onCancel={onClose}>
      <form onSubmit={save}>
        <div className="dialog-heading">
          <h2 id="create-task-title">{task ? 'Editar tarea' : 'Nueva tarea'}</h2>
          <button type="button" aria-label="Cerrar" onClick={onClose}>×</button>
        </div>
        <div className="task-form-fields">
          <div className="form-full-width">
            <FieldLabel id="new-task-title" label="Título" required help="Escribe un nombre que identifique la actividad que quieres organizar." />
            <input id="new-task-title" name="title" autoFocus required aria-required="true" maxLength={160} defaultValue={task?.caso ?? ''} />
          </div>
          <div className="form-full-width">
            <FieldLabel id="new-task-description" label="Descripción" help="Añade detalles útiles para recordar la tarea. Puedes dejarla vacía; no se interpreta como origen de los hechos ni se envía al motor." />
            <textarea id="new-task-description" name="description" rows={3} maxLength={2000} defaultValue={task?.description ?? ''} placeholder="Detalles, contexto o notas de la tarea" />
          </div>
          <div>
            <FieldLabel id="new-task-date" label="Fecha de entrega" help="Puedes dejarla vacía si no tienes un vencimiento. Se conserva aunque muevas la tarjeta. El motor usa esta fecha y la fecha de referencia para calcular el plazo. Editar la entrega no mueve una tarea existente en el calendario." />
            <input id="new-task-date" name="date" type="date" defaultValue={initialDelivery} />
          </div>
          {fields.map(field => (
            <div key={field.name}>
              <FieldLabel id={`new-task-${field.name}`} label={field.label} required help={field.help} />
              <select id={`new-task-${field.name}`} name={field.name} required aria-required="true" defaultValue={String(task?.hechos[field.name]?.valor ?? '')}>
                <option value="" disabled>Seleccionar</option>
                {field.options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
          ))}
        </div>
        {error && <p role="alert">{error}</p>}
        <div className="dialog-actions">
          <button type="button" onClick={onClose}>Cancelar</button>
          <button className="add-task" type="submit">{task ? 'Guardar cambios' : 'Crear tarea'}</button>
        </div>
      </form>
    </ScheduleDialog>
  );
}

function FieldLabel({id, label, help, required = false}: {id: string; label: string; help: string; required?: boolean}) {
  return (
    <div className="field-label-row">
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      <Tooltip title={help} describeChild arrow slotProps={{popper: {disablePortal: true}}}>
        <button className="field-help" type="button" aria-label={`Ayuda: ${label}`}>?</button>
      </Tooltip>
    </div>
  );
}
