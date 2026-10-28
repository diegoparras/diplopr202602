/* Clase 14 — RAG con n8n y con Dify
   Piezas: lo que trajo de la clase 13, dónde va cada cosa, partir el
   documento, buscar por significado, el paquete que recibe el modelo,
   los errores comunes, n8n o Dify, la práctica en Dify y la actividad.

   El documento es la política de la tienda de la clase 13: el mismo texto
   que trae el workflow de la clase y el archivo para subir a Dify. Nada se
   dibuja con colores leídos desde JavaScript: todo sale de las variables
   de estilo.css. Ninguna pieza depende de un modelo ni de un proveedor. */

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
function marcar(grupo, boton) {
  grupo.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === boton)));
}

// La política de la tienda. Un solo origen: el mismo texto va al workflow
// y al archivo que se descarga para Dify.
const POLITICA = "# Política de atención de la tienda\n\nTienda de ropa inventada para la clase 14. No es asesoramiento legal.\n\n## Cambios\nPodés cambiar cualquier prenda por otro talle o por otro color dentro de los 30 días corridos desde que la recibiste. La prenda tiene que estar sin uso, con la etiqueta puesta y con el comprobante de compra. El primer cambio es sin costo; si querés un segundo cambio de la misma prenda, el envío lo pagás vos. Las prendas en liquidación se pueden cambiar sólo por talle.\n\n## Devoluciones y arrepentimiento\nSi compraste por la web y te arrepentiste, tenés 10 días corridos desde la entrega para devolver la compra sin dar explicaciones. Te reintegramos el dinero por el mismo medio de pago dentro de los 10 días hábiles de recibir la prenda. Pasado ese plazo no hacemos devoluciones de dinero, pero podés cambiar la prenda según la política de cambios.\n\n## Envíos\nEnviamos a todo el país. En la Ciudad de Buenos Aires el pedido llega en 48 horas hábiles; en el resto del país, entre 3 y 7 días hábiles según la provincia. El envío es gratis en compras desde $ 80.000. Cuando el pedido sale te mandamos un correo con el número de seguimiento. Por ahora no hacemos envíos al exterior.\n\n## Formas de pago\nAceptamos tarjetas de crédito y débito, transferencia bancaria y billeteras virtuales. Con tarjeta de crédito de bancos adheridos hay hasta 6 cuotas sin interés en compras desde $ 60.000. Pagando por transferencia tenés un 10 % de descuento. El pedido se prepara cuando el pago queda acreditado.\n\n## Prendas con falla\nSi una prenda llega con una falla de fabricación, como una costura abierta, una mancha o un cierre que no funciona, la cambiamos sin costo dentro de los 6 meses de la compra. Mandanos una foto de la falla por correo y te enviamos la prenda nueva o, si no hay stock, te reintegramos el dinero.\n\n## Talles\nLas remeras y los buzos tienen horma amplia: si dudás entre dos talles, elegí el más chico. Los pantalones tienen horma justa: si dudás, elegí el más grande. En cada producto de la web está la tabla de medidas en centímetros.\n\n## Atención\nRespondemos consultas por correo y por el chat de la web, de lunes a viernes de 9 a 18. Los pedidos se pueden consultar con el número que figura en el correo de confirmación.";


/* ══════════════════════════════════════════════════════════
   1 · LO QUE TRAJISTE DE LA CLASE 13
   ══════════════════════════════════════════════════════════ */

(function traido() {
  const cont = document.getElementById('traido');
  if (!cont) return;
  const q1 = leerGuardado('clase13-q1');
  const q2 = leerGuardado('clase13-q2');
  if (!q1 && !q2) {
    cont.innerHTML = `
      <span class="rot">Todavía no hay nada guardado acá</span>
      <p class="vacio" style="margin-top:12px">La actividad de la clase 13 pedía seguir un caso y anotar qué datos pasan por servidores ajenos. Si la hiciste en otro dispositivo no la voy a ver. Podés completarla en <a href="13.html">la clase 13</a> o traerla pensada: hoy le sumamos una fila, la de los documentos.</p>`;
    return;
  }
  cont.innerHTML = '<span class="rot">Lo que escribiste el miércoles</span>' +
    (q1 ? `
      <div class="linea">
        <b>Qué datos de tu proceso pasaron por servidores ajenos</b>
        <p style="white-space:pre-wrap">${escapar(q1)}</p>
        <p style="font-size:0.84rem;color:var(--tenue);margin-top:4px">Hoy esta lista crece: con RAG, tus documentos viajan al proveedor de <i>embeddings</i> y quedan guardados en una base de vectores. Al final de la clase decidís cuáles no deberían salir.</p>
      </div>` : '') +
    (q2 ? `
      <div class="linea">
        <b>Si tu n8n viviera en una máquina de la organización</b>
        <p style="white-space:pre-wrap">${escapar(q2)}</p>
        <p style="font-size:0.84rem;color:var(--tenue);margin-top:4px">Esta respuesta la guardamos para la clase 15, que es la de alojarlo vos.</p>
      </div>` : '');
})();


