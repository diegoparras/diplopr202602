/* Clase 1 — El ecosistema no-code en 2026 y por qué n8n
   Cuatro piezas: el workflow de Valentina en 3D, la calculadora de
   ejecuciones, el clasificador de tareas y el gráfico en vivo. */

exigirSesion();
document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const claro = () => (window.temaActual && window.temaActual() === 'claro');


/* ══════════════════════════════════════════════════════════
   1 · EL WORKFLOW DE VALENTINA EN 3D
   Cinco nodos, dos ramas, y los ítems de datos viajando.
   ══════════════════════════════════════════════════════════ */

const NODOS = [
  { id: 'trigger', nombre: 'Nuevo pedido',        tipo: 'Disparador',
    pos: [-13, 0, 0],   osc: 0xF97316, cla: 0xDD5F0B,
    texto: 'Vigila la planilla y arranca el flujo cuando aparece una fila nueva. Todo proceso automatizado empieza por un disparador.' },
  { id: 'mail',    nombre: 'Confirmar al cliente', tipo: 'Acción',
    pos: [-4.5, 0, 0],  osc: 0xFBBF24, cla: 0xB45309,
    texto: 'Manda el correo de confirmación con los datos del pedido. Se ejecuta siempre, sin condición previa.' },
  { id: 'if',      nombre: 'Monto > 50.000',       tipo: 'Condición',
    pos: [4, 3.4, 0],   osc: 0x22D3EE, cla: 0x0E7490,
    texto: 'La única decisión del flujo. Compara el monto contra el umbral y abre dos caminos: uno sigue, el otro no.' },
  { id: 'tomas',   nombre: 'Avisar a Tomás',       tipo: 'Acción',
    pos: [4, -3.4, 0],  osc: 0xFBBF24, cla: 0xB45309,
    texto: 'Notifica al grupo de despacho por Telegram. Cuelga directo del correo, así que corre para todos los pedidos.' },
  { id: 'valen',   nombre: 'Alertar a Valentina',  tipo: 'Acción condicionada',
    pos: [12.5, 3.4, 0], osc: 0xA78BFA, cla: 0x6D28D9,
    texto: 'Solo se ejecuta cuando la condición dio verdadero. Es la rama que evita que un pedido grande pase sin aprobación.' }
];

const ARISTAS = [
  ['trigger', 'mail'],
  ['mail', 'if'],
  ['mail', 'tomas'],
  ['if', 'valen']
];

// Qué recorrido hace cada tipo de pedido.
const RECORRIDOS = {
  normal: ['trigger', 'mail', 'tomas'],
  alto:   ['trigger', 'mail', 'tomas', 'if', 'valen']
};

