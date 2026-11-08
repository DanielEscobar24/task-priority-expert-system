import type {Value, Knowledge, Case} from './types';

const ops = new Set(['==','!=','>','>=','<','<=']);
const record = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
const value = (x: unknown): x is Value => typeof x === 'string' || typeof x === 'boolean' || (typeof x === 'number' && Number.isFinite(x));
export function certainty(x: unknown): asserts x is number { if (typeof x !== 'number' || !Number.isFinite(x) || x < -1 || x > 1) throw Error('El CF debe ser un número entre −1 y +1.'); }
function text(x: unknown): asserts x is string { if (typeof x !== 'string' || !x.trim()) throw Error('Falta un texto obligatorio.'); }
function name(x: unknown): asserts x is string { text(x); if (!/^[a-z][a-z0-9_]*$/.test(x)) throw Error(`Nombre inválido: ${x}.`); }
export function parseKnowledge(raw: unknown): Knowledge {
 if (!record(raw) || !Array.isArray(raw.reglas)) throw Error('La base necesita nombre y una lista de reglas.');
 text(raw.nombre); const ids = new Set<string>();
 for (const r of raw.reglas) {
  if (!record(r)) throw Error('Regla inválida.'); name(r.id); text(r.porque); certainty(r.cf);
  if (ids.has(r.id)) throw Error(`Regla duplicada: ${r.id}.`); ids.add(r.id);
  if (typeof r.prioridad !== 'number' || !Number.isInteger(r.prioridad)) throw Error('La prioridad debe ser entera.');
  if (!Array.isArray(r.si) || !r.si.length) throw Error('Cada regla necesita condiciones.');
  for (const c of r.si) { if (!Array.isArray(c) || c.length !== 3 || !ops.has(c[1]) || !value(c[2])) throw Error('Condición inválida.'); name(c[0]); if (!['==','!='].includes(c[1]) && typeof c[2] !== 'number') throw Error('Las comparaciones de orden requieren números.'); }
  if (!Array.isArray(r.entonces) || r.entonces.length !== 2 || !value(r.entonces[1])) throw Error('Conclusión inválida.'); name(r.entonces[0]);
 }
 return raw as unknown as Knowledge;
}
export function parseCase(raw: unknown): Case {
 if (!record(raw) || !record(raw.hechos)) throw Error('El caso necesita hechos.'); text(raw.caso);
 if (!['concluye','no_concluye','conflicto'].includes(String(raw.rol))) throw Error('Rol inválido.');
 for (const [n,f] of Object.entries(raw.hechos)) { name(n); if (!record(f) || !value(f.valor) || f.clase !== 'inicial') throw Error('Los hechos de entrada deben ser iniciales y tener un valor válido.'); certainty(f.cf); text(f.origen); }
 return raw as unknown as Case;
}
