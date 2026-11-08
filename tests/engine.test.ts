import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {combineCF,evaluate,parseCase,parseTaskCase,parseKnowledge,type Rule} from '../src/priority-core';
const read=(p:string)=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
import {cases as officialCases} from '../src/lib/data';
const kb=read('bc.json');
const c=read('casos/caso_01_concluye.json');
const rule=(id:string,cf:number,valor='alta',prioridad=1):Rule=>({id,cf,prioridad,si:[['plazo','==','urgente']],entonces:['prioridad_tarea',valor],porque:'Regla de prueba.'});
const run=(reglas:Rule[],input=c)=>evaluate({nombre:'Prueba',reglas},input);
test('tres casos del proyecto y alternativas del conflicto',()=>{
 const names=['01_concluye','02_no_concluye','03_conflicto'];
 const ids=[['r1'],[],['r7','r2']]; const values=['alta',null,'alta']; const cfs=[0.72,null,0.81];
 names.forEach((n,i)=>{const r=evaluate(kb,read(`casos/caso_${n}.json`));assert.deepEqual(r.steps.map(s=>s.regla),ids[i]);assert.equal(r.recommendation?.valor??null,values[i]);assert.equal(r.recommendation?.cf??null,cfs[i]);if(i===2)assert.deepEqual(r.inferred.map(f=>f.cf),[0.81,0.54]);});
});
test('fórmulas de Sesión 6: positivos, mixtos, negativos y singular',()=>{assert.equal(combineCF(0.8,0.5),0.9);assert.equal(combineCF(0.5,0.6),0.8);assert.equal(combineCF(0.8,-0.2),0.75);assert.equal(combineCF(-0.5,-0.6),-0.8);assert.equal(combineCF(1,-1),0);});
test('umbral estricto del antecedente y umbral separado de recomendación',()=>{
 const input=structuredClone(c);input.hechos.plazo.cf=0.2;assert.equal(run([rule('r1',0.95)],input).steps.length,0);
 input.hechos.plazo.cf=0.21;const r=run([rule('r1',0.5)],input);assert.equal(r.steps.length,1);assert.equal(r.inferred[0].cf,0.105);assert.equal(r.recommendation,null);
 input.hechos.plazo.cf=-1;assert.equal(run([rule('r1',0.95)],input).steps.length,0);
});
test('la certeza final puede ganar al turno',()=>{const r=run([rule('r1',0.4,'alta',100),rule('r2',0.9,'baja',10)]);assert.deepEqual(r.steps.map(s=>s.regla),['r1','r2']);assert.equal(r.recommendation?.valor,'baja');assert.equal(r.inferred.length,2);});
test('combina solo misma conclusión y no reusa evidencia al repetir',()=>{const rules=[rule('r1',0.8),rule('r2',0.5),rule('r3',-0.2)];const a=run(rules),b=run(rules);assert.equal(a.inferred[0].cf,0.875);assert.deepEqual(a,b);assert.deepEqual(a.inferred[0].origen,['r1','r2','r3']);});
test('prioridad, especificidad y orden; empate conserva primera fila',()=>{const a=rule('r1',0.8,'alta');const b=rule('r2',0.8,'baja');b.si.push(['importancia','==','alta']);const input=structuredClone(c);input.hechos.importancia.cf=1;const r=run([a,b,rule('r3',0.6,'media')],input);assert.deepEqual(r.steps.map(s=>s.regla),['r2','r1','r3']);assert.equal(r.recommendation?.valor,'baja');});
test('mínimo del SI, dato ausente, sin coerción',()=>{const r=rule('r1',0.8);r.si.push(['esfuerzo','==','alto']);const input=structuredClone(c);input.hechos.esfuerzo.cf=0.4;assert.equal(run([r],input).inferred[0].cf,0.32);delete input.hechos.esfuerzo;assert.equal(run([r],input).steps.length,0);input.hechos.plazo.valor=4;assert.equal(run([rule('r2',1)],input).steps.length,0);});
test('rechaza datos corruptos, CF inválidos y conclusiones precargadas',()=>{assert.throws(()=>combineCF(NaN,0));assert.throws(()=>parseKnowledge({nombre:'X',reglas:[rule('r1',2)]}));assert.throws(()=>parseKnowledge({nombre:'X',reglas:[rule('r1',1),rule('r1',1)]}));assert.throws(()=>parseCase({...c,hechos:{plazo:{...c.hechos.plazo,clase:'inferido'}}}));assert.throws(()=>run([rule('r1',1)],{...c,hechos:{...c.hechos,prioridad_tarea:c.hechos.plazo}}));});
test('no modifica JSON ni dispara usando hechos inferidos',()=>{const before=JSON.stringify(c);const a=rule('r1',1);a.entonces=['intermedio','si'];const b=rule('r2',1);b.si=[['intermedio','==','si']];const result=run([a,b]);assert.deepEqual(result.steps.map(s=>s.regla),['r1']);assert.equal(JSON.stringify(c),before);});
test('los 10 ejemplos y 27 combinaciones son evaluables; todas las reglas alcanzables',()=>{const seen=new Set<string>();for(const p of ['urgente','proximo','con_tiempo'])for(const i of ['alta','media','baja'])for(const e of ['alto','medio','bajo']){const input=structuredClone(c);input.hechos.plazo.valor=p;input.hechos.importancia.valor=i;input.hechos.esfuerzo.valor=e;evaluate(kb,input).steps.forEach(s=>seen.add(s.regla));}assert.equal(seen.size,8);const tasks=read('ejemplos/diez_tareas.json');assert.equal(tasks.length,10);tasks.forEach((t:{tarea:string,hechos:unknown})=>evaluate(kb,{caso:t.tarea,rol:'concluye',hechos:t.hechos}));});

