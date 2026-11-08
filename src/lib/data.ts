import knowledge from '../../bc.json';
import c1 from '../../casos/caso_01_concluye.json';
import c2 from '../../casos/caso_02_no_concluye.json';
import c3 from '../../casos/caso_03_conflicto.json';
import {parseTaskCase,parseKnowledge} from '../priority-core';
export const kb=parseKnowledge(knowledge);
export const cases=[c1,c2,c3].map(parseTaskCase);
