/* Clase 13 — MCP: el protocolo que conecta la IA con tus herramientas
   Sigue el material del coordinador en su orden: la teoría (apertura, por
   qué ahora, el problema N × M, la historia, la arquitectura con el
   restaurante, JSON-RPC y el ciclo, transportes, primitivas, n8n en los dos
   lados, seguridad), la práctica con el servidor MCP de la instancia y los
   tres nodos MCP de n8n.

   El dibujo del N × M es un SVG que toma los colores de las variables de
   estilo.css: escucha cambio-tema y no anima si se pidió menos movimiento.
   Ninguna pieza depende de un modelo ni de un proveedor. */

exigirSesion();
document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function leerGuardado(clave) {
  try { return (localStorage.getItem(clave) || '').trim(); } catch (e) { return ''; }
}
function guardar(clave, valor) {
  try { localStorage.setItem(clave, valor); return true; } catch (e) { return false; }
}
function escapar(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function copiar(texto, boton) {
  const original = boton.textContent;
  const listo = ok => { boton.textContent = ok ? 'Copiado' : 'Seleccioná y copiá a mano'; setTimeout(() => { boton.textContent = original; }, 1800); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(() => listo(true), () => listo(false));
  else listo(false);
}
function marcar(grupo, boton) {
  grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === boton)));
}


/* ══════════════════════════════════════════════════════════
   1 · LO QUE TRAJISTE DE LA CLASE 12
   ══════════════════════════════════════════════════════════ */

