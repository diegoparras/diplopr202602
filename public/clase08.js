/* Clase 8 — APIs, webhooks y HTTP Request: conectar lo que no tiene nodo
   Seis piezas: lo que trajo de la clase 7, las cuatro maneras de conectar,
   el armador de pedidos, el explorador de JSON sobre una respuesta real,
   los cuatro tipos de autenticación y la actividad. */

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
   1 · LO QUE TRAJO DE LA CLASE 7
   ══════════════════════════════════════════════════════════ */

(function traido() {
  const cont = document.getElementById('traido');
  if (!cont) return;

  const partes = [
    { clave: 'clase07-q1', rot: 'El sistema tuyo que no está en la lista de n8n', hoy: 'Se resuelve en los bloques de pedido, JSON y autenticación.' },
    { clave: 'clase07-q2', rot: 'Dónde, en tu proceso, alguien espera que le avisen', hoy: 'Se resuelve en el bloque de webhooks.' }
  ].map(p => ({ ...p, texto: leerGuardado(p.clave) }));

  if (!partes.some(p => p.texto)) {
    cont.innerHTML = `
      <span class="rot">Todavía no hay nada guardado acá</span>
      <p class="vacio" style="margin-top:12px">La actividad del miércoles pedía dos cosas: qué sistema tuyo no aparece en n8n, y dónde esperás que alguien te avise. Si la hiciste en otro dispositivo no la voy a ver. Podés completarla en <a href="07.html">la clase 7</a> o simplemente traerlas pensadas: las vamos a usar toda la clase.</p>`;
    return;
  }

  cont.innerHTML = '<span class="rot">Lo que escribiste el miércoles</span>' +
    partes.filter(p => p.texto).map(p => `
      <div class="linea">
        <b>${p.rot}</b>
        <p>${escapar(p.texto)}</p>
        <p style="font-size:0.84rem;color:var(--tenue);margin-top:4px">${p.hoy}</p>
      </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   2 · LAS CUATRO MANERAS DE CONECTAR
   En orden de preferencia, cada una con el momento de la cursada
   en que ya la vivimos.
   ══════════════════════════════════════════════════════════ */

const MODOS = [
  { n: '1', tono: 'acierto', titulo: 'El nodo que ya existe',
    texto: 'Alguien escribió la integración y la mantiene: Gmail, Sheets, Telegram y varios cientos más. Trae la autenticación resuelta y los campos con nombre.',
    vivido: 'Lo usamos desde la clase 1. Regla: buscá el nodo antes de escribir una sola URL. Y si existe pero le falta la acción que necesitás, fijate si el nodo tiene la opción «Custom API Call»: es el atajo entre las dos primeras maneras.' },
  { n: '2', tono: 'naranja', titulo: 'La API del sistema',
    texto: 'No hay nodo pero el sistema tiene una puerta pensada para programas. Devuelve JSON, tiene documentación, y lo que devuelve hoy va a devolver mañana.',
    vivido: 'Es lo de hoy. Un contrato: alguien del otro lado se comprometió a que esa dirección siga existiendo y a avisar si cambia.' },
  { n: '3', tono: 'alerta', titulo: 'La página, leída a mano',
    texto: 'No hay nodo ni API: hay una web hecha para que la lea una persona. Se pide el HTML y se extrae con selectores.',
    vivido: 'Fue toda la clase 5, con InfoLeg. Anda, y es el más frágil de los cuatro: una casualidad que hoy funciona. Último recurso, y con aviso de que se va a romper.' },
  { n: '4', tono: 'coral', titulo: 'Que te avisen ellos',
    texto: 'Al revés de los tres anteriores: en vez de ir a buscar, dejás una dirección y esperás. El otro sistema te llama cuando pasa algo.',
    vivido: 'No es un escalón más abajo: es otro eje. Cuando el sistema lo ofrece, casi siempre le gana a preguntar cada cinco minutos, y por costo también.' }
];

(function modos() {
  const cont = document.getElementById('modos');
  if (!cont) return;

  function pintar() {
    cont.innerHTML = MODOS.map(m => `
      <div class="modo" style="border-left:2px solid ${window.token(m.tono)}">
        <div class="orden" style="color:${window.token(m.tono)}">${m.n}</div>
        <div>
          <b>${m.titulo}</b>
          <p>${m.texto}</p>
          <span class="vivido"><b>Dónde lo vimos.</b> ${m.vivido}</span>
        </div>
      </div>`).join('');
  }

  pintar();
  window.addEventListener('cambio-tema', pintar);
})();


/* ══════════════════════════════════════════════════════════
   3 · EL ARMADOR DE PEDIDOS
   Las cinco partes de un pedido HTTP, y cómo se escriben.
   ══════════════════════════════════════════════════════════ */

(function armador() {
  const $curl = document.getElementById('aCurl');
  const $mapa = document.getElementById('aMapa');
  if (!$curl) return;

  const campos = ['aMetodo', 'aUrl', 'aP1k', 'aP1v', 'aP2k', 'aP2v', 'aAuth', 'aCuerpo'];
  const val = id => document.getElementById(id).value.trim();
  const marcado = id => document.getElementById(id).checked;

  function pintar() {
    const metodo = val('aMetodo');
    const url = val('aUrl');
    const params = [[val('aP1k'), val('aP1v')], [val('aP2k'), val('aP2v')]]
      .filter(p => p[0] && p[1]);
    const query = params.map(p => `${p[0]}=${encodeURIComponent(p[1])}`).join('&');
    const urlCompleta = url + (query ? '?' + query : '');

    const lineas = [`curl -X ${metodo} "${urlCompleta}"`];
    if (marcado('aAuth')) lineas.push(`  -H "Authorization: Bearer TU_CLAVE"`);
    if (metodo === 'POST' && marcado('aCuerpo')) {
      lineas.push(`  -H "Content-Type: application/json"`);
      lineas.push(`  -d '{ "campo": "valor" }'`);
    }

    $curl.innerHTML = escapar(lineas.join(' \\\n'))
      .replace(/(-X|-H|-d)(\s)/g, '<span class="bandera">$1</span>$2');

    const filas = [
      ['Method', metodo],
      ['URL', url],
      ['Send Query Parameters', params.length ? 'sí, ' + params.length + (params.length === 1 ? ' parámetro' : ' parámetros') : 'no'],
      ['Authentication', marcado('aAuth') ? 'Generic Credential Type → Header Auth' : 'None'],
      ['Send Body', metodo === 'POST' && marcado('aCuerpo') ? 'sí, JSON' : 'no']
    ];
    $mapa.innerHTML = '<div style="border:0;padding-bottom:6px"><span style="color:var(--tenue);font-family:var(--dato);font-size:0.7rem">EN EL NODO HTTP REQUEST</span><span></span></div>' +
      filas.map(f => `<div><span>${f[0]}</span><span>${escapar(f[1])}</span></div>`).join('');
  }

  campos.forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', pintar);
    el.addEventListener('change', pintar);
  });
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   4 · EL EXPLORADOR DE JSON
   Respuesta real de la API abierta de la Base InfoLeg
   (datos.jus.gob.ar), capturada el 15 de septiembre de 2026.
   Tocar un valor devuelve la expresión de n8n que lo alcanza.
   ══════════════════════════════════════════════════════════ */

const RESPUESTA = {
  help: 'https://datos.jus.gob.ar/api/3/action/help_show?name=datastore_search',
  success: true,
  result: {
    resource_id: '8b1c2310-564e-41e6-9a84-99cfa9939bbc',
    records: [
      {
        tipo_norma: 'Ley',
        numero_norma: '27668',
        titulo_sumario: 'PROGRAMA DE FACILIDADES EXTENDIDAS',
        titulo_resumido: 'DISPOSICIONES',
        organismo_origen: 'HONORABLE CONGRESO DE LA NACION ARGENTINA',
        fecha_sancion: '2022-03-17',
        fecha_boletin: '2022-03-18',
        numero_boletin: '34882',
        pagina_boletin: '3',
        id_norma: '362395',
        texto_original: 'http://servicios.infoleg.gob.ar/infolegInternet/anexos/360000-364999/362395/norma.htm',
        modificada_por: '1'
      }
    ],
    total: 1
  }
};

const PISTAS = {
  'success': 'Casi todas las APIs mandan un campo así. Es lo primero que conviene mirar con un IF: que el pedido haya salido bien no significa que la consulta haya encontrado algo.',
  'result.total': 'El dato que la clase 5 tuvo que adivinar mirando el tamaño de la página. Pero cuidado, y esto lo descubrimos probando: cuando la búsqueda no encuentra nada, este campo NO VIENE. El IF de «¿encontró algo?» hay que hacerlo sobre la cantidad de registros, no sobre este número.',
  'result.records': 'Una lista, y el campo en el que hay que confiar: cuando no hay resultados llega vacía, pero llega. Cada elemento va a ser un ítem en n8n si lo separás con Split Out, y ahí vuelve todo lo de la clase 4: un nodo se ejecuta una vez por ítem.',
  'result.records[0].id_norma': 'Este es el mismo identificador que usa InfoLeg en su propia web. Con él se arma el link a la ficha: la API abierta y el sitio hablan de las mismas normas.',
  'result.records[0].texto_original': 'El link al texto completo, servido. En la clase 5 escribimos un nodo Code para calcular esa misma dirección, y después descubrimos que estaba en la página. Acá viene en un campo.',
  'result.records[0].numero_norma': 'Ojo con el tipo: viene como texto, no como número. Es exactamente el caso de la clase 4, y por eso una comparación con > puede fallar sin avisar.',
  'result.records[0].fecha_sancion': 'Formato ISO, que es el que se puede comparar y ordenar. Cuando una API te da las fechas así, agradecé: InfoLeg las daba como «17-mar-2022».'
};

(function explorador() {
  const $json = document.getElementById('expJson');
  const $panel = document.getElementById('expPanel');
  const $barra = document.getElementById('expBarra');
  if (!$json) return;

  $barra.innerHTML = 'GET datos.jus.gob.ar/api/3/action/datastore_search?resource_id=…&filters={"tipo_norma":"Ley"} · 200 OK';

  // Dibuja el JSON marcando cada valor con su camino.
  function dibujar(obj, camino, nivel) {
    const sangria = '  '.repeat(nivel);
    const sangriaInterna = '  '.repeat(nivel + 1);

    if (Array.isArray(obj)) {
      if (!obj.length) return '[]';
      const partes = obj.map((v, i) => sangriaInterna + dibujar(v, `${camino}[${i}]`, nivel + 1));
      return '[\n' + partes.join(',\n') + '\n' + sangria + ']';
    }
    if (obj && typeof obj === 'object') {
      const partes = Object.entries(obj).map(([k, v]) => {
        const sub = camino ? `${camino}.${k}` : k;
        return `${sangriaInterna}<span class="clave">"${k}"</span>: ` + dibujar(v, sub, nivel + 1);
      });
      return '{\n' + partes.join(',\n') + '\n' + sangria + '}';
    }
    const clase = typeof obj === 'string' ? 'texto' : 'numero';
    const texto = typeof obj === 'string' ? `"${escapar(obj)}"` : String(obj);
    return `<span class="valor ${clase}" data-camino="${camino}">${texto}</span>`;
  }

  $json.innerHTML = dibujar(RESPUESTA, '', 0);

  function alcanzar(camino) {
    // Devuelve el valor que hay en ese camino, para mostrarlo en el panel.
    return camino.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean)
      .reduce((o, k) => (o == null ? o : o[k]), RESPUESTA);
  }

  function pintarPanel(camino) {
    const valor = alcanzar(camino);
    // En n8n el ítem ya es la respuesta: el camino se escribe sin "result" arriba
    // sólo si el nodo devolvió eso. Acá mostramos el camino completo, que es el
    // que corresponde cuando el HTTP Request entrega la respuesta entera.
    const expresion = '{{ $json.' + camino.replace(/^\./, '') + ' }}';
    const pista = PISTAS[camino] ||
      'Ese es el camino hasta el dato. En n8n se escribe entre llaves dobles y se puede usar en cualquier campo de cualquier nodo de más abajo.';
    $panel.innerHTML = `
      <span class="rot">La expresión de n8n</span>
      <div class="expresion">${escapar(expresion)}</div>
      <p>${pista}</p>
      <div class="valor-actual"><b>Vale:</b> ${escapar(typeof valor === 'string' ? valor : JSON.stringify(valor))}</div>`;
  }

  $json.addEventListener('click', e => {
    const v = e.target.closest('.valor');
    if (!v) return;
    $json.querySelectorAll('.valor').forEach(x => x.classList.remove('elegido'));
    v.classList.add('elegido');
    pintarPanel(v.dataset.camino);
  });

  $panel.innerHTML = `
    <span class="rot">Tocá cualquier valor</span>
    <p>Del lado izquierdo está la respuesta tal como llega. Tocá un valor y te muestro con qué expresión lo alcanza n8n, y qué conviene mirar de ese campo en particular.</p>
    <div class="valor-actual" style="color:var(--tenue)">Siete de los campos tienen algo para contar.</div>`;
})();


/* ══════════════════════════════════════════════════════════
   5 · LAS CUATRO PUERTAS
   ══════════════════════════════════════════════════════════ */

const AUTENTICACIONES = [
  { tipo: 'Nada', sub: 'API pública',
    texto: 'La dirección es pública y contesta a cualquiera. Es el caso de la Base InfoLeg que usamos hoy y el de casi todos los datos abiertos del Estado. No confundir con «no tiene límites»: casi siempre hay un tope de pedidos por minuto.' },
  { tipo: 'Una clave', sub: 'API key',
    texto: 'Un texto largo que va en un encabezado o en la dirección. Simple y suficiente para la mayoría. En n8n va como credencial de tipo Header Auth, nunca escrita adentro del nodo.' },
  { tipo: 'Un token', sub: 'Bearer token',
    texto: 'Igual que la clave pero con vencimiento: hay que pedir uno nuevo cada tanto con otra credencial. Si tu flujo anda una semana y después empieza a fallar con 401, es esto.' },
  { tipo: 'El baile completo', sub: 'OAuth 2',
    texto: 'El sistema te manda a una pantalla, la persona autoriza, y recién ahí te dan permiso en su nombre. Es lo que usás cuando conectás Gmail o Sheets: el nodo lo resuelve por vos, y por eso el nodo le gana a la API cruda.' }
];

(function auth() {
  const cont = document.getElementById('auth');
  if (!cont) return;
  cont.innerHTML = AUTENTICACIONES.map(a => `
    <div class="auth-item">
      <div class="tipo">${a.tipo}<small>${a.sub}</small></div>
      <p>${a.texto}</p>
    </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   6 · ACTIVIDAD
   ══════════════════════════════════════════════════════════ */

(function actividad() {
  const campos = ['q1', 'q2'];
  const $aviso = document.getElementById('guardado');
  if (!document.getElementById('q1')) return;

  campos.forEach(id => {
    const el = document.getElementById(id);
    el.value = leerGuardado('clase08-' + id);
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.setItem('clase08-' + id, el.value);
        const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
      }, 500);
    });
  });

  if (campos.some(id => leerGuardado('clase08-' + id))) {
    $aviso.textContent = 'Recuperado de tu última visita.';
  }
})();


/* ══════════════════════════════════════════════════════════
   7 · REVELADO AL SCROLL
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
