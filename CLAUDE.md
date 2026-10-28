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
  n8n-google-oauth.html  el mismo taller, suelto: un archivo, sin clave, sin
                       mención de la cursada. Para compartir afuera.
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
5. Orquestar y alojar (13 a 17) — MCP, RAG con n8n y Dify, self-hosting e
   instancia propia, orquestación desde afuera, multi-agente
6. Evaluar y mejorar (18 a 20) — métricas, refactor, proyecto integrador

Los orquestadores (Claude Code, Codex, OpenCode) aparecen en la clase 12 como
herramienta de construcción y vuelven en la 16 como capa que maneja n8n desde
afuera vía MCP. Nunca desplazan a n8n del centro.

Estado: publicadas las clases 1 a 14, más el taller de OAuth. El módulo 3 cambió la regla: desde la 7 el
caso lo trae cada participante, y la página de la 7 tiene un taller que convierte
su proceso en algoritmo y le baja el esqueleto de n8n armado. Las actividades se
encadenan por `localStorage`: la 6 alimenta la 7, la 7 alimenta la 8, la 8
alimenta la 9, la 9 alimenta la 10, la 10 alimenta la 11, la 11 alimenta la 12, la 12 alimenta la 13, la 13 alimenta la 14 y la 15 (la primera pregunta va a la 14, la segunda a la 15) y la 14 alimenta la 15. Con la 9 cierra el módulo 3 y quedan
saldadas las dos deudas que arrastraba: la memoria entre ejecuciones y la
planilla usada como base de datos en el caso de la 7. La planilla no desaparece
del caso, cambia de papel: deja de ser la memoria del flujo y queda como la
salida que mira una persona.

La 10 abre el módulo 4 con el mismo caso: al buzón de Marcela llegan correos
sin factura (consultas por pagos, reclamos, publicidad), y separarlos es la
primera condición de la cursada que no se escribe como SI. La idea que ordena
la clase: el agente reemplaza **la condición** del esqueleto, no el flujo; el
disparador y las acciones siguen siendo nodos. Enseña tres escalones —flujo
fijo, flujo con un paso de IA, agente— y que casi siempre alcanza el del medio.
El agente usa como herramienta la Data Table `facturas_vistas` de la 9, sin
ninguna herramienta que escriba en ella. Deja abierta la 11: el system message
del agente es la mitad del flujo, y la actividad pide lo que el modelo no sabe
de la oficina y lo que no debería ver nunca.

La 11 es la primera clase **agnóstica de modelos**, por pedido del
coordinador: ni la página ni los workflows eligen proveedor. Los workflows
vienen sin sub-nodo de modelo, con una nota que marca dónde enchufarlo; la
página no recomienda ningún modelo, y la evaluación se presenta como la
manera honesta de compararlos con casos propios. Esa regla vale de la 11 en
adelante; las clases 5 y 10 quedan como se dictaron, con Anthropic. La 11
usa como fuente del concepto el artículo de Anthropic sobre ingeniería de
contexto (29/9/2025), citado como texto de referencia, nunca como
recomendación de modelo. Ordena la clase en: qué es el contexto, la anatomía
de una llamada, dónde va cada cosa (instrucciones, mensaje, herramienta,
base de documentos, no entra), las tres versiones de las instrucciones, las
herramientas como contexto, el orden, Guardrails para tapar, RAG explicado
sin workflow, y la evaluación simple con doce casos. Las evaluaciones con
puntaje quedan para el módulo 6. El texto de las instrucciones y los doce
casos tienen un solo origen y se copian a la página y a los workflows al
armarlos: si se cambia uno, se regeneran los dos.

La 12 trae los agentes de código (Claude Code, Codex, OpenCode) como
herramienta para escribir expresiones, nodos Code y JSON de workflows, y
sigue siendo agnóstica: presenta los tres por lo que hacen bien y lo que
cuestan, más n8n Assistant como «el que ya está adentro», y da criterios
para elegir sin recomendar ninguno. La idea que la ordena: es el mismo
bucle de la clase 10 con otras herramientas, el pedido lleva el
pseudocódigo, un ítem real tapado y los casos, y lo que decide si el agente
acertó son los casos. Piezas: el armador del pedido, un probador que corre
expresiones y nodos Code contra casos en el navegador, un revisor de JSON
de workflows con la lista real de tipos y versiones de la estable (sale de
los `nodes.json` de los paquetes; para actualizarla se reemplazan las
constantes `TIPOS`, `COMO_HERRAMIENTA` y `CON_APROBACION` de `clase12.js`
con los de la versión nueva, sin WhatsApp) y una
plantilla de `AGENTS.md`. El workflow de la clase prueba un nodo Code
contra casos adentro de n8n, sin modelo ni credenciales. Deja abierta la
13: el agente no ve tu n8n, todo se lo copiaste a mano, y la actividad pide
lo que no le dejarías hacer nunca ahí adentro.