(function traido() {
  const cont = document.getElementById('traido');
  if (!cont) return;
  const partes = [
    { clave: 'clase12-q1', rot: 'Lo que tuviste que copiarle a mano al agente',
      hoy: 'Cada cosa de esta lista es algo que, con MCP, el agente va a buscar solo.' },
    { clave: 'clase12-q2', rot: 'Lo que no le dejarías hacer nunca en tu n8n',
      hoy: 'Al final de la teoría vas a decidir qué freno cubre cada una.' }
  ].map(p => ({ ...p, texto: leerGuardado(p.clave) }));

  if (!partes.some(p => p.texto)) {
    cont.innerHTML = `
      <span class="rot">Todavía no hay nada guardado acá</span>
      <p class="vacio" style="margin-top:12px">La actividad de la clase 12 pedía dos listas: lo que le copiaste a mano al agente y lo que no le dejarías hacer nunca en tu n8n. Si la hiciste en otro dispositivo no la voy a ver. Podés completarla en <a href="12.html">la clase 12</a> o traerla pensada.</p>`;
    return;
  }
  cont.innerHTML = '<span class="rot">Lo que escribiste el miércoles</span>' +
    partes.filter(p => p.texto).map(p => `
      <div class="linea">
        <b>${p.rot}</b>
        <p style="white-space:pre-wrap">${escapar(p.texto)}</p>
        <p style="font-size:0.84rem;color:var(--tenue);margin-top:4px">${p.hoy}</p>
      </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   2 · LA PREGUNTA DISPARADORA
   ══════════════════════════════════════════════════════════ */

(function disparadora() {
  const $g = document.getElementById('disparadora');
  if (!$g) return;
  const $r = document.getElementById('disparadoraRta');
  const RTA = {
    mano: 'Leíste lo que propuso la IA y lo rearmaste nodo por nodo. La IA sabía qué hacer, pero no podía tocar tu n8n: las manos las pusiste vos.',
    json: 'Copiaste el JSON, lo importaste y probablemente arreglaste algo. La IA escribió de memoria, sin ver tu instancia: es lo que vimos con el revisor de la clase 12.',
    ambas: 'Hiciste de mensajero en las dos direcciones: le llevaste el contexto a la IA y le trajiste el resultado a n8n.',
    nunca: 'Entonces la clase 12 fue la primera vez. Igual te tocó copiar: el ítem real, los casos, el flujo.'
  };
  $g.addEventListener('click', e => {
    const b = e.target.closest('button[data-r]');
    if (!b) return;
    marcar($g, b);
    $r.innerHTML = `<p>${RTA[b.dataset.r]}</p><p style="margin-top:10px;color:var(--texto)"><b>Ese copiar y pegar es el problema.</b> La IA es muy capaz, pero está encerrada: no ve tus sistemas. MCP es la puerta.</p>`;
    $r.hidden = false;
  });
})();


/* ══════════════════════════════════════════════════════════
   3 · EL PROBLEMA N × M
   Un SVG: a la izquierda las IAs, a la derecha las herramientas. Sin
   estándar, una línea por par. Con MCP, todas pasan por el enchufe.
   ══════════════════════════════════════════════════════════ */

(function nxm() {
  const $svg = document.getElementById('nxmDibujo');
  if (!$svg) return;
  const $ias = document.getElementById('nxmIas');
  const $her = document.getElementById('nxmHer');
  const $modo = document.getElementById('nxmModo');
  const $cuenta = document.getElementById('nxmCuenta');
  const $leyIas = document.getElementById('nxmIasV');
  const $leyHer = document.getElementById('nxmHerV');
  const IAS = ['Claude', 'ChatGPT', 'Codex', 'Cursor', 'Gemini', 'Copilot'];
  const HER = ['GitHub', 'Notion', 'Drive', 'Postgres', 'Calendar', 'Slack', 'Sentry', 'CRM', 'Stripe', 'Jira', 'Figma', 'n8n'];
  let conMcp = false;

  function pintar() {
    const n = +$ias.value, m = +$her.value;
    $leyIas.textContent = n; $leyHer.textContent = m;
    const W = 640, H = 360, xi = 110, xh = W - 110, xm = W / 2;
    const yi = i => H / 2 + (i - (n - 1) / 2) * Math.min(52, (H - 40) / Math.max(n, 1));
    const yh = j => H / 2 + (j - (m - 1) / 2) * Math.min(30, (H - 30) / Math.max(m, 1));
    let lineas = '';
    if (!conMcp) {
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++)
        lineas += `<line x1="${xi}" y1="${yi(i)}" x2="${xh}" y2="${yh(j)}" style="stroke:var(--naranja);stroke-opacity:0.35;stroke-width:1.2"/>`;
    } else {
      for (let i = 0; i < n; i++) lineas += `<line x1="${xi}" y1="${yi(i)}" x2="${xm}" y2="${H / 2}" style="stroke:var(--naranja);stroke-width:1.6"/>`;
      for (let j = 0; j < m; j++) lineas += `<line x1="${xm}" y1="${H / 2}" x2="${xh}" y2="${yh(j)}" style="stroke:var(--naranja);stroke-width:1.6"/>`;
    }
    const nodo = (x, y, t, ancla) => `
      <circle cx="${x}" cy="${y}" r="5" style="fill:var(--naranja)"/>
      <text x="${ancla === 'end' ? x - 12 : x + 12}" y="${y + 4}" text-anchor="${ancla}" style="fill:var(--texto);font-family:var(--dato);font-size:12px">${t}</text>`;
    let puntos = '';
    for (let i = 0; i < n; i++) puntos += nodo(xi, yi(i), IAS[i], 'end');
    for (let j = 0; j < m; j++) puntos += nodo(xh, yh(j), HER[j], 'start');
    const enchufe = conMcp ? `
      <rect x="${xm - 38}" y="${H / 2 - 20}" width="76" height="40" rx="12" style="fill:var(--brasa);stroke:var(--naranja);stroke-width:1.5"/>
      <text x="${xm}" y="${H / 2 + 5}" text-anchor="middle" style="fill:var(--texto);font-family:var(--display);font-weight:800;font-size:15px">MCP</text>` : '';
    $svg.innerHTML = lineas + puntos + enchufe;
    $svg.classList.toggle('animado', !reducido);
    const total = conMcp ? n + m : n * m;
    $cuenta.innerHTML = conMcp
      ? `<b>${n} + ${m} = ${total}</b> piezas. Cada IA aprende MCP una vez y cada herramienta expone un servidor una vez.`
      : `<b>${n} × ${m} = ${total}</b> integraciones distintas, cada una programada y mantenida por separado.`;
  }

  $ias.addEventListener('input', pintar);
  $her.addEventListener('input', pintar);
  $modo.addEventListener('click', e => {
    const b = e.target.closest('button[data-m]');
    if (!b) return;
    conMcp = b.dataset.m === 'con';
    marcar($modo, b);
    pintar();
  });
  window.addEventListener('cambio-tema', pintar);
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   4 · EL RESTAURANTE
   ══════════════════════════════════════════════════════════ */

(function restaurante() {
  const $r = document.getElementById('resto');
  if (!$r) return;
  const $paso = document.getElementById('restoPaso');
  const $sigue = document.getElementById('restoSigue');
  const $reset = document.getElementById('restoReset');
  const $nombres = document.getElementById('restoNombres');
  const $cocina = document.getElementById('restoCocina');
  const $cocinas = document.getElementById('restoCocinas');

  const COCINAS = [
    { id: 'cocina', nom: 'Cocina', mcp: 'Servidor de la base de datos', plato: 'milanesa con papas' },
    { id: 'postres', nom: 'Postres', mcp: 'Servidor de GitHub', plato: 'helado' },
    { id: 'parrilla', nom: 'Parrilla', mcp: 'Servidor de Notion', plato: null }
  ];
  let activas = 2;
  let tecnico = false;

  const PASOS = [
    { on: ['comensal'], t: 'El comensal pide: «Quiero una milanesa con papas y un helado».', m: 'La persona escribe su pedido en la aplicación de IA.' },
    { on: ['jefe'], t: 'El jefe de salón toma el pedido y decide: milanesa a la cocina, helado a postres. No cocina nada: sabe qué ofrece cada cocina.', m: 'El modelo lee el pedido y las herramientas de cada servidor, y decide a cuál llamar.' },
    { on: ['mozo-cocina', 'mozo-postres'], t: 'Cada mozo lleva su parte a su cocina. Cada uno habla con una sola.', m: 'Cada cliente MCP manda la llamada a su servidor. Un cliente por servidor.' },
    { on: ['cocina', 'postres'], t: 'Las cocinas preparan. Son las que de verdad hacen el trabajo.', m: 'Los servidores ejecutan la herramienta: consultan la base, crean el issue.' },
    { on: ['mozo-cocina', 'mozo-postres'], t: 'Los mozos vuelven con los platos.', m: 'Cada cliente trae el resultado de su servidor.' },
    { on: ['jefe', 'comensal'], t: 'El jefe de salón arma la respuesta y la sirve. El comensal nunca vio a los mozos ni a las cocinas.', m: 'El modelo arma la respuesta con los resultados. La persona no ve los servidores.' }
  ];
  let n = -1;

  function caja(id, nom, mcp, extra) {
    return `<div class="resto-caja ${extra || ''}" data-id="${id}"><b>${tecnico ? mcp : nom}</b><small>${tecnico ? nom : mcp}</small></div>`;
  }
  function pintar() {
    const on = n >= 0 ? PASOS[n].on : [];
    const visibles = COCINAS.slice(0, activas);
    $cocinas.innerHTML = `
      <div class="resto-fila">${caja('comensal', 'Comensal', 'Usuario')}</div>
      <div class="resto-fila">${caja('jefe', 'Restaurante · jefe de salón', 'Host · el modelo decide', 'ancha')}</div>
      <div class="resto-fila">${visibles.map(c => caja('mozo-' + c.id, 'Mozo de ' + c.nom.toLowerCase(), 'Cliente MCP')).join('')}</div>
      <div class="resto-fila">${visibles.map(c => caja(c.id, c.nom, c.mcp)).join('')}</div>`;
    $cocinas.querySelectorAll('.resto-caja').forEach(el => el.classList.toggle('on', on.includes(el.dataset.id)));
    $paso.innerHTML = n < 0
      ? '<p class="sim-vacia">Dale a «Siguiente» para seguir el pedido.</p>'
      : `<span class="quien">Paso ${n + 1} de ${PASOS.length}</span><p>${tecnico ? PASOS[n].m : PASOS[n].t}</p><p class="otro">${tecnico ? PASOS[n].t : PASOS[n].m}</p>`;
    $sigue.disabled = n >= PASOS.length - 1;
    $cocina.disabled = activas >= COCINAS.length;
  }
  $sigue.addEventListener('click', () => { n++; pintar(); });
  $reset.addEventListener('click', () => { n = -1; activas = 2; pintar(); });
  $nombres.addEventListener('click', () => {
    tecnico = !tecnico;
    $nombres.setAttribute('aria-pressed', String(tecnico));
    $nombres.textContent = tecnico ? 'Ver el restaurante' : 'Ver los nombres de MCP';
    pintar();
  });
  $cocina.addEventListener('click', () => {
    activas = Math.min(COCINAS.length, activas + 1);
    pintar();
    $paso.innerHTML = `<span class="quien">Se sumó una cocina</span><p>${tecnico ? 'Se conectó un servidor nuevo: el host crea un cliente MCP nuevo para él.' : 'Abrió la parrilla: el restaurante suma un mozo nuevo, que sólo habla con ella.'}</p>`;
  });
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   5 · EL CICLO EN TRES PASOS, CON LOS MENSAJES DE VERDAD
   ══════════════════════════════════════════════════════════ */

(function ciclo() {
  const $l = document.getElementById('cicloPasos');
  if (!$l) return;
  const $sigue = document.getElementById('cicloSigue');
  const $reset = document.getElementById('cicloReset');
  const PASOS = [
    { k: 'herramienta', q: '1 · Descubrimiento · el cliente pregunta', t: '«¿Qué sabés hacer?»',
      c: '{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "method": "tools/list"\n}' },
    { k: 'herramienta', q: '1 · Descubrimiento · el servidor responde', t: 'Cada herramienta con su nombre, su descripción y sus parámetros.',
      c: '{\n  "jsonrpc": "2.0",\n  "id": 1,\n  "result": {\n    "tools": [{\n      "name": "weather_current",\n      "description": "Clima actual de una ciudad",\n      "inputSchema": {\n        "type": "object",\n        "properties": { "location": { "type": "string" } }\n      }\n    }]\n  }\n}' },
    { k: 'modelo', q: '2 · Decisión · el modelo', t: 'La persona preguntó «¿qué tiempo hace en Buenos Aires?». El modelo lee las descripciones y elige weather_current con location = "Buenos Aires". No ejecuta nada: decide.' },
    { k: 'herramienta', q: '3 · Ejecución · el cliente pide', t: 'La aplicación intercepta la decisión y la manda al servidor.',
      c: '{\n  "jsonrpc": "2.0",\n  "id": 3,\n  "method": "tools/call",\n  "params": {\n    "name": "weather_current",\n    "arguments": { "location": "Buenos Aires" }\n  }\n}' },
    { k: 'herramienta', q: '3 · Ejecución · el servidor responde', t: 'El resultado vuelve al modelo, adentro de la conversación.',
      c: '{\n  "jsonrpc": "2.0",\n  "id": 3,\n  "result": {\n    "resultType": "complete",\n    "content": [{ "type": "text", "text": "Buenos Aires: 22°C, parcialmente nublado" }]\n  }\n}' },
    { k: 'fin', q: 'Respuesta', t: 'El modelo le contesta a la persona con el dato. Son JSON que van y vuelven: una API con un formato acordado por todos.' }
  ];
  let n = 0;
  function pintar() {
    $l.innerHTML = PASOS.slice(0, n).map(p => `
      <div class="paso-bucle ${p.k}">
        <span class="quien">${escapar(p.q)}</span>
        <p>${escapar(p.t)}</p>
        ${p.c ? `<code>${escapar(p.c)}</code>` : ''}
      </div>`).join('') || '<p class="sim-vacia">Dale a «Siguiente mensaje».</p>';
    $l.scrollTop = $l.scrollHeight;
    $sigue.disabled = n >= PASOS.length;
    $sigue.textContent = n >= PASOS.length ? 'Terminó' : 'Siguiente mensaje';
  }
  $sigue.addEventListener('click', () => { n++; pintar(); });
  $reset.addEventListener('click', () => { n = 0; pintar(); });
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   6 · LA DESCRIPCIÓN DECIDE
   Un modelo no elige contando palabras. Esta simulación sí, y alcanza
   para ver lo que importa: con una descripción mala, la herramienta
   correcta no aparece.
   ══════════════════════════════════════════════════════════ */

(function descripciones() {
  const $h = document.getElementById('descHerr');
  if (!$h) return;
  const $preg = document.getElementById('descPreg');
  const $res = document.getElementById('descRes');
  const BUENAS = {
    consultar_stock: 'Devuelve cuántas unidades quedan de un producto en un talle. Usala cuando pregunten por stock, disponibilidad o si queda algo.',
    registrar_consulta: 'Guarda la consulta de un cliente para que una persona la responda. Usala para cambios, envíos, pagos o reclamos.',
    precio_producto: 'Devuelve el precio actual de un producto. Usala cuando pregunten cuánto cuesta o cuánto sale algo.'
  };
  const MALAS = { consultar_stock: 'Herramienta 1.', registrar_consulta: 'Hace cosas con la base.', precio_producto: 'Datos.' };
  const PREGUNTAS = [
    { t: '¿Queda alguna remera talle M?', ok: 'consultar_stock' },
    { t: '¿Cuánto sale el buzo gris?', ok: 'precio_producto' },
    { t: 'La remera me quedó chica, ¿cómo hago el cambio?', ok: 'registrar_consulta' },
    { t: '¿Tienen disponibilidad del pantalón en L?', ok: 'consultar_stock' }
  ];
  let preg = PREGUNTAS[0];
  const VACIAS = new Set('de la el los las un una y o a en que se lo por para con cuando usala usalo es del al su sus si no como me mi tu'.split(' '));
  const raiz = w => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-zñ]/g, '').slice(0, 5);
  const palabras = t => new Set(String(t).split(/\s+/).map(raiz).filter(w => w.length > 2 && !VACIAS.has(w)));

  function elegir() {
    const q = palabras(preg.t);
    const puntajes = [...$h.querySelectorAll('textarea')].map(ta => {
      const d = palabras(ta.value);
      let p = 0; q.forEach(w => { if (d.has(w)) p++; });
      return { nombre: ta.dataset.n, p };
    }).sort((a, b) => b.p - a.p);
    const gana = puntajes[0].p > 0 && puntajes[0].p > (puntajes[1] ? puntajes[1].p : -1) ? puntajes[0].nombre : null;
    const ok = gana === preg.ok;
    $res.className = 'veredicto';
    $res.innerHTML = gana
      ? `<div class="cual" style="color:${ok ? 'var(--acierto)' : 'var(--fallo)'}">${ok ? '✓' : '✗'} Elige <code>${gana}</code></div><p>${ok ? 'La descripción le dijo cuándo usarla.' : `La correcta era <code>${preg.ok}</code>. Su descripción no le dio pistas.`}</p>`
      : `<div class="cual" style="color:var(--alerta)">? No sabe cuál usar</div><p>Ninguna descripción tiene que ver con la pregunta, o dos empatan. Un modelo en esta situación adivina, o no usa ninguna y contesta de memoria.</p>`;
  }

  $h.innerHTML = Object.entries(BUENAS).map(([n, d]) => `
    <div class="campo"><label for="d-${n}"><code>${n}</code></label><textarea id="d-${n}" data-n="${n}" rows="3">${escapar(d)}</textarea></div>`).join('');
  $preg.innerHTML = PREGUNTAS.map((p, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${escapar(p.t)}</button>`).join('');
  $preg.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    preg = PREGUNTAS[+b.dataset.i];
    marcar($preg, b);
    elegir();
  });
  $h.addEventListener('input', elegir);
  document.getElementById('descMalas').addEventListener('click', () => {
    $h.querySelectorAll('textarea').forEach(ta => { ta.value = MALAS[ta.dataset.n]; });
    elegir();
  });
  document.getElementById('descBuenas').addEventListener('click', () => {
    $h.querySelectorAll('textarea').forEach(ta => { ta.value = BUENAS[ta.dataset.n]; });
    elegir();
  });
  elegir();
})();