test('normaliza CF inicial antes de comprobar umbral; vocabulario de tarea',()=>{const input=structuredClone(c);input.hechos.plazo.cf=0.20001;assert.equal(run([rule('r1',1)],input).steps.length,0);input.hechos.esfuerzo.valor='desconocido';assert.throws(()=>parseTaskCase(input));});

test('plazo opcional y sin_fecha no excluyen todas las tareas',()=>{
 const input=structuredClone(c);
 delete input.hechos.plazo;
 assert.doesNotThrow(()=>parseTaskCase(input));
 assert.equal(evaluate(kb,input).recommendation?.valor,'alta');
 input.hechos.importancia.valor='baja';input.hechos.esfuerzo.valor='bajo';
 assert.equal(evaluate(kb,input).recommendation,null);
 input.hechos.plazo={valor:'sin_fecha',cf:1,origen:'No hay vencimiento declarado.',clase:'inicial'};
 assert.equal(evaluate(kb,input).steps.length,0);
 input.hechos.esfuerzo.valor='medio';
 assert.equal(evaluate(kb,input).recommendation?.valor,'baja');
 delete input.hechos.importancia;
 assert.throws(()=>parseTaskCase(input));
});

test('caso sin conclusión no satisface ningún SI, independientemente de su CF',()=>{
 const input=read('casos/caso_02_no_concluye.json');
 assert.deepEqual(Object.keys(input.hechos).sort(),['esfuerzo','fecha_entrega','importancia','plazo']);
 for(const r of kb.reglas) {
   const matches=r.si.every(([name,op,value]:[string,string,unknown])=>{
     const actual=input.hechos[name]?.valor;
     return op==='==' ? actual===value : op==='!=' ? actual!==undefined && actual!==value : false;
   });
   assert.equal(matches,false,`SI de ${r.id}`);
 }
});

test('ocho reglas cubren vocabulario válido sin promover importancia baja a alta',()=>{
 assert.equal(kb.reglas.length,8);
 for(const plazo of ['urgente','proximo','con_tiempo','sin_fecha'])
 for(const importancia of ['alta','media','baja'])
 for(const esfuerzo of ['alto','medio','bajo']) {
   const input=structuredClone(c);
   input.hechos.plazo.valor=plazo;input.hechos.importancia.valor=importancia;input.hechos.esfuerzo.valor=esfuerzo;
   const result=evaluate(kb,parseTaskCase(input));
   if(importancia==='baja') assert.equal(result.inferred.some(f=>f.valor==='alta'),false);
   const expectedEmpty=importancia==='baja' && esfuerzo==='bajo' && plazo==='sin_fecha';
   assert.equal(result.recommendation===null,expectedEmpty);
 }
});

test('rol académico no impone resultado y entrada inválida no es sin recomendación',()=>{
 const input=structuredClone(c);input.rol='no_concluye';
 assert.equal(evaluate(kb,input).recommendation?.valor,'alta');
 assert.throws(()=>evaluate(kb,{caso:input.caso,hechos:input.hechos}));
});

test('fuente compartida contiene exactamente los tres casos oficiales sin fechas inventadas',()=>{
 const files=['01_concluye','02_no_concluye','03_conflicto'];
 assert.equal(officialCases.length,3);
 files.forEach((file,index)=>assert.deepEqual(officialCases[index],read(`casos/caso_${file}.json`)));
 assert.equal(officialCases[1].hechos.plazo.valor,'sin_fecha');
 officialCases.forEach(item=>assert.equal('deliveryDate' in item,false));
});
