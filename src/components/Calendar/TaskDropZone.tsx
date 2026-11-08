import {useDragFeedback} from './DragFeedback';
import {useEffect, useRef, type ReactNode, type DragEvent} from 'react';
import {cardTranslation} from './constants/motion';
import {TASK_DRAG_TYPE, readDraggedTask} from './constants/drag';

type Props = {
  taskCount: number;
  children: ReactNode;
  zone: string;
  className: string;
  label: string;
  onTaskDrop: (index: number, before?: number) => void;
};

/** Resuelve también los espacios entre tarjetas, no solo el área de una tarjeta. */
export default function TaskDropZone({taskCount, children, zone, className, label, onTaskDrop}: Props) {
  const {active, preview, end} = useDragFeedback();
  const snapshot = useRef<{index: number; cards: {key: number; top: number; bottom: number; middleX: number}[]} | null>(null);
  useEffect(() => { if (!active) snapshot.current = null; }, [active]);

  function over(event: DragEvent<HTMLElement>) {
    if (!event.dataTransfer.types.includes(TASK_DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    // Aceptar el drag nativo aunque su preview aún no se haya renderizado.
    if (!active) return;
    const list = event.currentTarget.querySelector<HTMLElement>('[data-layout]');
    if (!list || list.getClientRects().length === 0) {preview({zone}); return;}
    const origin = list.getBoundingClientRect();
    // Snapshot por arrastre/zona: el hueco y la animación NO redefinen umbrales.
    if (snapshot.current?.index !== active.index) {
      const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-task-key]:not([data-drag-source=true])'));
      snapshot.current = {index: active.index, cards: cards.map(card => {
        const rect = card.getBoundingClientRect();
        const offset = cardTranslation(card);
        return {key: Number(card.dataset.taskKey), top: rect.top - offset.y - origin.top + list.scrollTop,
          bottom: rect.bottom - offset.y - origin.top + list.scrollTop, middleX: rect.left - offset.x + rect.width / 2 - origin.left};
      })};
    }
    const y = event.clientY - origin.top + list.scrollTop;
    const x = event.clientX - origin.left;
    const grid = list.dataset.layout === 'grid';
    const next = snapshot.current.cards.find(card => grid
      ? y < card.top || (y <= card.bottom && x < card.middleX)
      : y < (card.top + card.bottom) / 2);

    preview({zone, before: next?.key});
  }

  function drop(event: DragEvent<HTMLElement>) {
    const index = readDraggedTask(event.dataTransfer, taskCount);
    if (index === null) return;
    event.preventDefault();
    const before = active?.position.zone === zone ? active.position.before : undefined;
    onTaskDrop(index, before);
    end();
  }

  return (
    <section className={`${className} ${active?.position.zone === zone ? 'drop-target' : ''}`}
      aria-label={label} onDragOver={over} onDrop={drop}
      onDragLeave={event => {
        if (!active || active.position.zone !== zone) return;
        if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) preview({zone: ''});
      }}>
      {children}
    </section>
  );
}
