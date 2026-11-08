import {useDragFeedback} from './DragFeedback';
import {TASK_DRAG_TYPE} from './constants/drag';
import type {CalendarTask} from './types';
import {TaskCard as CardSlot} from './slots/styled';

type Props = {
  task: CalendarTask;
  index: number;
  zone: string;
  onMove: (direction: -1 | 1) => void;
};

export default function TaskCard({task, index, zone, onMove}: Props) {
  const {active, begin, end} = useDragFeedback();
  const isSource = active?.index === index;
  return (
    <CardSlot taskIndex={index} dragHeight={isSource ? active?.height : undefined} data-task-key={index}
      data-drag-source={isSource ? 'true' : undefined}
      aria-hidden={isSource || undefined} tabIndex={isSource ? -1 : 0}
      onDragEnd={end}
      onKeyDown={event => {
        if (!event.altKey || !['ArrowUp', 'ArrowDown'].includes(event.key)) return;
        event.preventDefault();
        onMove(event.key === 'ArrowUp' ? -1 : 1);
      }}
      draggable
      onDragStart={event => {
        const bounds = event.currentTarget.getBoundingClientRect();
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData(TASK_DRAG_TYPE, String(index));
        begin(index, bounds.height, zone);
      }}
      aria-label={`${task.caso}. Arrastrar para mover. Alt más flecha arriba o abajo para reordenar`}
      title="Arrastra al hueco de destino. Alt + ↑/↓ también cambia el orden."
    >
      <strong>{task.caso}</strong>
      <span className="card-facts">
        <span>Plazo: {task.hechos.plazo ? String(task.hechos.plazo.valor).replaceAll('_', ' ') : 'Sin definir'}</span>
        <span>Importancia: {String(task.hechos.importancia.valor)}</span>
        <span>Esfuerzo: {String(task.hechos.esfuerzo.valor)}</span>
      </span>
      <span className="card-bottom">
        <span className="initial-dot" /> Arrastrar para mover
      </span>
    </CardSlot>
  );
}