La 13 sale del PDF del coordinador «Clase 13 - MCP» y sigue su orden:
teoría en nueve bloques (apertura, por qué ahora, N × M, historia,
arquitectura con el restaurante y JSON-RPC, transportes, primitivas, n8n en
los dos lados, seguridad), la práctica con el servidor MCP de la instancia
y sus tres pedidos, y los tres nodos MCP. Dos cambios respecto del PDF, por
las reglas de la cursada: la práctica no es sólo con Codex (trae el comando
de Codex, Claude Code y OpenCode) y el tercer pedido usa una credencial de
modelo con el nombre que ponga cada uno, en vez de una de OpenAI. Las
cifras de MCP del PDF son del anuncio de la donación (9/12/2025), no del
aniversario, y la página lo dice. El ejemplo de la tienda del PDF se armó
con Data Tables en lugar de Google Sheets, para que no pida credenciales.
Workflows: el servidor de la tienda (MCP Server Trigger con Bearer Auth,
dos herramientas Data Table) y n8n como cliente (agente sin modelo con MCP
Client Tool filtrado a la herramienta de lectura, y un MCP Client fijo).
Deja abierta la 14: el servidor MCP tiene que estar en internet, y la
actividad pregunta qué datos pasaron por servidores ajenos y quién cuidaría
un n8n propio.

El taller `taller-oauth.html` es aparte: no es una clase, no lleva número y no
entra en `clases.js`. Se llega desde el bloque «Talleres» del cronograma, y la
clase 9 lo usa como primera parte. Veinte etapas para poner un n8n propio
detrás de un dominio con Google OAuth en producción. Vuelve en el módulo 5.
Regla suya: el formulario maneja sólo valores no secretos, no hay ningún campo
donde pegar el Client Secret, y no se guarda ni Client ID ni Client Secret en
`localStorage`. Si alguna vez se agrega algo ahí, esa regla manda.

De ese taller hay **dos copias y hay que tocar las dos**. `taller-oauth.html`
es la de la cursada: detrás de la cortina de acceso, con el selector de clases
y las referencias a los módulos. `n8n-google-oauth.html` es la suelta, para
compartir con gente de afuera: un solo archivo con todo adentro —el CSS, el
tema y el JavaScript—, sin `exigirSesion()`, sin `estilo.css`, sin `menu.js` y
sin una sola mención de la diplomatura. Abre igual servida que con doble clic
sobre el archivo. Se regenera con el script del commit que la creó, que aplica
los reemplazos uno por uno y falla si alguno no encuentra su texto: si editás
la de la cursada, volvé a generarla en vez de editar las dos a mano. Ojo con
una cosa que ya mordió: el CSS que hace envolver la barra superior en teléfono
lo inyecta `menu.js`, así que la versión suelta lo lleva escrito aparte.

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
- **n8n 3.0 sale en octubre de 2026**, en pleno módulo 5 (la lista creció después: ver la sección del 30 de septiembre). Lo que rompía al 15/9:
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
  ejecuciones, Pro 50 € y 10.000. Business, 667 € y 40.000, es **sólo para
  instancia propia** (corregido el 21/10, con nota de revisión en la clase 6);
  Enterprise, en los dos. Todos con usuarios y workflows ilimitados. El plan gratuito de 50 ejecuciones no figura en la
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

## IA en n8n, verificado el 30 de septiembre de 2026

Contra docs.n8n.io, las notas de versión, el registro de npm y el código de los
paquetes de la estable (`n8n` 2.41.4 → `n8n-nodes-base` y
`@n8n/n8n-nodes-langchain` 2.41.3). La 2.42 está en beta.

- **Dos maneras de armar un agente.** El **nodo AI Agent** (versión por defecto
  3.1; la v1 con selector de tipo de agente desaparece en 3.0; máximo de vueltas
  por defecto 10; hace falta al menos una herramienta) y **Agents**, un producto
  aparte en **Preview**: armador propio con modelo, instrucciones, herramientas,
  skills, base de conocimiento, memoria episódica, sub-agentes, canales (Slack,
  Telegram, Linear) y tareas programadas, con borrador y publicación. Cloud:
  todos los planes. Instancia propia: desde 2.32.3 agregando `agents` a
  `N8N_ENABLED_MODULES` (la 2.42 beta lo trae activado); no en Enterprise de
  instancia propia; no anda en modo cola. **Un turno = una ejecución**, misma
  cuota que los workflows. El nodo **Message an Agent** lo llama desde un flujo.
  La clase 10 pone el nodo al centro y Agents como «la otra puerta», con la
  regla: paso de un proceso que sabés dibujar → nodo; conversación abierta que
  alguien empieza por un canal → Agents.
