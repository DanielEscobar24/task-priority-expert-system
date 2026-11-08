export type Value = string | number | boolean;
export type Operator = '==' | '!=' | '>' | '>=' | '<' | '<=';
export type Condition = [string, Operator, Value];
export interface Fact { valor: Value; cf: number; origen: string; clase: 'inicial' }
export interface Rule { id: string; prioridad: number; cf: number; si: Condition[]; entonces: [string, Value]; porque: string }
export interface Knowledge { nombre: string; reglas: Rule[] }
export interface Case { caso: string; rol: 'concluye' | 'no_concluye' | 'conflicto'; hechos: Record<string, Fact> }
export interface Inferred { nombre: string; valor: Value; cf: number; origen: string[]; clase: 'inferido' }
export interface Step { regla: string; prioridad: number; cfSi: number; cfRegla: number; aporte: number; antes: number | null; despues: number; conclusion: [string, Value]; porque: string }
