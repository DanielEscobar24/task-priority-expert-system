import type {Case} from '../../priority-core';

/** Una tarea no presupone conclusión ni rol de caso de prueba. */
export type CalendarTask = Pick<Case, 'caso' | 'hechos'> & {deliveryDate?: string; description?: string};