- **Frenos.** Revisión humana por herramienta (el flujo se pausa; variables
  `$tool.name` y `$tool.parameters`; canales: chat de n8n, Slack, Discord,
  Telegram, Teams, Google Chat, Gmail, Outlook — la lista oficial incluye
  WhatsApp y **no se menciona**). Nodo **Guardrails** (versión 2): datos
  personales, claves, jailbreak, NSFW, tema, palabras, URLs; los chequeos con
  modelo son otra llamada paga. Opción «Force Tool Call on First Iteration»
  desde la 2.40.
- **Cómo se llaman los nodos en el JSON.** Un nodo usado como herramienta es
  `<tipo>Tool` (`n8n-nodes-base.dataTableTool`, `gmailTool`, `telegramTool`).
  La revisión humana es `<tipo>HitlTool` y existe para los nodos con operación
  «send and wait» (`n8n-nodes-base.telegramHitlTool`): la herramienta que
  necesita aprobación se conecta **a** ese nodo por `ai_tool`, y ese nodo al
  agente. `$fromAI('clave', 'descripción', 'tipo')` completa parámetros de
  herramientas y no funciona en el Code tool.
- **Anthropic Chat Model 1.6.** Con los Claude nuevos no manda `temperature` ni
  `top_p` (el código los filtra), y no toca el razonamiento salvo que se lo
  pidas: con `thinkingMode: 'adaptive'` manda thinking adaptativo y el
  `effort` elegido. Los flujos de la 10 usan `claude-opus-5-5` con esfuerzo
  `low` para clasificar y `medium` para el agente. La calculadora de costo de
  la clase lee precios sólo de `/api/datos`.
- **Renombres.** «AI Assistant» es **n8n Assistant** desde la 2.40.
  (Corregido el 14/10: son dos productos. «Ask n8n AI» es el asistente
  viejo de ayuda, sin desarrollo; **n8n Assistant** es el agente nuevo que
  arma, ejecuta y publica en el lienzo. Ver la sección del 14 de octubre.)
- **n8n 3.0, lo que se sumó a la lista.** Se van Cron, Interval, HTML Extract,
  Read PDF, Read/Write Binary File, Workflow Trigger, Manual Chat Trigger,
  SerpApi, el HTTP Request Tool viejo, los loaders viejos y varios vector
  stores de a pares. El AI Transform ya no se puede agregar pero los existentes
  **se convierten solos en nodos Code**. El nodo Code corta a los 60 s. Los
  nodos de comunidad sin verificar quedan apagados. Chat Hub se apaga (y se va
  en 4.0). El Gmail Trigger 1.0–1.3 pasa a comportarse como el 1.4.
- **Auditoría de la cursada contra esa lista.** De los dieciséis workflows,
  sólo los Gmail Trigger 1.2 de las clases 7 y 9, que no se ven afectados en
  un buzón que recibe facturas; llevan una nota fechada en su sticky. La 9
  lleva además una nota de revisión sobre la conversión del AI Transform. Los
  flujos nuevos usan el Gmail Trigger 1.4.

## Contexto y evaluaciones en n8n, verificado el 7 de octubre de 2026

Contra docs.n8n.io y el código de la estable (`n8n` 2.42.4 →
`n8n-nodes-base` y `@n8n/n8n-nodes-langchain` 2.42.3). La 2.43 está en beta
y la página de la 3.0 no cambió desde el 30/9 (sigue «octubre de 2026»).

- **La documentación de n8n no usa la expresión «context engineering»** ni
  una vez en todo su índice. La clase lo dice.
- **Memoria.** Simple Memory guarda las últimas N interacciones (Session Key,
  Context Window Length) y en modo cola no funciona en producción; en los
  sub-nodos las expresiones resuelven siempre al primer ítem. Chat Memory
  Manager recorta o inyecta mensajes. Los agentes usan memoria; las cadenas,
  no. El agente v3 tiene una opción `maxTokensFromMemory` pero está
  **oculta** en la interfaz: no se enseña.
