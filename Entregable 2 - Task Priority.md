# Entregable 2 Sistema experto para la priorización de tareas

Base de conocimiento y base de hechos

Institución Universitaria Salazar y Herrera · Ingeniería de Sistemas

Curso: Sistemas expertos (SISTE11-531) · Docente: Santiago Rivera López · Avance: 15 % del curso.

Este informe presenta las ocho reglas que sustentan una recomendación de prioridad y los hechos iniciales de tres situaciones académicas: una que permite concluir, una que no permite concluir y una que satisface dos reglas con prioridades distintas. La base de conocimiento es común a los tres casos y se mantiene separada de los datos de cada situación.

## 1. Integrantes

| Nombre | Código |
| --- | --- |
| Daniel Escobar Muñoz | 202210280 |
| Manuela Escobar | 22210247 |

## 2. El sistema

El sistema apoya la priorización individual de tareas académicas, laborales y personales. Su decisión es `prioridad_tarea`, con los valores `alta`, `media` y `baja`. Cuando la información no satisface ninguna regla que concluya, no se asigna una prioridad por defecto: la tarea se conserva sin recomendación. La salida es una categoría para una tarea, no un calendario automático ni una clasificación global de todas las actividades.

Este avance continúa el sistema presentado en el informe del 21 de octubre, «Rule-Based Expert System for Task Prioritization and Time Management». Mantiene el propósito de explicar las recomendaciones a partir de criterios explícitos, separando el conocimiento del mecanismo que posteriormente lo utilizará. El alcance actual comprende cuatro hechos iniciales: `fecha_entrega`, `plazo`, `importancia` y `esfuerzo`; el plazo se prepara a partir de la fecha de entrega y de una referencia temporal explícita. La disponibilidad de tiempo y las dependencias mencionadas en el informe anterior no están representadas en estas reglas y no se les atribuyen resultados.

El usuario es una persona que organiza sus compromisos y declara la importancia y el esfuerzo de cada tarea. El referente de conocimiento experto son las prácticas documentadas de priorización y gestión del tiempo que el informe anterior tomó de Asana y Atlassian, entre ellas la matriz urgencia–importancia; no se identifica a una persona experta entrevistada. El grupo propone su formalización en reglas para este ejercicio; no se afirma haber entrevistado a un experto externo ni haber validado empíricamente la matriz o sus factores de certeza.

La estrategia elegida en el informe anterior es el encadenamiento hacia adelante: partir de hechos conocidos para obtener una conclusión. Este avance presenta únicamente la base de conocimiento y tres bases de hechos iniciales. No incluye implementación, traza de ejecución ni resultados de pruebas del motor. La prioridad numérica de las reglas establece su precedencia; no debe confundirse con el nivel de prioridad recomendado para una tarea.

La política de esta versión considera siempre importancia y esfuerzo. Un plazo urgente puede reforzar determinados criterios de importancia alta o media, pero no transforma por sí solo una tarea de importancia baja en prioridad alta. La ausencia de fecha no excluye todas las tareas: la abstención explícita corresponde a la combinación importancia baja, esfuerzo bajo y sin fecha. Los criterios son revisables y sus límites se declaran, en lugar de presentar las recomendaciones como decisiones universales.

## 3. Hechos

| Hecho | Significado | Tipo | Origen en el dominio | Ejemplo de valor |
| --- | --- | --- | --- | --- |
| `fecha_entrega` | Fecha civil de entrega o ausencia explícita de vencimiento. | Observado, inicial. | Aviso académico o declaración del usuario. | `2026-11-09` |
| `plazo` | Categoría de cercanía preparada antes de aplicar las reglas de prioridad. | Inicial, normalizado desde entrega y referencia. | Fecha de entrega y convención temporal declarada. | `urgente` |
| `importancia` | Relevancia o consecuencias de la actividad para los compromisos del usuario. | Observado, inicial. | Valoración declarada por la persona y contexto de la actividad. | `alta` |
| `esfuerzo` | Carga de trabajo estimada de manera categórica. | Observado, inicial. | Estimación del usuario a partir del material o actividad conocida. | `alto` |
| `prioridad_tarea` | Nivel de atención que una regla escribiría como conclusión. | Inferido; no se precarga en los casos. | Reglas de la base de conocimiento. | `media` |

