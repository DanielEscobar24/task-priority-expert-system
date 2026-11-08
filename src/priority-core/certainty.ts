import {certainty} from './validation';

/** Redondeo de trabajo a cuatro decimales, como la plantilla. */
export const round4 = (n: number) => Math.round((n + Math.sign(n) * Number.EPSILON) * 10000) / 10000;
export function combineCF(a: number, b: number): number {
 certainty(a); certainty(b);
 if (a >= 0 && b >= 0) return round4(a + b * (1-a));
 if (a < 0 && b < 0) return round4(a + b * (1+a));
 const denominator = 1 - Math.min(Math.abs(a),Math.abs(b));
 return denominator === 0 ? 0 : round4((a+b)/denominator);
}
