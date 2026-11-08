import type {Knowledge} from '../../priority-core';
import {formatCF} from './format';

export default function KnowledgeTable({knowledge}: {knowledge: Knowledge}) {
  return (
    <section className="panel">
      <h2>Base de conocimiento · {knowledge.reglas.length} reglas</h2>
      <p>La misma base para los tres casos. Condiciones unidas por Y; CF propuestos, no validados por un experto.</p>
      <div className="tablewrap"><table>
        <thead><tr><th>Regla</th><th>Prioridad</th><th>CF</th><th>SI</th><th>ENTONCES</th><th>Justificación</th></tr></thead>
        <tbody>{knowledge.reglas.map(rule => <tr key={rule.id}>
          <td>{rule.id}</td><td>{rule.prioridad}</td><td>{formatCF(rule.cf)}</td>
          <td>{rule.si.map(condition => condition.join(' ')).join(' Y ')}</td>
          <td>{rule.entonces.join(' = ')}</td><td>{rule.porque}</td>
        </tr>)}</tbody>
      </table></div>
    </section>
  );
}
