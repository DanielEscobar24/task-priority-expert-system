import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calendarDay, classifyDeadline, evaluateTask, parseTaskCase} from '../src/priority-core';
import {cases, kb} from '../src/lib/data';

test('límites civiles reproducibles: pasado, hoy, 2, 3, 7 y 8 días',()=>{
 const reference='2026-11-08';
 const expected=[['2026-11-07','vencida',-1],['2026-11-08','urgente',0],['2026-11-10','urgente',2],['2026-11-11','proximo',3],['2026-11-15','proximo',7],['2026-11-16','con_tiempo',8]] as const;
 for(const [date,plazo,daysRemaining] of expected) assert.deepEqual(classifyDeadline(date,reference),{plazo,daysRemaining,deliveryDate:date});
 assert.deepEqual(classifyDeadline('sin_fecha',reference),{plazo:'sin_fecha',daysRemaining:null,deliveryDate:null});
});

test('fechas reales sin normalización ni dependencias de horas/DST',()=>{
 assert.equal(calendarDay('2024-03-01')-calendarDay('2024-02-28'),2);
 assert.equal(calendarDay('2027-01-01')-calendarDay('2026-12-31'),1);
 for(const invalid of ['2026-02-29','2026-11-31','2026-13-01','2026-11-08T00:00:00Z','08/11/2026','']) assert.throws(()=>calendarDay(invalid));
 assert.throws(()=>classifyDeadline('sin_fecha','invalid'));
});

test('tres roles con referencia fija y cuatro hechos iniciales idénticos en estructura',()=>{
 const expected=['alta',null,'alta'];
 cases.forEach((input,index)=>{
   assert.equal(input.fecha_referencia,'2026-11-08');
   assert.deepEqual(Object.keys(input.hechos).sort(),['esfuerzo','fecha_entrega','importancia','plazo']);
   const outcome=evaluateTask(kb,input,input.fecha_referencia!);
   assert.equal(outcome.status,'evaluated');
   assert.equal(outcome.result?.recommendation?.valor??null,expected[index]);
 });
 const conflict=evaluateTask(kb,cases[2],'2026-11-08');
 assert.deepEqual(conflict.result?.steps.map(step=>step.regla),['r7','r2']);
});

test('vencida excluye toda prioridad, incluso criterios sin plazo',()=>{
 const outcome=evaluateTask(kb,cases[0],'2026-11-10');
 assert.equal(outcome.status,'overdue');assert.equal(outcome.plazo,'vencida');assert.equal(outcome.result,null);
});

test('plazo se prepara desde fecha con su CF y sin mutar caso ni calendario',()=>{
 const input=structuredClone(cases[2]);const before=JSON.stringify(input);
 input.hechos.fecha_entrega.cf=.5;
 input.hechos.plazo.valor='con_tiempo';
 const snapshot=JSON.stringify(input);
 const outcome=evaluateTask(kb,input,'2026-11-08');
 assert.equal(outcome.plazo,'urgente');
 assert.equal(outcome.result?.initial.plazo.cf,.5);
 assert.equal(outcome.result?.steps.find(step=>step.regla==='r7')?.aporte,.45);
 assert.equal(JSON.stringify(input),snapshot);
 assert.equal(JSON.stringify(cases[2]),before);
});

test('ausencia explícita no equivale a dato corrupto o falta de fecha',()=>{
 const input=structuredClone(cases[0]);
 input.hechos.fecha_entrega.valor='sin_fecha';
 assert.equal(evaluateTask(kb,input,'2026-11-08').result?.recommendation?.valor,'alta');
 input.hechos.fecha_entrega.valor='2026-02-30';assert.throws(()=>parseTaskCase(input));
 delete input.hechos.fecha_entrega;assert.throws(()=>evaluateTask(kb,input,'2026-11-08'));
});
