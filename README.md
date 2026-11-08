# Task Priority Expert System

Sistema experto basado en reglas para recomendar la prioridad de tareas académicas, laborales y personales. Este repositorio conserva la base de conocimiento y los hechos de ejemplo que alimentan un laboratorio local para probar el motor de certeza de Sesión 6.

## Revisión del material del curso (7 de noviembre de 2026)

Esta revisión corrige la propuesta inicial de elegir la recomendación final solo por la prioridad de una regla:

- **Sesión 5:** la agenda se ordena por prioridad descendente, luego por especificidad (más condiciones) y finalmente por orden de declaración. Eso decide el turno de aplicación.
- **Sesión 6:** se conservan las conclusiones alternativas. La recomendación es la fila con mayor CF, no necesariamente la regla que tuvo el primer turno (diapositiva «Camilo, después de correr»).
- Una regla aporta `cf_regla × mínimo(cf de los hechos del SI)`. Si ese mínimo no es estrictamente mayor que `0.20`, no escribe. El umbral se aplica al antecedente, no al aporte calculado.
- Para dos apoyos positivos sobre **el mismo hecho y el mismo valor**: `a + b × (1 − a)`.
- Para apoyos de signo contrario sobre **la misma conclusión**: `(a + b) / (1 − min(|a|, |b|))`.
- Las conclusiones de valores distintos se guardan por separado; no se combinan «alta» y «baja» como si fueran el mismo valor.
- El CF es apoyo, no probabilidad estadística. Se guarda tanto en reglas como en hechos, conservando el origen y la clase de cada fila.

**Pendientes de fundamentación:** documentar una escala que traduzca observaciones a CF de forma reproducible y justificar las reglas con fuentes de dominio. Las certezas actuales son propuestas de diseño, no parámetros validados por un experto. La plantilla local de Sesión 6 sí define dos aportes negativos (`a + b × (1 + a)`), denominador cero (+1/−1 → 0), recomendación solo si supera 0,20 y empate a favor de la primera fila inferida. El prototipo conserva esas decisiones.

El avance académico sigue pidiendo solo conocimiento, hechos y PDF, sin motor ni traza. La implementación solicitada después es una herramienta separada de validación y aprendizaje.

## Estado actual

- Propuesta vigente de ocho reglas generales, diez tareas ficticias y tres casos.
- La decisión es `prioridad_tarea`, con valores `alta`, `media` o `baja`.
- Implementación actual: evaluación de reglas sobre hechos iniciales; no encadena conclusiones inferidas como nuevos antecedentes.
- Hay un laboratorio local en Next.js y TypeScript con un motor de certeza y pruebas. No hay despliegue ni almacenamiento persistente.
- Los factores de certeza de las reglas son juicios propuestos para el ejercicio; no son valores medidos o validados por un experto real.

## Estructura

```text
README.md
bc.json
casos/
  caso_01_concluye.json
  caso_02_no_concluye.json
  caso_03_conflicto.json
ejemplos/
  diez_tareas.json
```

`bc.json` es una sola base de conocimiento compartida por todos los casos. Se conservan únicamente los tres casos exigidos por la actividad. El catálogo de diez tareas es material de trabajo adicional, no diez tipos de hecho ni un sustituto de los casos.

## Hechos y vocabulario

Cada tarea requiere importancia y esfuerzo. Plazo es un hecho opcional, declarado y no calculado desde la ubicación del calendario:

| Hecho | Valores válidos | Significado |
| --- | --- | --- |
| `plazo` | `urgente`, `proximo`, `con_tiempo`, `sin_fecha` | Cercanía del vencimiento o ausencia de fecha declarada. |
| `importancia` | `alta`, `media`, `baja` | Relevancia o consecuencias de la actividad. |
| `esfuerzo` | `alto`, `medio`, `bajo` | Categoría de esfuerzo declarada; no es una duración en horas. |

La salida `prioridad_tarea` es inferida; no aparece precargada en los hechos de los casos.

Cada hecho contiene `valor`, `cf`, `origen` y `clase`. La clase es `inicial` porque el dato entra antes de aplicar reglas. El origen explica de dónde sale el dato y, si su certeza es menor que 1, por qué es incierto. Los ejemplos y sus fuentes son ficticios, no datos personales reales.

### Criterios propuestos anteriormente, no implementados

- Plazo urgente: vence en dos días o menos; próximo: de tres a siete días; con tiempo: más de siete días.
- Esfuerzo bajo: hasta una hora; medio: más de una y hasta tres; alto: más de tres horas.
- Importancia alta: consecuencias relevantes para un objetivo; media: contribuye, pero admite reprogramación; baja: impacto reducido u opcional.

Estos límites se conservan como antecedente de la propuesta, no como contrato del motor ni decisiones definitivas: no son requisitos del profesor ni criterios universales. Los JSON contienen categorías ya asignadas. No existe configuración ni conversión implementada desde fechas y horas; no se deben convertir estas categorías en cantidades de horas para presentarlas como resultados.

Tiempo disponible y dependencias pertenecen al alcance del proyecto anterior, pero esta primera base no los evalúa. Se incorporarán solo cuando se definan sus hechos y reglas, sin atribuirles resultados que aún no produce el sistema.

## Contrato real del motor y límites de la vista

El laboratorio valida cada caso con `parseTaskCase` antes de llamar a `evaluate`; el calendario no llama al motor:

- Entrada del caso: `caso` (nombre), `rol` (`concluye`, `no_concluye` o `conflicto`, metadato del ejemplo) y `hechos` con `importancia` y `esfuerzo` obligatorios y `plazo` opcional en las categorías de la tabla anterior.
- Cada hecho contiene `valor`, `cf` numérico entre −1 y +1, `origen` no vacío y `clase: "inicial"`. No se acepta `prioridad_tarea` precargada.
- La otra entrada es la base de conocimiento (`nombre` y `reglas`). `evaluate` admite además un objetivo opcional, por defecto `prioridad_tarea`. El evaluador genérico no impone por sí solo las tres categorías; esa validación corresponde a `parseTaskCase`.
- Salida `initial`: hechos iniciales con CF redondeados a cuatro decimales.
- Salida `inferred`: alternativas con `nombre`, `valor`, `cf`, `origen` (identificadores de reglas) y `clase: "inferido"`.
- Salida `steps`: por cada regla aplicada, `regla`, `prioridad`, `cfSi`, `cfRegla`, `aporte`, `antes`, `despues`, `conclusion` y `porque`.
- Salida `excluded`: reglas no aplicadas, con `regla` y `motivo`.
- Salida `recommendation`: la alternativa del objetivo con mayor CF si supera 0,20, o `null`. Con la base actual sus valores posibles son `alta`, `media` y `baja`. `null` debe mostrarse como **Sin recomendación**, nunca como prioridad baja por defecto.

**Qué mostrar en el detalle o una imagen de propuesta:** nombre de la tarea, los tres hechos con sus categorías y CF, su origen y clase; prioridad recomendada y CF final; alternativas conservadas; reglas aplicadas con sus aportes y justificación; reglas excluidas. Los CF son apoyo a conclusiones, no probabilidades ni porcentajes de avance.

**Qué no atribuir al motor:** horas recomendadas, duración calculada, bloques horarios, fecha de ejecución, tiempo disponible, dependencias, orden global entre tareas o planificación automática. No recibe ni produce esos datos. El calendario semanal sigue siendo una decisión de diseño futuro de la interfaz, no una salida del motor. Hasta definir datos adicionales, una vista no debe rellenar fechas u horas ficticias como si se hubieran calculado.

## Base de conocimiento

El archivo contiene `nombre` y `reglas`. Cada regla incluye exactamente:

- `id`: identificador único en minúsculas.
- `prioridad`: entero que establece el orden entre reglas aplicables.
- `cf`: factor de certeza entre −1 y +1.
- `si`: condiciones `[hecho, operador, valor]`, unidas por **Y**.
- `entonces`: `[hecho_de_conclusion, valor]`.
- `porque`: justificación en español.

| Regla | Prioridad | CF | Condiciones | Conclusión |
| --- | ---: | ---: | --- | --- |
| r1 | 20 | 0.9 | importancia == alta; esfuerzo != bajo | alta |
| r2 | 20 | 0.6 | importancia == alta; esfuerzo == bajo | media |
| r3 | 20 | 0.6 | importancia == media; esfuerzo != bajo | media |
| r4 | 20 | 0.6 | importancia == media; esfuerzo == bajo | baja |
| r5 | 20 | 0.9 | importancia == baja; esfuerzo != bajo | baja |
| r6 | 20 | 0.9 | importancia == baja; esfuerzo == bajo; plazo != sin_fecha | baja |
| r7 | 100 | 0.9 | importancia == alta; esfuerzo == bajo; plazo == urgente | alta |
| r8 | 100 | 0.9 | importancia == media; esfuerzo != bajo; plazo == urgente | alta |

Ocho reglas vigentes: seis criterios base y dos refinamientos por urgencia. `esfuerzo != bajo` agrupa alto/medio dentro del vocabulario validado, no valores desconocidos. Baja/bajo/sin_fecha queda sin recomendación por r6. Importancia baja nunca concluye alta solo por urgencia. Los IDs están numerados consecutivamente de r1 a r8.

El CF expresa apoyo o seguridad, no probabilidad estadística ni prioridad de ejecución. La prioridad numérica de una regla no es la prioridad recomendada para una tarea.

## Casos y resultados esperados

| Archivo | Situación | Reglas aplicables | Resultado esperado (análisis, no ejecución) |
| --- | --- | --- | --- |
| `caso_01_concluye.json` | Examen: importancia alta, esfuerzo alto | r1 | Alta, CF 0,90 × 0,80 = 0,72. |
| `caso_02_no_concluye.json` | Lectura opcional: sin_fecha, importancia baja, esfuerzo bajo | Ninguna tiene el SI cumplido | Sin recomendación, tarea conservada. |
| `caso_03_conflicto.json` | Confirmación obligatoria urgente, importancia alta, esfuerzo bajo | r7 y r2 | Alta 0,81 y media 0,54; recomienda alta. |

El caso sin conclusión tiene los mismos tres hechos observados que los otros casos y valores válidos. r6 no coincide porque exige plazo distinto de sin_fecha; las demás reglas no coinciden por importancia o esfuerzo. No depende de reducir artificialmente CF: los hechos tienen certeza suficiente, pero ningún SI completo coincide.

### Motor de certeza implementado

La prioridad decide el turno (mayor prioridad, más condiciones, orden de declaración). Se evalúan todas las reglas aplicables una sola vez por corrida; no se detiene al escribir la primera conclusión. Los aportes del mismo hecho y valor se combinan; las alternativas se conservan. La recomendación es la fila de mayor CF siempre que supere 0,20. En el caso 3 quedan alta = 0,81 y media = 0,54: gana alta por certeza, no simplemente por el turno de r7.

La implementación sigue el cuaderno de Sesión 6, que consulta solo hechos iniciales. No implementa encadenamiento de hechos inferidos ni razonamiento hacia atrás. Cada nueva evaluación empieza desde los datos de entrada y no modifica los JSON. El validador de dominio rechaza categorías desconocidas; las comparaciones del motor no hacen coerción de tipos.

Se redondean los CF iniciales y resultados de trabajo a cuatro decimales. La función JavaScript utiliza redondeo al más cercano con corrección de representación; no promete equivalencia bit a bit con `round` de Python en empates de redondeo. Los ejemplos del curso y del proyecto son reproducibles con las pruebas incluidas.

## Ejecutar el laboratorio local

Requiere Node.js 20.9 o superior (verificado con Node 24.13). Dependencias fijadas mediante `package-lock.json`.

```bash
npm ci
npm test
npm run typecheck
npm run build
npm run dev
```

Abre http://127.0.0.1:3000. Si ese puerto está ocupado: `npm run dev -- --port 3011`.

La ruta `/laboratorio` conserva la pantalla para seleccionar tres casos o diez tareas, cambiar categorías y CF, evaluar, ver alternativas inferidas y revisar aportes y justificaciones. La ruta `/` muestra ahora el calendario semanal. Las modificaciones son simulaciones en memoria y se pierden al recargar. El selector de CF es una herramienta de laboratorio, no la escala de observaciones definitiva del producto.

Archivos de implementación: `src/priority-core/engine.ts` (motor y validación), `src/lib/data.ts` (lectura de JSON), `src/app/` (interfaz), `tests/engine.test.ts` (pruebas). El motor es independiente de React y Next.js.

### Material contrastado

- Guía «Proyecto 1: Avance, base de conocimiento y base de hechos», pp. 2–4: esquema y alcance de entrega.
- Diapositivas Sesión 5, diapositiva 9, y su plantilla: prioridad, especificidad, orden y refracción.
- Diapositivas Sesión 6, pp. 8–15 y 20–26: escala, aportes, combinación y filas iniciales/inferidas; p. 23: recomendación por mayor CF.
- Plantilla «de una fuente a una regla» (texto y cuaderno): justificar el conocimiento con fuentes, no inventar razones de experto.
- Cuaderno de arritmias y artículo «Architectural model of expert systems»: separación de conocimiento, hechos, inferencia y explicación; no son reglas del dominio de tareas.
- `ciclo.html`: demostración de Sesión 5, no especificación del cálculo de certeza.
- Plantilla de estudiantes y ficha de fórmulas de Sesión 6, consultadas adicionalmente en el material local: fórmulas y detalles ejecutables.

### Verificación

Las pruebas cubren tres casos, diez tareas, combinaciones con y sin fecha, apoyos positivos/negativos/opuestos, umbral estricto, CF final mínimo, agenda y empates, datos inválidos, no mutación y repetición sin duplicar evidencia. No validan empíricamente la calidad del conocimiento experto. La interfaz no se considera validada visualmente mientras la conexión de lectura del navegador siga fallando.

## Entrega académica

La guía «Proyecto 1: Avance, base de conocimiento y base de hechos» pide un ZIP con:

```text
Avance1_Apellido1_Apellido2.zip
  InformeBC_Apellido1_Apellido2.pdf
  bc.json
  casos/caso_01_concluye.json
  casos/caso_02_no_concluye.json
  casos/caso_03_conflicto.json
```

Lo sube una sola persona del grupo. Fecha indicada: domingo 8 de noviembre de 2026, antes de las 11:59 p. m.; la guía no explicita zona horaria.

El informe debe estar en español, tener al menos dos páginas de desarrollo y estas secciones, en orden: **Integrantes**, **El sistema**, **Hechos**, **Reglas** y **Casos**. La tabla de reglas debe coincidir con `bc.json`; los casos deben explicar su rol e incluir clase, hecho, valor, CF y origen.

Este repositorio no es todavía el paquete final: falta elaborar el PDF y preparar el ZIP. Los dos casos adicionales y el catálogo son ejemplos de trabajo; no reemplazan los tres archivos exigidos. No incluir un motor, código, traza ni archivos de verificación en la entrega académica.

## Continuidad y próximos pasos

1. Revisar y ajustar los criterios y certezas de esta propuesta.
2. Preparar el informe y contrastarlo con los JSON y la rúbrica.
3. Crear el ZIP académico con los archivos requeridos.
4. Ampliar el laboratorio con una escala reproducible y casos adicionales después de revisar las fuentes. Vercel sigue siendo una opción futura, no un despliegue realizado.

