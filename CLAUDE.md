# Diplomatura en Diseño de Procesos de Negocios con Automatización e IA Agéntica — FCE-UBA

Sitio de material de cursada. Cohorte agosto — diciembre 2026, veinte encuentros,
miércoles de 18 a 21:30 más tres viernes. Quien te habla es el coordinador.

El trabajo habitual es convertir el material de una clase en una página web
interactiva que entre sin costuras en el sitio que ya existe.

## El espíritu

Esta diplomatura enseña a pensar procesos. n8n es el lápiz. Si alguien termina la
cursada sabiendo mover nodos pero sin poder explicar un proceso en pasos
numerados, fracasamos. De ahí bajan cuatro reglas que no se negocian.

**Narrada en cadena.** Cada clase cierra lo que dejó abierto la anterior y crea la
necesidad que resuelve la siguiente. Antes de escribir la clase N, leé la N−1 y
cerrá ahí. El cronograma es un guion, no una lista de temas.

**El algoritmo antes que los nodos.** Cuando una clase construya algo, el orden es:
el proceso contado en desorden como lo contaría el dueño del negocio en el
pasillo, la descomposición, el pseudocódigo en castellano, y recién ahí la
herramienta.

**Disparador, condición, acción.** El esqueleto mental que vuelve en todas las
clases, más los datos que viajan entre los tres. Permite que alguien de ciencias
económicas mire cualquier automatización y la entienda sin saber qué es un nodo.

**Honestidad comparativa.** Las otras plataformas se presentan por lo que hacen
bien y por lo que cuestan. La preferencia por n8n se argumenta con criterios, no
con entusiasmo.

## Estructura

```
api/datos.mjs          Artificial Analysis, caché 24 h, clave en AA_API_KEY
public/
  index.html           portada con la cortina de acceso
  cronograma.html      las 20 clases, los 6 módulos, la regla temporal
  404.html             aviso de clase todavía no publicada
  NN.html + claseNN.js una clase publicada
  estilo.css           tokens de los dos temas
  tema.js              conmutador claro / oscuro, se carga en el <head>
  acceso.js            validación de la clave
  clases.js            datos del cronograma
  menu.js              selector de clases publicadas de la barra superior
  taller-oauth.html    taller de apoyo: n8n propio + Google OAuth en producción
  taller-oauth.js      sus variables, plantillas, checklist y diagrama
  workflows/           los JSON importables a n8n
vercel.json
```

Estático puro: sin build, sin dependencias, sin gestor de paquetes. Vercel sirve
`public/` como estático y `api/` como funciones. No agregues un paso de build.

## Invariantes

- **Nunca reescribas `public/estilo.css`.** Si falta un componente, definilo en el
  `<style>` de esa página. Si falta un tono, agregá la variable en los dos bloques
  de tema y avisalo al entregar.
- **Ningún color literal** fuera del `:root` de `estilo.css`. Todo sale de
  variables. Lo que se dibuja por código lee `window.token('naranja')`.
- **Toda pieza dibujada por código** escucha el evento `cambio-tema` sobre
  `window` y respeta `prefers-reduced-motion`.
- La primera línea ejecutable de cada `claseNN.js` es `exigirSesion()`.
- Cada cifra de n8n lleva su fecha de corte visible en un `.nota-pie` y se
  reverifica antes de publicar. No se copian de una clase anterior.
- La única fuente de datos vivos es `/api/datos`. Si no responde, la página
  muestra el resto y un mensaje corto en el lugar del gráfico. Nunca inventes
  datos de respaldo.
- No reproduzcas texto ajeno con derechos ni imágenes de terceros.
- **Nunca WhatsApp** como integración, en ninguna clase, ni como ejemplo a
  conectar. Cuando haga falta ese canal se dice "mensaje directo". Conectarlo
  exige verificación de negocio en Meta, número dedicado y plantillas aprobadas:
  no es material de cursada.

## Entregables de una clase

0. La barra superior de toda página con `<nav>` lleva el selector de clases:
   `<span data-selector-clases><a href="cronograma.html">Clases</a></span>` en el
   `<nav>`, y `clases.js` + `menu.js` antes del script de la clase. El selector
   se arma solo desde `CLASES`: publicar es poner `pagina` en `clases.js`.
