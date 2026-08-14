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

Estado: publicadas las clases 1 y 2. La clase 3 es viernes 21 de agosto y, según
lo que quedó dictado en la clase 2, pasa a ser el taller donde cada persona
construye con su cuenta; hay que reescribirle título y bajada en `clases.js`
cuando se arme.

## Despliegue

Vercel, sin configuración: Framework Preset en Other y los tres campos de build
vacíos. La variable `AA_API_KEY` va en los tres entornos. Si se carga después del
primer deploy hace falta un redeploy manual. Verificación: `/api/datos` devuelve
un JSON con `fecha` y `modelos`.

La clave de acceso de la cohorte vive como hash SHA-256 en `acceso.js`. Es una
cortina, no un candado: no la presentes como seguridad.