**Vocabulario.** Importancia admite `alta`, `media`, `baja`; esfuerzo admite `alto`, `medio`, `bajo`; plazo admite `urgente`, `proximo`, `con_tiempo`, `sin_fecha`. `sin_fecha` expresa un dato conocido: no existe un vencimiento declarado. No significa certeza cero ni equivale a un vencimiento lejano. Los tres casos contienen los mismos cuatro hechos iniciales: fecha_entrega, plazo, importancia y esfuerzo. Fecha, importancia y esfuerzo son datos declarados; plazo es su categoría temporal preparada, no la conclusión de prioridad. Una tarea puede no tener fecha real y aun así declarar el hecho `plazo = sin_fecha`.

La preparación del caso clasifica fecha_entrega respecto de una fecha_referencia explícita: desde hoy hasta dos días, urgente; de tres a siete días, proximo; más de siete, con_tiempo; ausencia declarada, sin_fecha. Una fecha pasada se considera vencida y queda fuera de priorización. Son criterios revisables del proyecto, no rangos universales ni una escala validada por el profesor. Esfuerzo tampoco es una duración calculada; las referencias temporales de los orígenes son estimaciones ficticias del caso, no una conversión automática.

Cada hecho inicial tiene `valor`, `cf`, `origen` y `clase`. El CF representa el apoyo o seguridad asignado al dato, entre −1 y +1, no una probabilidad estadística. El origen explica la observación y, cuando corresponde, la incertidumbre. Los casos son ficticios. Sus cifras ilustran certezas distintas y no se presentan como mediciones o estimaciones calibradas por un experto.

La referencia reproducible de estos tres casos es **2026-11-08**, registrada como metadato `fecha_referencia` en cada JSON. Las entregas del examen y la confirmación se fijan ficticiamente en **2026-11-09**, coherentes con «mañana»; la actividad opcional declara `sin_fecha`. El plazo que figura en la tabla es la categoría inicial preparada para esa referencia y conserva el CF de la fecha, sin asignar una certeza experta adicional. No es un hecho inferido por las reglas de prioridad: la única conclusión de estas es `prioridad_tarea`.

### Convenciones de lectura

Los valores se escriben sin tildes en los JSON: `proximo` y `con_tiempo` son etiquetas, no errores de redacción. Los CF se almacenan como números con punto decimal; las tablas usan coma decimal para lectura en español, sin cambiar su valor. `fecha_referencia` no es un quinto hecho: es metadato que fija el día desde el que se interpreta la entrega.

Importancia y esfuerzo son valoraciones categóricas del usuario: no se deducen del título ni se convierten en horas. Importancia alta representa consecuencias relevantes; media, consecuencias intermedias; baja, impacto limitado. Esfuerzo alto, medio y bajo expresan carga relativa percibida. Estas definiciones orientan la declaración, pero todavía no constituyen una escala calibrada entre personas.

## 4. Reglas

La base `bc.json` contiene ocho reglas compartidas por los tres casos. Las condiciones de cada SI se unen con **Y**. Dentro del vocabulario admitido, `esfuerzo != bajo` comprende alto y medio; no autoriza categorías desconocidas. Los identificadores se numeran consecutivamente de r1 a r8, en el mismo orden de declaración del JSON.

Los CF de las reglas son propuestas de diseño: **0,90** expresa apoyo fuerte al criterio y **0,60** apoyo moderado, sujeto a excepciones. Esta escala no está validada empíricamente. Una conclusión baja puede tener apoyo fuerte: CF y nivel de prioridad son conceptos distintos. La prioridad 100 corresponde a refinamientos de urgencia y 20 a criterios base; indica precedencia de reglas, no magnitud de importancia de la tarea.