1. `public/NN.html`, con el número en dos dígitos.
2. `public/claseNN.js`, solo si la clase tiene lógica propia.
3. `public/workflows/NN-nombre-del-caso-n8n.json` por cada workflow que construya.
4. La línea de esa clase en `public/clases.js`: `pagina: null` pasa a `'NN.html'`.

El procedimiento completo está en el skill `/clase`. La verificación previa a
publicar, en `/revisar-clase`.

## El recorrido

Seis módulos, veinte encuentros, un solo hilo. n8n es el eje de punta a punta,
con progresión de nube a instancia propia.

1. Entender el terreno (1 a 3) — qué es un proceso, pensamiento algorítmico,
   primer contacto con n8n
2. Anatomía de un flujo (4 a 6) — nodos, datos que viajan, ramas y el costo de
   cada ejecución
3. Construir de verdad (7 a 9) — primer caso completo, APIs y webhooks, datos
4. Contexto e inteligencia (10 a 12) — nodo de agente, ingeniería de contexto,
   primer contacto con los orquestadores
5. Orquestar y alojar (13 a 17) — MCP, self-hosting, instancia propia,
   orquestación desde afuera, multi-agente
6. Evaluar y mejorar (18 a 20) — métricas, refactor, proyecto integrador

Los orquestadores (Claude Code, Codex, OpenCode) aparecen en la clase 12 como
herramienta de construcción y vuelven en la 16 como capa que maneja n8n desde
afuera vía MCP. Nunca desplazan a n8n del centro.

Estado: publicadas las clases 1 a 9, más el taller de OAuth. El módulo 3 cambió la regla: desde la 7 el
caso lo trae cada participante, y la página de la 7 tiene un taller que convierte
su proceso en algoritmo y le baja el esqueleto de n8n armado. Las actividades se
encadenan por `localStorage`: la 6 alimenta la 7, la 7 alimenta la 8, la 8
alimenta la 9, y la 9 alimenta la 10. Con la 9 cierra el módulo 3 y quedan
saldadas las dos deudas que arrastraba: la memoria entre ejecuciones y la
planilla usada como base de datos en el caso de la 7. La planilla no desaparece
del caso, cambia de papel: deja de ser la memoria del flujo y queda como la
salida que mira una persona.

El taller `taller-oauth.html` es aparte: no es una clase, no lleva número y no
entra en `clases.js`. Se llega desde el bloque «Talleres» del cronograma, y la
clase 9 lo usa como primera parte. Veinte etapas para poner un n8n propio
detrás de un dominio con Google OAuth en producción. Vuelve en el módulo 5.
Regla suya: el formulario maneja sólo valores no secretos, no hay ningún campo
donde pegar el Client Secret, y no se guarda ni Client ID ni Client Secret en
`localStorage`. Si alguna vez se agrega algo ahí, esa regla manda.

## El terreno de n8n, verificado el 15 de septiembre de 2026

Contra la fuente (docs.n8n.io y la grilla de n8n.io), no contra recuerdos:

- **Los flujos no se activan: se publican.** n8n guarda solo cada pocos segundos
  y todo queda en borrador hasta el Publish, que además congela la versión que
  corre en producción. Las ocho clases publicadas ya usan ese vocabulario. Las
  clases 2 y 3, que se dictaron diciendo "activar", llevan además una nota de
  revisión fechada que explica el cambio, para que nadie crea que la página se
  contradice con lo que escuchó en el aula. Ese es el patrón cuando la
  herramienta cambia debajo de una clase ya dictada: corregir el texto y dejar
  la nota, nunca reescribir en silencio.
- **n8n 3.0 sale en octubre de 2026**, en pleno módulo 5. Lo que rompe:
  self-hosted pasa a requerir Docker (npm y npx dejan de servir), se eliminan los
  nodos Function, Function Item, Item Lists, LangChain Code y AI Transform, se va
  el helper `$getPairedItem`, y el nodo AI Agent pierde su versión 1 con los
  modos viejos (SQL Agent, Conversational, ReAct). Nada de eso lo usa esta
  cursada: enseñamos Code, Split Out, Aggregate, Summarize, `$('Nodo').item` y
  Tools Agent. El módulo 5 ya iba por Docker, así que el cambio lo confirma.
