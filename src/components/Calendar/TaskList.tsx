import {Fragment, useEffect, useLayoutEffect, useRef, type ReactNode} from 'react';
import {CARD_SHIFT_DURATION, CARD_SHIFT_EASING, cardTranslation} from './constants/motion';
import type {CalendarTask} from './types';
import {useDragFeedback} from './DragFeedback';
import {Placeholder} from './slots/styled';
import TaskCard from './TaskCard';

type Props = {
  tasks: CalendarTask[];
  indexes: number[];
  zone: string;
  className: string;
  grid?: boolean;
  children?: ReactNode;
  onMove: (index: number, target: number, after: boolean) => void;
};

/** Lista única para días/Sin fecha: reserva un hueco y anima vecinos con FLIP. */
export default function TaskList({tasks, indexes, zone, className, grid = false, children, onMove}: Props) {
  const {active} = useDragFeedback();
  const root = useRef<HTMLDivElement>(null);
  const previous = useRef(new Map<string, {left: number; top: number}>());
  const animations = useRef<Animation[]>([]);
  const destination = active?.position.zone === zone ? active : null;
  const before = destination?.position.before;

  useEffect(() => () => {animations.current.forEach(animation => animation.cancel());}, []);

  useLayoutEffect(() => {
    const list = root.current;
    if (!list) return;
    const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-task-key]:not([data-drag-source=true])'));
    // Conservar el desplazamiento visible cuando el usuario cambia de destino rápido.
    const offsets = new Map(cards.map(card => [card.dataset.taskKey!, cardTranslation(card)]));
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    const origin = list.getBoundingClientRect();
    const next = new Map<string, {left: number; top: number}>();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.forEach(card => {
      const key = card.dataset.taskKey!;
      const rect = card.getBoundingClientRect();
      const layout = {left: rect.left - origin.left + list.scrollLeft, top: rect.top - origin.top + list.scrollTop};
      const old = previous.current.get(key);
      next.set(key, layout);
      if (old && zone !== 'unscheduled' && !reduceMotion && typeof card.animate === 'function') {
        const offset = offsets.get(key)!;
        const x = old.left - layout.left + offset.x;
        const y = old.top - layout.top + offset.y;
        if (Math.abs(x) + Math.abs(y) > 1) animations.current.push(card.animate([
          {transform: `translate(${x}px, ${y}px)`}, {transform: 'translate(0, 0)'},
        ], {duration: CARD_SHIFT_DURATION, easing: CARD_SHIFT_EASING}));
      }
    });
    previous.current = next;
  });

  const placeholder = destination && <Placeholder placeholderHeight={destination.height} data-placeholder aria-label="Posición de destino" />;
  return (
    <div ref={root} className={className} tabIndex={zone === 'unscheduled' ? undefined : 0} aria-label={zone === 'unscheduled' ? undefined : 'Tareas del día. Desplázate para ver más'} data-layout={grid ? 'grid' : 'column'} data-preview={destination ? 'true' : undefined}>
      {indexes.map((index, position) => (
        <Fragment key={index}>
          {destination && before === index && placeholder}
          <TaskCard task={tasks[index]} index={index} zone={zone}
            onMove={direction => {
              const target = indexes[position + direction];
              if (target !== undefined) onMove(index, target, direction > 0);
            }}
          />
        </Fragment>
      ))}
      {destination && (before === undefined || !indexes.includes(before)) && placeholder}
      {children}
    </div>
  );
}
