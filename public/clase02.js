/* Clase 2 — Pensamiento algorítmico: disparador, condición, acción
   Cinco piezas: el rescate de lo que quedó de la clase 1, el desarmador
   que genera pseudocódigo y arma el grafo en 3D, la mesa de prueba y
   el editor de algoritmo propio. */

exigirSesion();
document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const claro = () => (window.temaActual && window.temaActual() === 'claro');


/* ══════════════════════════════════════════════════════════
   1 · LO QUE QUEDÓ DE LA CLASE 1
   Los tres textos de la actividad anterior, si están.
   ══════════════════════════════════════════════════════════ */

(function loTraido() {
  const cont = document.getElementById('traido');
  if (!cont) return;

  const CAMPOS = [
    { id: 'clase01-p1', rot: 'El proceso, contado en desorden' },
    { id: 'clase01-p2', rot: 'Qué lo dispara' },
    { id: 'clase01-p3', rot: 'Dónde se decide algo' }
  ];

  const hay = CAMPOS.map(c => ({ ...c, texto: (localStorage.getItem(c.id) || '').trim() }))
                    .filter(c => c.texto);

  if (!hay.length) {
    cont.innerHTML = `<div class="traido-vacio">
      No hay nada guardado en este dispositivo de la actividad de la clase 1. Puede ser que la
      hayas hecho en otra computadora o que no llegaste a completarla. No pasa nada: más abajo,
      en la actividad de hoy, podés escribir el proceso y el algoritmo de una sola vez.</div>`;
    return;
  }

  cont.className = 'traido';
  cont.innerHTML = hay.map(c => `
    <div class="traido-item">
      <span class="rot">${c.rot}</span>
      <p></p>
    </div>`).join('');
  // El texto va por textContent para que nada de lo escrito se interprete como HTML.
  cont.querySelectorAll('.traido-item p').forEach((p, i) => { p.textContent = hay[i].texto; });
})();


/* ══════════════════════════════════════════════════════════
   2 · EL DESARMADOR
   Nueve frases del relato. Cada una bien etiquetada revela su línea
   de pseudocódigo y, si le corresponde, su nodo en el grafo.
   ══════════════════════════════════════════════════════════ */

const ROLES = [
  { r: 'disparador', et: 'Disparador' },
  { r: 'dato',       et: 'Dato' },
  { r: 'condicion',  et: 'Condición' },
  { r: 'accion',     et: 'Acción' },
  { r: 'ruido',      et: 'No entra' }
];

const FRASES = [
  { id: 'f1', r: 'disparador',
    t: 'Yo cargo la venta en la planilla y ahí tendría que arrancar todo.',
    razon: 'El evento que da comienzo. Hay uno solo por algoritmo y va siempre en la primera línea.' },
  { id: 'f2', r: 'dato',
    t: 'De cada venta anoto número, fecha, cliente, mail, cantidad, producto, monto, canal y forma de pago.',
    razon: 'Los campos que el disparador trae. Si un dato no está acá, ningún paso posterior lo puede usar.' },
  { id: 'f3', r: 'accion',
    t: 'Al cliente hay que confirmarle siempre, venga de donde venga.',
    razon: 'Acción incondicional. El "siempre" es la pista: no depende de ninguna pregunta.' },
  { id: 'f4', r: 'condicion',
    t: 'Lo que Tomás tiene que hacer cambia según por dónde entró el pedido.',
    razon: 'Un campo con varios valores posibles abre varios caminos. Es un SEGÚN, no un SI.' },
  { id: 'f5', r: 'accion',
    t: 'A Tomás le llega todo por Telegram, es lo único que mira.',
    razon: 'Acción, y además dice por dónde. El aviso existe en las tres ramas del SEGÚN, con texto distinto en cada una.' },
  { id: 'f6', r: 'condicion',
    t: 'Los pedidos grandes que me pagaron por transferencia los quiero revisar yo antes de que salgan.',
    razon: 'Dos preguntas unidas por Y: monto alto y forma de pago. Ninguna alcanza sola, y esa es la regla de negocio.' },
  { id: 'f7', r: 'accion',
    t: 'Cuando el pedido ya salió le pongo una marca en la planilla, si me acuerdo.',
    razon: 'Acción sobre el mismo origen que disparó el flujo. El "si me acuerdo" es justamente lo que se automatiza.' },
  { id: 'f8', r: 'ruido',
    t: 'Empecé en 2019 vendiendo remeras a las chicas de la facultad.',
    razon: 'Es cierto y no cambia una sola línea del algoritmo. Abstraer es animarse a descartar esto.' },
  { id: 'f9', r: 'ruido',
    t: 'Este mes vendí bastante más que el anterior, no sé si va a seguir así.',
    razon: 'Importa para el negocio y no para el proceso. Si mañana el volumen cambia, el algoritmo es el mismo.' }
];