(function flujoEn3D() {
  const lienzo = document.getElementById('lienzoFlujo');
  const caja = document.getElementById('flujo3d');
  if (!lienzo || !window.THREE) return;

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
  camara.position.set(0, 2, 34);
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

  /* Nodos: cajas redondeadas por aproximación (caja + bordes) */
  const cuerpos = {};
  NODOS.forEach(n => {
    const g = new THREE.BoxGeometry(5.4, 2.2, 1.1);
    const m = new THREE.MeshStandardMaterial({
      color: color(n), roughness: 0.5, metalness: 0.12,
      transparent: true, opacity: 0.95
    });
    const caja3d = new THREE.Mesh(g, m);
    caja3d.position.copy(posDe[n.id]);
    caja3d.userData.id = n.id;
    grupo.add(caja3d);

    const bordes = new THREE.LineSegments(
      new THREE.EdgesGeometry(g),
      new THREE.LineBasicMaterial({
        color: new THREE.Color(window.token('arista')),
        transparent: true, opacity: parseFloat(window.token('arista-op'))
      })
    );
    bordes.position.copy(caja3d.position);
    grupo.add(bordes);

    cuerpos[n.id] = { malla: caja3d, bordes, base: posDe[n.id].clone() };
  });

  /* Aristas */
  const lineas = [];
  ARISTAS.forEach(([a, b]) => {
    const geo = new THREE.BufferGeometry().setFromPoints([posDe[a], posDe[b]]);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(window.token('naranja')), transparent: true, opacity: 0.32
    });
    const l = new THREE.Line(geo, mat);
    grupo.add(l);
    lineas.push({ a, b, linea: l });
  });

  /* Ítems de datos: esferitas que recorren las aristas */
  const items = [];
  ARISTAS.forEach(([a, b], i) => {
    const g = new THREE.SphereGeometry(0.34, 12, 12);
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(window.token('naranja')), transparent: true });
    const s = new THREE.Mesh(g, m);
    grupo.add(s);
    items.push({ a, b, malla: s, t: i * 0.25, activo: true });
  });

  function medir() {
    const w = caja.clientWidth, h = caja.clientHeight;
    render.setSize(w, h, false);
    render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camara.aspect = w / h;
    camara.updateProjectionMatrix();
    // En pantallas angostas el grafo no entra de frente: lo alejamos.
    camara.position.z = w < 620 ? 46 : 34;
  }
  medir();
  window.addEventListener('resize', medir);

  let girY = -0.28, girX = 0.2, arrastrando = false, ux = 0, uy = 0, movio = false;
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

  /* Selección por click */
  const rayo = new THREE.Raycaster();
  const puntero = new THREE.Vector2();
  let elegido = null, recorrido = null;

  lienzo.addEventListener('pointerup', e => {
    arrastrando = false;
    if (movio) return;
    const r = lienzo.getBoundingClientRect();
    puntero.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    puntero.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    rayo.setFromCamera(puntero, camara);
    const golpes = rayo.intersectObjects(Object.values(cuerpos).map(c => c.malla));
    if (golpes.length) elegirNodo(golpes[0].object.userData.id);
    else elegirNodo(null);
  });

  const $n = document.getElementById('flujoN');
  const $t = document.getElementById('flujoTitulo');
  const $x = document.getElementById('flujoTexto');

  function elegirNodo(id) {
    elegido = id;
    if (!id) {
      $n.textContent = recorrido ? (recorrido === 'alto' ? 'Pedido de $67.000' : 'Pedido de $18.000') : 'El flujo completo';
      $t.textContent = recorrido
        ? (recorrido === 'alto' ? 'Cuatro nodos ejecutados' : 'Tres nodos ejecutados')
        : 'Cinco nodos, una ejecución';
      $x.textContent = recorrido
        ? 'Los dos recorridos consumen una sola ejecución. Lo que cambia es qué nodos corren, no lo que cuesta.'
        : 'Arrastrá para girar. Tocá un nodo para ver qué hace y cuándo se ejecuta.';
      return;
    }
    const n = NODOS.find(x => x.id === id);
    $n.textContent = n.tipo;
    $t.textContent = n.nombre;
    $x.textContent = n.texto;
  }

  document.querySelectorAll('#flujoMandos .mando').forEach(b => {
    b.addEventListener('click', () => {
      const caso = b.dataset.caso;
      const yaEstaba = recorrido === caso;
      recorrido = yaEstaba ? null : caso;
      document.querySelectorAll('#flujoMandos .mando').forEach(x => x.classList.remove('viva'));
      if (!yaEstaba) b.classList.add('viva');
      elegirNodo(null);
    });
  });

  function enRecorrido(id) {
    return !recorrido || RECORRIDOS[recorrido].includes(id);
  }

  function aristaViva(a, b) {
    if (!recorrido) return true;
    const r = RECORRIDOS[recorrido];
    return r.includes(a) && r.includes(b);
  }

  const reloj = new THREE.Clock();

  function animar() {
    requestAnimationFrame(animar);
    const dt = reloj.getDelta();
    if (!arrastrando && !reducido) girY += 0.0016;

    NODOS.forEach(n => {
      const c = cuerpos[n.id];
      const dentro = enRecorrido(n.id);
      const foco = elegido === n.id;
      const op = foco ? 1 : (dentro ? 0.94 : 0.16);
      c.malla.material.opacity += (op - c.malla.material.opacity) * 0.12;
      const z = foco ? 1.6 : 0;
      c.malla.position.z += (c.base.z + z - c.malla.position.z) * 0.12;
      c.bordes.position.copy(c.malla.position);
      c.bordes.material.opacity += ((dentro ? parseFloat(window.token('arista-op')) : 0.05) - c.bordes.material.opacity) * 0.12;
    });

    lineas.forEach(l => {
      const op = aristaViva(l.a, l.b) ? 0.32 : 0.06;
      l.linea.material.opacity += (op - l.linea.material.opacity) * 0.12;
    });

    items.forEach(it => {
      const viva = aristaViva(it.a, it.b);
      if (!reducido) it.t = (it.t + dt * 0.42) % 1;
      const p = posDe[it.a].clone().lerp(posDe[it.b], it.t);
      it.malla.position.copy(p);
      const op = viva ? 0.9 : 0;
      it.malla.material.opacity += (op - it.malla.material.opacity) * 0.14;
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
   2 · CALCULADORA DE EJECUCIONES
   El flujo de Valentina: 5 nodos, 3 ó 4 se ejecutan según el monto.
   ══════════════════════════════════════════════════════════ */

(function calculadora() {
  const $rango = document.getElementById('pedidos');
  const $val = document.getElementById('pedidosVal');
  const $barras = document.getElementById('barras');
  const $ver = document.getElementById('veredicto');
  if (!$rango) return;

  const DIAS = 30;
  const PROP_ALTOS = 0.2;      // uno de cada cinco supera los 50.000
  const LIMITE_FREE = 50;      // ejecuciones de producción del plan gratuito

  function pintar() {
    const porDia = Number($rango.value);
    $val.textContent = porDia;

    const altos = porDia * PROP_ALTOS;
    const normales = porDia - altos;

    // Cobro por operación: cada nodo ejecutado cuenta.
    const ops = Math.round((normales * 3 + altos * 4) * DIAS);
    // Cobro por ejecución: la corrida entera cuenta una vez.
    const ejec = Math.round(porDia * DIAS);

    const tope = Math.max(ops, ejec, LIMITE_FREE) * 1.05;
    const filas = [
      { nombre: 'Cobro por operación', valor: ops,  unidad: 'operaciones/mes', color: 'var(--tenue)' },
      { nombre: 'Cobro por ejecución', valor: ejec, unidad: 'ejecuciones/mes',  color: 'var(--naranja)' }
    ];

    $barras.innerHTML = filas.map(f => `
      <div class="barra-fila">
        <div class="barra-tope">
          <span>${f.nombre}</span>
          <b>${f.valor.toLocaleString('es-AR')} ${f.unidad}</b>
        </div>
        <div class="barra-riel">
          <div class="barra-lleno" style="width:${(f.valor / tope * 100).toFixed(1)}%;background:${f.color}"></div>
          <div class="barra-limite" style="left:${(LIMITE_FREE / tope * 100).toFixed(1)}%" title="Límite del plan gratuito"></div>
        </div>
      </div>`).join('');

    const veces = (ejec / LIMITE_FREE);
    const ahorro = ops > 0 ? (1 - ejec / ops) * 100 : 0;

    $ver.innerHTML = ejec <= LIMITE_FREE
      ? `Con ${porDia} pedidos por día el flujo consume ${ejec} ejecuciones al mes y entra en el plan gratuito. Cobrado por operación serían ${ops.toLocaleString('es-AR')}, un ${ahorro.toFixed(0)}% más. La línea vertical marca el límite de 50.`
      : `Con ${porDia} pedidos por día hacen falta ${ejec.toLocaleString('es-AR')} ejecuciones al mes, ${veces.toFixed(1)} veces el límite del plan gratuito. Este caso vive en una instancia propia o en un plan pago. Cobrado por operación serían ${ops.toLocaleString('es-AR')}, un ${ahorro.toFixed(0)}% más.`;
  }

  $rango.addEventListener('input', pintar);
  window.addEventListener('cambio-tema', pintar);
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   3 · CLASIFICADOR DE TAREAS
   ══════════════════════════════════════════════════════════ */

const TAREAS = [
  { t: 'Copiar mil contactos de una casilla a una base de datos', ok: true,
    razon: 'Repetitiva, con reglas claras y volumen alto. Es el caso ideal.' },
  { t: 'Calmar a un cliente enojado por teléfono', ok: false,
    razon: 'Necesita leer el estado emocional de alguien y decidir sobre la marcha.' },
  { t: 'Generar el mismo reporte todos los lunes con datos actualizados', ok: true,
    razon: 'Predecible, repetitiva y sobre datos que ya están en una computadora.' },
  { t: 'Escribir el eslogan de una marca nueva', ok: false,
    razon: 'Pide criterio creativo y juicio sobre algo que no tiene respuesta correcta.' },
  { t: 'Mandar recordatorio de turno a quinientos pacientes', ok: true,
    razon: 'Volumen alto, reglas claras y ningún criterio en el medio.' },
  { t: 'Negociar el precio con un proveedor', ok: false,
    razon: 'Persuasión y decisión compleja, con información que no está escrita en ningún lado.' }
];

(function clasificador() {
  const cont = document.getElementById('clasificador');
  const $marcador = document.getElementById('marcador');
  if (!cont) return;

  let resueltas = 0, aciertos = 0;

  TAREAS.forEach((t, i) => {
    const fila = document.createElement('div');
    fila.className = 'tarea';
    fila.innerHTML = `
      <span>${t.t}</span>
      <button data-r="si">Se automatiza</button>
      <button data-r="no">Necesita persona</button>
      <div class="razon">${t.razon}</div>`;

    fila.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        if (fila.classList.contains('resuelta')) return;
        const dijoSi = b.dataset.r === 'si';
        const acerto = dijoSi === t.ok;
        fila.classList.add('resuelta', acerto ? 'ok' : 'mal');
        b.classList.add('elegida');
        resueltas++;
        if (acerto) aciertos++;
        $marcador.textContent = resueltas < TAREAS.length
          ? `${aciertos} de ${resueltas}`
          : `${aciertos} de ${TAREAS.length}. La regla que las separa: si podés escribir la decisión como una condición, se automatiza.`;
      });
    });

    cont.appendChild(fila);
  });
})();


/* ══════════════════════════════════════════════════════════
   4 · EL GRÁFICO EN VIVO DE ARTIFICIAL ANALYSIS
   ══════════════════════════════════════════════════════════ */

const PALETA_OSCURA = ['#F97316', '#FBBF24', '#22D3EE', '#A78BFA', '#34D399',
                       '#F472B6', '#60A5FA', '#FB7185', '#4ADE80', '#E879F9'];
const PALETA_CLARA  = ['#DD5F0B', '#A16207', '#0E7490', '#6D28D9', '#047857',
                       '#BE185D', '#1D4ED8', '#BE123C', '#3F6212', '#A21CAF'];
const paleta = () => (claro() ? PALETA_CLARA : PALETA_OSCURA);

(function graficoVivo() {
  const svg = document.getElementById('grafico');
  const $cargando = document.getElementById('cargandoGrafico');
  const $sello = document.getElementById('selloDatos');
  const $creadores = document.getElementById('creadores');
  const $globo = document.getElementById('globo');
  if (!svg) return;

  fetch('/api/datos')
    .then(r => r.ok ? r.json() : Promise.reject(new Error('sin datos')))
    .then(dibujar)
    .catch(() => {
      $cargando.textContent = 'No se pudo consultar Artificial Analysis en este momento. El gráfico vuelve solo cuando el servicio responde.';
    });

  function dibujar(d) {
    const modelos = d.modelos.filter(m => m.f >= '2023-01-01' && m.i != null);
    if (!modelos.length) { $cargando.textContent = 'Sin modelos para graficar.'; return; }

    const cuenta = {};
    modelos.forEach(m => { if (m.c) cuenta[m.c] = (cuenta[m.c] || 0) + 1; });
    const top = Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 10).map(x => x[0]);

    let color = {};
    function recolorear() {
      const p = paleta();
      color = {};
      top.forEach((c, i) => color[c] = p[i % p.length]);
    }
    recolorear();

    const datos = modelos.filter(m => top.includes(m.c));
    const apagados = new Set();

    const AL = 60, AR = 22, AT = 22, AB = 46;
    const W = 900, H = 420;
    const fx = W - AL - AR, fy = H - AT - AB;

    const fechas = datos.map(m => new Date(m.f).getTime());
    const t0 = Math.min(...fechas), t1 = Math.max(...fechas);
    const iMax = Math.ceil(Math.max(...datos.map(m => m.i)) / 10) * 10;

    const X = t => AL + ((t - t0) / (t1 - t0)) * fx;
    const Y = v => AT + fy - (v / iMax) * fy;

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.hidden = false;
    $cargando.hidden = true;
    $sello.textContent = `${datos.length} modelos · datos al ${d.fecha}`;

    function pintar() {
      const tenue = window.token('tenue');
      let s = '';

      for (let v = 0; v <= iMax; v += 10) {
        s += `<line x1="${AL}" y1="${Y(v)}" x2="${W - AR}" y2="${Y(v)}" stroke="${window.token('rejilla')}"/>`;
        s += `<text x="${AL - 10}" y="${Y(v) + 4}" text-anchor="end" fill="${tenue}" font-family="JetBrains Mono, monospace" font-size="10">${v}</text>`;
      }

      const dt0 = new Date(t0), dt1 = new Date(t1);
      const meses = ['Ene', 'Abr', 'Jul', 'Oct'];
      let cur = new Date(dt0.getFullYear(), Math.floor(dt0.getMonth() / 3) * 3, 1);
      while (cur.getTime() <= dt1.getTime()) {
        const x = X(cur.getTime());
        if (x >= AL && x <= W - AR) {
          s += `<line x1="${x}" y1="${AT}" x2="${x}" y2="${AT + fy}" stroke="${window.token('rejilla-suave')}"/>`;
          s += `<text x="${x}" y="${H - AB + 20}" text-anchor="middle" fill="${tenue}" font-family="JetBrains Mono, monospace" font-size="10">${meses[cur.getMonth() / 3]} ${String(cur.getFullYear()).slice(2)}</text>`;
        }
        cur = new Date(cur.getFullYear(), cur.getMonth() + 3, 1);
      }

      const orden = datos.slice().sort((x, y) => new Date(x.f) - new Date(y.f));
      let techo = 0, camino = '';
      orden.forEach(m => {
        if (m.i > techo) {
          const x = X(new Date(m.f).getTime());
          camino += camino ? ` L${x},${Y(techo)} L${x},${Y(m.i)}` : `M${x},${Y(m.i)}`;
          techo = m.i;
        }
      });
      camino += ` L${W - AR},${Y(techo)}`;
      s += `<path d="${camino}" fill="none" stroke="${window.token('naranja')}" stroke-opacity="0.4" stroke-width="1.5" stroke-dasharray="4 4"/>`;

      datos.forEach((m, k) => {
        if (apagados.has(m.c)) return;
        const x = X(new Date(m.f).getTime()), y = Y(m.i);
        s += `<circle cx="${x}" cy="${y}" r="4" fill="${color[m.c]}" fill-opacity="0.85"
                 stroke="${color[m.c]}" stroke-width="1" data-k="${k}" class="pto" style="cursor:pointer"/>`;
      });

      s += `<text x="${AL - 44}" y="${AT + fy / 2}" fill="${tenue}" font-family="JetBrains Mono, monospace" font-size="10" transform="rotate(-90 ${AL - 44} ${AT + fy / 2})" text-anchor="middle">Índice de inteligencia</text>`;

      svg.innerHTML = s;

      svg.querySelectorAll('.pto').forEach(c => {
        c.addEventListener('mouseenter', () => {
          const m = datos[Number(c.dataset.k)];
          const cajaSvg = svg.getBoundingClientRect();
          const panel = svg.closest('.panel-vivo').getBoundingClientRect();
          const px = cajaSvg.left - panel.left + (Number(c.getAttribute('cx')) / W) * cajaSvg.width;
          const py = cajaSvg.top - panel.top + (Number(c.getAttribute('cy')) / H) * cajaSvg.height;
          $globo.innerHTML = `<b>${m.n}</b><span>${m.c} · ${m.f} · índice ${m.i}` +
            (m.p != null ? ` · US$ ${m.p}/M tokens` : '') + `</span>`;
          $globo.style.left = Math.max(6, px - 90) + 'px';
          $globo.style.top = (py - 62) + 'px';
          $globo.style.opacity = '1';
        });
        c.addEventListener('mouseleave', () => { $globo.style.opacity = '0'; });
      });
    }

    top.forEach(c => {
      const b = document.createElement('button');
      b.className = 'creador viva';
      b.style.color = color[c];
      b.dataset.creador = c;
      b.innerHTML = `<i></i>${c}`;
      b.addEventListener('click', () => {
        if (apagados.has(c)) { apagados.delete(c); b.classList.add('viva'); b.classList.remove('apagada'); }
        else { apagados.add(c); b.classList.remove('viva'); b.classList.add('apagada'); }
        pintar();
      });
      $creadores.appendChild(b);
    });

    window.addEventListener('cambio-tema', () => {
      recolorear();
      $creadores.querySelectorAll('.creador').forEach(b => { b.style.color = color[b.dataset.creador]; });
      pintar();
    });

    pintar();
  }
})();


/* ══════════════════════════════════════════════════════════
   5 · ACTIVIDAD
   ══════════════════════════════════════════════════════════ */

(function actividad() {
  const campos = ['p1', 'p2', 'p3'];
  const $aviso = document.getElementById('guardado');
  if (!document.getElementById('p1')) return;

  campos.forEach(id => {
    const el = document.getElementById(id);
    el.value = localStorage.getItem('clase01-' + id) || '';
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.setItem('clase01-' + id, el.value);
        const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
      }, 500);
    });
  });

  if (campos.some(id => localStorage.getItem('clase01-' + id))) {
    $aviso.textContent = 'Recuperado de tu última visita.';
  }
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