- **Reuso del comienzo del paquete.** Cada nodo de modelo lo expone distinto
  (uno con opción de 5 min / 1 h, otro con una clave, la mayoría nada), así
  que la clase enseña el principio —lo fijo primero, lo variable al final, y
  nunca `{{ $now }}` al principio de las instrucciones— y no un botón.
- **Guardrails v2 en Sanitize Text** no pide modelo: sólo lo pide si se usan
  jailbreak, NSFW, tema o personalizado. Reemplaza por `<TIPO>` y deja el
  texto en `guardrailsInput`; la operación sanitize tiene una sola salida y
  no conserva los demás campos del ítem. **No trae entidades argentinas**
  (ni CUIT, ni CBU, ni DNI): se agregan con «Custom Regex», que acepta el
  patrón con o sin barras.
- **RAG.** Necesita un modelo de *embeddings*; n8n tiene nodos para trece
  proveedores, uno local. La regla de la clase: si el dato tiene llave,
  herramienta; si es texto que hay que buscar por significado, base de
  documentos.
- **Evaluaciones.** Las simples: todos los planes de Cloud y Community
  registrada, Business y Enterprise en instancia propia; casos en una Data
  Table o una planilla; nodos Evaluation Trigger 4.7 (fuente `dataTable`) y
  Evaluation 4.8 (operación `setOutputs`). Las de puntaje (Categorization,
  Correctness, Helpfulness, String Similarity, Tools Used, propias): Cloud Pro
  y Enterprise, Enterprise en instancia propia, y Starter o Community
  registrada para un solo workflow.
- **El Gmail Trigger en modo completo (`simple: false`)** entrega lo que arma
  mailparser: `from` es un **objeto** (el texto está en `from.text`, con el
  nombre entre comillas; el nombre solo, en `from.value[0].name`), no hay
  `snippet` (el cuerpo está en `text`), y **el campo `attachments` se borra**
  a propósito. Los adjuntos sólo llegan como binarios si se prende la opción
  `downloadAttachments`, y se detectan con `Object.keys($binary || {}).length`.
  Los workflows de la 11 nacieron así. Los de las clases 7, 9 y 10 tenían el
  error y se corrigieron el 7/10/2026, con nota de revisión fechada en el
  sticky de puesta a punto de cada flujo y en un `.nota-pie` junto a las
  descargas de 07.html, 09.html y 10.html. Todo flujo nuevo con Gmail
  Trigger sale así de entrada.

## Agentes de código, verificado el 14 de octubre de 2026

Contra code.claude.com, claude.com/pricing, learn.chatgpt.com, opencode.ai,
agents.md, docs.n8n.io, el registro de npm y el código de la estable
(`n8n` 2.43.5 → `n8n-nodes-base`, `@n8n/n8n-nodes-langchain` y
`@n8n/task-runner` 2.43.3). La beta es la 2.44.1.

- **n8n 3.0 todavía no salió**: no hay ninguna 3.x en npm, sólo imágenes
  nocturnas en Docker. Su página de cambios ya dice «has been released» y
  el changelog trae entradas fechadas a futuro: no dar fecha. La lista
  sumó, entre otras cosas, la pestaña Ask AI del nodo Code, Import from
  URL y `$evaluateExpression()`. El nodo Code hoy corta a los 300 s; el
  corte a 60 s es de la 3.0.
- **Nodo Code.** Versiones 1 y 2. En modo por ítem devuelve un objeto y
  n8n rechaza `$input.all()`; en modo para todos, una lista. n8n envuelve
  solo en `{ json }`. `items` todavía anda en modo para todos pero la
  documentación ya no lo muestra. Sin red, sin Data Tables, y en Cloud
  sólo `crypto` y `moment` con `require`. El constructor de IA de n8n
  tiene la orden de usar Code «como último recurso».
- **Importar JSON.** El editor sólo exige `nodes` y `connections`; las
  conexiones a nombres que no existen se descartan sin aviso, un tipo
  desconocido queda como nodo a instalar, y `$node["…"]` sigue andando
  pero desapareció de la documentación. El JSON exportado trae nombre e
  id de cada credencial, no el secreto; `pinData` sí viaja.
- **Claude Code.** Sólo modelos de Anthropic. Incluido desde Pro (USD 20);
  el plan gratuito no lo trae. Código cerrado. Lee `CLAUDE.md`, y desde la
  2.1.277 `AGENTS.md` si no hay `CLAUDE.md` (o vía `@AGENTS.md`). Modos:
  Manual, aceptar ediciones, plan, auto.