// Las líneas del pseudocódigo, en orden fijo. Cada una aparece cuando
// están resueltas todas las frases de las que depende.
const LINEAS = [
  { de: ['f1'], ind: 0, txt: 'CUANDO se carga un pedido en la planilla:' },
  { de: ['f2'], ind: 1, txt: 'leer { Pedido, Fecha, Cliente, Email, Cantidad, Producto, Monto, Canal, Pago }' },
  { de: ['f3'], ind: 1, txt: 'enviar correo de confirmación a {Email}' },
  { de: ['f4'], ind: 1, txt: 'SEGÚN Canal:' },
  { de: ['f4', 'f5'], ind: 2, txt: 'MercadoLibre:  avisar a Tomás que imprima la etiqueta' },
  { de: ['f4', 'f5'], ind: 2, txt: 'Instagram:     avisar a Tomás que pida la dirección' },
  { de: ['f4', 'f5'], ind: 2, txt: 'otro:          avisar a Tomás que lo revise a mano' },
  { de: ['f6'], ind: 1, txt: 'SI Monto > 50000 Y Pago = "Transferencia":' },
  { de: ['f6'], ind: 2, txt: 'alertar a Valentina para que confirme el ingreso' },
  { de: ['f7'], ind: 1, txt: 'marcar la fila como Procesado con la fecha y la hora' },
  { de: ['f1'], ind: 0, txt: 'FIN' }
];

// Los nodos del grafo. `de` es la frase que los revela.
const NODOS = [
  { id: 'pedido',   de: 'f1', nombre: 'Nuevo pedido',        tipo: 'Disparador',
    pos: [-14, 0, 0], forma: 'caja', osc: 0xF97316, cla: 0xDD5F0B,
    texto: 'Vigila la planilla y arranca la corrida cuando aparece una fila nueva.' },
  { id: 'confirmar', de: 'f3', nombre: 'Confirmar al cliente', tipo: 'Acción',
    pos: [-6, 0, 0], forma: 'caja', osc: 0xFBBF24, cla: 0xB45309,
    texto: 'Manda el correo con los datos del pedido. Corre siempre, sin condición previa.' },
  { id: 'canal',    de: 'f4', nombre: 'Según el canal',       tipo: 'Condición de varios caminos',
    pos: [2, 5, 0], forma: 'rombo', osc: 0x22D3EE, cla: 0x0E7490,
    texto: 'Mira el campo Canal y elige una de tres salidas. La tercera es la de por defecto, para los valores que no previmos.' },
  { id: 'tomas',    de: 'f5', nombre: 'Avisar a Tomás',       tipo: 'Acción',
    pos: [11, 5, 0], forma: 'caja', osc: 0xFBBF24, cla: 0xB45309,
    texto: 'El aviso por Telegram al grupo de despacho, con el texto que corresponde a cada canal.' },
  { id: 'monto',    de: 'f6', nombre: 'Monto alto y transferencia', tipo: 'Condición compuesta',
    pos: [2, 0, 0], forma: 'rombo', osc: 0x22D3EE, cla: 0x0E7490,
    texto: 'Dos comparaciones unidas por Y. Las dos tienen que dar verdadero para que se abra la rama.' },
  { id: 'valen',    de: 'f6', nombre: 'Alertar a Valentina',  tipo: 'Acción condicionada',
    pos: [11, 0, 0], forma: 'caja', osc: 0xA78BFA, cla: 0x6D28D9,
    texto: 'La única rama que puede frenar un despacho. Se ejecuta solo si la condición dio verdadero.' },
  { id: 'marcar',   de: 'f7', nombre: 'Marcar como procesado', tipo: 'Acción',
    pos: [2, -5, 0], forma: 'caja', osc: 0xFBBF24, cla: 0xB45309,
    texto: 'Escribe la fecha y la hora en la misma fila que disparó el flujo. Cierra el círculo sobre el origen.' }
];

