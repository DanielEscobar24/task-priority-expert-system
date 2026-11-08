'use client';
import {useDragFeedback} from './DragFeedback';
import {useEffect, useMemo, useState} from 'react';
import {dateKey, moveDays} from '../../lib/calendar';
import {cases as initialTasks, kb} from '../../lib/data';
import type {CalendarTask} from './types';
import CreateTaskDialog from './CreateTaskDialog';
import PrioritiesView from './PrioritiesView';
import {evaluateCalendarTask, taskForCalendarDisplay} from './evaluation';
import {initialTaskDates, initialCalendarAnchor} from './placement';
import {useAppTheme} from '../../theme/ThemeProvider';
import {CalendarRoot, CalendarSidebar, CalendarMain} from './slots/styled';
import CalendarIcon from './CalendarIcon';
import TaskList from './TaskList';
import TaskDropZone from './TaskDropZone';
import WeekCalendar from './WeekCalendar';

export default function Calendar() {
  const [tasks, setTasks] = useState<CalendarTask[]>(initialTasks);
  const [creation, setCreation] = useState<{date: string; index?: number} | null>(null);
  const [view, setView] = useState<'calendar' | 'priorities'>('calendar');
  const {dragging} = useDragFeedback();
  const {mode, toggleMode} = useAppTheme();
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [today, setToday] = useState('');
  // UI-only dates: never injected into the engine or derived from categorical facts.
  const [order, setOrder] = useState(() => tasks.map((_, index) => index));
  const [dates, setDates] = useState<Record<number, string>>(() => initialTaskDates(initialTasks));
  const [unscheduledOpen, setUnscheduledOpen] = useState(true);
  const [notice, setNotice] = useState('');

  function showToday() {
    const now = new Date();
    setAnchor(now);
    setToday(dateKey(now));
  }
  useEffect(() => {
    const now = new Date();
    setToday(dateKey(now));
    setAnchor(initialCalendarAnchor(initialTaskDates(initialTasks), now));
    const refreshReference = () => setToday(dateKey(new Date()));
    const timer = window.setInterval(refreshReference, 60_000);
    window.addEventListener('focus', refreshReference);
    return () => {window.clearInterval(timer); window.removeEventListener('focus', refreshReference);};
  }, []);

  const outcomes = useMemo(() => today ? tasks.map(task => evaluateCalendarTask(kb, task, today)) : [], [tasks, today]);

  const displayTasks = useMemo(() => tasks.map((task, index) => taskForCalendarDisplay(task, outcomes[index])), [tasks, outcomes]);

  const unassigned = order.filter(index => !dates[index]).map(index => ({task: tasks[index], index}));

  function open(date = '') {
    setCreation({date});
  }
  function createTask(task: CalendarTask, date: string) {
    if (creation?.index !== undefined) {
      const index = creation.index;
      setTasks(previous => previous.map((item, position) => position === index ? task : item));
      setNotice('Tarea actualizada y reevaluada. Su ubicación no cambia.');
      return;
    }
    const index = tasks.length;
    setTasks(previous => [...previous, task]);
    setOrder(previous => [...previous, index]);
    if (date) setDates(previous => ({...previous, [index]: date}));
    else setUnscheduledOpen(true);
    setNotice('Tarea creada. Guardada solo en esta sesión.');
  }

  // Manual display order is independent of facts and engine recommendations.
  function place(index: number, date: string | undefined, target?: number, after = false) {
    if (index === target) return;
    setDates(previous => {
      const next = {...previous};
      if (date) next[index] = date;
      else delete next[index];
      return next;
    });
    setOrder(previous => {
      const next = previous.filter(value => value !== index);
      const position = target === undefined ? -1 : next.indexOf(target);
      next.splice(position < 0 ? next.length : position + Number(after), 0, index);
      return next;
    });
    setNotice('Calendario actualizado.');
  }

  return (
    <CalendarRoot data-dragging={dragging ? 'true' : undefined}>
      <CalendarSidebar>
        <div className="sidebar-content">
        <nav className="calendar-nav" aria-label="Navegación principal">
          <button className={view === 'calendar' ? 'nav-current' : undefined} aria-current={view === 'calendar' ? 'page' : undefined} onClick={() => setView('calendar')}><CalendarIcon /> Calendario</button>
          <button className={view === 'priorities' ? 'nav-current' : undefined} aria-current={view === 'priorities' ? 'page' : undefined} onClick={() => setView('priorities')}><span aria-hidden="true">≡</span> Prioridades</button>
        </nav>
        </div>
        <div className="sidebar-bottom">
          <div className="theme-selector" role="group" aria-label="Tema de la interfaz">
            <button aria-pressed={mode === 'light'} onClick={() => mode !== 'light' && toggleMode()}><span aria-hidden="true">☀</span> Claro</button>
            <button aria-pressed={mode === 'dark'} onClick={() => mode !== 'dark' && toggleMode()}><span aria-hidden="true">☾</span> Oscuro</button>
          </div>
        </div>
      </CalendarSidebar>
      <CalendarMain>
        <header className="calendar-heading">
          <h1>{view === 'calendar' ? 'Calendario' : 'Prioridades'}</h1>
          <button className="add-task" onClick={() => open()} disabled={!anchor}><span aria-hidden="true">＋</span> Agregar</button>
        </header>
        {view === 'calendar' ? <>
        <TaskDropZone taskCount={tasks.length} zone="unscheduled" className="unscheduled" label="Tareas sin fecha. Suelta aquí para quitar la fecha" onTaskDrop={(index, before) => place(index, undefined, before)}>
          <button className="unscheduled-toggle" aria-expanded={unscheduledOpen} aria-controls="unscheduled-content" onClick={() => setUnscheduledOpen(value => !value)}>
            <span>Sin fecha <span className="count">{unassigned.length}</span></span>
            <svg className="accordion-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
          </button>
          <div id="unscheduled-content" hidden={!unscheduledOpen}>
          <TaskList tasks={displayTasks} indexes={unassigned.map(({index}) => index)} zone="unscheduled" className="unscheduled-grid" grid
            onMove={(index, target, after) => place(index, undefined, target, after)} />
          {!unassigned.length && <p>Todas las tareas tienen fecha. Suelta una tarjeta aquí para dejarla sin fecha.</p>}
          </div>
        </TaskDropZone>
        <WeekCalendar tasks={displayTasks} anchor={anchor} today={today} dates={dates} order={order} onMove={amount => setAnchor(value => value ? moveDays(value, amount) : value)} onToday={showToday} onAdd={open} onSchedule={place} />
        </> : <PrioritiesView tasks={tasks} outcomes={outcomes} referenceDate={today} onEdit={index => setCreation({index, date: dates[index] ?? ''})} />}
        <p className="calendar-status" role="status">{notice}</p>
        {creation && <CreateTaskDialog task={creation.index === undefined ? undefined : tasks[creation.index]} date={creation.date} taskIndex={creation.index ?? tasks.length} onCreate={createTask} onClose={() => setCreation(null)} />}
      </CalendarMain>
    </CalendarRoot>
  );
}