/* ══════════════════════════════════════════════════════════
   7 · DOS PRUEBAS RÁPIDAS: TRANSPORTES Y PRIMITIVAS
   ══════════════════════════════════════════════════════════ */

function prueba(idCont, items, opciones) {
  const $c = document.getElementById(idCont);
  if (!$c) return;
  const $total = document.getElementById(idCont + 'Total');
  const respuestas = {};
  function contar() {
    const bien = Object.values(respuestas).filter(Boolean).length;
    $total.textContent = `${bien} de ${items.length} bien${Object.keys(respuestas).length < items.length ? ' · faltan ' + (items.length - Object.keys(respuestas).length) : ''}`;
  }
  $c.innerHTML = items.map((it, i) => `
    <div class="prueba-item" data-i="${i}">
      <p>${it.t}</p>
      <div class="opciones">${opciones.map(o => `<button type="button" data-o="${o.v}" aria-pressed="false">${o.t}</button>`).join('')}</div>
      <p class="prueba-fb" hidden></p>
    </div>`).join('');
  $c.addEventListener('click', e => {
    const b = e.target.closest('button[data-o]');
    if (!b) return;
    const $it = b.closest('.prueba-item');
    const it = items[+$it.dataset.i];
    marcar($it.querySelector('.opciones'), b);
    const ok = b.dataset.o === it.ok;
    respuestas[$it.dataset.i] = ok;
    const $fb = $it.querySelector('.prueba-fb');
    $fb.hidden = false;
    $fb.className = 'prueba-fb ' + (ok ? 'ok' : 'mal');
    $fb.innerHTML = (ok ? '✓ ' : '✗ ') + it.por;
    contar();
  });
  contar();
}