| id | prioridad | CF | SI (todas las condiciones) | ENTONCES | porque |
| --- | ---: | ---: | --- | --- | --- |
| `r1` | 20 | 0,9 | `importancia == alta` **Y** `esfuerzo != bajo` | `prioridad_tarea = alta` | El impacto alto y un esfuerzo alto o medio justifican atención prioritaria aunque no se conozca el vencimiento. |
| `r2` | 20 | 0,6 | `importancia == alta` **Y** `esfuerzo == bajo` | `prioridad_tarea = media` | Una tarea importante pero breve admite planificación regular cuando no hay evidencia adicional de urgencia. |
| `r3` | 20 | 0,6 | `importancia == media` **Y** `esfuerzo != bajo` | `prioridad_tarea = media` | Una tarea de impacto medio y esfuerzo alto o medio necesita planificación regular, sin equipararla automáticamente a un compromiso de alto impacto. |
| `r4` | 20 | 0,6 | `importancia == media` **Y** `esfuerzo == bajo` | `prioridad_tarea = baja` | Una tarea de impacto medio y carga reducida puede atenderse después de compromisos de mayor impacto o carga. |
| `r5` | 20 | 0,9 | `importancia == baja` **Y** `esfuerzo != bajo` | `prioridad_tarea = baja` | Una tarea de impacto bajo y esfuerzo alto o medio no debe desplazar compromisos importantes por su sola carga. |
| `r6` | 20 | 0,9 | `importancia == baja` **Y** `esfuerzo == bajo` **Y** `plazo != sin_fecha` | `prioridad_tarea = baja` | Una tarea de impacto y esfuerzo bajos con vencimiento declarado admite prioridad baja; sin fecha el sistema conserva la tarea y se abstiene de recomendar para esta combinación. |
| `r7` | 100 | 0,9 | `importancia == alta` **Y** `esfuerzo == bajo` **Y** `plazo == urgente` | `prioridad_tarea = alta` | Un vencimiento urgente refuerza la atención alta de una tarea importante aunque su esfuerzo sea reducido. |
| `r8` | 100 | 0,9 | `importancia == media` **Y** `esfuerzo != bajo` **Y** `plazo == urgente` | `prioridad_tarea = alta` | Un vencimiento urgente y un esfuerzo alto o medio refuerzan la atención alta de una tarea de impacto medio. |

En particular, importancia media con esfuerzo bajo corresponde a r4 y conclusión baja, incluso con plazo urgente; importancia baja con esfuerzo alto corresponde a r5 y conclusión baja. Estos son límites explícitos de la política actual, no errores que deba corregir el motor ni afirmaciones universales sobre productividad. Un cambio de criterio requiere revisar la base de conocimiento.

Las reglas no nombran personas, fechas concretas ni casos. Todas escriben el mismo hecho de conclusión y, en conjunto, pueden escribir alta, media o baja. La excepción de r6 impide concluir para baja/bajo/sin_fecha sin eliminar la tarea. Las otras combinaciones no quedan excluidas automáticamente por carecer de fecha. Las reglas y sus CF permanecen iguales al cambiar de caso.

## 5. Casos

Cada tabla transcribe los valores y orígenes del JSON correspondiente. La clase de todas las filas es inicial. Ningún caso incluye `prioridad_tarea` como hecho de entrada. El campo `rol` identifica el propósito académico del ejemplo; no impone una conclusión.

### 5.1. Estudiar para un examen de matemáticas

Archivo: `casos/caso_01_concluye.json` · Rol: `concluye`.

Con estos hechos, el SI de `r1` queda cumplido y esa regla escribiría `prioridad_tarea = alta`.

| clase | hecho | valor | CF | origen |
| --- | --- | --- | ---: | --- |
| `inicial` | `fecha_entrega` | `2026-11-09` | 1 | Fecha ficticia del aviso académico: entrega el 9 de noviembre de 2026; referencia del caso: 8 de noviembre de 2026. |
| `inicial` | `plazo` | `urgente` | 1,0 | Categoría inicial preparada desde fecha_entrega y la referencia fija 2026-11-08; no es una conclusión de prioridad. |
| `inicial` | `importancia` | `alta` | 0,9 | Valoración del estudiante por el peso del examen; aún no confirma todos los criterios. |
| `inicial` | `esfuerzo` | `alto` | 0,8 | Estima más de tres horas de repaso; no ha resuelto aún todos los temas. |

