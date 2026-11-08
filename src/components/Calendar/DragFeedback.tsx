'use client';
import {createContext, useContext, useEffect, useRef, useState, type ReactNode} from 'react';

export type DropPosition = {zone: string; before?: number};
type ActiveDrag = {index: number; height: number; position: DropPosition};
type Feedback = {
  active: ActiveDrag | null;
  dragging: boolean;
  begin: (index: number, height: number, zone: string) => void;
  preview: (position: DropPosition) => void;
  end: () => void;
};
const Context = createContext<Feedback>({active: null, dragging: false, begin: () => {}, preview: () => {}, end: () => {}});
export const useDragFeedback = () => useContext(Context);

/** El preview nunca modifica fechas/orden. Solo el drop confirma el movimiento. */
export function DragFeedbackProvider({children}: {children: ReactNode}) {
  const [active, setActive] = useState<ActiveDrag | null>(null);
  const frame = useRef<number | null>(null);
  function end() {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setActive(null);
  }
  function begin(index: number, height: number, zone: string) {
    // Dejar capturar la imagen nativa antes de ocultar el original en el tablero.
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      setActive({index, height, position: {zone, before: index}});
    });
  }
  function preview(position: DropPosition) {
    setActive(previous => {
      if (!previous) return previous;
      if (previous.position.zone === position.zone && previous.position.before === position.before) return previous;
      return {...previous, position};
    });
  }
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') end(); };
    window.addEventListener('drop', end);
    window.addEventListener('dragend', end);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('drop', end);
      window.removeEventListener('dragend', end);
      window.removeEventListener('keydown', escape);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);
  return <Context.Provider value={{active, dragging: active !== null, begin, preview, end}}>{children}</Context.Provider>;
}
