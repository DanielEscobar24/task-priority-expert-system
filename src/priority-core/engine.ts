import type {Value, Operator, Step, Inferred} from './types';
import {parseKnowledge, parseCase} from './validation';
import {round4, combineCF} from './certainty';

export const THRESHOLD = 0.20;

export function conditionMatches(actual: Value, op: Operator, expected: Value): boolean {
 // Sin coerción: 4 no es "4", true no es 1.
 if (typeof actual !== typeof expected) return false;
 if (op === '==') return actual === expected;
 if (op === '!=') return actual !== expected;
 if (typeof actual !== 'number' || typeof expected !== 'number') return false;
 return op === '>' ? actual > expected : op === '>=' ? actual >= expected : op === '<' ? actual < expected : actual <= expected;
}
export function evaluate(knowledgeInput: unknown, caseInput: unknown, goal = 'prioridad_tarea') {
 const kb = parseKnowledge(knowledgeInput), parsed = parseCase(caseInput);
 const input = {...parsed, hechos: Object.fromEntries(Object.entries(parsed.hechos).map(([name,f])=>[name,{...f,cf:round4(f.cf)}]))};
 // La BF de entrada no debe incluir las conclusiones ni hechos intermedios.
 const outputs = new Set(kb.reglas.map(r=>r.entonces[0]));
 for (const n of Object.keys(input.hechos)) if (outputs.has(n)) throw Error(`La conclusión ${n} no puede venir precargada.`);
 const steps: Step[] = [], inferred: Inferred[] = [], excluded: {regla: string; motivo: string}[] = [];
 const agenda = kb.reglas.map((r,index)=>({r,index})).sort((a,b)=>b.r.prioridad-a.r.prioridad || b.r.si.length-a.r.si.length || a.index-b.index);
 for (const {r} of agenda) {
  const cf = r.si.map(([n,op,expected])=>{ const f=input.hechos[n]; return f && conditionMatches(f.valor,op,expected) ? f.cf : 0; });
  const cfSi = Math.min(...cf);
  if (cfSi <= THRESHOLD) { excluded.push({regla:r.id,motivo:'Alguna condición no coincide, falta un dato o la certeza mínima no supera 0,20.'}); continue; }
  const aporte=round4(r.cf*cfSi), [nombre,valor]=r.entonces;
  const previous=inferred.find(f=>f.nombre===nombre && f.valor===valor); const antes=previous?.cf??null;
  const despues=previous ? combineCF(previous.cf,aporte) : aporte;
  if (previous) {previous.cf=despues;previous.origen.push(r.id);} else inferred.push({nombre,valor,cf:despues,origen:[r.id],clase:'inferido'});
  steps.push({regla:r.id,prioridad:r.prioridad,cfSi,cfRegla:r.cf,aporte,antes,despues,conclusion:r.entonces,porque:r.porque});
 }
 const candidates=inferred.filter(f=>f.nombre===goal);
 // Empates: primera fila inferida, igual que max() de la plantilla Python.
 const best=candidates.reduce<Inferred|null>((a,b)=>!a || b.cf>a.cf ? b:a,null);
 return {initial:input.hechos,inferred,steps,excluded,recommendation:best && best.cf>THRESHOLD ? best:null};
}


export type EvaluationResult = ReturnType<typeof evaluate>;