prueba('pruebaTransporte', [
  { t: 'Que la IA lea y escriba archivos de la carpeta de tu computadora.', ok: 'local', por: 'El servidor corre en tu máquina y habla con el host por entrada y salida estándar, sin red de por medio.' },
  { t: 'Que tu agente de código cree un issue en GitHub usando el servidor oficial que GitHub aloja.', ok: 'remoto', por: 'El servidor está en internet y atiende a muchos clientes por HTTP, con un token o con OAuth.' },
  { t: 'Que Claude arme flujos en tu n8n.', ok: 'remoto', por: 'El servidor MCP de n8n es remoto, por HTTP. Es el que conectamos en la práctica.' },
  { t: 'Un programa en tu computadora que consulta un servicio de internet y le pasa los datos a la IA.', ok: 'local', por: 'Lo que define el transporte es dónde corre el servidor, no adónde se conecta después. Este corre en tu máquina.' }
], [{ v: 'local', t: 'Local (stdio)' }, { v: 'remoto', t: 'Remoto (HTTP)' }]);

prueba('pruebaPrimitivas', [
  { t: 'Crear un issue en GitHub.', ok: 'tool', por: 'Es una acción, y el modelo decide cuándo hacerla: una herramienta.' },
  { t: 'El esquema de la base de datos, para que la IA sepa qué tablas hay.', ok: 'resource', por: 'Es contexto de sólo lectura que la aplicación decide adjuntar: un recurso.' },
  { t: '«/resumir-ventas-del-mes», que la persona elige del menú.', ok: 'prompt', por: 'Es una plantilla que elige el usuario, muchas veces como comando con barra: un prompt.' },
  { t: 'Mandar el newsletter de la semana.', ok: 'tool', por: 'Acción que cambia algo afuera: herramienta. Y de las que merecen confirmación humana.' },
  { t: 'El contenido de un documento de políticas de la empresa.', ok: 'resource', por: 'Contexto para leer, no modifica nada: recurso.' },
  { t: 'Una tarea armada con ejemplos de cómo consultar la base paso a paso.', ok: 'prompt', por: 'Una indicación reutilizable que expone el servidor: prompt.' }
], [{ v: 'tool', t: 'Tool' }, { v: 'resource', t: 'Resource' }, { v: 'prompt', t: 'Prompt' }]);