- **Cuotas.** Solo cuentan las ejecuciones de producción y solo en planes pagos.
  No cuentan: manuales, sub-workflows, **flujos de error**, sondeos que no
  encuentran datos y pedidos malformados. El Schedule Trigger cuenta siempre;
  los de sondeo, solo cuando encuentran algo; los webhooks, cada pedido que
  active el disparador, incluso con cuerpo vacío.
- **Precios Cloud (grilla, facturación anual).** Starter 20 € y 2.500
  ejecuciones, Pro 50 € y 10.000, Business 667 € y 40.000. Todos con usuarios y
  workflows ilimitados. El plan gratuito de 50 ejecuciones no figura en la
  grilla: sale del panel de la cuenta y conviene reconfirmarlo cada cohorte.

## Datos en n8n, verificado el 23 de septiembre de 2026

Contra docs.n8n.io y el código de `packages/nodes-base/nodes/DataTable/`:

- **Data Tables.** Siete operaciones sobre filas: Insert, Get, Update, Upsert,
  Delete, If Row Exists y If Row Does Not Exist. Cuatro sobre tablas: Create,
  Delete, List y Update. Las dos operaciones «If Row…» **filtran, no ramifican**:
  dejan pasar los ítems que cumplen y descartan el resto, así que para tener las
  dos ramas hay que poner dos nodos. Tipo del nodo `n8n-nodes-base.dataTable`,
  versiones 1 y 1.1, y `usableAsTool: true`, o sea que un agente la puede usar
  como herramienta (eso vuelve en la clase 10).
- **Los límites.** 200 MiB entre todas las tablas de la instancia, aviso al 80 %
  y otro al tope; pasado el tope fallan los insert y los update. La variable
  `N8N_DATA_TABLES_MAX_SIZE_BYTES` cambia ese límite **solo en instancia propia**.
  Las tablas son del proyecto y las ve el equipo del proyecto. **No se accede a
  una Data Table desde el nodo Code**: no hay método ni variable que las exponga.
- **Remove Duplicates.** Resuelve el mismo problema sin tabla, y la clase lo dice:
  operación «Remove Items Processed in Previous Executions», alcance `Node` o
  `Workflow`, `History Size` de 10.000 ítems por defecto, y «Clear Deduplication
  History» que borra todo o nada. La regla de decisión que enseña la 9: si sólo
  necesitás saber «¿esto ya lo vi?», Remove Duplicates; si además necesitás saber
  algo *sobre* lo que viste, Data Table.
- **Cuatro maneras de transformar** y dónde corre cada una: expresiones, nodos de
  transformación y nodo Code andan en nube y en instancia propia; el **nodo AI
  Transform es sólo de nube** y además **n8n 3.0 lo elimina** en octubre. La
  documentación pide preferir expresiones siempre que se pueda, porque muestran
  el valor calculado mientras se escribe.
- **Dos ayudantes que traicionan.** `.toNumber()` tira error si el texto no
  empieza con un número válido, así que no sirve para `$ 1.234,56`. `.toDateTime()`
  sólo acepta ISO 8601, HTTP, RFC2822, SQL y timestamp Unix: **no entiende
  `15/03/2026`**, que hay que convertir con `DateTime.fromFormat()`.
- **La trampa del cero.** Limpiar un monto con `replace` y pasarlo por `Number()`
  devuelve **0** cuando no quedó ningún dígito, porque `Number('')` es 0 y no NaN.
  Un IF que pregunte si el monto «existe» lo deja pasar. Tiene que preguntar si
  es mayor que cero. Está enseñado así en la clase y en el flujo del limpiador.

## Despliegue

Vercel, sin configuración: Framework Preset en Other y los tres campos de build
vacíos. La variable `AA_API_KEY` va en los tres entornos. Si se carga después del
primer deploy hace falta un redeploy manual. Verificación: `/api/datos` devuelve
un JSON con `fecha` y `modelos`.

La clave de acceso de la cohorte vive como hash SHA-256 en `acceso.js`. Es una
cortina, no un candado: no la presentes como seguridad.
