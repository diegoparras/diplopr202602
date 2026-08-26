/* Clase 4 — Anatomía de un workflow: nodos, ítems y datos que viajan
   Seis piezas: los errores heredados de la clase 3, el panel de tres vistas,
   la tabla de tipos evaluada de verdad, el caudal en 3D, el mapeador de
   expresiones y la actividad. */

exigirSesion();
document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const claro = () => (window.temaActual && window.temaActual() === 'claro');


/* ══════════════════════════════════════════════════════════
   1 · LOS ERRORES QUE QUEDARON DEL VIERNES
   Los mismos mensajes del laboratorio de la clase 3, ahora con el
   bloque de hoy donde se explica cada uno.
   ══════════════════════════════════════════════════════════ */

const HEREDADOS = [
  { error: 'Could not find field "monto_total" in input item',
    texto: 'El campo no falta: se llama distinto. En la salida anterior puede figurar como Monto, monto o estar adentro de otro objeto. Se resuelve mirando la estructura real del ítem antes de escribir la expresión.',
    donde: 'Se explica en el bloque siguiente' },
  { error: 'Wrong type: "75000" is a string but was expecting a number',
    texto: 'El valor se ve numérico y es texto. La planilla no manda tipos, manda celdas, y una celda con formato de moneda llega entre comillas.',
    donde: 'Se explica en el bloque de tipos' },
  { error: 'ExpressionError: Cannot read properties of undefined (reading "email")',
    texto: 'La expresión buscó un ítem que en esa corrida no existía. Casi siempre es porque en el medio hubo un nodo que cambió la cantidad de ítems y el rastro entre entrada y salida se cortó.',
    donde: 'Se explica en el bloque de emparejamiento' }
];