/* ══════════════════════════════════════════════════════════
   8 · LA ELICITACIÓN
   ══════════════════════════════════════════════════════════ */

(function elicitacion() {
  const $b = document.getElementById('eliBorrar');
  if (!$b) return;
  const $c = document.getElementById('eliCaja');
  $b.addEventListener('click', () => {
    $c.innerHTML = `
      <div class="paso-bucle humano">
        <span class="quien">El servidor le pide al cliente que te pregunte</span>
        <p>Estás por borrar <b>500 registros</b> de la tabla consultas. ¿Confirmás?</p>
        <div class="aprobar"><button type="button" class="si" data-e="si">Confirmo</button><button type="button" class="no" data-e="no">No</button></div>
      </div>`;
  });
  $c.addEventListener('click', e => {
    const b = e.target.closest('button[data-e]');
    if (!b) return;
    $c.innerHTML = b.dataset.e === 'si'
      ? '<div class="paso-bucle fin"><span class="quien">Confirmado</span><p>El servidor borra. La decisión la tomaste vos, no el modelo.</p></div>'
      : '<div class="paso-bucle freno"><span class="quien">Cancelado</span><p>El servidor no hace nada. El modelo se entera de que dijiste que no.</p></div>';
  });
})();


/* ══════════════════════════════════════════════════════════
   9 · n8n EN LOS DOS LADOS
   ══════════════════════════════════════════════════════════ */