La primera versión clasifica una tarea; todavía no ordena globalmente una lista, resuelve empates entre tareas ni programa un calendario automáticamente.

## Decisiones de diseño de la aplicación (pendientes de implementar)

Estas decisiones recogen la conversación de diseño con Daniel. Describen la evolución prevista; no son funcionalidades implementadas en el laboratorio actual.

- **Mis tareas**: reunirá el calendario semanal y la opción de agregar tareas. El calendario no tendrá una sección de navegación separada.
- **Prioridades**: tendrá un icono identificable y mostrará una lista ordenada de recomendaciones del motor.
- **Evaluación automática**: al guardar una tarea se evaluarán sus hechos con las reglas del motor, sin exigir un paso manual adicional de evaluación.
- **Detalle de una tarea**: al seleccionarla se abrirá su detalle dentro de la misma aplicación, con sus hechos, las reglas aplicadas, la explicación de la recomendación y su certeza. Una ruta dinámica de Next.js, por ejemplo `/tareas/[id]`, es una opción técnica por evaluar, no una implementación existente.

### Pendiente: política de ordenamiento entre tareas

Antes de implementar la lista de Prioridades hay que acordar cómo ordenar tareas y resolver empates. La prioridad inferida de una tarea, la prioridad de ejecución de una regla y el factor de certeza son conceptos distintos. El CF expresa el grado de apoyo a una conclusión; no se ha decidido usarlo como puntuación de urgencia ni como criterio único para ordenar tareas. La selección de la alternativa con mayor CF dentro de una tarea no define por sí sola el orden global entre tareas.

Esta propuesta no implica todavía programación automática del calendario, persistencia de tareas ni cambios en las reglas o los JSON actuales.

### Next MVP: mejora futura fuera de esta entrega

Para una siguiente entrega o el proyecto final, explorar la estimación de duración mediante hechos y reglas adicionales debidamente fundamentados. No se tendrá en cuenta en esta entrega y no forma parte del motor actual; no está implementada.

## Referencias del proyecto previo

