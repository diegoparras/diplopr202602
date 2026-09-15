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

Estado: publicadas las clases 1 a 8. El módulo 3 cambió la regla: desde la 7 el
caso lo trae cada participante, y la página de la 7 tiene un taller que convierte
su proceso en algoritmo y le baja el esqueleto de n8n armado. Las actividades se
encadenan por `localStorage`: la 6 alimenta la 7, la 7 alimenta la 8, la 8
alimenta la 9. Deudas anotadas: la memoria entre ejecuciones (Data Tables, clase
9) y la planilla usada como base de datos en el caso de la 7, que la 9 desarma.

## El terreno de n8n, verificado el 15 de septiembre de 2026

Contra la fuente (docs.n8n.io y la grilla de n8n.io), no contra recuerdos:

- **Los flujos no se activan: se publican.** n8n guarda solo cada pocos segundos
  y todo queda en borrador hasta el Publish, que además congela la versión que
  corre en producción. Las clases 7 y 8 ya usan ese vocabulario; las clases 1, 2
  y 3 dicen "activar" y habría que repasarlas.
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

## Despliegue

Vercel, sin configuración: Framework Preset en Other y los tres campos de build
vacíos. La variable `AA_API_KEY` va en los tres entornos. Si se carga después del
primer deploy hace falta un redeploy manual. Verificación: `/api/datos` devuelve
un JSON con `fecha` y `modelos`.

La clave de acceso de la cohorte vive como hash SHA-256 en `acceso.js`. Es una
cortina, no un candado: no la presentes como seguridad.