### 5.2. Ordenar material de lectura opcional sin fecha de entrega

Archivo: `casos/caso_02_no_concluye.json` · Rol: `no_concluye`.

Ninguna regla que escribe la conclusión tiene su SI completo cumplido: r6 exige un plazo distinto de `sin_fecha` y las demás reglas no coinciden con la combinación de importancia baja y esfuerzo bajo.

| clase | hecho | valor | CF | origen |
| --- | --- | --- | ---: | --- |
| `inicial` | `fecha_entrega` | `sin_fecha` | 1 | El estudiante confirma que la actividad no tiene fecha de entrega. |
| `inicial` | `plazo` | `sin_fecha` | 1 | Categoría inicial preparada desde fecha_entrega y la referencia fija 2026-11-08; no es una conclusión de prioridad. |
| `inicial` | `importancia` | `baja` | 0,9 | Valoración del estudiante: actividad opcional sin impacto en compromisos actuales; sus necesidades pueden cambiar. |
| `inicial` | `esfuerzo` | `bajo` | 0,9 | El estudiante revisó el material y estima una organización breve; podría aparecer algún documento adicional. |

### 5.3. Confirmar asistencia a una evaluación obligatoria

Archivo: `casos/caso_03_conflicto.json` · Rol: `conflicto`.

Los SI de `r7` y `r2` quedan cumplidos simultáneamente: `r7` escribiría `prioridad_tarea = alta` y tiene prioridad 100, mayor que la prioridad 20 de `r2`, que escribiría `prioridad_tarea = media`.

| clase | hecho | valor | CF | origen |
| --- | --- | --- | ---: | --- |
| `inicial` | `fecha_entrega` | `2026-11-09` | 1 | Fecha ficticia del aviso académico: entrega el 9 de noviembre de 2026; referencia del caso: 8 de noviembre de 2026. |
| `inicial` | `plazo` | `urgente` | 1,0 | Categoría inicial preparada desde fecha_entrega y la referencia fija 2026-11-08; no es una conclusión de prioridad. |
| `inicial` | `importancia` | `alta` | 0,9 | El estudiante considera relevante asegurar su asistencia a la evaluación; falta confirmar una condición del aviso. |
| `inicial` | `esfuerzo` | `bajo` | 0,9 | El formulario de confirmación revisado parece breve; podría requerir una aclaración. |

### Fuentes de contexto

- Escobar Muñoz, D., y Escobar, M. (2026). *Rule-Based Expert System for Task Prioritization and Time Management*. Informe previo del grupo, octubre de 2026.
- Institución Universitaria Salazar y Herrera. *Proyecto 1. Avance: base de conocimiento y base de hechos*. Guía de Sistemas expertos, docente Santiago Rivera López.
- Asana. (s. f.). *Matriz de Eisenhower*. https://asana.com/es/templates/eisenhower-matrix
- Atlassian. (s. f.). *How to prioritize tasks*. https://www.atlassian.com/es/work-management/project-management/how-to-prioritize-tasks

Las referencias de Asana y Atlassian provienen del informe anterior y fundamentan el contexto general; no se les atribuyen los CF ni las ocho reglas exactas propuestas por el grupo.

# INSTRUCCIONES PARA MANUELA

**Este bloque es independiente del informe y no debe incluirse en el PDF académico.** El cuerpo del PDF es el título, la presentación y las cinco secciones anteriores, con sus tablas y fuentes de contexto. Este archivo Markdown es el material editable para preparar ese documento; no es uno de los archivos que se suben al campus.

## Preparar el informe en Word y exportar a PDF

