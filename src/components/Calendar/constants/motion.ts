export const CARD_SHIFT_DURATION = 260;
export const CARD_SHIFT_EASING = 'cubic-bezier(0.22, 0.7, 0.25, 1)';

/** Separar transformación visual de geometría usada para detectar destinos. */
export function cardTranslation(element: HTMLElement): {x: number; y: number} {
  const transform = getComputedStyle(element).transform;
  if (transform === 'none') return {x: 0, y: 0};
  const matrix = new DOMMatrixReadOnly(transform);
  return {x: matrix.m41, y: matrix.m42};
}
