export const TASK_DRAG_TYPE = 'application/x-task-priority-index';

/** Ignorar archivos/texto externos y datos que no identifiquen una tarea existente. */
export function readDraggedTask(transfer: DataTransfer, taskCount: number): number | null {
  const raw = transfer.getData(TASK_DRAG_TYPE);
  if (!/^\d+$/.test(raw)) return null;
  const index = Number(raw);
  return Number.isSafeInteger(index) && index < taskCount ? index : null;
}