1. Copiar el cuerpo del informe a Word u otro editor y conservar los cinco títulos exactamente en este orden: **1. Integrantes**, **2. El sistema**, **3. Hechos**, **4. Reglas**, **5. Casos**. No convertir estas instrucciones en una sexta sección.
2. Mantener el informe en español. El desarrollo debe ocupar **al menos dos páginas**, no exactamente dos; la sección **El sistema** debe ocupar aproximadamente media página. No reemplazar desarrollo por una portada ni reducir las tablas hasta volverlas ilegibles.
3. Usar letra legible, títulos consistentes, márgenes normales y tablas con encabezados visibles. Ajustar anchos, orientación o saltos de página según haga falta; repetir los encabezados si una tabla continúa y evitar cortar una fila de forma que se pierda su lectura.
4. Conservar las ocho filas de reglas y los textos completos de `porque`. La tabla debe tener las seis columnas **id, prioridad, CF, SI, ENTONCES y porque**; no sustituirla por capturas, resúmenes ni imágenes de los JSON.
5. Mantener en cada caso una tabla con las cinco columnas **clase, hecho, valor, CF y origen** y sus cuatro filas iniciales. No abreviar los orígenes ni añadir `prioridad_tarea` a esas tablas.
6. Dejar **una sola frase del rol por caso**, como está redactada: `r1` concluye alta; el segundo caso no satisface ningún SI completo que concluya; el tercero satisface `r7` y `r2`, con prioridad 100 frente a 20 y conclusiones alta y media. No añadir cálculos, capturas de ejecución, recorridos paso a paso ni trazas.
7. Exportar como **InformeBC_Escobar_Escobar.pdf** y abrir el PDF final para revisar todas sus páginas. Comprobar que no se corten textos o tablas, que no queden filas ilegibles, que se conserven tildes en la redacción y que estén completas las cinco secciones. La paginación final solo se comprueba al maquetar y exportar.

## Empaquetar exactamente cinco archivos

El nombre interno «Entregable 2» identifica este documento de trabajo y **no cambia** el nombre oficial que exige la guía: **Avance1_Escobar_Escobar.zip**. Los dos apellidos disponibles para nombrar el paquete son Escobar y Escobar.

```text
Avance1_Escobar_Escobar.zip
├── InformeBC_Escobar_Escobar.pdf
├── bc.json
└── casos/
    ├── caso_01_concluye.json
    ├── caso_02_no_concluye.json
    └── caso_03_conflicto.json
```

El ZIP debe contener **exactamente esos cinco archivos**, con `bc.json` y el PDF en la raíz y los tres casos en la carpeta `casos`. Usar la base y los casos vigentes que corresponden a las tablas de este informe. No incluir motor, traza, código, pruebas, README, este Markdown, un archivo Word, capturas, carpetas del proyecto ni versiones anteriores del PDF. No reutilizar el PDF o ZIP interno de una versión previa: el paquete final debe reflejar estos datos y esta numeración de reglas.

Una sola persona del grupo sube el ZIP al campus virtual. La guía fija el **domingo 8 de noviembre de 2026, antes de las 11:59 p. m.** y no especifica zona horaria; verificar el cierre que indique el campus. Preparar este Markdown no equivale a haber generado el PDF, armado el ZIP, enviado el trabajo ni recibido confirmación del campus.

## Lista de chequeo de la guía página 6

Las casillas se dejan vacías para revisarlas sobre los archivos finales, no como constancia de una entrega ya realizada.

- [ ] El ZIP se llama Avance1_Escobar_Escobar.zip y lo sube una sola persona.
- [ ] El PDF está en español y tiene las cinco secciones: Integrantes, El sistema, Hechos, Reglas, Casos.
- [ ] Cada integrante está con nombre completo y código.
- [ ] El sistema es el del informe del 21 de octubre: se ve la decisión, el experto y el usuario.
- [ ] bc.json tiene ocho reglas o más, con id, prioridad, cf, si, entonces y porque.
- [ ] Las reglas que concluyen escriben el mismo hecho, y ese hecho no viene en los casos.
- [ ] Ninguna regla nombra a una persona ni a un caso. Los CF y las prioridades no están todos repetidos.
- [ ] Los tres casos traen los mismos hechos observados, con valor, CF, origen y clase inicial.
- [ ] Los roles son concluye, no_concluye y conflicto. En el PDF, una frase por caso dice qué reglas quedan cumplidas.
- [ ] En al menos un hecho el CF es menor que 1, y el origen explica esa duda.
- [ ] El ZIP no trae motor, traza ni código.
- [ ] El PDF se entiende sin abrir el JSON.