/* ══════════════════════════════════════════════════════════
   2 · PRUEBAS RÁPIDAS
   ══════════════════════════════════════════════════════════ */

function prueba(idCont, items, opciones) {
  const $c = document.getElementById(idCont);
  if (!$c) return;
  const $total = document.getElementById(idCont + 'Total');
  const respuestas = {};
  function contar() {
    const bien = Object.values(respuestas).filter(Boolean).length;
    const faltan = items.length - Object.keys(respuestas).length;
    $total.textContent = `${bien} de ${items.length} bien${faltan ? ' · faltan ' + faltan : ''}`;
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

prueba('pruebaDonde', [
  { t: '¿Cuántas remeras talle M quedan?', ok: 'herr', por: 'Tiene llave: producto y talle. Se busca exacto en una tabla, con una herramienta, como consultar_stock de la clase 13.' },
  { t: 'La remera me quedó chica, ¿cómo hago para cambiarla?', ok: 'docs', por: 'La respuesta está escrita en la política de cambios, y nadie la va a preguntar con las mismas palabras. Se busca por significado.' },
  { t: '¿En qué estado está la factura 7-4410?', ok: 'herr', por: 'Número de factura: llave. La Data Table de la clase 9, con una herramienta.' },
  { t: 'Me llegó un buzo con una costura abierta, ¿qué hago?', ok: 'docs', por: 'Está en el apartado de prendas con falla, aunque la persona no diga «falla». Base de documentos.' },
  { t: 'Que el asistente siempre firme «Administración».', ok: 'instr', por: 'Es una regla fija para todos los casos: va en las instrucciones, como en la clase 11.' }
], [{ v: 'herr', t: 'Herramienta' }, { v: 'docs', t: 'Base de documentos' }, { v: 'instr', t: 'Instrucciones' }]);

prueba('pruebaErrores', [
  { t: 'Cargaste la política con un modelo de <i>embeddings</i> y preguntás con otro. Las búsquedas devuelven cualquier cosa.', ok: 'modelo', por: 'Cada modelo traduce el texto a números a su manera: los de uno no se comparan con los del otro. Cargar y preguntar, siempre con el mismo.' },
  { t: 'Los pedazos son de 100 caracteres. Al preguntar por cambios aparece «sin uso, con la etiqueta puesta», pero no dice cuántos días hay.', ok: 'corte', por: 'Pedazos demasiado chicos cortan la idea a la mitad. Más tamaño o algo de superposición.' },
  { t: 'La tienda cambió el plazo de cambios a 15 días, pero el asistente sigue diciendo 30.', ok: 'viejo', por: 'La base guarda lo que le cargaste. Si el documento cambia, hay que volver a cargarlo: RAG no se entera solo.' },
  { t: 'Preguntan por un local para probarse ropa y el asistente inventa una dirección.', ok: 'inventa', por: 'La política no dice nada de locales. Las instrucciones tienen que decirle que si los pedazos no alcanzan, no invente y derive a una persona.' }
], [{ v: 'modelo', t: 'Distinto modelo' }, { v: 'corte', t: 'Pedazos mal cortados' }, { v: 'viejo', t: 'Documento viejo' }, { v: 'inventa', t: 'Falta un freno' }]);

prueba('pruebaCual', [
  { t: 'Un asistente en la web para que los clientes pregunten por cambios, envíos y pagos. Nada más.', ok: 'dify', por: 'El centro es conversar con documentos. Dify trae la base, la prueba de búsqueda y la página de chat publicada, sin armar nada.' },
  { t: 'Cuando llega un correo de reclamo, buscar en la política qué corresponde, avisar a Marcela por Telegram y anotar el caso en la planilla.', ok: 'n8n', por: 'El centro es un proceso con disparador, condición y acciones. La búsqueda en la política es un paso del medio.' },
  { t: 'El área de atención ya tiene su asistente en Dify, y querés que un flujo de n8n le pregunte antes de responder un correo.', ok: 'ambos', por: 'n8n orquesta y le pregunta a Dify por su API, con un HTTP Request. Es el segundo flujo de la clase.' }
], [{ v: 'dify', t: 'Dify' }, { v: 'n8n', t: 'n8n' }, { v: 'ambos', t: 'n8n que llama a Dify' }]);


/* ══════════════════════════════════════════════════════════
   3 · PARTIR EL DOCUMENTO
   Parecido a lo que hace un divisor recursivo: corta por párrafos, después
   por oraciones y recién después por palabras, sin pasarse del tamaño, y
   repite el final de un pedazo al principio del siguiente.
   ══════════════════════════════════════════════════════════ */

function partir(texto, tam, sup) {
  const piezas = [];
  texto.split(/\n{2,}/).forEach(par => {
    par = par.trim();
    if (!par) return;
    if (par.length <= tam) { piezas.push(par); return; }
    par.split(/(?<=[.!?])\s+/).forEach(or => {
      if (or.length <= tam) { piezas.push(or); return; }
      let actual = '';
      or.split(/\s+/).forEach(p => {
        if ((actual + ' ' + p).trim().length > tam && actual) { piezas.push(actual); actual = p; }
        else actual = (actual + ' ' + p).trim();
      });
      if (actual) piezas.push(actual);
    });
  });
  const pedazos = [];
  let actual = '';
  piezas.forEach(p => {
    const junto = actual ? actual + ' ' + p : p;
    if (junto.length > tam && actual) {
      pedazos.push(actual);
      let cola = '';
      if (sup > 0) {
        const palabras = actual.split(/\s+/);
        while (palabras.length && (palabras[palabras.length - 1] + ' ' + cola).trim().length <= sup) cola = (palabras.pop() + ' ' + cola).trim();
      }
      actual = cola ? cola + ' ' + p : p;
    } else actual = junto;
  });
  if (actual) pedazos.push(actual);
  return pedazos.map((t, i) => {
    const previo = i > 0 ? pedazos[i - 1] : '';
    let comun = 0;
    for (let n = Math.min(previo.length, t.length); n > 0; n--) if (previo.endsWith(t.slice(0, n))) { comun = n; break; }
    return { t, sup: comun };
  });
}

// Lo que se parte es el texto sin el encabezado de la página.
const CUERPO = POLITICA.split('\n').filter(l => !/^# /.test(l) && !/^Tienda de ropa inventada/.test(l)).join('\n').replace(/^## (.+)$/gm, '$1.').trim();

const estado = { tam: 400, sup: 50, pedazos: [] };
const alCambiarPedazos = [];

(function partirDoc() {
  const $tam = document.getElementById('ptTam');
  if (!$tam) return;
  const $sup = document.getElementById('ptSup');
  const $lista = document.getElementById('ptLista');
  const $res = document.getElementById('ptResumen');
  function pintar() {
    estado.tam = +$tam.value;
    estado.sup = Math.min(+$sup.value, Math.floor(estado.tam / 2));
    document.getElementById('ptTamV').textContent = estado.tam;
    document.getElementById('ptSupV').textContent = estado.sup;
    estado.pedazos = partir(CUERPO, estado.tam, estado.sup);
    $res.textContent = `${estado.pedazos.length} pedazos de hasta ${estado.tam} caracteres, con ${estado.sup} de superposición.`;
    $lista.innerHTML = estado.pedazos.map((p, i) => `
      <div class="pedazo">
        <span class="rot">Pedazo ${i + 1} · ${p.t.length} caracteres</span>
        <p>${p.sup ? `<mark>${escapar(p.t.slice(0, p.sup))}</mark>${escapar(p.t.slice(p.sup))}` : escapar(p.t)}</p>
      </div>`).join('');
    alCambiarPedazos.forEach(f => f());
  }
  $tam.addEventListener('input', pintar);
  $sup.addEventListener('input', pintar);
  document.querySelectorAll('[data-pt]').forEach(b => b.addEventListener('click', () => {
    const [t, s] = b.dataset.pt.split(',');
    $tam.value = t; $sup.value = s; pintar();
  }));
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   4 · BUSCAR POR SIGNIFICADO
   Un modelo de embeddings convierte cada texto en cientos de números que
   aprendió solo. Acá son diez «ideas» escritas a mano: alcanza para ver
   cómo se compara el significado y no las palabras.
   ══════════════════════════════════════════════════════════ */

const IDEAS = {
  cambio: ['cambi', 'canje'],
  talle: ['talle', 'chica', 'chico', 'grand', 'ajust', 'apret', 'holgad', 'medida', 'horma', 'amplia', 'justa'],
  devolución: ['devol', 'devuel', 'arrepent', 'reintegr', 'reembols', 'plata', 'dinero'],
  envío: ['envi', 'lleg', 'tard', 'demor', 'seguimiento', 'despach', 'entreg', 'exterior'],
  lugar: ['cordob', 'rosari', 'mendoz', 'provinc', 'interior', 'ciudad', 'caba', 'chile', 'uruguay', 'pais'],
  pago: ['pag', 'cuota', 'tarjeta', 'transfer', 'billetera', 'efectivo', 'descuent', 'acredit', 'mercado'],
  falla: ['falla', 'rota', 'roto', 'defect', 'costur', 'mancha', 'cierre', 'descos', 'fabric'],
  plazo: ['dias', 'plazo', 'hora', 'semana', 'mes'],
  atención: ['consult', 'atenc', 'horari', 'chat', 'respond', 'contact', 'lunes', 'viernes'],
  comprobante: ['etiqueta', 'comprobante', 'ticket', 'factura', 'uso']
};
const NOMBRES_IDEAS = Object.keys(IDEAS);
const normal = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const palabras = t => normal(t).split(/[^a-zñ0-9]+/).filter(Boolean);
function vector(t) {
  const v = NOMBRES_IDEAS.map(() => 0);
  palabras(t).forEach(w => NOMBRES_IDEAS.forEach((k, i) => { if (IDEAS[k].some(r => w.startsWith(r))) v[i]++; }));
  return v;
}
function coseno(a, b) {
  let p = 0, na = 0, nb = 0;
  a.forEach((x, i) => { p += x * b[i]; na += x * x; nb += b[i] * b[i]; });
  return na && nb ? p / Math.sqrt(na * nb) : 0;
}
const VACIAS = new Set('para como cuando donde puedo tengo tienen hacen hago pero esta este estos esas sobre desde hasta porque quiero'.split(' '));
function exactas(q, t) {
  const pq = new Set(palabras(q).filter(w => w.length > 3 && !VACIAS.has(w)));
  const pt = new Set(palabras(t));
  let n = 0; pq.forEach(w => { if (pt.has(w)) n++; });
  return n;
}

const UMBRAL = 0.3;
const busqueda = { pregunta: '', topK: 3, hallados: [] };
const alBuscar = [];

(function buscar() {
  const $preg = document.getElementById('bsPreg');
  if (!$preg) return;
  const $txt = document.getElementById('bsTexto');
  const $k = document.getElementById('bsK');
  const $vec = document.getElementById('bsVector');
  const $res = document.getElementById('bsRes');
  const $exa = document.getElementById('bsExactas');
  const PREGUNTAS = [
    'La remera me quedó chica, ¿cómo hago para cambiarla?',
    'Me arrepentí de la compra, ¿me devuelven la plata?',
    '¿Cuánto tarda en llegar a Córdoba?',
    'El buzo vino con una costura rota',
    '¿Puedo pagar en cuotas?',
    '¿Tienen local para probarme la ropa?'
  ];
  function pintar() {
    busqueda.pregunta = $txt.value.trim();
    busqueda.topK = +$k.value;
    document.getElementById('bsKV').textContent = busqueda.topK;
    const vq = vector(busqueda.pregunta);
    const max = Math.max(1, ...vq);
    $vec.innerHTML = busqueda.pregunta
      ? NOMBRES_IDEAS.map((k, i) => `<div class="idea${vq[i] ? ' on' : ''}"><span>${k}</span><i style="width:${(vq[i] / max) * 100}%"></i></div>`).join('')
      : '<p class="sim-vacia">Escribí o elegí una pregunta.</p>';
    const puntajes = estado.pedazos.map((p, i) => ({ i, t: p.t, s: coseno(vq, vector(p.t)), e: exactas(busqueda.pregunta, p.t) }));
    const orden = [...puntajes].sort((a, b) => b.s - a.s);
    busqueda.hallados = orden.slice(0, busqueda.topK).filter(x => x.s >= UMBRAL);
    $res.innerHTML = !busqueda.pregunta ? '' : orden.slice(0, busqueda.topK).map(x => `
      <div class="hallado${x.s >= UMBRAL ? '' : ' flojo'}">
        <div class="cabeza"><span class="rot">Pedazo ${x.i + 1}</span><b>${x.s.toFixed(2)}</b></div>
        <div class="barra-ctx"><i style="width:${Math.round(x.s * 100)}%"></i></div>
        <p>${escapar(x.t.length > 220 ? x.t.slice(0, 220) + '…' : x.t)}</p>
      </div>`).join('') + (busqueda.hallados.length ? '' : `<p class="aviso-umbral">Ningún pedazo pasa el umbral de ${UMBRAL}. La política no habla de esto: el asistente no tiene con qué contestar y tiene que derivar.</p>`);
    const mejorExacta = [...puntajes].sort((a, b) => b.e - a.e)[0];
    $exa.innerHTML = !busqueda.pregunta ? '' : mejorExacta && mejorExacta.e
      ? `Buscando las palabras exactas, el mejor es el pedazo ${mejorExacta.i + 1}, con ${mejorExacta.e} ${mejorExacta.e === 1 ? 'palabra' : 'palabras'} en común.`
      : 'Buscando las palabras exactas, <b>no aparece nada</b>: nadie escribe igual que el documento.';
    alBuscar.forEach(f => f());
  }
  $preg.innerHTML = PREGUNTAS.map((p, i) => `<button type="button" data-i="${i}" aria-pressed="false">${escapar(p)}</button>`).join('');
  $preg.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    marcar($preg, b);
    $txt.value = PREGUNTAS[+b.dataset.i];
    pintar();
  });
  $txt.addEventListener('input', () => { marcar($preg, null); pintar(); });
  $k.addEventListener('input', pintar);
  alCambiarPedazos.push(pintar);
  $preg.querySelector('button').click();
})();


/* ══════════════════════════════════════════════════════════
   5 · EL PAQUETE QUE RECIBE EL MODELO
   ══════════════════════════════════════════════════════════ */

(function paquete() {
  const $p = document.getElementById('paquete');
  if (!$p) return;
  const INSTR = 'Sos el asistente de atención de una tienda de ropa. Respondé sólo con la información de los fragmentos de la política que vienen abajo. Si los fragmentos no alcanzan para contestar, decilo y ofrecé derivar la consulta a una persona. No inventes plazos, montos ni direcciones.';
  function pintar() {
    const frag = busqueda.hallados.length
      ? busqueda.hallados.map((h, n) => `[Fragmento ${n + 1} · pedazo ${h.i + 1}]\n${h.t}`).join('\n\n')
      : '(La búsqueda no devolvió ningún fragmento que pase el umbral.)';
    $p.innerHTML = `<span class="bloque-p instr"><b>Instrucciones</b>${escapar(INSTR)}</span><span class="bloque-p frag"><b>Lo que trajo la búsqueda</b>${escapar(frag)}</span><span class="bloque-p preg"><b>La pregunta</b>${escapar(busqueda.pregunta || '—')}</span>`;
    document.getElementById('paqueteNota').textContent = busqueda.hallados.length
      ? `El modelo recibe ${busqueda.hallados.length} ${busqueda.hallados.length === 1 ? 'fragmento' : 'fragmentos'}, no el documento entero. Lo que no está acá, no lo sabe.`
      : 'Sin fragmentos, lo único que lo frena de inventar es la última oración de las instrucciones.';
  }
  alBuscar.push(pintar);
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   6 · LA PRÁCTICA EN DIFY
   ══════════════════════════════════════════════════════════ */

(function practica() {
  const $d = document.getElementById('bajarPolitica');
  if ($d) {
    $d.addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([POLITICA + '\n'], { type: 'text/markdown;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = url; a.download = 'politica-de-la-tienda.md';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }
  document.querySelectorAll('[data-copiar]').forEach(b => b.addEventListener('click', () => {
    const texto = document.getElementById(b.dataset.copiar).textContent;
    const original = b.textContent;
    const listo = ok => { b.textContent = ok ? 'Copiado' : 'Seleccioná y copiá a mano'; setTimeout(() => { b.textContent = original; }, 1800); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(() => listo(true), () => listo(false));
    else listo(false);
  }));
  const marcas = (() => { try { return JSON.parse(leerGuardado('clase14-practica') || '{}'); } catch (e) { return {}; } })();
  document.querySelectorAll('.chequeo input[type="checkbox"]').forEach(ch => {
    ch.checked = !!marcas[ch.id];
    ch.addEventListener('change', () => { marcas[ch.id] = ch.checked; guardar('clase14-practica', JSON.stringify(marcas)); });
  });
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
    el.value = leerGuardado('clase14-' + id);
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (guardar('clase14-' + id, el.value)) {
          const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
          $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
        } else {
          $aviso.textContent = 'No pude guardar: el navegador tiene bloqueado el almacenamiento.';
        }
      }, 500);
    });
  });
  if (campos.some(id => leerGuardado('clase14-' + id))) $aviso.textContent = 'Recuperado de tu última visita.';
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