- **Codex.** Modelos de OpenAI por defecto, acepta otros proveedores y
  locales. Incluido desde ChatGPT Plus (USD 20); gratuito y Go sólo en la
  app de escritorio, con un modelo chico y «sujeto a despliegue». CLI
  Apache 2.0. Lee `AGENTS.md`, no `CLAUDE.md`. Desde julio vive dentro de
  la app de escritorio de ChatGPT y su documentación está en
  learn.chatgpt.com.
- **OpenCode.** MIT, cualquier proveedor y modelos locales. La v2 salió el
  11/9/2026 como paquete aparte (`@opencode/cli`) y sólo lee `AGENTS.md`.
  Una suscripción de Claude no se puede usar ahí.
- **`AGENTS.md`** lo cuida la Agentic AI Foundation (Linux Foundation) y es
  hoy el único archivo que leen los tres.
- **n8n Assistant** (Preview): arma, ejecuta, depura y publica con
  aprobación. Cloud Starter y Pro con créditos; instancia propia en
  Community y Business, no Enterprise, con Docker y clave de modelo propia.
  Reemplaza al AI Workflow Builder.
- **Para la 13**: n8n tiene servidor MCP por instancia (Settings >
  Instance-level MCP), skills oficiales para agentes de código
  (`n8n-io/skills`), la n8n CLI y dos MCP de documentación. Las
  herramientas de construcción del MCP trabajan con el Workflow SDK en
  TypeScript, no con JSON crudo. Codex quitó el modo servidor MCP el 5/9;
  como cliente los tres andan.

## MCP, verificado el 21 de octubre de 2026

Contra modelcontextprotocol.io, anthropic.com, linuxfoundation.org,
docs.n8n.io, la grilla de n8n.io, el registro de npm y el código de la
estable (`n8n` 2.44.5 → nodos 2.44.3). La beta es la 2.45.1 y no hay
ninguna 3.x publicada.

- **Especificación vigente: 2026-07-28.** Sin saludo `initialize` ni
  sesiones; el resultado de `tools/call` lleva `resultType: "complete"`;
  transportes stdio y Streamable HTTP, SSE deprecado; OAuth recomendado
  para remotos; del lado del cliente sólo queda la elicitación (Sampling,
  Roots y Logging deprecados). Tools las controla el modelo, resources la
  aplicación, prompts el usuario.
- **Historia.** Lanzado el 25/11/2024; donado a la Agentic AI Foundation
  (Linux Foundation) el 9/12/2025, cofundada por Anthropic, Block y
  OpenAI. Las cifras «97 M de descargas mensuales y 10.000 servidores»
  son de ese anuncio y cuentan sólo los SDK de Python y TypeScript.
- **Servidor MCP de la instancia.** Settings > Instance-level MCP, y
  después flujo por flujo («Available in MCP»); todo cliente ve todos los
  flujos habilitados. OAuth recomendado o token personal. URL terminada en
  `/mcp-server/http`. En todos los planes de Cloud y en Community,
  Business y Enterprise de instancia propia. Crear y editar flujos, desde
  2.13 según la guía (la referencia de herramientas dice 2.12). Un cliente
  conectado también puede publicar (`publish_workflow`). n8n publica los
  comandos de Claude Code y Codex, no el de OpenCode. No está documentado
  si una ejecución por MCP cuenta para la cuota.
- **Nodos.** MCP Server Trigger 2.1 (auth None, Bearer, Header u OAuth de
  n8n; campo «Instructions» que le llega al cliente al conectarse), MCP
  Client Tool 1.4 (All / Selected / All Except), MCP Client 1.1, existe
  desde n8n 1.122 (noviembre de 2025).
- **dolarapi.com** responde sin credenciales en `/v1/dolares/oficial` y
  `/v1/dolares/blue` (campos compra, venta, fechaActualizacion).
- **Grilla de n8n.io, 21/10:** Cloud tiene Starter (20 €, 2.500
  ejecuciones, 1.600 créditos de Assistant), Pro (50 €, 10.000) y
  Enterprise; Business (667 €, 40.000) dice «Self-hosted only» y la
  pregunta frecuente lo confirma: «Not yet» en Cloud.

## Despliegue

Vercel, sin configuración: Framework Preset en Other y los tres campos de build
vacíos. La variable `AA_API_KEY` va en los tres entornos. Si se carga después del
primer deploy hace falta un redeploy manual. Verificación: `/api/datos` devuelve
un JSON con `fecha` y `modelos`.

La clave de acceso de la cohorte vive como hash SHA-256 en `acceso.js`. Es una
cortina, no un candado: no la presentes como seguridad.