## Comprobaciones adicionales de contenido y formato

- [ ] El desarrollo ocupa al menos dos páginas y **El sistema** aproximadamente media página, sin contar estas instrucciones.
- [ ] El PDF contiene las ocho reglas `r1` a `r8`, con identificadores únicos, condiciones, prioridades, CF, conclusiones y razones iguales a `bc.json`.
- [ ] Los hechos y los id se conservan en minúsculas, sin espacios ni tildes; los valores de texto coinciden con el vocabulario del JSON y los números no se han convertido en categorías diferentes.
- [ ] Se distingue la prioridad numérica de una regla del valor de `prioridad_tarea` y de su CF.
- [ ] Los tres casos comparten `fecha_entrega`, `plazo`, `importancia` y `esfuerzo`, sin conclusión precargada; cada tabla coincide con el JSON correspondiente en clase, hecho, valor, CF y origen.
- [ ] La referencia fija es `2026-11-08`; los casos 1 y 3 tienen entrega `2026-11-09` y plazo `urgente`, y el caso 2 tiene fecha y plazo `sin_fecha`.
- [ ] El caso 2 conserva su abstención porque ningún SI completo coincide, no por un supuesto umbral de CF; el caso 3 conserva las dos reglas cumplidas y su precedencia 100 frente a 20.
- [ ] Las condiciones consultan `importancia`, `esfuerzo` y `plazo`; `fecha_entrega` prepara la categoría temporal y `fecha_referencia` es metadato, no un quinto hecho inicial ni una condición SI.
- [ ] El informe no afirma que estén representadas disponibilidad de tiempo o dependencias del informe anterior, ni presenta un calendario automático como conclusión de estas reglas.
- [ ] Se han abierto y revisado todas las páginas del PDF, así como el ZIP final, que contiene únicamente los cinco archivos solicitados y conserva sus nombres y rutas.

## Pendientes que requieren confirmación

**Nombre de Manuela.** Confirmar si «Manuela Escobar» es el nombre completo que debe aparecer. Es el nombre disponible en el informe previo; no se han inventado otros apellidos. Los códigos disponibles son Daniel Escobar Muñoz **202210280** y Manuela Escobar **22210247**.

**Referencia experta y CF.** La guía atribuye las reglas, sus razones y sus CF al experto. El informe anterior toma como referente prácticas documentadas por Asana y Atlassian, no una persona experta entrevistada. Las ocho reglas concretas y la escala propuesta 0,90/0,60 son una formalización del grupo y siguen sin validación experimental o experta específica; los CF de los hechos son valoraciones ficticias de estos casos. No presentar estas cifras como probabilidades medidas, atribuirlas a esas organizaciones ni inventar entrevistas. Revisar con el docente si esa fundamentación documental satisface lo esperado y qué respaldo adicional necesita.

**Normalización de plazo y metadato.** La guía pide hechos observados de clase inicial. Los JSON actuales declaran `plazo` como inicial aunque sea una categoría preparada desde `fecha_entrega` y la referencia fija, mientras `fecha_referencia` es una extensión de metadatos del proyecto que la guía no exige expresamente. El informe explica esta interpretación con transparencia; **no consta aprobación docente de esta convención**. Confirmarla con el docente y, si se solicita un ajuste, mantener coherencia entre informe, `bc.json` y los tres casos, sin cambiar solo la tabla del PDF.

Esta revisión documental no es una calificación de la rúbrica, una validación del conocimiento por un experto ni una prueba de ejecución de la aplicación.
