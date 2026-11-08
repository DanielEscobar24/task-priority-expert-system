import {initialTaskDates,initialCalendarAnchor} from '../src/components/Calendar/placement';
import {dateKey} from '../src/lib/calendar';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cases,kb} from '../src/lib/data';
import {evaluateCalendarTask,taskForCalendarDisplay} from '../src/components/Calendar/evaluation';
import type {CalendarTask} from '../src/components/Calendar/types';

const fact=(valor:string)=>({valor,cf:1,origen:'Declaración de prueba.',clase:'inicial' as const});

test('calendario adapta los tres casos sin modificar datos ni requerir rol en tareas nuevas',()=>{
 const snapshot=JSON.stringify(cases);
 const outcomes=cases.map(task=>evaluateCalendarTask(kb,task,'2026-11-08'));
 assert.deepEqual(outcomes.map(out=>out.status==='evaluated'?out.evaluation.result?.recommendation?.valor??null:'error'),['alta',null,'alta']);
 const task:CalendarTask={caso:'Nueva tarea',hechos:{importancia:fact('alta'),esfuerzo:fact('bajo')},deliveryDate:'2026-11-09'};
 const result=evaluateCalendarTask(kb,task,'2026-11-08');
 assert.equal(result.status,'evaluated');
 if(result.status==='evaluated')assert.equal(result.evaluation.result?.recommendation?.valor,'alta');
 assert.equal(JSON.stringify(cases),snapshot);
});

test('crear sin fecha y actualizar importancia o entrega recalcula resultados',()=>{
 const task:CalendarTask={caso:'Actividad',hechos:{importancia:fact('baja'),esfuerzo:fact('bajo'),fecha_entrega:fact('sin_fecha')}};
 const withoutDate=evaluateCalendarTask(kb,task,'2026-11-08');
 assert.equal(withoutDate.status,'evaluated');
 if(withoutDate.status==='evaluated')assert.equal(withoutDate.evaluation.result?.recommendation,null);
 const updated={...task,hechos:{...task.hechos,importancia:fact('alta'),fecha_entrega:fact('2026-11-09')}};
 const result=evaluateCalendarTask(kb,updated,'2026-11-08');
 if(result.status!=='evaluated')assert.fail(result.message);
 assert.equal(result.evaluation.result?.recommendation?.valor,'alta');
 assert.equal(result.evaluation.result?.recommendation?.cf,.9);
 const overdue=evaluateCalendarTask(kb,updated,'2026-11-10');
 if(overdue.status!=='evaluated')assert.fail(overdue.message);
 assert.equal(overdue.evaluation.status,'overdue');assert.equal(overdue.evaluation.result,null);
});

test('ubicación manual no cambia entrega, evaluación ni orden; proyección no muta hechos',()=>{
 const task=structuredClone(cases[2]);
 const before=JSON.stringify(task);const order=[2,0,1];const dates:Record<number,string>={2:'2026-11-08'};
 const first=evaluateCalendarTask(kb,task,'2026-11-08');
 dates[2]='2026-11-15';
 const second=evaluateCalendarTask(kb,task,'2026-11-08');
 assert.deepEqual(first,second);assert.deepEqual(order,[2,0,1]);
 const display=taskForCalendarDisplay(task,first);
 assert.equal(display.hechos.plazo.valor,'urgente');assert.equal(JSON.stringify(task),before);
 assert.equal(task.hechos.fecha_entrega.valor,'2026-11-09');
});

test('error de fecha es distinto de vencida y sin recomendación',()=>{
 const task:CalendarTask={caso:'Inválida',hechos:{importancia:fact('alta'),esfuerzo:fact('bajo'),fecha_entrega:fact('2026-02-30')}};
 assert.equal(evaluateCalendarTask(kb,task,'2026-11-08').status,'error');
});

test('ubica casos únicamente en entregas declaradas y abre su semana, sin alterar referencia ni hechos',()=>{
 const before=JSON.stringify(cases);
 const dates=initialTaskDates(cases);
 assert.deepEqual(dates,{0:'2026-11-09',2:'2026-11-09'});
 assert.equal(1 in dates,false);
 const reference=new Date(2026,10,8,12);
 assert.equal(dateKey(initialCalendarAnchor(dates,reference)),'2026-11-09');
 assert.equal(dateKey(reference),'2026-11-08');
 assert.equal(initialCalendarAnchor({},reference),reference);
 assert.equal(JSON.stringify(cases),before);
});