(function dosLados() {
  const $g = document.getElementById('ladosOpc');
  if (!$g) return;
  const $mapa = document.getElementById('ladosMapa');
  const $txt = document.getElementById('ladosTxt');
  const FORMAS = {
    instancia: { lado: 'izq', t: '<b>n8n como servidor MCP de toda la instancia</b> — «una IA que arma el workflow». Le describís el flujo a Claude, ChatGPT o tu agente de código, y se conecta a tu n8n para buscarlo, armarlo, probarlo y ejecutarlo. Es la práctica de hoy.' },
    trigger: { lado: 'izq', t: '<b>n8n como servidor MCP de un workflow</b> — «alojar». Con el nodo MCP Server Trigger, un flujo expone sólo las herramientas que diseñaste adentro. La IA de afuera no ve nada más.' },
    tool: { lado: 'der', t: '<b>n8n como cliente, con MCP Client Tool</b> — «orquestar». Se enchufa al AI Agent de la clase 10: el agente descubre las herramientas de un servidor externo y decide cuándo usarlas.' },
    client: { lado: 'der', t: '<b>n8n como cliente, con MCP Client</b> — un paso fijo del flujo que llama siempre a la misma herramienta de un servidor externo. No decide nadie: lo decidiste vos al dibujar el flujo.' }
  };
  $g.addEventListener('click', e => {
    const b = e.target.closest('button[data-f]');
    if (!b) return;
    marcar($g, b);
    const f = FORMAS[b.dataset.f];
    $mapa.dataset.lado = f.lado;
    $txt.innerHTML = `<p>${f.t}</p>`;
  });
  $g.querySelector('button').click();
})();


/* ══════════════════════════════════════════════════════════
   10 · TU LISTA, CONTRA LOS FRENOS
   ══════════════════════════════════════════════════════════ */

(function frenos() {
  const $l = document.getElementById('frenosLista');
  if (!$l) return;
  const FRENOS = [
    { v: '', t: 'Elegí un freno…' },
    { v: 'minimo', t: 'Mínimo acceso: no habilitar ese flujo o esa herramienta' },
    { v: 'confianza', t: 'Sólo servidores de fuentes confiables' },
    { v: 'humano', t: 'Confirmación humana antes de hacerlo' },
    { v: 'credencial', t: 'Credenciales en n8n, nunca a la vista' }
  ];
  const propia = leerGuardado('clase12-q2');
  const ejemplos = ['Publicar un flujo sin que yo lo mire', 'Ver o copiar las credenciales', 'Borrar flujos o ejecuciones', 'Mandar mensajes a clientes', 'Leer el flujo de sueldos'];
  const lineas = (propia ? propia.split('\n') : ejemplos).map(l => l.replace(/^\s*\d+[.)-]\s*/, '').trim()).filter(Boolean).slice(0, 8);
  document.getElementById('frenosOrigen').textContent = propia
    ? 'Tu lista de la clase 12:'
    : 'No encontré tu lista de la clase 12. Te dejo una de ejemplo:';
  const elegido = (() => { try { return JSON.parse(leerGuardado('clase13-frenos') || '{}'); } catch (e) { return {}; } })();
  $l.innerHTML = lineas.map((l, i) => `
    <div class="freno-fila">
      <span>${escapar(l)}</span>
      <select data-i="${i}" aria-label="Freno para: ${escapar(l)}">${FRENOS.map(f => `<option value="${f.v}"${elegido[l] === f.v ? ' selected' : ''}>${f.t}</option>`).join('')}</select>
    </div>`).join('');
  $l.addEventListener('change', e => {
    const s = e.target.closest('select');
    if (!s) return;
    elegido[lineas[+s.dataset.i]] = s.value;
    guardar('clase13-frenos', JSON.stringify(elegido));
  });
})();


