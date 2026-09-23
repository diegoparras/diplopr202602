/* Clase 9 — Datos: Data Tables, expresiones y transformaciones
   Seis piezas: lo que trajo de la clase 8, el decisor entre Remove Duplicates
   y Data Table, las siete operaciones sobre filas, el simulador del buzón de
   Marcela corriendo contra una tabla, el laboratorio de datos sucios y la
   actividad.

   Nada de lo que se dibuja acá lee colores desde JavaScript: todo sale de las
   variables de estilo.css, así que el cambio de tema lo resuelve el CSS solo. */

exigirSesion();
document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function leerGuardado(clave) {
  try { return (localStorage.getItem(clave) || '').trim(); } catch (e) { return ''; }
}
function escapar(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


/* ══════════════════════════════════════════════════════════
   1 · LO QUE TRAJO DE LA CLASE 8
   ══════════════════════════════════════════════════════════ */

(function traido() {
  const cont = document.getElementById('traido');
  if (!cont) return;

  const partes = [
    { clave: 'clase08-q1', rot: 'Qué encontraste en la documentación de tu sistema',
      hoy: 'Si lo que encontraste viene sucio o incompleto, se resuelve en la última parte de hoy.' },
    { clave: 'clase08-q2', rot: 'Qué necesita recordar tu flujo entre una corrida y la siguiente',
      hoy: 'Esto es la clase entera. Al final vas a saber en qué tabla va y con qué columnas.' }
  ].map(p => ({ ...p, texto: leerGuardado(p.clave) }));

  if (!partes.some(p => p.texto)) {
    cont.innerHTML = `
      <span class="rot">Todavía no hay nada guardado acá</span>
      <p class="vacio" style="margin-top:12px">La actividad del viernes pedía dos cosas: qué encontraste cuando fuiste a buscar la documentación de tu sistema, y qué necesita recordar tu flujo entre una corrida y la siguiente. Si la hiciste en otro dispositivo no la voy a ver. Podés completarla en <a href="08.html">la clase 8</a> o traerlas pensadas: la segunda es el tema de hoy.</p>`;
    return;
  }

  cont.innerHTML = '<span class="rot">Lo que escribiste el viernes</span>' +
    partes.filter(p => p.texto).map(p => `
      <div class="linea">
        <b>${p.rot}</b>
        <p>${escapar(p.texto)}</p>
        <p style="font-size:0.84rem;color:var(--tenue);margin-top:4px">${p.hoy}</p>
      </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   2 · EL DECISOR: REMOVE DUPLICATES O DATA TABLE
   ══════════════════════════════════════════════════════════ */

(function decisor() {
  const cont = document.getElementById('decisor');
  if (!cont) return;

  const PREGUNTAS = [
    { id: 'algo', t: '¿Necesitás recordar algo más que la llave?',
      sub: 'El monto, el estado, quién lo autorizó, la fecha en que lo viste.' },
    { id: 'mirar', t: '¿Alguien va a tener que mirar o corregir esa memoria?',
      sub: 'Porque se cargó una mal, porque hay que auditar, porque alguien pregunta.' },
    { id: 'otros', t: '¿Otro flujo del mismo proyecto necesita leer lo mismo?',
      sub: 'Dos flujos distintos que tienen que ponerse de acuerdo sobre qué ya se procesó.' }
  ];

  const resp = {};

  cont.innerHTML =
    '<span class="rotulo">Probalo con tu caso</span>' +
    '<h3 style="margin:14px 0 22px">Tres preguntas y sale solo</h3>' +
    PREGUNTAS.map(p => `
      <div class="decisor-p">
        <b>${p.t}</b>
        <p style="font-size:0.87rem;margin-bottom:10px">${p.sub}</p>
        <div class="opciones" role="group" data-p="${p.id}">
          <button type="button" data-v="no" aria-pressed="false">No</button>
          <button type="button" data-v="si" aria-pressed="false">Sí</button>
        </div>
      </div>`).join('') +
    '<div class="veredicto" id="veredicto"></div>';

  const $ver = cont.querySelector('#veredicto');

  function pintar() {
    const contestadas = Object.keys(resp).length;
    if (contestadas < PREGUNTAS.length) {
      $ver.innerHTML = `<p>Contestá las tres y te digo cuál te conviene. Van ${contestadas} de ${PREGUNTAS.length}.</p>`;
      return;
    }
    const sies = PREGUNTAS.filter(p => resp[p.id] === 'si');

    if (!sies.length) {
      $ver.innerHTML = `
        <div class="cual">Nodo Remove Duplicates</div>
        <p>Sólo necesitás saber si ya viste algo, nadie va a mirar esa memoria y ningún otro flujo la necesita. Armar una tabla para esto es trabajo de más: poné un Remove Duplicates con «Remove Items Processed in Previous Executions» y seguí.</p>
        <p style="margin-top:10px">La única cuenta que te queda pendiente: recuerda 10.000 ítems por defecto. Si tu volumen anual pasa de eso, fijate el parámetro <code>History Size</code> antes de confiar.</p>`;
      return;
    }

    const razones = {
      algo: 'guardás más que la llave, y Remove Duplicates sólo guarda la llave',
      mirar: 'alguien va a tener que mirarlo, y la memoria de Remove Duplicates no se ve por ningún lado',
      otros: 'lo comparten varios flujos, y la memoria de Remove Duplicates es del nodo o del flujo, no del proyecto'
    };
    const lista = sies.map(p => razones[p.id]);
    const texto = lista.length === 1 ? lista[0]
      : lista.slice(0, -1).join(', ') + ' y ' + lista[lista.length - 1];

    $ver.innerHTML = `
      <div class="cual">Data Table</div>
      <p>Alcanza con una de las tres para que Remove Duplicates se quede corto, y acá ${sies.length === 1 ? 'hay una' : 'hay ' + sies.length}: ${texto}.</p>
      <p style="margin-top:10px">Creá la tabla con una columna para la llave y una por cada cosa que necesites recordar al lado. Para escribir, <b>Upsert</b>; para la rama de las repetidas, <b>If Row Does Not Exist</b>.</p>`;
  }

  cont.querySelectorAll('.opciones').forEach(grupo => {
    grupo.addEventListener('click', e => {
      const b = e.target.closest('button[data-v]');
      if (!b) return;
      resp[grupo.dataset.p] = b.dataset.v;
      grupo.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      pintar();
    });
  });

  pintar();
})();


/* ══════════════════════════════════════════════════════════
   3 · LAS SIETE OPERACIONES SOBRE FILAS
   Leídas de docs.n8n.io el 23 de septiembre de 2026.
   ══════════════════════════════════════════════════════════ */

(function operaciones() {
  const cont = document.getElementById('ops');
  if (!cont) return;

  const OPS = [
    { n: 'Insert', q: 'Mete filas nuevas en la tabla.',
      c: 'Cuando ya sabés que no están. Si no lo sabés, usá Upsert.' },
    { n: 'Get', q: 'Trae una o varias filas según los filtros que le pongas.',
      c: 'Para leer lo que guardaste: el estado de una factura, el último valor de algo.' },
    { n: 'Update', q: 'Actualiza una o varias filas existentes.',
      c: 'Cuando la fila seguro existe y sólo cambia un campo. Si puede no existir, Upsert.' },
    { n: 'Upsert', q: 'Si la fila existe la actualiza, y si no existe la crea.', d: true,
      c: 'La que más vas a usar. Una sola operación en lugar de mirar y después decidir.' },
    { n: 'Delete', q: 'Borra una o varias filas.',
      c: 'Para limpiar lo procesado, o para que una tabla de pendientes se vacíe sola.' },
    { n: 'If Row Exists', q: 'Deja pasar los ítems que sí están en la tabla.',
      c: 'La rama del «ya lo vi»: avisar que llegó repetida, saltear, contar.' },
    { n: 'If Row Does Not Exist', q: 'Deja pasar los ítems que no están en la tabla.', d: true,
      c: 'La rama del «esto es nuevo». Reemplaza el SI de la planilla del caso de Marcela.' }
  ];

  cont.innerHTML = OPS.map(o => `
    <div class="op${o.d ? ' destacada' : ''}">
      <b>${o.n}</b>
      <p>${o.q}</p>
      <small>${o.c}</small>
    </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   4 · NORMALIZAR: LAS MISMAS REGLAS QUE USA EL FLUJO
   Se usan en el simulador y en el laboratorio, para que lo que
   se ve en un lado sea exactamente lo que hace el otro.
   ══════════════════════════════════════════════════════════ */

// A-0001-00012345 y 0001-12345 son la misma factura. Se tiran las letras,
// los ceros a la izquierda de cada tramo y lo que sobre.
function numeroCanonico(bruto) {
  const partes = String(bruto).replace(/[^0-9-]/g, '').split('-').filter(p => p !== '');
  if (!partes.length) return '';
  return partes.map(p => String(Number(p))).join('-');
}

// $ 1.234,56 → 1234.56. El punto es de miles y la coma es decimal,
// que es al revés de lo que asume JavaScript.
function montoANumero(bruto) {
  const limpio = String(bruto).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');
  // Number('') devuelve 0, no NaN. Si no quedo ningun digito hay que
  // cortar acá: un monto que no existe no es un monto de cero.
  if (!/\d/.test(limpio)) return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

function cuitSoloDigitos(bruto) {
  return String(bruto).replace(/\D/g, '');
}

function proveedorNormal(bruto) {
  return String(bruto).trim().replace(/\s+/g, ' ').toUpperCase();
}

// Emula DateTime.fromFormat(valor, 'dd/MM/yyyy').toISODate() de Luxon:
// si el texto no tiene ese formato exacto, Luxon devuelve Invalid DateTime.
function fechaDesdeFormato(bruto) {
  const m = String(bruto).trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mes, a] = m;
  const dd = Number(d), mm = Number(mes);
  if (dd < 1 || dd > 31 || mm < 1 || mm > 12) return null;
  return `${a}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

function pesos(n) {
  return n === null ? '—' : '$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


/* ══════════════════════════════════════════════════════════
   5 · EL SIMULADOR DEL BUZÓN DE MARCELA
   ══════════════════════════════════════════════════════════ */

(function simulador() {
  const $entrante = document.getElementById('simEntrante');
  if (!$entrante) return;

  const $tabla = document.getElementById('simTabla');
  const $bit   = document.getElementById('simBitacora');
  const $pie   = document.getElementById('simPie');
  const $paso  = document.getElementById('simPaso');
  const $todo  = document.getElementById('simTodo');
  const $reset = document.getElementById('simReset');

  const TOPE = 50000;

  // Once correos, en el orden en que llegaron. Los casos interesantes:
  // el 3 sin adjunto, el 4 repetida exacta, el 6 la misma factura escrita
  // distinto, el 10 justo en el tope.
  const CORREOS = [
    { de: 'facturacion@acme.com.ar',      proveedor: 'ACME S.A.',            numero: 'A-0001-00012345', monto: '$ 45.200,00',  fecha: '14/09/2026' },
    { de: 'admin@distribuidorasur.com',   proveedor: 'Distribuidora Sur',    numero: 'B-0003-00000871', monto: '$ 128.400,50', fecha: '14/09/2026' },
    { de: 'juan@acme.com.ar',             proveedor: null,                   sinAdjunto: true,          asunto: 'Consulta por el pago de agosto' },
    { de: 'facturacion@acme.com.ar',      proveedor: 'ACME S.A.',            numero: 'A-0001-00012345', monto: '$ 45.200,00',  fecha: '15/09/2026' },
    { de: 'ventas@papeleranorte.com.ar',  proveedor: 'Papelera del Norte',   numero: 'A-0007-00004410', monto: '$ 12.900,00',  fecha: '15/09/2026' },
    { de: 'cobranzas@acme.com.ar',        proveedor: '  acme  s.a. ',        numero: '0001-12345',      monto: '$ 45.200,00',  fecha: '15/09/2026' },
    { de: 'facturas@serviciosint.com.ar', proveedor: 'Servicios Integrales', numero: 'C-0002-00000156', monto: '$ 89.000,00',  fecha: '16/09/2026' },
    { de: 'admin@distribuidorasur.com',   proveedor: 'Distribuidora Sur',    numero: 'B-0003-00000871', monto: '$ 128.400,50', fecha: '16/09/2026' },
    { de: 'ventas@papeleranorte.com.ar',  proveedor: 'Papelera del Norte',   numero: 'A-0007-00004411', monto: '$ 3.450,00',   fecha: '16/09/2026' },
    { de: 'facturacion@acme.com.ar',      proveedor: 'ACME S.A.',            numero: 'A-0001-00012346', monto: '$ 50.000,00',  fecha: '17/09/2026' },
    { de: 'pagos@transportelitoral.com',  proveedor: 'Transporte Litoral',   numero: 'D-0005-00000023', monto: '$ 210.000,00', fecha: '17/09/2026' }
  ];

  let i = 0;
  let filas = [];
  let bitacora = [];
  let ultimaNueva = null;

  function pintarEntrante() {
    if (i >= CORREOS.length) {
      $entrante.innerHTML = `<div class="sim-entrante"><b>No queda ninguno</b><p style="font-size:0.88rem;margin-top:6px">Entraron los once. Quedaron ${filas.length} facturas en la tabla: ${filas.filter(f => f.estado === 'para pagar').length} para pagar y ${filas.filter(f => f.estado !== 'para pagar').length} esperando la firma del socio.</p></div>`;
      return;
    }
    const c = CORREOS[i];
    $entrante.innerHTML = `
      <div class="sim-entrante">
        <b>Correo ${i + 1} de ${CORREOS.length}</b>
        <dl>
          <dt>De</dt><dd>${escapar(c.de)}</dd>
          ${c.sinAdjunto
            ? `<dt>Asunto</dt><dd>${escapar(c.asunto)}</dd><dt>Adjuntos</dt><dd>ninguno</dd>`
            : `<dt>Proveedor</dt><dd>${escapar(c.proveedor)}</dd>
               <dt>Número</dt><dd>${escapar(c.numero)}</dd>
               <dt>Monto</dt><dd>${escapar(c.monto)}</dd>
               <dt>Fecha</dt><dd>${escapar(c.fecha)}</dd>`}
        </dl>
      </div>`;
  }

  function pintarTabla() {
    if (!filas.length) {
      $tabla.innerHTML = '';
      $tabla.insertAdjacentHTML('afterend', '');
      $tabla.innerHTML = `<tbody><tr><td class="sim-vacia">La tabla está vacía. Todavía no entró ningún correo.</td></tr></tbody>`;
      $pie.textContent = '0 filas.';
      return;
    }
    $tabla.innerHTML =
      '<thead><tr><th>numero</th><th>proveedor</th><th>monto</th><th>estado</th></tr></thead><tbody>' +
      filas.map(f => `
        <tr${f.numero === ultimaNueva ? ' class="nueva"' : ''}>
          <td>${escapar(f.numero)}</td>
          <td>${escapar(f.proveedor)}</td>
          <td>${escapar(pesos(f.monto))}</td>
          <td>${escapar(f.estado)}</td>
        </tr>`).join('') + '</tbody>';
    $pie.textContent = `${filas.length} fila${filas.length === 1 ? '' : 's'}. La columna numero es la llave: es la que mira If Row Does Not Exist.`;
  }

  function pintarBitacora() {
    $bit.innerHTML = bitacora.map(b => `
      <div class="bit ${b.tipo}">
        <i>${b.tipo === 'ok' ? '✓' : b.tipo === 'rep' ? '=' : '!'}</i>
        <span>${b.texto}</span>
      </div>`).join('');
    $bit.scrollTop = $bit.scrollHeight;
  }

  function paso() {
    if (i >= CORREOS.length) return;
    const c = CORREOS[i];
    ultimaNueva = null;

    if (c.sinAdjunto) {
      bitacora.push({ tipo: 'mal', texto: `<b>Correo ${i + 1}</b> · sin adjunto. Se le avisa a Marcela y el flujo termina ahí. <b>No toca la tabla.</b>` });
    } else {
      const num = numeroCanonico(c.numero);
      const prov = proveedorNormal(c.proveedor);
      const monto = montoANumero(c.monto);
      const existe = filas.some(f => f.numero === num);

      if (existe) {
        bitacora.push({ tipo: 'rep', texto: `<b>Correo ${i + 1}</b> · <b>${escapar(c.numero)}</b> normaliza a <b>${escapar(num)}</b>, que ya está en la tabla. If Row Does Not Exist lo detiene. Repetida.` });
      } else {
        const estado = monto > TOPE ? 'pendiente de autorización' : 'para pagar';
        filas.push({ numero: num, proveedor: prov, monto, estado });
        ultimaNueva = num;
        const porque = monto > TOPE
          ? `${pesos(monto)} supera el tope de ${pesos(TOPE)}: se le avisa al socio`
          : `${pesos(monto)} no supera el tope de ${pesos(TOPE)}`;
        bitacora.push({ tipo: 'ok', texto: `<b>Correo ${i + 1}</b> · <b>${escapar(num)}</b> es nueva. ${escapar(porque)}. Se guarda como <b>${escapar(estado)}</b>.` });
      }
    }

    i++;
    pintarEntrante();
    pintarTabla();
    pintarBitacora();
    $paso.disabled = i >= CORREOS.length;
    $todo.disabled = i >= CORREOS.length;
  }

  function reiniciar() {
    i = 0; filas = []; bitacora = []; ultimaNueva = null;
    $paso.disabled = false; $todo.disabled = false;
    pintarEntrante(); pintarTabla(); pintarBitacora();
  }

  $paso.addEventListener('click', paso);
  $reset.addEventListener('click', reiniciar);
  $todo.addEventListener('click', () => {
    if (reducido) { while (i < CORREOS.length) paso(); return; }
    const reloj = setInterval(() => {
      paso();
      if (i >= CORREOS.length) clearInterval(reloj);
    }, 420);
  });

  reiniciar();
})();


/* ══════════════════════════════════════════════════════════
   6 · EL LABORATORIO DE DATOS SUCIOS
   Las expresiones son las de verdad: se pueden copiar a un nodo.
   ══════════════════════════════════════════════════════════ */

(function laboratorio() {
  const cont = document.getElementById('lab');
  if (!cont) return;

  const CASOS = [
    {
      id: 'cuit', rot: 'CUIT', campo: 'cuit',
      muestras: ['30-71234567-8', '30.712.345.67-8', '  30712345678  ', '3071234567'],
      expr: "{{ $json.cuit.replace(/\\D/g, '') }}",
      correr: v => {
        const r = cuitSoloDigitos(v);
        if (r.length !== 11) return { error: true, valor: r || '(vacío)', expl: `Quedaron ${r.length} dígitos y un CUIT tiene 11. Limpiar no es lo mismo que validar: la expresión hizo su trabajo, el dato está mal. Este es el caso que conviene mandar a una rama de revisión en vez de seguir.` };
        return { valor: r, expl: 'Se tiraron guiones, puntos y espacios. Guardar siempre la versión de sólo dígitos es lo que hace que dos escrituras distintas del mismo CUIT se encuentren.' };
      }
    },
    {
      id: 'numero', rot: 'Número de factura', campo: 'numero',
      muestras: ['A-0001-00012345', '0001-12345', '  a-1-12345 ', 'B-0003-00000871'],
      expr: "{{ $json.numero.replace(/[^0-9-]/g, '').split('-').filter(p => p).map(p => Number(p)).join('-') }}",
      correr: v => {
        const r = numeroCanonico(v);
        if (!r) return { error: true, valor: '(vacío)', expl: 'No quedó ningún dígito. Sin número no hay llave, y sin llave no se puede saber si está repetida.' };
        return { valor: r, expl: 'Se tiran la letra del tipo de comprobante y los ceros a la izquierda de cada tramo. Es la normalización que evita que la misma factura entre dos veces en el simulador de más arriba.' };
      }
    },
    {
      id: 'monto', rot: 'Monto', campo: 'monto',
      muestras: ['$ 45.200,00', '1.234,56', '$128400,50', 'a convenir', '$ 0,00'],
      expr: "{{ Number($json.monto.replace(/[^\\d,.-]/g, '').replace(/\\./g, '').replace(',', '.')) }}",
      correr: v => {
        const r = montoANumero(v);
        if (r === null) return { error: true, valor: '0', expl: 'Y acá está la trampa más cara de todo el bloque. No había ningún número adentro, así que la limpieza dejó un texto vacío, y en JavaScript <code>Number(\'\')</code> no da error ni da NaN: <b>da cero</b>. O sea que esta factura sigue de largo con un monto de $&nbsp;0, nunca supera el tope, y se carga sola como «para pagar» sin que nadie se entere. Un NaN al menos se nota. Por eso el IF de control no pregunta si el monto existe: pregunta si es mayor que cero.' };
        return { valor: String(r), expl: 'Se tira el símbolo, después los puntos de miles y recién ahí la coma decimal pasa a punto. El orden importa: si convertís la coma antes de tirar los puntos, 45.200,00 termina siendo 45.2.' };
      }
    },
    {
      id: 'fecha', rot: 'Fecha', campo: 'fecha',
      muestras: ['15/03/2026', '01/12/2026', '2026-03-15', '15-03-2026'],
      expr: "{{ DateTime.fromFormat($json.fecha, 'dd/MM/yyyy').toISODate() }}",
      correr: v => {
        const r = fechaDesdeFormato(v);
        if (!r) return { error: true, valor: 'Invalid DateTime', expl: 'Esto es exactamente lo que devuelve Luxon cuando el texto no tiene el formato que le declaraste, y es lo que vas a ver en el nodo. No es un error de la expresión: es que ese valor no venía en dd/MM/yyyy. Si tu fuente mezcla formatos, hace falta un IF antes que separe las aguas.' };
        return { valor: r, expl: 'Guardar las fechas en ISO (año-mes-día) no es capricho: es el único formato que se ordena bien como texto y que entienden todos los sistemas a los que se la vas a mandar después.' };
      }
    },
    {
      id: 'proveedor', rot: 'Proveedor', campo: 'proveedor',
      muestras: ['  ACME S.A. ', 'acme  s.a.', 'Acme S.A.', 'PAPELERA DEL NORTE'],
      expr: "{{ $json.proveedor.trim().replace(/\\s+/g, ' ').toUpperCase() }}",
      correr: v => {
        const r = proveedorNormal(v);
        if (!r) return { error: true, valor: '(vacío)', expl: 'Vino vacío o sólo con espacios. <code>$ifEmpty($json.proveedor, "sin dato")</code> te evita que el flujo siga con un campo en blanco.' };
        return { valor: r, expl: 'Se sacan los espacios de los extremos, se colapsan los del medio y se sube todo a mayúsculas. Para agrupar por proveedor esto es la diferencia entre tres proveedores y uno.' };
      }
    }
  ];

  let activo = 0;

  cont.innerHTML =
    '<div class="lab-pestanas" id="labPestanas" role="tablist"></div>' +
    '<div class="lab-campo">' +
      '<label for="labValor">Escribí un valor, o tocá una muestra</label>' +
      '<input id="labValor" type="text" spellcheck="false" autocomplete="off">' +
      '<div class="lab-muestras" id="labMuestras"></div>' +
    '</div>' +
    '<div class="lab-salida" id="labSalida"></div>';

  const $pest = cont.querySelector('#labPestanas');
  const $val = cont.querySelector('#labValor');
  const $mues = cont.querySelector('#labMuestras');
  const $sal = cont.querySelector('#labSalida');

  $pest.innerHTML = CASOS.map((c, n) =>
    `<button type="button" role="tab" data-n="${n}" aria-selected="${n === 0}">${c.rot}</button>`).join('');

  function pintarMuestras() {
    $mues.innerHTML = CASOS[activo].muestras.map(m =>
      `<button type="button" data-m="${escapar(m)}">${escapar(m)}</button>`).join('');
  }

  function correr() {
    const c = CASOS[activo];
    const v = $val.value;
    if (!v.trim()) {
      $sal.innerHTML = `<div class="lab-fila"><span class="rot">La expresión</span><code>${escapar(c.expr)}</code><p class="expl">Escribí algo arriba, o tocá una de las muestras.</p></div>`;
      return;
    }
    const r = c.correr(v);
    $sal.innerHTML = `
      <div class="lab-fila">
        <span class="rot">Lo que llegó</span>
        <code>${escapar(JSON.stringify(v))}</code>
        <p class="expl">Entre comillas para que se vean los espacios, que son la mitad de los problemas.</p>
      </div>
      <div class="lab-fila">
        <span class="rot">La expresión, en el campo del nodo</span>
        <code>${escapar(c.expr)}</code>
      </div>
      <div class="lab-fila ${r.error ? 'error' : 'resultado'}">
        <span class="rot">${r.error ? 'Lo que devuelve, y no es lo que querías' : 'Lo que queda guardado'}</span>
        <code>${escapar(r.valor)}</code>
        <p class="expl">${r.expl}</p>
      </div>`;
  }

  function elegir(n) {
    activo = n;
    $pest.querySelectorAll('button').forEach(b =>
      b.setAttribute('aria-selected', String(Number(b.dataset.n) === activo)));
    $val.value = CASOS[activo].muestras[0];
    pintarMuestras();
    correr();
  }

  $pest.addEventListener('click', e => {
    const b = e.target.closest('button[data-n]');
    if (b) elegir(Number(b.dataset.n));
  });
  $mues.addEventListener('click', e => {
    const b = e.target.closest('button[data-m]');
    if (b) { $val.value = b.dataset.m; correr(); }
  });
  $val.addEventListener('input', correr);

  elegir(0);
})();


/* ══════════════════════════════════════════════════════════
   7 · ACTIVIDAD
   ══════════════════════════════════════════════════════════ */

(function actividad() {
  const campos = ['q1', 'q2'];
  const $aviso = document.getElementById('guardado');
  if (!document.getElementById('q1')) return;

  campos.forEach(id => {
    const el = document.getElementById(id);
    el.value = leerGuardado('clase09-' + id);
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try {
          localStorage.setItem('clase09-' + id, el.value);
          const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
          $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
        } catch (e) {
          $aviso.textContent = 'No pude guardar: el navegador tiene bloqueado el almacenamiento.';
        }
      }, 500);
    });
  });

  if (campos.some(id => leerGuardado('clase09-' + id))) {
    $aviso.textContent = 'Recuperado de tu última visita.';
  }
})();


/* ══════════════════════════════════════════════════════════
   8 · REVELADO AL SCROLL
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