const ARISTAS = [
  ['pedido', 'confirmar'],
  ['confirmar', 'canal'],
  ['canal', 'tomas'],
  ['confirmar', 'monto'],
  ['monto', 'valen'],
  ['confirmar', 'marcar']
];

const resueltas = new Set();   // ids de frases correctamente etiquetadas
let mostrarDatos = false;      // se enciende al etiquetar la frase del dato
const oyentesGrafo = [];       // el grafo se suscribe a los cambios

(function desarmador() {
  const cont = document.getElementById('desarmador');
  const $marcador = document.getElementById('marcador');
  const $cuerpo = document.getElementById('pseudoCuerpo');
  const $estado = document.getElementById('pseudoEstado');
  if (!cont) return;

  function pintarPseudo() {
    const vistas = LINEAS.filter(l => l.de.every(f => resueltas.has(f)));
    $estado.textContent = `${vistas.length} de ${LINEAS.length} líneas`;
    $cuerpo.innerHTML = LINEAS.map(l => {
      const lista = l.de.every(f => resueltas.has(f));
      const sangria = '    '.repeat(l.ind);
      if (lista) return `<span class="ln">${sangria}${l.txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
      return `<span class="ln hueca">${sangria}${'·'.repeat(Math.min(46, Math.max(14, Math.round(l.txt.length / 1.6))))}</span>`;
    }).join('');
  }

  function actualizarMarcador() {
    const total = FRASES.length;
    if (resueltas.size < total) {
      $marcador.textContent = `${resueltas.size} de ${total} frases clasificadas`;
    } else {
      $marcador.textContent = `${total} de ${total}. Nueve frases entraron y quedaron diez líneas: dos se fueron por la ventana y una se abrió en tres. Eso es abstraer.`;
    }
  }

  FRASES.forEach(f => {
    const fila = document.createElement('div');
    fila.className = 'frag';
    const p = document.createElement('p');
    p.textContent = f.t;

    const botones = document.createElement('div');
    botones.className = 'frag-botones';
    ROLES.forEach(r => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.r = r.r;
      b.textContent = r.et;
      botones.appendChild(b);
    });

    const razon = document.createElement('div');
    razon.className = 'razon';

    fila.appendChild(p);
    fila.appendChild(botones);
    fila.appendChild(razon);

    botones.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        if (fila.classList.contains('bien')) return;
        const acerto = b.dataset.r === f.r;
        fila.classList.add('hablo');
        if (acerto) {
          fila.classList.remove('mal');
          fila.classList.add('bien');
          b.classList.add('elegida');
          razon.textContent = f.razon;
          resueltas.add(f.id);
          if (f.id === 'f2') mostrarDatos = true;
          pintarPseudo();
          actualizarMarcador();
          oyentesGrafo.forEach(fn => fn());
        } else {
          fila.classList.add('mal');
          b.classList.add('marcada');
          razon.textContent = 'Todavía no. Fijate si esa frase describe cuándo arranca algo, qué información trae, qué pregunta se hace o qué hace el proceso hacia afuera. Probá de nuevo.';
        }
      });
    });

    cont.appendChild(fila);
  });

  pintarPseudo();
  actualizarMarcador();
})();


/* ══════════════════════════════════════════════════════════
   3 · EL GRAFO QUE SE ARMA
   Los nodos aparecen a medida que las frases quedan clasificadas.
   ══════════════════════════════════════════════════════════ */

(function grafoEn3D() {
  const lienzo = document.getElementById('lienzoFlujo');
  const caja = document.getElementById('flujo3d');
  if (!lienzo || !caja) return;

  const $n = document.getElementById('flujoN');
  const $t = document.getElementById('flujoTitulo');
  const $x = document.getElementById('flujoTexto');

  if (!window.THREE) {
    caja.style.height = 'auto';
    caja.querySelector('canvas').remove();
    caja.querySelector('.flujo-pista').remove();
    const panel = document.getElementById('flujoPanel');
    panel.style.position = 'static';
    panel.style.maxWidth = 'none';
    $n.textContent = 'Sin gráfico';
    $t.textContent = 'El grafo no se pudo dibujar acá';
    $x.textContent = 'La biblioteca de dibujo no cargó. El pseudocódigo de arriba tiene toda la información igual.';
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
      ? new THREE.OctahedronGeometry(2.4)
      : new THREE.BoxGeometry(5.4, 2.2, 1.1);

    const m = new THREE.MeshStandardMaterial({
      color: color(n), roughness: 0.5, metalness: 0.12,
      transparent: true, opacity: 0
    });
    const malla = new THREE.Mesh(g, m);
    malla.position.copy(posDe[n.id]);
    if (n.forma === 'rombo') malla.scale.set(1.45, 0.95, 0.5);
    malla.userData.id = n.id;
    malla.visible = false;
    grupo.add(malla);

    const bordes = new THREE.LineSegments(
      new THREE.EdgesGeometry(g),
      new THREE.LineBasicMaterial({
        color: new THREE.Color(window.token('arista')),
        transparent: true, opacity: 0
      })
    );
    bordes.position.copy(malla.position);
    bordes.scale.copy(malla.scale);
    bordes.visible = false;
    grupo.add(bordes);

    cuerpos[n.id] = { def: n, malla, bordes, base: posDe[n.id].clone() };
  });

  const lineas = [];
  ARISTAS.forEach(([a, b]) => {
    const geo = new THREE.BufferGeometry().setFromPoints([posDe[a], posDe[b]]);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(window.token('naranja')), transparent: true, opacity: 0
    });
    const l = new THREE.Line(geo, mat);
    l.visible = false;
    grupo.add(l);
    lineas.push({ a, b, linea: l });
  });

  const items = [];
  ARISTAS.forEach(([a, b], i) => {
    const g = new THREE.SphereGeometry(0.34, 12, 12);
    const m = new THREE.MeshBasicMaterial({
      color: new THREE.Color(window.token('naranja')), transparent: true, opacity: 0
    });
    const s = new THREE.Mesh(g, m);
    s.visible = false;
    grupo.add(s);
    items.push({ a, b, malla: s, t: i * 0.17 });
  });

  const vive = id => resueltas.has(cuerpos[id].def.de);
  const aristaViva = (a, b) => vive(a) && vive(b);

  function medir() {
    const w = caja.clientWidth, h = caja.clientHeight;
    render.setSize(w, h, false);
    render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
    camara.position.z = w < 620 ? 52 : 38;
  }
  medir();
  window.addEventListener('resize', medir);

  let girY = -0.3, girX = 0.2, arrastrando = false, ux = 0, uy = 0, movio = false;
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
    const objetivos = Object.values(cuerpos).filter(c => vive(c.def.id)).map(c => c.malla);
    const golpes = rayo.intersectObjects(objetivos);
    elegirNodo(golpes.length ? golpes[0].object.userData.id : null);
  });

  function elegirNodo(id) {
    elegido = id;
    if (id) {
      const n = cuerpos[id].def;
      $n.textContent = n.tipo;
      $t.textContent = n.nombre;
      $x.textContent = n.texto;
      return;
    }
    const cuantos = NODOS.filter(n => resueltas.has(n.de)).length;
    if (!cuantos) {
      $n.textContent = 'Todavía vacío';
      $t.textContent = 'El grafo se arma con tus etiquetas';
      $x.textContent = 'Cada frase que clasifiques bien agrega su nodo acá. El dato aparece cuando etiquetes la frase que lo nombra.';
    } else if (cuantos < NODOS.length) {
      $n.textContent = `${cuantos} de ${NODOS.length} nodos`;
      $t.textContent = 'Se está armando';
      $x.textContent = mostrarDatos
        ? 'Las esferas son el pedido viajando de un paso al siguiente. Tocá un nodo para ver qué hace.'
        : 'Falta el dato: sin él, los nodos existen y no viaja nada entre ellos.';
    } else {
      $n.textContent = 'El proceso completo';
      $t.textContent = 'Siete nodos, una sola ejecución';
      $x.textContent = 'Esta es la forma del flujo antes de existir el flujo. Cuando lo construyamos, el Switch se abre en tres avisos y quedan nueve nodos.';
    }
  }
  oyentesGrafo.push(() => elegirNodo(null));

  const reloj = new THREE.Clock();

  function animar() {
    requestAnimationFrame(animar);
    const dt = reloj.getDelta();
    if (!arrastrando && !reducido) girY += 0.0016;

    NODOS.forEach(n => {
      const c = cuerpos[n.id];
      const dentro = vive(n.id);
      const foco = elegido === n.id;
      const op = dentro ? (foco ? 1 : 0.94) : 0;
      c.malla.material.opacity += (op - c.malla.material.opacity) * 0.1;
      c.malla.visible = c.malla.material.opacity > 0.02;
      const z = foco ? 1.6 : 0;
      c.malla.position.z += (c.base.z + z - c.malla.position.z) * 0.12;
      c.bordes.position.copy(c.malla.position);
      const opB = dentro ? parseFloat(window.token('arista-op')) : 0;
      c.bordes.material.opacity += (opB - c.bordes.material.opacity) * 0.1;
      c.bordes.visible = c.bordes.material.opacity > 0.02;
    });

    lineas.forEach(l => {
      const op = aristaViva(l.a, l.b) ? 0.32 : 0;
      l.linea.material.opacity += (op - l.linea.material.opacity) * 0.1;
      l.linea.visible = l.linea.material.opacity > 0.01;
    });

    items.forEach(it => {
      const viva = mostrarDatos && aristaViva(it.a, it.b);
      if (!reducido) it.t = (it.t + dt * 0.42) % 1;
      it.malla.position.copy(posDe[it.a].clone().lerp(posDe[it.b], it.t));
      const op = viva ? 0.9 : 0;
      it.malla.material.opacity += (op - it.malla.material.opacity) * 0.12;
      it.malla.visible = it.malla.material.opacity > 0.02;
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
    lineas.forEach(l => l.linea.material.color.copy(naranja));
    items.forEach(i => i.malla.material.color.copy(naranja));
  });

  elegirNodo(null);
})();


/* ══════════════════════════════════════════════════════════
   4 · LA MESA DE PRUEBA
   Tres pedidos corridos contra el algoritmo, con las mismas
   comparaciones que hace n8n: número para el monto, texto exacto
   para la forma de pago.
   ══════════════════════════════════════════════════════════ */

const LINEAS_MESA = [
  { id: 'l1',  ind: 0, txt: 'CUANDO se carga un pedido en la planilla:' },
  { id: 'l2',  ind: 1, txt: 'leer { Pedido, Cliente, Email, Monto, Canal, Pago }' },
  { id: 'l3',  ind: 1, txt: 'enviar correo de confirmación a {Email}' },
  { id: 'l4',  ind: 1, txt: 'SEGÚN Canal:' },
  { id: 'l5',  ind: 2, txt: 'MercadoLibre:  avisar a Tomás que imprima la etiqueta' },
  { id: 'l6',  ind: 2, txt: 'Instagram:     avisar a Tomás que pida la dirección' },
  { id: 'l7',  ind: 2, txt: 'otro:          avisar a Tomás que lo revise a mano' },
  { id: 'l8',  ind: 1, txt: 'SI Monto > 50000 Y Pago = "Transferencia":' },
  { id: 'l9',  ind: 2, txt: 'alertar a Valentina para que confirme el ingreso' },
  { id: 'l10', ind: 1, txt: 'marcar la fila como Procesado con la fecha y la hora' },
  { id: 'l11', ind: 0, txt: 'FIN' }
];

const PEDIDOS = [
  { pedido: '1041', cliente: 'Sofía Ramírez',  canal: 'MercadoLibre',   pago: 'MercadoLibre',   monto: '18000' },
  { pedido: '1042', cliente: 'Nahuel Ortiz',   canal: 'Instagram',      pago: 'Transferencia',  monto: '67000' },
  { pedido: '1043', cliente: 'Carla Benítez',  canal: 'Feria de diseño', pago: 'transferencia', monto: '84000' }
];

(function mesaDePrueba() {
  const $casos = document.getElementById('casos');
  const $pseudo = document.getElementById('pseudoMesa');
  const $ver = document.getElementById('veredictoMesa');
  if (!$casos) return;

  // Las mismas comparaciones que va a hacer el nodo: número contra número,
  // texto exacto contra texto exacto.
  function correr(p) {
    const corre = new Set(['l1', 'l2', 'l3', 'l4', 'l8', 'l10', 'l11']);
    const rama = p.canal === 'MercadoLibre' ? 'l5' : (p.canal === 'Instagram' ? 'l6' : 'l7');
    corre.add(rama);
    const alta = Number(p.monto) > 50000 && p.pago === 'Transferencia';
    if (alta) corre.add('l9');
    return { corre, rama, alta };
  }

  function veredicto(p, r) {
    if (p.pedido === '1041') {
      return { txt: 'Rama de MercadoLibre y ninguna alerta. Es el caso que todo el mundo imagina cuando dice que el proceso ya está resuelto.', rota: false };
    }
    if (p.pedido === '1042') {
      return { txt: 'Monto alto y transferencia: las dos preguntas dan verdadero y la alerta sale. Es el único camino de este algoritmo que puede frenar un despacho.', rota: false };
    }
    return {
      txt: 'Dos agujeros en la misma fila. El canal no coincide con ninguna rama y cae en la salida por defecto, que existe porque la decidimos y no porque la adivinamos. Y la forma de pago dice transferencia con minúscula, así que la comparación da falso y un pedido de 84.000 sale sin que Valentina lo vea. El algoritmo escrito muestra las dos cosas en treinta segundos; el flujo armado a las apuradas las esconde hasta el primer reclamo.',
      rota: true
    };
  }

  function pintar(i) {
    const p = PEDIDOS[i];
    const r = correr(p);
    $pseudo.innerHTML = LINEAS_MESA.map(l => {
      const clase = r.corre.has(l.id) ? 'corre' : 'salteada';
      return `<span class="ln ${clase}">${'    '.repeat(l.ind)}${l.txt.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
    }).join('');
    const v = veredicto(p, r);
    $ver.textContent = v.txt;
    $ver.classList.toggle('rota', v.rota);
    $casos.querySelectorAll('.fila-caso').forEach((b, k) => b.classList.toggle('viva', k === i));
  }

  PEDIDOS.forEach((p, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'fila-caso';
    b.innerHTML = `<b>Pedido ${p.pedido} · ${p.cliente}</b>
      <span>Canal: ${p.canal}<br>Pago: ${p.pago}<br>Monto: ${p.monto}</span>`;
    b.addEventListener('click', () => pintar(i));
    $casos.appendChild(b);
  });

  pintar(0);
})();


/* ══════════════════════════════════════════════════════════
   5 · TU ALGORITMO
   Editor con verificación en vivo, guardado local y descarga.
   ══════════════════════════════════════════════════════════ */

const PLANTILLA = [
  'CUANDO :',
  '    leer {  }',
  '',
  'FIN'
].join('\n');

(function actividad() {
  const $alg = document.getElementById('alg');
  const $falla = document.getElementById('falla');
  const $aviso = document.getElementById('guardado');
  const $chequeo = document.getElementById('chequeo');
  const $bajar = document.getElementById('bajar');
  if (!$alg) return;

  $alg.value = localStorage.getItem('clase02-algoritmo') || PLANTILLA;
  $falla.value = localStorage.getItem('clase02-falla') || '';

  function verificar() {
    const lineas = $alg.value.split('\n');
    const utiles = lineas.filter(l => l.trim());
    const primera = (utiles[0] || '').trim();

    const disparador = /^(CUANDO|CADA)\s+\S.*:\s*$/.test(primera);
    const datos = /^\s*leer\s*\{[^}]*\S[^}]*\}/m.test($alg.value);
    const fin = utiles.length > 1 && utiles[utiles.length - 1].trim() === 'FIN';

    const esControl = l => /^\s*(CUANDO|CADA|SI|SINO|SEGÚN|SEGUN|FIN|leer)\b/.test(l);
    const accion = utiles.some(l => /^\s+\S/.test(l) && !esControl(l));

    // Cada bloque abierto con SI, SINO o SEGÚN tiene que tener algo más adentro.
    let sangria = true;
    lineas.forEach((l, i) => {
      if (!/^\s*(SI|SINO|SEGÚN|SEGUN)\b/.test(l)) return;
      const nivel = l.match(/^\s*/)[0].length;
      const sig = lineas.slice(i + 1).find(x => x.trim());
      if (!sig || sig.match(/^\s*/)[0].length <= nivel) sangria = false;
    });

    const estado = { disparador, datos, accion, sangria, fin };
    $chequeo.querySelectorAll('div').forEach(d => {
      d.classList.toggle('ok', Boolean(estado[d.dataset.c]));
    });
  }

  let timer;
  function guardar(clave, el) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      localStorage.setItem(clave, el.value);
      const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
    }, 500);
  }

  $alg.addEventListener('input', () => { verificar(); guardar('clase02-algoritmo', $alg); });
  $falla.addEventListener('input', () => guardar('clase02-falla', $falla));

  // Tab escribe cuatro espacios en vez de saltar al control siguiente,
  // salvo que se llegue con Escape antes, que es la salida accesible.
  let escapo = false;
  $alg.addEventListener('keydown', e => {
    if (e.key === 'Escape') { escapo = true; return; }
    if (e.key !== 'Tab' || escapo) return;
    e.preventDefault();
    const i = $alg.selectionStart, f = $alg.selectionEnd;
    $alg.value = $alg.value.slice(0, i) + '    ' + $alg.value.slice(f);
    $alg.selectionStart = $alg.selectionEnd = i + 4;
    verificar();
    guardar('clase02-algoritmo', $alg);
  });
  $alg.addEventListener('blur', () => { escapo = false; });

  $bajar.addEventListener('click', () => {
    const cuerpo =
      'Algoritmo — Diplomatura en Diseño de Procesos de Negocios · FCE-UBA\n' +
      'Clase 2 · ' + new Date().toLocaleDateString('es-AR') + '\n\n' +
      $alg.value.trim() + '\n\n' +
      '— Qué pasa cuando algo sale mal —\n' +
      ($falla.value.trim() || '(sin completar)') + '\n';
    const url = URL.createObjectURL(new Blob([cuerpo], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mi-algoritmo-clase02.txt';
    a.click();
    URL.revokeObjectURL(url);
  });

  if (localStorage.getItem('clase02-algoritmo') || localStorage.getItem('clase02-falla')) {
    $aviso.textContent = 'Recuperado de tu última visita.';
  }
  verificar();
})();


/* ══════════════════════════════════════════════════════════
   6 · REVELADO AL SCROLL
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