/* ══════════════════════════════════════════════════════════
   11 · LA PRÁCTICA
   ══════════════════════════════════════════════════════════ */

const CONEXION = {
 "codex": {
  "nombre": "Codex",
  "pasos": [
   {
    "texto": "Con OAuth, lo recomendado. El segundo comando abre el navegador para que autorices:"
   },
   {
    "codigo": "codex mcp add n8n --url \"@@URL@@\"\ncodex mcp login n8n"
   },
   {
    "texto": "Con un token personal, en el archivo <code>~/.codex/config.toml</code> de tu usuario:"
   },
   {
    "codigo": "[mcp_servers.n8n-mcp]\nurl = \"@@URL@@\"\nhttp_headers = { \"authorization\" = \"Bearer <TU_TOKEN_MCP_DE_N8N>\" }"
   }
  ],
  "nota": "Comandos publicados por n8n en su documentación. Verificado el 21 de octubre de 2026."
 },
 "claude": {
  "nombre": "Claude Code",
  "pasos": [
   {
    "texto": "Con OAuth, lo recomendado:"
   },
   {
    "codigo": "claude mcp add --transport http n8n @@URL@@"
   },
   {
    "texto": "Después, adentro de Claude Code, escribí <code>/mcp</code>, elegí <b>n8n</b> y autorizá en el navegador. Con un token personal:"
   },
   {
    "codigo": "claude mcp add --transport http n8n-mcp @@URL@@ --header \"Authorization: Bearer <TU_TOKEN_MCP_DE_N8N>\""
   }
  ],
  "nota": "Comandos publicados por n8n en su documentación. Verificado el 21 de octubre de 2026."
 },
 "opencode": {
  "nombre": "OpenCode",
  "pasos": [
   {
    "texto": "OpenCode 2 intenta OAuth por su cuenta con los servidores remotos: la primera vez abre el navegador para que autorices."
   },
   {
    "codigo": "opencode mcp add n8n --url @@URL@@"
   },
   {
    "texto": "Para usar un token en lugar de OAuth, la configuración está en la sección de servidores MCP remotos de la documentación de OpenCode."
   }
  ],
  "nota": "n8n no publica instrucciones para OpenCode: el comando sale de la documentación de OpenCode 2. Verificado el 21 de octubre de 2026."
 }
};

(function practica() {
  const $tabs = document.getElementById('conTabs');
  if (!$tabs) return;
  const $con = document.getElementById('conTexto');
  const $url = document.getElementById('conUrl');
  const valorUrl = () => ($url.value.trim() || 'https://TU-INSTANCIA/mcp-server/http');
  let actual = Object.keys(CONEXION)[0];

  function pintar() {
    const c = CONEXION[actual];
    $con.innerHTML = c.pasos.map(p => p.codigo
      ? `<pre class="codigo">${escapar(p.codigo.replace(/@@URL@@/g, valorUrl()))}</pre>`
      : `<p>${p.texto}</p>`).join('') + (c.nota ? `<p class="nota-pie">${c.nota}</p>` : '');
  }
  $tabs.innerHTML = Object.entries(CONEXION).map(([k, c], i) => `<button type="button" data-k="${k}" aria-pressed="${i === 0}">${c.nombre}</button>`).join('');
  $tabs.addEventListener('click', e => {
    const b = e.target.closest('button[data-k]');
    if (!b) return;
    actual = b.dataset.k;
    marcar($tabs, b);
    pintar();
  });
  $url.addEventListener('input', pintar);
  pintar();

  // Los tres prompts. El tercero lleva el nombre de la credencial de modelo
  // de cada uno: la página no elige proveedor.
  const $cred = document.getElementById('prCred');
  function prompt3() {
    const cred = $cred.value.trim() || 'Modelo - Clase MCP';
    document.getElementById('prompt3').textContent = document.getElementById('prompt3').dataset.base.replace(/@@CRED@@/g, cred);
  }
  const $p3 = document.getElementById('prompt3');
  $p3.dataset.base = $p3.textContent;
  $cred.addEventListener('input', prompt3);
  prompt3();
  document.querySelectorAll('[data-copiar]').forEach(b => b.addEventListener('click', () => copiar(document.getElementById(b.dataset.copiar).textContent, b)));

  // Lo que hay que mirar en cada respuesta. Se recuerda en este dispositivo.
  const marcas = (() => { try { return JSON.parse(leerGuardado('clase13-practica') || '{}'); } catch (e) { return {}; } })();
  document.querySelectorAll('.chequeo input[type="checkbox"]').forEach(ch => {
    ch.checked = !!marcas[ch.id];
    ch.addEventListener('change', () => { marcas[ch.id] = ch.checked; guardar('clase13-practica', JSON.stringify(marcas)); });
  });
})();


