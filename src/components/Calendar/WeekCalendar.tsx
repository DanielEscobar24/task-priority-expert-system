import type {CalendarTask} from './types';
import TaskDropZone from './TaskDropZone';
import {dateKey, weekDays} from '../../lib/calendar';
import CalendarIcon from './CalendarIcon';
import TaskList from './TaskList';

type Props = {
  tasks: CalendarTask[];
  anchor: Date | null;
  today: string;
  dates: Record<number, string>;
  order: number[];
  onMove: (days: number) => void;
  onToday: () => void;
  onAdd: (date?: string) => void;
  onSchedule: (index: number, date: string, target?: number, after?: boolean) => void;
};

export default function WeekCalendar({tasks, anchor, today, dates, order, onMove, onToday, onAdd, onSchedule}: Props) {
  const days = anchor ? weekDays(anchor) : [];
  const label = days.length
    ? `${days[0].toLocaleDateString('es', {day: 'numeric', month: 'short'})} – ${days[6].toLocaleDateString('es', {day: 'numeric', month: 'long', year: 'numeric'})}`
    : 'Cargando semana…';

  return (
    <section className="week-panel" aria-label="Calendario semanal">
      <div className="week-toolbar">
        <div className="week-navigation">
          <button aria-label="Semana anterior" disabled={!anchor} onClick={() => onMove(-7)}>‹</button>
          <button aria-label="Semana siguiente" disabled={!anchor} onClick={() => onMove(7)}>›</button>
          <button onClick={onToday}>Hoy</button>
          <h2 aria-live="polite">{label}</h2>
        </div>
        <span className="week-view"><CalendarIcon /> Semana</span>
      </div>
      <div className="week-scroll">
        <div className="week-grid">
          {days.map(day => {
            const key = dateKey(day);
            const scheduled = order.filter(index => dates[index] === key);
            return (
              <TaskDropZone taskCount={tasks.length}
                key={key}
                zone={key}
                className={`day-column ${key === today ? 'is-today' : ''}`}
                label={day.toLocaleDateString('es', {dateStyle: 'full'})}
                onTaskDrop={(index, before) => onSchedule(index, key, before)}
              >
                <div className="day-heading">
                  <span>{day.toLocaleDateString('es', {weekday: 'short'})}</span>
                  <strong aria-current={key === today ? 'date' : undefined}>{day.getDate()}</strong>
                  {key === today && <small>HOY</small>}
                </div>
                <TaskList tasks={tasks} indexes={scheduled} zone={key} className="day-tasks"
                  onMove={(index, target, after) => onSchedule(index, key, target, after)}>
                  {!scheduled.length && <p className="empty-day">Sin tareas<br /><span>Arrastra aquí</span></p>}
                  <button className="day-add" onClick={() => onAdd(key)} aria-label={`Agregar tarea el ${key}`}>＋ Agregar</button>
                </TaskList>
              </TaskDropZone>
            );
          })}
        </div>
      </div>

    </section>
  );
}