(function heredados() {
  const cont = document.getElementById('heredado');
  if (!cont) return;
  cont.innerHTML = HEREDADOS.map(h => `
    <div class="heredado-item">
      <pre>${h.error.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      <p>${h.texto}</p>
      <span class="donde">${h.donde}</span>
    </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   2 · EL PANEL DE TRES VISTAS
   Los mismos tres ítems como tabla, como JSON y como esquema.
   El Monto viene mezclado a propósito: dos textos y un número.
   ══════════════════════════════════════════════════════════ */

const ITEMS = [
  { Pedido: '1044', Cliente: 'Sofía Ramírez', Email: 'sofia.ramirez@correo.com',
    Cantidad: 2, Producto: 'Buzo oversize', Monto: 18000,
    Canal: 'MercadoLibre', Pago: 'MercadoLibre', Procesado: '' },
  { Pedido: '1045', Cliente: 'Nahuel Ortiz', Email: 'nahuel.ortiz@correo.com',
    Cantidad: 1, Producto: 'Campera de gabardina', Monto: '67000',
    Canal: 'Instagram', Pago: 'Transferencia', Procesado: '' },
  { Pedido: '1046', Cliente: 'Carla Benítez', Email: 'carla.benitez@correo.com',
    Cantidad: 3, Producto: 'Remera lisa', Monto: '$84.000',
    Canal: 'Feria de diseño', Pago: 'transferencia', Procesado: '' }
];

const CAMPOS = Object.keys(ITEMS[0]);

const NOTAS_CAMPO = {
  Monto: 'Ojo: en dos de los tres ítems llega como texto. Compararlo contra un número sin convertirlo es el segundo error del viernes.',
  Pago: 'La comparación de texto distingue mayúsculas. El tercer ítem dice transferencia con minúscula y no coincide con "Transferencia".',
  Procesado: 'Está vacío en los tres. Es el campo que mira el filtro del caso de hoy para saber qué queda pendiente.',
  Cantidad: 'Llega como número en los tres, porque la columna no tiene formato.'
};

(function panelDatos() {
  const cuerpo = document.getElementById('panelCuerpo');
  const $cuenta = document.getElementById('panelCuenta');
  const $lupa = document.getElementById('lupa');
  if (!cuerpo) return;

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  $cuenta.textContent = `${ITEMS.length} ítems · salida de "Leer la planilla"`;

  function tipoDe(v) {
    if (v === '') return 'vacío';
    return typeof v === 'number' ? 'número' : 'texto';
  }

  function vistaTabla() {
    const enc = CAMPOS.map(c => `<th data-campo="${c}" title="Tocar para ver la expresión">${c}</th>`).join('');
    const filas = ITEMS.map(it => '<tr>' + CAMPOS.map(c => {
      const v = it[c];
      return `<td class="${v === '' ? 'vacio' : ''}">${v === '' ? '—' : esc(v)}</td>`;
    }).join('') + '</tr>').join('');
    return `<table class="datos"><thead><tr>${enc}</tr></thead><tbody>${filas}</tbody></table>`;
  }

  function vistaJson() {
    const cuerpoJson = ITEMS.map(it => {
      const campos = CAMPOS.map(c => {
        const v = it[c];
        const val = typeof v === 'number'
          ? `<span class="numero">${v}</span>`
          : `<span class="texto">"${esc(v)}"</span>`;
        return `      <span class="clave">"${c}"</span>: ${val}`;
      }).join(',\n');
      return `  {\n    "json": {\n${campos}\n    },\n    "binary": {}\n  }`;
    }).join(',\n');
    return `<pre class="json">[\n${cuerpoJson}\n]</pre>`;
  }

  function vistaEsquema() {
    const filas = CAMPOS.map(c => {
      const tipos = [...new Set(ITEMS.map(it => tipoDe(it[c])))];
      const mixto = tipos.length > 1;
      const ej = ITEMS.map(it => (it[c] === '' ? '—' : it[c])).join(' · ');
      return `<div class="esquema-fila">
        <b data-campo="${c}" style="cursor:pointer">${c}</b>
        <span class="tipo ${mixto ? 'mixto' : ''}">${tipos.join(' y ')}</span>
        <span class="ej">${esc(ej)}</span>
      </div>`;
    }).join('');
    return `<div class="esquema">${filas}</div>`;
  }

  const VISTAS = { tabla: vistaTabla, json: vistaJson, esquema: vistaEsquema };

  function pintar(v) {
    cuerpo.innerHTML = VISTAS[v]();
    cuerpo.querySelectorAll('[data-campo]').forEach(el => {
      el.addEventListener('click', () => mirar(el.dataset.campo));
    });
  }

  function mirar(campo) {
    const tipos = [...new Set(ITEMS.map(it => tipoDe(it[campo])))];
    const nota = NOTAS_CAMPO[campo] || 'Se nombra igual desde cualquier nodo que reciba este ítem.';
    $lupa.innerHTML = `{{ $json.${campo} }} &nbsp;·&nbsp; también {{ $json['${campo}'] }}
      <small>Tipo: ${tipos.join(' y ')}. ${nota}</small>`;
  }

  document.querySelectorAll('.panel-barra button').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.panel-barra button').forEach(x => x.classList.remove('viva'));
      b.classList.add('viva');
      pintar(b.dataset.vista);
    });
  });

  pintar('tabla');
})();


/* ══════════════════════════════════════════════════════════
   3 · LA TABLA DE TIPOS
   Las comparaciones se evalúan acá, no están escritas a mano.
   ══════════════════════════════════════════════════════════ */

const CELDAS = [
  { celda: '18000',    valor: 18000 },
  { celda: '75000',    valor: '75000' },
  { celda: '$84.000',  valor: '$84.000' },
  { celda: '84.000',   valor: '84.000' }
];

const TEXTOS = [
  { celda: 'Transferencia',  valor: 'Transferencia' },
  { celda: 'transferencia',  valor: 'transferencia' },
  { celda: 'Transferencia ', valor: 'Transferencia ' }
];

(function tablaTipos() {
  const cont = document.getElementById('tipos');
  if (!cont) return;

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const marca = ok => `<span class="res ${ok ? 'si' : 'no'}">${ok ? 'verdadero' : 'falso'}</span>`;

  let html = `<div class="tipos-fila"><span>Lo que hay en la celda</span><span>Cómo llega al nodo</span><span>Monto &gt; 50000</span></div>`;

  CELDAS.forEach(c => {
    const n = Number(c.valor);
    const llega = typeof c.valor === 'number'
      ? `${c.valor} · número`
      : `"${esc(c.valor)}" · texto`;
    const res = n > 50000;
    const detalle = Number.isNaN(n) ? '<span class="res no">falso, y sin aviso</span>' : marca(res);
    html += `<div class="tipos-fila"><span class="val">${esc(c.celda)}</span><span>${llega}</span>${detalle}</div>`;
  });

  html += `<div class="tipos-fila"><span>Lo que hay en la celda</span><span>Cómo llega al nodo</span><span>Pago = "Transferencia"</span></div>`;

  TEXTOS.forEach(t => {
    const ok = t.valor === 'Transferencia';
    const visible = t.celda.endsWith(' ') ? t.celda.trimEnd() + ' ␣' : t.celda;
    html += `<div class="tipos-fila"><span class="val">${esc(visible)}</span><span>"${esc(t.valor)}" · texto</span>${marca(ok)}</div>`;
  });

  cont.innerHTML = html;
})();


/* ══════════════════════════════════════════════════════════
   4 · EL CAUDAL EN 3D
   Cinco nodos en línea. La cantidad de ítems cambia en cada tramo
   y las esferas se multiplican con la perilla.
   ══════════════════════════════════════════════════════════ */

const MAX_ITEMS = 48;
const PROP_PENDIENTES = 0.6;   // seis de cada diez filas están sin procesar
const PROP_ALTOS = 0.2;        // dos de cada diez pendientes hay que revisar

const NODOS = [
  { id: 'leer', nombre: 'Leer la planilla', tipo: 'Lectura', pos: [-13, 0, 0], forma: 'caja',
    osc: 0xF97316, cla: 0xDD5F0B,
    texto: 'Recibe un solo ítem del disparador y devuelve uno por fila. Es el nodo que convierte una corrida en muchos ítems.' },
  { id: 'filtrar', nombre: 'Quedarse con los pendientes', tipo: 'Filtro', pos: [-6.5, 0, 0], forma: 'caja',
    osc: 0xFBBF24, cla: 0xB45309,
    texto: 'Deja pasar los ítems que tienen Procesado vacío y descarta el resto. Filtrar saca ítems de la lista, no elige un camino.' },
  { id: 'confirmar', nombre: 'Confirmar al cliente', tipo: 'Acción', pos: [0, 0, 0], forma: 'caja',
    osc: 0xFBBF24, cla: 0xB45309,
    texto: 'Se ejecuta una vez por ítem. Con veinticuatro pendientes salen veinticuatro correos, y sigue siendo una sola ejecución.' },
  { id: 'condicion', nombre: 'Alto y por transferencia', tipo: 'Condición', pos: [6.5, 0, 0], forma: 'rombo',
    osc: 0x22D3EE, cla: 0x0E7490,
    texto: 'Evalúa una vez por ítem y parte la lista en dos montones. Los que dan falso se detienen acá, sin error y sin aviso.' },
  { id: 'resumen', nombre: 'Juntar en un resumen', tipo: 'Agrupación', pos: [13, 0, 0], forma: 'caja',
    osc: 0xA78BFA, cla: 0x6D28D9,
    texto: 'Recibe muchos ítems y devuelve uno solo con la lista adentro. Acá se corta el rastro: después de este nodo, .item ya no sabe a cuál referirse.' }
];

const ARISTAS = [
  { a: 'leer', b: 'filtrar', rot: 'Leer → Filtro' },
  { a: 'filtrar', b: 'confirmar', rot: 'Filtro → Correo' },
  { a: 'confirmar', b: 'condicion', rot: 'Correo → Condición' },
  { a: 'condicion', b: 'resumen', rot: 'Condición → Resumen' }
];

function cuentas(filas) {
  const pendientes = Math.max(1, Math.round(filas * PROP_PENDIENTES));
  const altos = Math.round(pendientes * PROP_ALTOS);
  return { filas, pendientes, altos };
}

function cuentaDeArista(i, c) {
  return [c.filas, c.pendientes, c.pendientes, c.altos][i];
}

(function caudal() {
  const lienzo = document.getElementById('lienzoFlujo');
  const caja = document.getElementById('flujo3d');
  const $rango = document.getElementById('filas');
  const $val = document.getElementById('filasVal');
  const $cinta = document.getElementById('cinta');
  const $total = document.getElementById('cintaTotal');
  if (!lienzo || !$rango) return;

  const $n = document.getElementById('flujoN');
  const $t = document.getElementById('flujoTitulo');
  const $x = document.getElementById('flujoTexto');

  /* ── La cinta de números, que funciona con 3D o sin él ── */
  function pintarCinta() {
    const c = cuentas(Number($rango.value));
    $val.textContent = c.filas;
    $cinta.innerHTML = ARISTAS.map((ar, i) => {
      const n = cuentaDeArista(i, c);
      return `<div class="cinta-fila"><span>${ar.rot}</span><b>${n} ${n === 1 ? 'ítem' : 'ítems'}</b></div>`;
    }).join('') +
      `<div class="cinta-fila"><span>Resumen → Valentina</span><b>1 ítem</b></div>`;
    $total.textContent =
      `${c.filas} filas leídas, ${c.pendientes} pendientes, ${c.pendientes} correos, ` +
      `${c.altos} ${c.altos === 1 ? 'pedido apartado' : 'pedidos apartados'} en un solo mensaje y ` +
      `${c.pendientes} filas marcadas. Todo eso es una ejecución.`;
  }
  $rango.addEventListener('input', pintarCinta);
  pintarCinta();

  if (!window.THREE) {
    caja.style.height = 'auto';
    lienzo.remove();
    caja.querySelector('.flujo-pista').remove();
    const panel = document.getElementById('flujoPanel');
    panel.style.position = 'static';
    panel.style.maxWidth = 'none';
    $n.textContent = 'Sin gráfico';
    $t.textContent = 'El caudal no se pudo dibujar acá';
    $x.textContent = 'La biblioteca de dibujo no cargó. Los números de abajo dicen lo mismo y la perilla sigue andando.';
    return;
  }

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
  camara.position.set(0, 2, 38);
  camara.lookAt(0, 0, 0);

  const render = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, alpha: true });
  render.setClearColor(0x000000, 0);

  escena.add(new THREE.AmbientLight(0xffffff, 0.62));
  const luz = new THREE.DirectionalLight(0xffffff, 0.85);
  luz.position.set(5, 10, 12);
  escena.add(luz);

  const grupo = new THREE.Group();
  escena.add(grupo);

  const color = n => (claro() ? n.cla : n.osc);
  const posDe = {};
  NODOS.forEach(n => posDe[n.id] = new THREE.Vector3(...n.pos));

  const cuerpos = {};
  NODOS.forEach(n => {
    const g = n.forma === 'rombo'
      ? new THREE.OctahedronGeometry(2.1)
      : new THREE.BoxGeometry(4.6, 2, 1);
    const m = new THREE.MeshStandardMaterial({
      color: color(n), roughness: 0.5, metalness: 0.12, transparent: true, opacity: 0.94
    });
    const malla = new THREE.Mesh(g, m);
    malla.position.copy(posDe[n.id]);
    if (n.forma === 'rombo') malla.scale.set(1.35, 0.95, 0.5);
    malla.userData.id = n.id;
    grupo.add(malla);

    const bordes = new THREE.LineSegments(
      new THREE.EdgesGeometry(g),
      new THREE.LineBasicMaterial({
        color: new THREE.Color(window.token('arista')),
        transparent: true, opacity: parseFloat(window.token('arista-op'))
      })
    );
    bordes.position.copy(malla.position);
    bordes.scale.copy(malla.scale);
    grupo.add(bordes);

    cuerpos[n.id] = { def: n, malla, bordes, base: posDe[n.id].clone() };
  });

  /* Aristas y su chorro de ítems */
  const tramos = ARISTAS.map((ar, i) => {
    const A = posDe[ar.a], B = posDe[ar.b];
    const geo = new THREE.BufferGeometry().setFromPoints([A, B]);
    const linea = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: new THREE.Color(window.token('naranja')), transparent: true, opacity: 0.28
    }));
    grupo.add(linea);

    // Un solo material y una sola geometría para las 48 esferas del tramo.
    const geoIt = new THREE.SphereGeometry(0.21, 10, 10);
    const matIt = new THREE.MeshBasicMaterial({
      color: new THREE.Color(window.token('naranja')), transparent: true, opacity: 0.9
    });
    const esferas = [];
    for (let k = 0; k < MAX_ITEMS; k++) {
      const s = new THREE.Mesh(geoIt, matIt);
      // Dispersión determinista: el chorro tiene grosor, no es una fila india.
      const ang = (k * 2.399963) % (Math.PI * 2);
      const rad = 0.28 + ((k * 37) % 100) / 100 * 0.72;
      s.userData.oy = Math.cos(ang) * rad;
      s.userData.oz = Math.sin(ang) * rad;
      s.userData.t0 = ((k * 61) % MAX_ITEMS) / MAX_ITEMS;
      s.visible = false;
      grupo.add(s);
      esferas.push(s);
    }
    return { i, ar, A, B, linea, esferas, matIt };
  });

  function medir() {
    const w = caja.clientWidth, h = caja.clientHeight;
    render.setSize(w, h, false);
    render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
    camara.position.z = w < 620 ? 58 : 38;
  }
  medir();
  window.addEventListener('resize', medir);

  let girY = -0.24, girX = 0.22, arrastrando = false, ux = 0, uy = 0, movio = false;
  lienzo.addEventListener('pointerdown', e => {
    arrastrando = true; movio = false; ux = e.clientX; uy = e.clientY;
    lienzo.setPointerCapture(e.pointerId);
  });
  lienzo.addEventListener('pointermove', e => {
    if (!arrastrando) return;
    if (Math.abs(e.clientX - ux) + Math.abs(e.clientY - uy) > 3) movio = true;
    girY += (e.clientX - ux) * 0.006;
    girX = Math.max(-0.5, Math.min(0.8, girX + (e.clientY - uy) * 0.004));
    ux = e.clientX; uy = e.clientY;
  });

  const rayo = new THREE.Raycaster();
  const puntero = new THREE.Vector2();
  let elegido = null;

  lienzo.addEventListener('pointerup', e => {
    arrastrando = false;
    if (movio) return;
    const r = lienzo.getBoundingClientRect();
    puntero.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    puntero.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    rayo.setFromCamera(puntero, camara);
    const golpes = rayo.intersectObjects(Object.values(cuerpos).map(c => c.malla));
    elegirNodo(golpes.length ? golpes[0].object.userData.id : null);
  });

  function elegirNodo(id) {
    elegido = id;
    if (!id) {
      const c = cuentas(Number($rango.value));
      $n.textContent = 'El caudal';
      $t.textContent = 'Cinco nodos, un solo disparo';
      $x.textContent = `Con ${c.filas} filas en la planilla entran ${c.pendientes} ítems al correo y llegan ${c.altos} al resumen. Tocá un nodo para ver qué le hace al caudal.`;
      return;
    }
    const n = cuerpos[id].def;
    $n.textContent = n.tipo;
    $t.textContent = n.nombre;
    $x.textContent = n.texto;
  }
  $rango.addEventListener('input', () => { if (!elegido) elegirNodo(null); });

  const reloj = new THREE.Clock();

  function animar() {
    requestAnimationFrame(animar);
    const dt = reloj.getDelta();
    if (!arrastrando && !reducido) girY += 0.0014;

    const c = cuentas(Number($rango.value));

    NODOS.forEach(n => {
      const cu = cuerpos[n.id];
      const foco = elegido === n.id;
      cu.malla.material.opacity += ((foco ? 1 : 0.94) - cu.malla.material.opacity) * 0.12;
      cu.malla.position.z += ((cu.base.z + (foco ? 1.5 : 0)) - cu.malla.position.z) * 0.12;
      cu.bordes.position.copy(cu.malla.position);
    });

    tramos.forEach(tr => {
      const cuantos = Math.min(MAX_ITEMS, cuentaDeArista(tr.i, c));
      tr.esferas.forEach((s, k) => {
        if (k >= cuantos) { s.visible = false; return; }
        s.visible = true;
        if (!reducido) s.userData.t0 = (s.userData.t0 + dt * 0.22) % 1;
        const t = s.userData.t0;
        s.position.copy(tr.A).lerp(tr.B, t);
        s.position.y += s.userData.oy;
        s.position.z += s.userData.oz;
      });
      tr.linea.material.opacity = cuantos > 0 ? 0.28 : 0.06;
    });

    grupo.rotation.y = girY;
    grupo.rotation.x = girX;
    render.render(escena, camara);
  }
  animar();

  window.addEventListener('cambio-tema', () => {
    const arista = new THREE.Color(window.token('arista'));
    const naranja = new THREE.Color(window.token('naranja'));
    NODOS.forEach(n => {
      cuerpos[n.id].malla.material.color.set(color(n));
      cuerpos[n.id].bordes.material.color.copy(arista);
    });
    tramos.forEach(tr => {
      tr.linea.material.color.copy(naranja);
      tr.matIt.color.copy(naranja);
    });
  });

  elegirNodo(null);
})();


/* ══════════════════════════════════════════════════════════
   5 · EL MAPEADOR DE EXPRESIONES
   Cuatro casilleros. Se aceptan las formas equivalentes.
   ══════════════════════════════════════════════════════════ */

const CASILLEROS = [
  { nodo: 'Confirmar al cliente', contexto: 'Segundo nodo después del filtro',
    campo: 'Para',
    pedido: 'El correo del cliente, que viene en el ítem que está entrando a este nodo.',
    ok: ["$json.Email", "$('Leer la planilla').item.json.Email"],
    pista: 'Acá el ítem que entra es la fila de la planilla, así que sirve la forma corta.' },
  { nodo: 'Confirmar al cliente', contexto: 'Mismo nodo, otro casillero',
    campo: 'Asunto',
    pedido: 'El nombre del cliente, para armar el saludo.',
    ok: ["$json.Cliente", "$('Leer la planilla').item.json.Cliente"],
    pista: 'Mismo ítem que el casillero anterior. Cambia el campo, no la forma.' },
  { nodo: 'Alto y por transferencia', contexto: 'Después del nodo de Gmail',
    campo: 'Valor a comparar',
    pedido: 'El monto del pedido. Cuidado: el nodo anterior ya no es la planilla.',
    ok: ["$('Leer la planilla').item.json.Monto"],
    pista: 'Después de Gmail, $json es la respuesta de Gmail y no tiene ningún campo Monto. Hay que ir a buscarlo al nodo por su nombre.' },
  { nodo: 'Alto y por transferencia', contexto: 'Segunda condición del mismo nodo',
    campo: 'Forma de pago',
    pedido: 'El campo Pago del mismo pedido.',
    ok: ["$('Leer la planilla').item.json.Pago"],
    pista: 'Igual que el anterior. El nombre del nodo va tal cual figura en el lienzo, entre comillas.' }
];

function normalizar(s) {
  return String(s)
    .trim()
    .replace(/^\{\{/, '').replace(/\}\}$/, '')
    .replace(/\[\s*["']([^"']+)["']\s*\]/g, '.$1')   // ['Email'] pasa a .Email
    .replace(/\$\(\s*"([^"]+)"\s*\)/g, "$('$1')")     // comillas dobles pasan a simples
    .replace(/\s+/g, '');
}

(function mapeador() {
  const cont = document.getElementById('mapeador');
  const $marcador = document.getElementById('marcadorMapa');
  if (!cont) return;

  const resueltos = new Set();

  CASILLEROS.forEach((c, i) => {
    const caja = document.createElement('div');
    caja.className = 'casillero';
    caja.innerHTML = `
      <span class="contexto">${c.contexto}</span>
      <h4>${c.nodo} · casillero "${c.campo}"</h4>
      <p class="pedido">${c.pedido}</p>
      <div class="linea">
        <input type="text" spellcheck="false" autocomplete="off"
               placeholder="{{ … }}" aria-label="Expresión para ${c.campo}">
        <button type="button">Probar</button>
      </div>
      <div class="dictamen"></div>`;

    const $inp = caja.querySelector('input');
    const $bot = caja.querySelector('button');
    const $dic = caja.querySelector('.dictamen');

    function probar() {
      if (resueltos.has(i)) return;
      const escrito = normalizar($inp.value);
      if (!escrito) { $dic.textContent = 'Escribí la expresión antes de probar.'; return; }
      const acerto = c.ok.some(o => normalizar(o) === escrito);
      caja.classList.remove('bien', 'mal');
      if (acerto) {
        caja.classList.add('bien');
        resueltos.add(i);
        $dic.textContent = 'Correcta. ' + c.pista;
        $inp.readOnly = true;
        $bot.disabled = true;
        marcar();
      } else {
        caja.classList.add('mal');
        $dic.textContent = 'Todavía no. ' + c.pista;
      }
    }

    $bot.addEventListener('click', probar);
    $inp.addEventListener('keydown', e => { if (e.key === 'Enter') probar(); });
    cont.appendChild(caja);
  });

  function marcar() {
    $marcador.textContent = resueltos.size < CASILLEROS.length
      ? `${resueltos.size} de ${CASILLEROS.length} casilleros`
      : `${CASILLEROS.length} de ${CASILLEROS.length}. Los dos primeros usan la forma corta y los dos últimos la larga, y la diferencia es un solo nodo de Gmail en el medio.`;
  }
  marcar();
})();


/* ══════════════════════════════════════════════════════════
   6 · CARDINALIDAD
   Tres diagramas en SVG, pintados con los tokens del tema.
   ══════════════════════════════════════════════════════════ */

const FORMAS = [
  { titulo: 'Uno a uno', entra: 4, sale: 4,
    texto: 'Lo que hace casi todo: un correo por pedido, una fila actualizada por pedido. La cantidad no cambia y el rastro entre entrada y salida queda intacto.' },
  { titulo: 'Uno a muchos', entra: 1, sale: 5,
    texto: 'Un ítem con una lista adentro se abre en un ítem por elemento. Es lo que hace el nodo que lee la planilla, y lo que hace falta cuando una respuesta trae veinte resultados juntos.' },
  { titulo: 'Muchos a uno', entra: 5, sale: 1,
    texto: 'Muchos ítems se juntan en uno solo con la lista adentro. Es la diferencia entre cinco notificaciones sueltas y un resumen, y es donde se corta el rastro.' }
];

(function cardinalidad() {
  const cont = document.getElementById('cardi');
  if (!cont) return;

  function dibujar(f) {
    const W = 190, H = 110, r = 5.5;
    const col = (n, x) => {
      const paso = H / (n + 1);
      return Array.from({ length: n }, (_, i) =>
        `<circle cx="${x}" cy="${(i + 1) * paso}" r="${r}" fill="var(--naranja)" fill-opacity="0.85"/>`).join('');
    };
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${f.entra} ítems entran y ${f.sale} salen">
      <rect x="78" y="26" width="34" height="58" rx="9" fill="var(--sup2)" stroke="var(--linea)"/>
      <line x1="30" y1="55" x2="74" y2="55" stroke="var(--naranja)" stroke-opacity="0.35" stroke-width="1.5"/>
      <line x1="116" y1="55" x2="160" y2="55" stroke="var(--naranja)" stroke-opacity="0.35" stroke-width="1.5"/>
      ${col(f.entra, 22)}${col(f.sale, 168)}
    </svg>`;
  }

  cont.innerHTML = FORMAS.map(f => `
    <div class="cardi-fila">
      <div>${dibujar(f)}</div>
      <div>
        <h4>${f.titulo}</h4>
        <p>${f.texto}</p>
      </div>
    </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   7 · ACTIVIDAD
   ══════════════════════════════════════════════════════════ */

(function actividad() {
  const campos = ['q1', 'q2', 'q3'];
  const $aviso = document.getElementById('guardado');
  if (!document.getElementById('q1')) return;

  campos.forEach(id => {
    const el = document.getElementById(id);
    el.value = localStorage.getItem('clase04-' + id) || '';
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.setItem('clase04-' + id, el.value);
        const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
      }, 500);
    });
  });

  if (campos.some(id => localStorage.getItem('clase04-' + id))) {
    $aviso.textContent = 'Recuperado de tu última visita.';
  }
})();


/* ══════════════════════════════════════════════════════════
   8 · REVELADO AL SCROLL
   ══════════════════════════════════════════════════════════ */

if (!reducido && 'IntersectionObserver' in window) {
  const ojo = new IntersectionObserver(entradas => {
    entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); ojo.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('section.bloque > .envoltura').forEach(el => {
    el.classList.add('revelar');
    ojo.observe(el);
  });
}