/* ══════════════════════════════════════════════════════════
   12 · ¿QUÉ NODO USO?
   ══════════════════════════════════════════════════════════ */

(function decisor() {
  const $d = document.getElementById('nodoDecisor');
  if (!$d) return;
  const $v = document.getElementById('nodoVeredicto');
  const r = {};
  const VEREDICTOS = {
    trigger: { cual: 'MCP Server Trigger', p: 'Una IA de afuera tiene que usar herramientas que armás en n8n. El flujo se vuelve un servidor MCP y la IA sólo ve lo que colgaste del disparador. Con autenticación, siempre.' },
    instancia: { cual: 'El servidor MCP de la instancia', p: 'Querés que una IA vea, arme o edite flujos. No hace falta ningún nodo: se habilita en la configuración, y después flujo por flujo.' },
    client: { cual: 'MCP Client', p: 'Sabés de antemano qué hay que hacer. Un paso fijo del flujo llama siempre a la misma herramienta, como un HTTP Request. Predecible.' },
    nativo: { cual: 'El nodo nativo, como herramienta del agente', p: 'n8n ya tiene un nodo que hace lo que necesitás. Lo construye y lo mantiene n8n, decidís operación por operación y las credenciales quedan en n8n. Es lo más estable.' },
    tool: { cual: 'MCP Client Tool', p: 'Depende de lo que pida la persona y no hay un nodo nativo que alcance, o querés usar tu propio servidor MCP. Un solo nodo le da al agente las herramientas del servidor: filtrá las que no necesita.' }
  };
  function decidir() {
    let v = null;
    if (r.quien === 'afuera') v = r.que === 'flujos' ? 'instancia' : r.que === 'herr' ? 'trigger' : null;
    else if (r.quien === 'n8n') v = r.cuando === 'fijo' ? 'client' : r.cuando === 'depende' ? (r.nativo === 'si' ? 'nativo' : r.nativo === 'no' ? 'tool' : null) : null;
    $d.querySelectorAll('[data-si]').forEach(el => {
      const [k, val] = el.dataset.si.split('=');
      el.hidden = r[k] !== val;
    });
    $v.hidden = !v;
    if (v) $v.innerHTML = `<div class="cual">${VEREDICTOS[v].cual}</div><p>${VEREDICTOS[v].p}</p>`;
  }
  $d.addEventListener('click', e => {
    const b = e.target.closest('button[data-k]');
    if (!b) return;
    r[b.dataset.k] = b.dataset.v;
    if (b.dataset.k === 'quien') { delete r.que; delete r.cuando; delete r.nativo; }
    if (b.dataset.k === 'cuando') delete r.nativo;
    $d.querySelectorAll(`button[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    $d.querySelectorAll('button').forEach(x => { if (!(x.dataset.k in r)) x.setAttribute('aria-pressed', 'false'); });
    decidir();
  });
  decidir();
})();


/* ══════════════════════════════════════════════════════════
   13 · ACTIVIDAD
   ══════════════════════════════════════════════════════════ */

(function actividad() {
  const campos = ['q1', 'q2'];
  const $aviso = document.getElementById('guardado');
  if (!document.getElementById('q1')) return;
  campos.forEach(id => {
    const el = document.getElementById(id);
    el.value = leerGuardado('clase13-' + id);
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (guardar('clase13-' + id, el.value)) {
          const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
          $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
        } else {
          $aviso.textContent = 'No pude guardar: el navegador tiene bloqueado el almacenamiento.';
        }
      }, 500);
    });
  });
  if (campos.some(id => leerGuardado('clase13-' + id))) $aviso.textContent = 'Recuperado de tu última visita.';
})();


/* ══════════════════════════════════════════════════════════
   14 · REVELADO AL SCROLL
   ══════════════════════════════════════════════════════════ */

if (!reducido && 'IntersectionObserver' in window) {
  const ojo = new IntersectionObserver(entradas => {
    entradas.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); ojo.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.revelar').forEach(s => ojo.observe(s));
} else {
  document.querySelectorAll('.revelar').forEach(s => s.classList.add('visible'));
}