- [Asana: matriz de Eisenhower](https://asana.com/es/templates/eisenhower-matrix).
- [Atlassian: cómo priorizar tareas](https://www.atlassian.com/es/work-management/project-management/how-to-prioritize-tasks).
- Moisuc, D.-A., y Avornicului, M.-C. (2015). *Architectural model of expert systems*.

Estas referencias sustentan el contexto del proyecto; los CF concretos de esta propuesta no se atribuyen a ellas.

## Plan de desarrollo — Visual Studio Code

Alcance actual solicitado: refactorizar primero el calendario semanal según el prototipo, con **Calendario** como única opción lateral. No implementar todavía Prioridades ni atribuir fechas, horas o duraciones al motor.

1. Mantener controles de semana anterior, siguiente y Hoy; ubicar ejemplos existentes mediante una fecha elegida explícitamente. Agregar no crea hechos nuevos: abre la selección de una tarea existente.
2. Aplicar MUI `styled`, carpeta `slots` (`slots.ts` y `styled.ts`) y estilos separados del componente. No usar archivos `.css` ni dependencias privadas del monorepo.
3. Centralizar los colores en `src/theme/palette.ts` y ofrecer temas claro y oscuro.
4. Separar componentes con responsabilidades claras, sin código muerto, abstracciones innecesarias ni documentación redundante. Preservar el motor y el laboratorio.
5. Por indicación posterior de Daniel, **no ejecutar pruebas, build ni comprobaciones extensas**; como máximo lint. Actualmente no hay script lint configurado, por lo que no se sustituye por tests o typecheck.

**Ya realizado al registrar este plan:** primera cuadrícula semanal, asignación manual de fechas en memoria, laboratorio conservado en `/laboratorio`, dependencias MUI instaladas, paleta central y selector claro/oscuro incorporados, migración de CSS a estilos TypeScript. Antes de la restricción se ejecutaron 13 pruebas y build de la versión inicial; estos resultados no validan la versión final migrada.

### Estado al finalizar esta implementación

- Calendario semanal en `/`, única opción lateral **Calendario**, controles anterior/siguiente/Hoy y selección explícita de fecha. Las tareas empiezan en **Sin fecha**: no se inventan fechas a partir del plazo categórico.
- Agregar abre un diálogo para ubicar uno de los diez ejemplos existentes. Permite cambiar o quitar su fecha; Cancelar/Cerrar no guardan. No es todavía un formulario de creación de tareas nuevas. Los datos viven en memoria y se pierden al recargar.
- Tarjetas con título y los tres hechos reales (plazo, importancia, esfuerzo). Sin horas, estados de trabajo, categorías nuevas ni prioridades ficticias. Las referencias de calendario y Jira fueron inspeccionadas; sus datos decorativos no se incorporaron al motor.
- MUI con `slots/slots.ts`, `slots/styled.ts` y `Calendar.styles.ts`; componentes separados en `Calendar`, `WeekCalendar`, `TaskCard`, `ScheduleTaskDialog` y `CalendarIcon`. El laboratorio se conserva en `/laboratorio`, sin entrada adicional en la navegación lateral.
- Colores centralizados en `src/theme/palette.ts`; `ThemeProvider.tsx` ofrece claro/oscuro y caché de estilos de MUI para Next.js. Selector de tema en la cabecera, sin persistencia. No quedan archivos `.css` en el código fuente.
- No se añadió una librería de calendario: la cuadrícula semanal usa fechas locales y MUI. No requiere inicio/fin ni estimaciones de duración.
- Motor y JSON sin cambios. Sin commit, push ni despliegue.

**Verificación y límites:** por la instrucción posterior no se ejecutaron tests, build, typecheck ni pruebas de navegador después de la limpieza final. No existe script lint. Los resultados anteriores corresponden a versiones previas, no garantizan la versión final. Queda pendiente validación funcional y visual cuando se autorice; no se afirma paridad visual exacta con el boceto. No se reinició ni actualizó el servidor de producción anterior, que puede seguir mostrando la compilación previa. Para trabajar con el código actual, iniciar `npm run dev` desde Visual Studio Code.

### Actualización visual: colores, datos demo y arrastre

- Cuadrícula más despejada, tarjetas con jerarquía de título/hechos y acento cromático. Inspiración de claridad Notion y tarjetas Jira, sin copiar sus estados ni inventar resultados.
- `src/theme/taskPalette.ts` define **20 colores fijos**, cada uno con acento y superficie light/dark. La identidad depende del índice estable del ejemplo y se conserva al moverlo; no significa prioridad. Cambiar esa paleta actualiza todas las tarjetas.
- El día actual usa número sobre fondo primario con `contrastText`, marcador HOY con texto principal y borde superior visible en ambos temas. No depende solo del color.
- `constants/demoSchedule.ts` contiene toda la distribución ficticia: diez tareas repartidas en la semana local actual, sin horas. `ENABLE_DEMO_SCHEDULE = false` desactiva la carga inicial. La interfaz permite quitar todas las fechas o recargar la semana demo; ambas acciones reemplazan la distribución temporal. No se modifican los JSON ni el motor. Esta decisión sustituye el inicio vacío de la versión anterior.
- Arrastre nativo de tarjetas hacia otro día visible, con destino resaltado y validación del identificador. No añade dependencias. El arrastre solo cambia fechas dentro de la semana visible; no mueve a otra semana ni navega automáticamente. La gestión específica entre semanas queda para edición posterior. En móvil o con teclado, seleccionar la tarjeta abre el diálogo existente para elegir fecha o quitarla.
- No hay persistencia: al recargar se restaura la distribución demo si está habilitada. El color, la fecha de vista y el arrastre no cambian plazo/importancia/esfuerzo ni evalúan el motor.
- Por indicación del usuario, no se ejecutan tests, build ni comprobaciones extensas. No hay lint configurado; queda a su prueba manual la interacción de arrastre, temas y diseño final.

Contraste calculado directamente sobre los tokens (no prueba de navegador): número del día actual **6,95:1 en dark** y **5,17:1 en light**; etiqueta HOY en dark **9,54:1** sobre el fondo resaltado. Superan 4,5:1 para texto normal. Esto comprueba esas combinaciones, no sustituye una revisión visual de toda la aplicación.

### Refinamiento visual y flujo de arrastre completo

Las dos capturas adjuntas del diseño «Task Scheduling Board WeekView DarkTheme» se inspeccionaron como referencias de **estilo**, no de datos ni funciones. Se mantienen light/dark, vista semanal sin horas, calendario único y los veinte colores centralizados.

- Tarjetas con gradiente suave sobre superficie sólida, borde de identidad y halo de sombra. El difuminado se limita al fondo del diálogo; texto y controles permanecen nítidos. Las intensidades están en `surfaceEffects` de `src/theme/palette.ts`.
- El diálogo existente de edición utiliza la misma identidad cromática de la tarea seleccionada, borde superior y profundidad. No se añadió una nueva función de popover ni los menús/avatares de la referencia.
- `TaskDropZone.tsx` unifica recepción y validación de arrastres para los siete días y **Sin fecha**. Día → día actualiza la fecha; día → Sin fecha la elimina; Sin fecha → día la asigna de nuevo. Son cambios sobre el mismo mapa temporal de fechas, sin duplicar tareas ni modificar los hechos.
- Se conserva el diálogo accesible mediante clic/teclado para asignar o quitar fecha. El arrastre no navega entre semanas y no acepta texto ni archivos externos.
- Se revisó el flujo leyendo el código, sin ejecutarlo. No se hicieron pruebas de navegador, tests, build ni typecheck por la restricción vigente. No hay lint configurado. La interacción real, cancelación y aspecto final quedan pendientes de prueba manual del usuario.

### Ajuste puntual del marco de navegación

- Colores independientes `sidebar` y `main` en `src/theme/palette.ts`: superficie lateral gris fría en light y grafito más profundo en dark; contenido principal con su propio tono. Tarjetas, calendario, motor y acciones se conservan.
- Selector claro/oscuro trasladado al pie del sidebar. El marco usa altura de viewport (`100dvh`, con respaldo `100vh`) y el contenido principal tiene scroll independiente. El pie no depende del scroll de la página; la zona superior del sidebar puede desplazarse si falta altura.
- En pantallas pequeñas, la navegación se convierte en una franja compacta arriba, conservando el selector visible en su parte inferior; el contenido sigue desplazándose por separado.
- Sin tests, build ni navegador por indicación vigente; no hay lint configurado. El ajuste responsive queda pendiente de comprobación manual.

### Decisión vigente: calendario semanal sin eje horario

Por corrección posterior de Daniel, se retiró la cuadrícula de 24 horas y se recuperó el calendario semanal sencillo: siete columnas de días, tarjetas y arrastre entre días/Sin fecha. Se conservan diseño, colores, selector de tema y funciones existentes. El eje horario queda para otra iteración; no hay inicio ni duración en el motor.

Daniel confirmó que «NX» era el botón flotante **N de Next.js**. Se oculta mediante la opción oficial `devIndicators: false` en `next.config.ts`. Si el servidor de desarrollo no recarga la configuración, reiniciarlo manualmente. No se ocultaron errores de compilación ni se modificó el motor.

No se ejecutaron tests, build ni navegador, conforme a la restricción vigente; no hay lint configurado. Pendiente revisión manual del calendario y del indicador tras cargar la configuración.

### Orden manual de tarjetas

El calendario ahora guarda un orden visual independiente de las recomendaciones del motor. Soltar en la mitad superior de una tarjeta inserta antes; en la mitad inferior, después. Se muestra el borde de inserción. Funciona dentro del mismo día, entre días visibles y con Sin fecha. Soltar en el espacio de una columna agrega al final; soltar sobre la propia tarjeta no cambia nada.

Con una tarjeta enfocada, **Alt + flecha arriba/abajo** cambia su posición dentro de su día o Sin fecha. Seleccionarla sigue abriendo el diálogo de fecha. Guardar una fecha desde ese diálogo coloca la tarea al final del destino.

Fecha y orden viven solo en memoria: se pierden al recargar. Cargar semana demo restablece distribución y orden inicial; quitar todas las fechas conserva el orden manual. El motor y los JSON permanecen intactos, sin evaluación ni orden automático de prioridades en esta vista.

Implementación revisada por lectura; sin tests, build ni navegador según indicación. Pendiente prueba manual de arrastre e inserción.

### Marco visual y flujo compacto de organización

- Sidebar y main incorporan profundidad suave con tokens `sidebarGlow`/`mainGlow` centralizados para light/dark. Calendario, tarjetas, colores de identidad y arrastre se conservan.
- Se retiraron textos repetidos y la cabecera de migas que solo repetía Calendario. La opción lateral actual es un indicador de ubicación, no un enlace sin acción. Todos los botones de acción revisados tenían función y se mantienen.
- Información y controles de demostración quedan en un desplegable nativo accesible, cerrado inicialmente. La advertencia de cambios temporales permanece visible; menos contenido antecede al calendario.
- «Agregar al calendario» nombra la capacidad real: seleccionar tarea existente, no crearla. El diálogo conserva tarea, fecha y acciones; campos en dos columnas en escritorio y una en móvil, foco inicial en selector, explicación asociada y acciones accesibles al desplazarse en pantallas pequeñas. No se eliminaron datos ni validación.
- Sin tests, build ni navegador; no hay lint configurado. Se espera revisión manual del usuario para proporciones, scroll y foco en su pantalla.

### Limpieza de presentación y ajuste de tema claro

Se retiró de la interfaz la sección «Datos de ejemplo» y sus controles de vaciar/recargar la distribución. No se borraron tareas ni sus fechas actuales; la carga inicial de ejemplos y la bandera `ENABLE_DEMO_SCHEDULE` siguen disponibles en código. La naturaleza temporal de los cambios se conserva documentada y en la ayuda de «Sesión local».

El tema claro usa ahora superficies neutras ligeramente cálidas, bordes más definidos, texto con mayor presencia y acento azul moderado. Se reducen tinte y halo de tarjetas en light para evitar exceso de color. La paleta y efectos **dark no se modificaron**. No se cambian datos, motor, orden ni arrastre.

Sin ejecución de pruebas, build o navegador; no hay lint. La mejora visual debe valorarse en la pantalla del usuario, no se presenta como validada mediante captura.

### Paleta vigente del marco: superficies neutras

Sidebar y main usan fondos sólidos centralizados, sin gradientes: light gris frío suave/blanco neutro; dark grafito profundo/gris carbón. Se retiraron los tokens `sidebarGlow` y `mainGlow` ya sin uso. Esta decisión sustituye el tratamiento anterior de degradados del marco. No se añadieron contenedores ni padding adicional.

Las tarjetas, sus gradientes sutiles, colores y efectos se conservan idénticos; no se cambiaron los tokens compartidos que afectan su presentación. Calendario, selector, orden manual, arrastre, tareas y datos permanecen igual. La sección visual «Datos de ejemplo» sigue retirada, sin borrar los ejemplos.

Sin tests, build ni navegador conforme a la restricción. Pendiente revisión manual del esquema final.

### Limpieza de identidad y textos decorativos

Se retiraron el branding «Task Priority / Sistema experto», el bloque con T, «Espacio de trabajo», «Sesión local» y el eslogan de cabecera. Se conservan Calendario, el selector de tema, botones funcionales, explicaciones de edición necesarias y anuncios accesibles de las operaciones. Tarjetas, motor, orden y arrastre no cambian.

Los cambios de fecha/orden siguen siendo temporales aunque se haya retirado la rotulación de sesión. No se ejecutaron tests, build ni navegador.

### Propuestas visuales pendientes (no implementadas)

La comparación de capturas sugiere explorar un sidebar más estrecho para una sola opción, reducir la altura de cabecera, compactar Sin fecha cuando está vacío y neutralizar el matiz verdoso de la cabecera de días en light. Son propuestas para decidir después: no se ha autorizado ni aplicado esa compactación.

### Feedback de arrastre

Durante un arrastre interno, los días visibles y Sin fecha muestran un resaltado tenue como destinos válidos. El destino bajo el cursor tiene un borde interior y fondo más definidos; al pasar sobre una tarjeta se mantiene la señal de inserción antes/después, ahora sin cambiar su tamaño. Transiciones discretas usan el tema activo y se deshabilitan con `prefers-reduced-motion`.

`DragFeedbackProvider` mantiene solo estado visual, separado de fechas y orden. Limpia el estado al soltar, finalizar/cancelar el arrastre, pulsar Escape o perder foco. No se modificaron las recomendaciones del motor ni el aspecto habitual de las tarjetas.

No se ejecutaron tests, build ni navegador. Pendiente comprobar manualmente destinos, cancelación y reduced motion en ambos temas.

### Arrastre con placeholder real

Implementación retomada tras la desconexión: el original permanece montado pero oculto y fuera del flujo después de que el navegador capture su imagen de arrastre. Un único placeholder rectangular reserva espacio en el destino, en vez de mantener dos tarjetas visibles.

`TaskList` unifica días y Sin fecha. `TaskDropZone` calcula la inserción con la posición del cursor también entre tarjetas; sobre el placeholder mantiene el destino para evitar oscilaciones. Fechas/orden solo cambian al soltar, y cancelar no modifica datos. Vecinos se recolocan con FLIP breve; reduced motion evita la animación. Se conserva la alternativa Alt + flechas y el diálogo de fecha.

No hay dependencias nuevas, cambios al motor ni persistencia nueva. Sin tests, build ni navegador según restricción. Pendiente validar manualmente arrastre nativo, huecos, cancelación y listas de distinto ancho en el navegador del usuario.

El placeholder sigue la última precisión visual: **rectángulo vacío**, borde dashed, sin texto ni iconos; ancho de columna y altura medida de la tarjeta arrastrada. Al salir de una zona válida se retira el hueco y los vecinos recuperan su posición. Se inspeccionó la captura de referencia adjunta; no se ejecutó la interfaz.

### Corrección prioritaria del arrastre nativo

Daniel informó que el cambio anterior impedía arrastrar. En lectura se detectaron dos riesgos concretos: el origen se volvía invisible con tamaño cero/posición absoluta durante el drag nativo, y los receptores rechazaban el movimiento si el estado visual todavía no estaba activo.

Se conserva ahora el nodo origen con su geometría, usando solo opacidad cero; se retiran `visibility:hidden`, tamaño cero y cambio de posición. Los receptores aceptan el MIME interno sin depender del render del preview, y el drop valida el ID aunque el preview falte. Se elimina la cancelación por pérdida de foco, manteniendo Escape/drop/dragend.

**Compromiso temporal:** para priorizar el movimiento nativo, el espacio original permanece reservado mientras se arrastra; el placeholder vacío aparece en el nuevo destino y no se duplica en el origen. La compactación completa del origen queda pendiente de verificar una técnica segura en el navegador. Estas causas son diagnóstico por lectura, no reproducción confirmada. No se ejecutaron tests/build/navegador; requiere prueba manual del usuario antes de afirmar que quedó resuelto.

### Estabilización de hover y espacio disponible

La captura mostró el hueco después del espacio invisible reservado al origen. La revisión también encontró mediciones de tarjetas animadas en cada dragover: el placeholder cambiaba geometría y esa geometría volvía a cambiar el destino.

Se usan umbrales capturados una vez por zona/arrastre, en coordenadas locales corregidas por scroll. Se retira FLIP durante el hover para que la propia animación no alimente el cálculo; reduced motion sigue respetado y la recolocación al terminar puede animarse. En columnas se compensa el espacio del origen con margen negativo sin cambiar sus dimensiones ni ocultarlo con visibility. En la cuadrícula Sin fecha se conserva su caja por seguridad del drag nativo.

Sin fecha pasa arriba como acordeón cerrado inicialmente, con contenido acotado. Su cabecera permanece como destino para quitar fecha incluso cerrado; se puede abrir con teclado/clic para editar o arrastrar de vuelta. El calendario ocupa el espacio restante y las columnas llenas desplazan su contenido internamente, sin aumentar la altura total por el hueco.

No se ejecutaron tests, build ni navegador. Son correcciones por lectura y captura; pendientes de validar estabilidad, drop, scroll y cancelación en Chrome.

### Movimiento suave y scroll discreto, solo en días del calendario

Se habilita recolocación FLIP de 260 ms al abrir/cerrar el hueco de las columnas, conservando el desplazamiento visual actual al cambiar rápidamente de destino. Las posiciones de detección siguen capturadas por arrastre/zona y descuentan la transformación visual: la animación no vuelve a alimentar las medidas de hover. Con reduced motion no se anima. Sin fecha no recibe esta animación nueva.

Solo `.day-tasks` oculta visualmente el thumb hasta hover o foco, reservando su espacio para evitar cambios de ancho. La celda es enfocable y mantiene scroll por teclado/rueda; en dispositivos sin hover y colores forzados el indicador permanece visible. No se cambian los scrolls de main, sidebar, acordeón ni diálogo.

Sin tests/build/navegador por indicación. Pendiente validar manualmente suavidad y estabilidad durante movimientos rápidos y desplazamiento de columnas.

### Tarjetas light con mayor presencia cromática

Tras inspeccionar ambas capturas, se reforzaron exclusivamente las veinte superficies light de `taskPalette.ts`: más saturación y separación entre familias cromáticas, sin convertirlas en fondos oscuros. `lightCardTokens` centraliza borde más definido, badges y texto secundario más oscuro para legibilidad. Los veinte valores dark, sus efectos y la interacción quedan intactos; no se cambiaron el marco ni el calendario.

No se ejecutaron tests/build/navegador. Se calcularon contrastes de tokens de las superficies y texto como control de diseño, no como validación visual de la aplicación. Pendiente valoración manual del resultado.

### Refinamiento de controles del calendario
- Cabecera y navegación Calendario con jerarquía más discreta; acción principal «Agregar» conserva el diálogo existente.
- Selector Claro/Oscuro con estado seleccionado accesible (`aria-pressed`), usando la paleta central de cada tema.
- Sin fecha mantiene su acordeón y destino de arrastre, con contador y chevrón de apertura.
- Se retira la frase «fecha y orden manual» del aviso: ahora solo anuncia «Calendario actualizado». Fechas y orden siguen siendo locales a la sesión e independientes del motor.
- No se modificaron tarjetas, cuadrícula ni lógica de arrastre. Sin pruebas, build ni navegador por indicación; pendiente revisión visual del usuario.

### Cambio de tema y resaltado de hoy
Se retiró la transición permanente del fondo de las columnas: podía interpolar el resaltado de hoy durante 120 ms mientras la cabecera y el resto del tema cambiaban inmediatamente. Las transiciones de destinos durante el arrastre se mantienen. Es una corrección focalizada de una causa plausible del destello informado, no una reproducción confirmada. Sin pruebas/build/navegador; pendiente comprobar visualmente el cambio claro/oscuro.

### Creación real de tareas desde Agregar
- Agregar abre un formulario nuevo: título, fecha opcional y los tres hechos del motor (plazo, importancia y esfuerzo), cada uno con valor, certeza entre −1 y 1 y origen. La clase es inicial; no se inventan horas, prioridad ni resultado esperado.
- El botón general no propone fecha; el botón de un día la precarga y permite borrarla. Sin fecha abre el acordeón para mostrar la tarea creada.
- Las tareas se mantienen en estado del calendario, sin modificar los JSON académicos. Lista, tarjetas y validación de arrastre reciben la colección actual, incluidas las nuevas tareas. Seleccionar una tarjeta conserva el diálogo para cambiar fecha.
- Todo sigue en memoria: recargar pierde las tareas nuevas, fechas y orden. No hay almacenamiento permanente ni evaluación automática del motor desde el calendario.
- Verificación limitada a lectura del código por indicación: sin pruebas/build/navegador; pendiente validación funcional y visual del usuario.

### Formulario sencillo: convención vigente
Sustituye la entrada técnica obligatoria descrita arriba. Nueva tarea pide título, fecha organizativa opcional, «¿Qué importancia tiene?» y «¿Cuánto esfuerzo requiere?». No pide CF, origen ni plazo técnico.

- Importancia y esfuerzo conservan el vocabulario de la base. Se registran como hechos iniciales declarados por el usuario, con CF 1 por convención de captura. No es una certeza medida, validada por un experto ni una probabilidad del resultado. El origen registra explícitamente esa convención.
- La fecha conserva su significado de organización del calendario, no de vencimiento. No se transforma en urgencia, tampoco al arrastrar. Las tareas nuevas omiten el hecho plazo y muestran «Sin definir»; sin fecha permanecen en Sin fecha. No se rellenan valores ficticios.
- `evaluate` ya admite hechos ausentes: una condición que necesita plazo no coincide y su regla queda excluida; reglas basadas solo en hechos disponibles podrían concluir. No se garantiza ausencia de recomendación. El calendario NO invoca automáticamente el motor.
- El validador académico `parseTaskCase` sigue exigiendo los tres hechos y no acepta estas tareas incompletas. Los JSON académicos y el motor no cambian. Integración futura debe distinguir tarea parcial y caso académico completo, y definir vencimiento antes de derivar plazo.
- Persistencia solo en memoria. No se ejecutaron pruebas/build/navegador; pendiente revisión del usuario.

### Fondo de acciones del formulario
El bloque de acciones tenía un fondo sólido distinto del gradiente del diálogo y producía el rectángulo visible en la captura dark. Se dejó el pie en flujo normal, sin fondo propio ni posición sticky: muestra la misma superficie y no se superpone a campos al desplazar. Aplica también a light por estilos compartidos, sin captura light ni prueba visual ejecutada.

### Tarjetas sin apertura por clic
Las tarjetas existentes ya no abren el diálogo de fecha. Se conservan arrastre entre destinos y orden por Alt + flechas arriba/abajo. Agregar sigue abriendo exclusivamente creación de tareas. Se retiraron el diálogo antiguo, su estado y callbacks sin uso; la tarjeta indica «Arrastrar para mover». No hay edición por clic ni se añadió cambio de fecha por teclado: Alt + flechas conserva únicamente orden dentro del destino actual. Sin pruebas/build/navegador.

### Fecha de entrega y ayudas del formulario (vigente)
- La etiqueta es «Fecha de entrega», sin la palabra opcional; el campo sigue sin ser obligatorio. Título, importancia y esfuerzo muestran asterisco y conservan `required`/`aria-required`. Los cuatro campos tienen ayuda «?» por hover o foco, asociada con Tooltip MUI.
- La entrega se guarda como `deliveryDate` en la tarea, separada de `dates[index]`, que sigue siendo ubicación manual. El arrastre solo cambia ubicación/orden, nunca entrega ni hechos.
- La entrega inicia vacía incluso al crear desde una celda: el día pulsado no prueba que exista vencimiento. Crear desde una celda conserva esa ubicación; desde Agregar general se usa la entrega como ubicación inicial si existe, o Sin fecha si no. Después ambas son independientes.
- Los ejemplos anteriores no reciben fechas de entrega inventadas. El vencimiento no deriva plazo ni ejecuta reglas. No se añadieron edición ni persistencia; todo sigue en memoria.
- Sin pruebas/build/navegador; cambios revisados por lectura, pendientes de validación del usuario.

### Descripción y distribución del formulario
Nueva tarea dispone título y descripción a todo el ancho, seguidos por fecha de entrega, importancia y esfuerzo en una fila; en pantallas pequeñas se apilan. Descripción es opcional (hasta 2000 caracteres), se guarda como `description` en memoria y no se usa como origen ni entrada del motor. Ejemplos sin descripción siguen siendo válidos. No se añadió visualización/edición de descripción en tarjetas ni persistencia. Entrega y ubicación permanecen separadas y el arrastre no cambia entrega. Sin pruebas/build/navegador; pendiente revisión visual.

### Revisión vigente de reglas: importancia/esfuerzo y plazo opcional
- Sustituye la matriz anterior de ocho reglas. Los IDs r1–r8 ya no significan lo mismo que en notas históricas; la tabla principal y bc.json son la referencia vigente.
- CF provisionales: 0,90 = apoyo fuerte del criterio de diseño; 0,60 = apoyo moderado que admite excepciones. Son juicios ilustrativos, no mediciones, probabilidades ni valores validados por el profesor/experto. Una conclusión baja puede tener CF fuerte. Los valores de certeza de los hechos siguen separados.
- Base: impacto alto con esfuerzo alto/medio → alta; alto con bajo → media; impacto medio con alto/medio → media y con bajo → baja; impacto bajo → baja cualquiera sea esfuerzo. Es una política propuesta, no una verdad universal. Urgencia refuerza alto/bajo y medio/alto o medio/medio a alta; no promueve impacto bajo.
- La prioridad de regla solo establece turno: 100 para refinamientos, 20 para base. Mayor CF final decide la recomendación; una urgencia incierta puede no vencer al apoyo de la alternativa base. Las alternativas se conservan.
- `parseTaskCase` admite ausencia de plazo, pero exige importancia/esfuerzo válidos y rechaza otros hechos. El algoritmo de inferencia no cambió. Ausencia de plazo no equivale a con_tiempo ni crea urgencia.
- Fechas de entrega y ubicación siguen fuera de inferencia: no hay conversión automática. Las tareas nuevas del calendario aún carecen del rol académico obligatorio del evaluador; no hay conexión automática ni lista global implementada.
- Se conservaron los diez ejemplos y el caso 1. Caso 2 cambia certeza de importancia a 0,20 y origen; caso 3 cambia contexto/importancia para preservar conflicto sin elevar impacto bajo por urgencia.
- Compatibilidad revisada por lectura, no ejecutada. No se ejecutaron tests/build/navegador. Los resultados esperados anteriores de las pruebas de integración (IDs, CF y total de reglas) quedan desactualizados y requieren ajuste antes de volver a ejecutarlas; pruebas del algoritmo no se modificaron.

### Alcance de casos académicos
Se retiraron los casos adicionales 04/05 y sus referencias de carga y documentación. El laboratorio ofrece solo los tres casos obligatorios, además del catálogo independiente de diez tareas. No se cambiaron reglas ni el contenido del caso 2 en esta limpieza. Las expectativas de las pruebas siguen pendientes de actualizar por la revisión previa de reglas; no se ejecutaron.

### Decisión vigente: baja/bajo sin fecha, sin recomendación
Sustituye el caso 2 provisional de CF 0,20. Daniel aprobó la excepción concreta: importancia baja + esfuerzo bajo + plazo sin_fecha no produce conclusión. Se agregó únicamente la condición `plazo != sin_fecha` a r6 y se adaptaron vocabulario, selector del laboratorio y caso 2. Las demás reglas y casos 1/3 se conservan.

`sin_fecha` significa ausencia de vencimiento declarada, no urgencia, ni plazo lejano, ni certeza cero. Su CF 1 en el caso 2 indica que se sabe que no hay fecha. El origen explica ese dato. No representa ausencia de ubicación en el calendario: mover a Sin fecha solo quita ubicación, no entrega. No se conectó el formulario al motor ni se convirtió automáticamente una fecha en categoría.

Cuando el hecho plazo se omite, el evaluador tampoco puede satisfacer r6; no trata un dato ausente como «distinto de sin_fecha». Otras tareas sin plazo/sin_fecha sí pueden concluir mediante reglas base según importancia/esfuerzo. La exclusión no es global. Sin recomendación no borra ni descarta la tarea.

Revisión lógica, no ejecución: caso 1 cumple r1 (alta, aporte esperado 0,72); caso 2 no cumple ningún SI; caso 3 cumple r7 (prioridad 100) y r2 (20), conserva alta 0,81 y media 0,54. Se mantienen tres hechos observados y la misma base en los tres casos. Pruebas de integración previas aún pendientes de actualización; sin tests/build/navegador.

### Consolidación vigente: exactamente ocho reglas
Se agruparon cuatro pares de reglas equivalentes para esfuerzo alto/medio mediante `esfuerzo != bajo`. La tabla principal y bc.json son la referencia vigente; esta nota describe la consolidación histórica.

Equivalencia revisada manualmente: cada par eliminado tenía igual importancia, conclusión, CF y prioridad, y solo difería en esfuerzo alto/medio; era mutuamente excluyente. La fusión conserva número de condiciones, mínimo de CF y aportes para todo valor admitido. No se ejecutaron pruebas. No se extiende esta equivalencia a entradas inválidas pasadas directamente al evaluador genérico; el laboratorio debe seguir usando parseTaskCase.

Los tres casos no cambian: r1 en caso1; ningún SI completo en caso2; r7 (100) y r2 (20) en caso3. Plazo sigue opcional, `sin_fecha` no excluye otros perfiles, no se convierte una fecha en plazo ni se modifica el calendario. CF .90/.60 siguen provisionales. El PDF/ZIP interno de doce reglas queda obsoleto y debe regenerarse con estos JSON antes de entregar. Pruebas antiguas siguen pendientes de revisión, sin ejecución.

## Implementación vigente para Daniel y Manuela: priority-core

`src/priority-core/` es el módulo TypeScript independiente de interfaz: no importa React, Next.js, MUI, navegador ni JSON del proyecto. Consume objetos de conocimiento/caso por su API. No es todavía un paquete publicado ni servicio remoto.

- `types.ts`: contratos de hechos, reglas, casos, inferencias y pasos.
- `validation.ts`: estructura genérica y CF válidos; errores de datos son errores, no «Sin recomendación».
- `task-domain.ts`: vocabulario de tareas, importancia/esfuerzo obligatorios y plazo opcional.
- `certainty.ts`: redondeo y combinación de factores de certeza.
- `engine.ts`: agenda, comprobación de hechos iniciales, aportes, alternativas y recomendación.
- `index.ts`: entrada pública; `evaluate`, `parseTaskCase`, `parseKnowledge`, tipos y utilidades.
- `src/lib/data.ts`: adaptador de los JSON, separado del motor. Carga bc.json y los tres casos académicos; conserva los diez ejemplos del calendario.

Uso: `evaluate(kb, parseTaskCase(caso))`. La recomendación puede ser null aun con inferencias; un error de validación lanza excepción. `rol` es metadato académico y no fuerza la salida. No hay encadenamiento de inferidos, clasificación de fechas, planificación ni orden global entre tareas. La combinación de evidencias existe, aunque las ocho reglas de dominio no generan apoyos simultáneos al mismo valor; las pruebas unitarias usan reglas específicas para cubrir esa rama.

La ruta `/laboratorio` muestra la validación de casos y la explicación separada del calendario `/`. El calendario no se reordena ni evalúa automáticamente. La conexión con tareas nuevas, un listado de recomendaciones y derivación desde fecha de entrega siguen siendo trabajo futuro, no funciones implementadas.

`Entregable 2 - Task Priority.md` es el borrador de informe para revisión de Manuela: fuente académica de ocho reglas y tres casos, sin traza ni código. Esta implementación no se incorpora al ZIP de la actividad. No se generó Word/PDF nuevo en esta etapa.

Pruebas autorizadas en esta iteración: 17/17 aprobadas, TypeScript sin errores y `npm run build` completado después de integrar la interfaz. Incluyen casos vigentes (alta 0,72; sin conclusión; conflicto alta 0,81/media 0,54), fórmulas, agenda, empate, umbrales, no mutación, rechazo de datos inválidos, plazo opcional y vocabulario con sin_fecha. Los avisos históricos sobre expectativas obsoletas quedan superados por la actualización de tests/engine.test.ts. No constituye validación empírica de los CF o criterios del dominio.

### Verificación final de esta implementación
`npm test`: 17 pruebas aprobadas, cero fallos. `npm run typecheck`: aprobado. `npm run build`: aprobado, rutas `/` y `/laboratorio` generadas. No se ejecutó revisión interactiva en navegador: accesibilidad visual, scroll y drag quedan fuera de esta verificación. No hay script lint configurado. Sin commit, push ni despliegue.

### Calendario con los tres casos oficiales
Calendario y laboratorio parten ahora del mismo export `cases` de `src/lib/data.ts`, obtenido de los tres JSON académicos y sin copiar ni reinterpretar hechos/CF. El catálogo histórico de diez tareas permanece en ejemplos, pero ya no se importa en la aplicación.

Se retiró la distribución semanal ficticia: los tres casos empiezan sin ubicación, con el acordeón Sin fecha abierto para encontrarlos. No se inventan fechas de entrega a partir de relatos como «mañana». `plazo=sin_fecha` del caso 2 se conserva; mover una tarjeta cambia solo ubicación, no ese hecho ni entrega. El título Sin fecha del calendario se refiere a ubicación, no sustituye el plazo académico.

Crear y arrastrar siguen usando la colección local del calendario. Compartir fuente inicial NO conecta automáticamente la evaluación ni sincroniza cambios de sesión entre calendario y laboratorio. Los JSON no se modifican desde la interfaz.

## Fecha de entrega y reloj reproducible (estado vigente)

Los tres JSON académicos contienen los mismos cuatro hechos iniciales: `fecha_entrega`, `plazo`, `importancia`, `esfuerzo`. Entrega admite fecha civil ISO `AAAA-MM-DD` o el valor explícito `sin_fecha`, siempre con CF/origen/clase. `fecha_referencia` es un metadato superior con la referencia fija 2026-11-08; examen y confirmación vencen ficticiamente 2026-11-09. No se deduce ninguna fecha desde ubicación del calendario.

`priority-core/dates.ts` valida fechas reales y calcula diferencias de días civiles (UTC como aritmética, sin horas ni reloj implícito). Convención revisable: pasado→vencida; hoy–2→urgente; 3–7→proximo; >7→con_tiempo; sin_fecha→sin_fecha. No es una escala experta validada. El reloj se inyecta como string de referencia: no se usa Date.now.

`evaluateTask(kb, caso, referenceDate)` es la entrada de dominio con fecha. Valida conocimiento/caso, prepara plazo conservando el CF de fecha y registra procedencia. No modifica el caso original. Devuelve `status=overdue`, resultado null y días negativos si venció, sin ejecutar ninguna regla de prioridad; ello no es error ni «sin recomendación» del motor. En los demás casos devuelve `status=evaluated` y el resultado de inferencia. Fecha corrupta o ausente (sin declaración explícita sin_fecha) produce error. `parseTaskCase` sigue aceptando casos categóricos heredados; `evaluate` permanece genérico y no aplica exclusión temporal por sí mismo. Para trabajar con fechas debe usarse evaluateTask, no evaluate directamente.

El plazo almacenado en el JSON es una categoría inicial normalizada para la referencia del caso, no la conclusión inferida de prioridad. Se conserva para lectura autónoma de la guía; el adaptador lo recalcula desde fecha al evaluar y no confía en una categoría desactualizada. La certeza de plazo proviene de fecha, sin duplicar apoyos ni agregar CF experto. Las ocho reglas no cambian.

Laboratorio: referencia editable y restaurable, fecha de entrega/ausencia y CF editables, plazo calculado visible y estado vencida separado. Conserva tres roles con referencia fija. Calendario: ubicación manual y hechos originales, sin evaluación automática; las tareas creadas en calendario aún requieren adaptación para entrar al contrato académico, y su deliveryDate de UI no equivale automáticamente al hecho fecha_entrega.

Documentación Entregable 2 - Task Priority.md actualizada con tablas exactas de los cuatro hechos. No se produjo Word/PDF. El PDF/ZIP interno anterior está obsoleto. Cualquier referencia histórica a «no se convierte fecha» aplica a versiones anteriores o al evaluador genérico, no a este adaptador.

Verificación final de fechas: 24/24 pruebas aprobadas, TypeScript y build Next.js aprobados. Casos reproducibles con referencia fija; sin inspección interactiva en navegador. Sin commit/push ni nuevos PDF/Word.

## Calendario conectado y vista Prioridades (vigente)

- La colección local se evalúa automáticamente al crear o guardar cambios de tarea y al cambiar la fecha de referencia. `Calendar/evaluation.ts` adapta a `priority-core/evaluateTask` sin enviar ubicación u orden del calendario. El rol académico exigido por el formato se añade solo como metadato técnico y no impone resultado.
- Navegación Calendario/Prioridades: la segunda vista muestra categoría, CF, entrega, plazo calculado, explicación y alternativas; distingue error, vencida y sin recomendación. Editar está en Prioridades; las tarjetas del calendario siguen sin abrir edición al clicar.
- Orden de la lista: alta/media/baja, luego sin recomendación, vencidas y errores; CF desempata solo dentro de categoría e índice original resuelve empates restantes. Es una convención de presentación, no una nueva conclusión del motor. No altera orden manual, ubicaciones ni JSON.
- La referencia visible en Prioridades es la fecha local actual del navegador, renovada cada minuto y al recuperar foco. El motor recibe esa fecha explícitamente. El laboratorio académico mantiene la referencia fija/restaurable del caso para reproducirlo; al avanzar el reloj real, un ejemplo puede aparecer vencido en Prioridades sin que haya cambiado su JSON.
- El formulario crea `fecha_entrega` como hecho ISO o sin_fecha; no duplica deliveryDate. En edición conserva CF/origen si el valor no cambia y usa la convención de declaración CF 1 si cambia. Descripción no participa en inferencia. Plazo se recalcula, no se edita manualmente; tarjetas muestran una proyección del plazo actual sin sobrescribir los hechos originales.
- Editar entrega no reubica la tarjeta. Arrastrar solo modifica ubicación/orden y nunca entrega ni hechos. Crear desde un día conserva esa ubicación; desde Agregar usa inicialmente entrega si existe o Sin fecha. No es programación automática del motor.
- Los casos oficiales son la fuente inicial compartida; cambios de sesión del calendario no editan los archivos ni las simulaciones del laboratorio. Persistencia sigue solo en memoria, sin servidor ni almacenamiento local.

Verificación de esta conexión: 28/28 pruebas aprobadas, TypeScript aprobado y build Next.js aprobado. Se añadieron pruebas del adaptador de creación/actualización, independencia ubicación/entrega, conservación de fuentes y estados inválidos/vencidos/sin recomendación. No se ejecutó interacción en navegador; no se afirma cobertura end-to-end del formulario/drag. Sin commit, push o despliegue.

### Presentación vigente de los tres casos
El calendario ubica inicialmente examen y confirmación en su entrega declarada, 2026-11-09, y abre esa semana. La actividad sin fecha queda en el acordeón Sin fecha. `Calendar/placement.ts` separa esta ubicación inicial del reloj de evaluación: no altera JSON, vencimientos ni CF. Hoy vuelve a la semana actual; arrastrar mantiene organización manual. Si la referencia actual supera la entrega, Prioridades muestra vencida y no modifica los casos para evitarla.

La vista Prioridades reutiliza identidad cromática de las tarjetas del calendario y conserva categoría, CF y evidencia real del motor. Los colores identifican tareas, no codifican prioridades. La evidencia extensa se puede desplegar; los estados sin recomendación, vencida y error permanecen distintos.

Verificación final de presentación/casos: 29/29 pruebas aprobadas; TypeScript y build aprobados. Se corrigió una aserción de tipos de la nueva prueba de ubicación durante la verificación. Sin revisión interactiva en navegador: aspecto visual pendiente de valoración del usuario. JSON y reglas sin cambios.

### Prioridades: lista vertical y detalle seleccionado (vigente)
La rejilla de tarjetas y sus desplegables se sustituyen por una lista vertical de tareas y un panel de detalle de la tarea seleccionada. En pantallas pequeñas el panel queda debajo de la lista. Cada elemento es un botón operable con teclado, con estado seleccionado `aria-pressed` y referencia al panel mediante `aria-controls`. Se muestra inicialmente la primera tarea del orden calculado; seleccionar otra no cambia datos ni orden.

Se conserva la paleta de identidad del calendario en claro/oscuro, resultado y CF en la lista, y en el panel entrega/plazo, importancia/esfuerzo, explicación, descripción, hechos con origen/CF, reglas, alternativas y edición. Sin evaluación disponible se identifican los hechos como declarados, no como utilizados. Vencida, error y sin recomendación mantienen sus diferencias. No se modificaron calendario, drag, motor, reglas ni JSON.

Verificación: 29/29 pruebas existentes aprobadas, `npm run typecheck` y `npm run build` aprobados. No se ejecutó navegador ni prueba interactiva de selección/teclado; la comprobación de interfaz fue por lectura y compilación. Sin commit, push ni despliegue.

### Identificadores consecutivos de reglas (vigente)
Se renumeró únicamente el campo id, preservando orden de declaración, condiciones, conclusión, CF, prioridad y porque. Mapa de migración: antiguo r1→r1, r3→r2, r4→r3, r6→r4, r7→r5, r9→r6, r10→r7 y r11→r8. Las tablas y referencias del informe/README y las expectativas de pruebas usan ahora los nuevos IDs. Los identificadores sintéticos de pruebas unitarias del algoritmo son independientes de bc.json y no requieren migración.

Casos vigentes: caso 1 activa r1; caso 2 ningún SI; caso 3 activa r7 y r2. Los JSON de casos no contienen referencias a IDs y permanecen intactos. UI y motor leen los IDs del conocimiento sin constantes adicionales. Se comprobó igualdad exacta de los cinco campos restantes de cada regla antes/después y fidelidad de las ocho filas de reglas y doce filas de hechos del borrador a los JSON. 29/29 pruebas y TypeScript aprobados. La renumeración no representa cambios de criterio ni nueva validación experta.
