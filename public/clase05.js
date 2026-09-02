/* Clase 5 — Los ocho nodos que resuelven el noventa por ciento
   Cinco piezas: las deudas de la clase 4, el tablero de nodos, los tres
   cambios de cardinalidad, el simulador del caso InfoLeg y la actividad. */

exigirSesion();
document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function escapar(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


/* ══════════════════════════════════════════════════════════
   1 · LO QUE QUEDÓ DEBIENDO LA CLASE 4
   Las tres promesas textuales del cierre y las notas al pie de la 4.
   ══════════════════════════════════════════════════════════ */

const DEUDAS = [
  { titulo: 'Los tres nodos que cambian la cantidad de ítems',
    texto: 'La clase 4 te enseñó a reconocer las tres formas en el panel de salida — cuarenta y cuarenta, cuarenta y uno, uno y cuarenta — y dejó dicho que hoy les ponemos nombre propio. Son tres de los ocho.',
    donde: 'Se paga en el bloque de cardinalidad' },
  { titulo: 'El resumen se puede armar sin escribir código',
    texto: 'El mensaje para Valentina usaba la única línea de JavaScript de aquella clase, escondida adentro del texto de un nodo de Telegram. Existe la versión sin una sola línea, y son dos nodos.',
    donde: 'Se paga en el bloque del código' },
  { titulo: 'Un caso que no se puede resolver con una planilla',
    texto: 'Todo lo que construimos hasta hoy entraba y salía de una hoja de cálculo. El caso de hoy consulta un sitio del Estado que no tiene API ni RSS, y ahí aparecen el HTTP Request y sus consecuencias.',
    donde: 'Se paga en el caso completo' }
];

(function deudas() {
  const cont = document.getElementById('deudas');
  if (!cont) return;
  cont.innerHTML = DEUDAS.map(d => `
    <div class="deuda-item">
      <b>${d.titulo}</b>
      <p>${d.texto}</p>
      <span class="donde">${d.donde}</span>
    </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   2 · EL TABLERO DE NODOS
   Ocho del título más dos invitados. Cada uno con lo que importa:
   qué recibe, qué entrega, qué le hace a la cantidad de ítems y
   cuándo conviene no usarlo.
   ══════════════════════════════════════════════════════════ */

const NODOS = [
  {
    id: 'trigger', orden: '1', nombre: 'Trigger', familia: 'disparador',
    sub: 'Telegram Trigger', capa: 'Disparador',
    frase: 'Es la puerta. Nada pasa en un workflow si no hay algo que lo despierte.',
    recibe: 'Nada de adentro del flujo: lo despierta algo de afuera, un mensaje, un horario, una fila nueva.',
    entrega: 'Un ítem con el suceso completo tal como lo manda el sistema de origen. En el caso de hoy, el mensaje de Telegram entero.',
    cardinal: 'de cero a uno',
    cuidado: 'El ítem del disparador tiene mucho más adentro de lo que parece. Antes de escribir la expresión, abrí la salida y mirá la estructura: el texto del mensaje no está en la raíz, está en <code>message.text</code>.'
  },
  {
    id: 'set', orden: '2', nombre: 'Edit Fields', familia: 'datos',
    sub: 'antes se llamaba Set', capa: 'Datos',
    frase: 'Elige qué campos siguen viaje y con qué nombre. Es el nodo más usado de todos.',
    recibe: 'Los ítems del nodo anterior, con todo lo que traigan.',
    entrega: 'La misma cantidad de ítems, con los campos que vos decidiste. Podés quedarte solo con lo que sirve o agregar campos nuevos.',
    cardinal: 'uno entra, uno sale',
    cuidado: 'Tiene una llave que decide si los campos que no nombraste siguen o se caen. Si el nodo de más adelante «no encuentra» un campo que vos viste antes, mirá esa llave primero.'
  },
  {
    id: 'http', orden: '3', nombre: 'HTTP Request', familia: 'afuera',
    sub: 'el nodo que abre todo', capa: 'Salir afuera',
    frase: 'Cuando la integración no existe, este nodo la construye. Habla con cualquier cosa que esté en internet.',
    recibe: 'Un ítem con lo que haga falta para armar el pedido: una URL, parámetros, a veces credenciales.',
    entrega: 'La respuesta del otro lado. Si viene JSON, ya sale como ítems. Si viene HTML, sale un texto largo que hay que abrir con otro nodo.',
    cardinal: 'uno entra, uno o muchos salen',
    cuidado: 'Es el nodo que más depende de algo que no controlás. Antes de darlo por hecho, probalo con el sitio caído: si no decidiste qué pasa cuando responde 500, ya decidiste que se rompa.'
  },
  {
    id: 'html', orden: '+', nombre: 'HTML', familia: 'invitado',
    sub: 'invitado · Extract HTML Content', capa: 'Invitado',
    frase: 'Toma una página pensada para una persona y saca de ahí los pedazos que necesita el flujo.',
    recibe: 'El texto HTML que devolvió el HTTP Request.',
    entrega: 'Los campos que le pediste por selector CSS, ya como datos: un título, una tabla, una lista de enlaces.',
    cardinal: 'uno entra, uno sale',
    cuidado: 'Está en el flujo por una sola razón: InfoLeg no devuelve JSON. En n8n Cloud el nodo Code no puede parsear HTML, así que este no es un capricho, es la única puerta. También es lo primero que se rompe cuando el sitio cambia de plantilla.'
  },
  {
    id: 'code', orden: '4', nombre: 'Code', familia: 'datos',
    sub: 'el último recurso, no el primero', capa: 'Datos',
    frase: 'Hace la cuenta que ningún nodo sabe hacer. Nada más que eso.',
    recibe: 'Todos los ítems de la entrada, o uno por vez, según cómo lo configures.',
    entrega: 'Los ítems que devuelva tu código, con la forma que vos armes.',
    cardinal: 'lo que vos decidas',
    cuidado: 'La prueba para saber si corresponde: ¿existe un nodo que hace esto? En el caso de hoy corresponde, porque calcular la carpeta del anexo de InfoLeg (<code>Math.floor(id / 5000) * 5000</code>) no es algo que ningún nodo sepa hacer.'
  },
  {
    id: 'if', orden: '5', nombre: 'IF', familia: 'decision',
    sub: 'dos caminos', capa: 'Decisión',
    frase: 'Pregunta una sola cosa y manda cada ítem por la puerta verdadera o por la falsa.',
    recibe: 'Los ítems del nodo anterior.',
    entrega: 'Los mismos ítems, repartidos entre dos salidas. Ninguno se pierde.',
    cardinal: 'no cambia la cantidad, cambia el camino',
    cuidado: 'La rama falsa existe aunque vos no la conectes, y los ítems que caen ahí se detienen sin error y sin aviso. Conectala siempre, aunque sea a un mensaje que diga «no entendí».'
  },
  {
    id: 'switch', orden: '6', nombre: 'Switch', familia: 'decision',
    sub: 'muchos caminos', capa: 'Decisión',
    frase: 'El IF cuando las respuestas posibles son más de dos. Una salida por caso, más la salida de lo que no encaja.',
    recibe: 'Los ítems del nodo anterior.',
    entrega: 'Los mismos ítems, repartidos entre tantas salidas como reglas hayas escrito.',
    cardinal: 'no cambia la cantidad, cambia el camino',
    cuidado: 'La salida por defecto no es un detalle técnico: es una decisión de negocio. En la clase 2 un pedido se escapó justo por ahí. Si no sabés qué hacer con lo que no encaja, el flujo tampoco.'
  },
  {
    id: 'merge', orden: '7', nombre: 'Merge', familia: 'juntar',
    sub: 'dos ramas, un ítem', capa: 'Juntar',
    frase: 'Vuelve a unir lo que se separó, o cruza dos fuentes distintas en un solo ítem.',
    recibe: 'Dos entradas, cada una con sus ítems.',
    entrega: 'Depende del modo: pegados uno atrás del otro, o combinados campo a campo.',
    cardinal: 'muchos entran, menos salen',
    cuidado: 'El modo por posición asume que el primero de una entrada corresponde al primero de la otra. Si una rama filtró y la otra no, estás cruzando datos de dos normas distintas sin que nadie te avise.'
  },
  {
    id: 'summarize', orden: '+', nombre: 'Summarize', familia: 'invitado',
    sub: 'invitado · el que salda la deuda', capa: 'Invitado',
    frase: 'Junta muchos ítems en uno solo: los cuenta, los suma o los pega en un texto.',
    recibe: 'Todos los ítems de la entrada.',
    entrega: 'Un ítem con el resultado de la operación que elegiste.',
    cardinal: 'muchos entran, uno sale',
    cuidado: 'Es el que reemplaza la línea de JavaScript de la clase 4: concatenar un campo con salto de línea como separador. El nombre del campo que genera se lee en el panel de salida, y no lo elegís vos.'
  },
  {
    id: 'app', orden: '8', nombre: 'Nodos de app', familia: 'afuera',
    sub: 'Telegram, Gmail, Sheets y otros seiscientos', capa: 'Salir afuera',
    frase: 'Un HTTP Request al que alguien ya le escribió la parte difícil: la autenticación y los campos.',
    recibe: 'Los ítems con los datos que la acción necesita.',
    entrega: 'La respuesta del servicio, y de paso hace lo que tenía que hacer allá afuera.',
    cardinal: 'uno entra, uno sale, una acción por ítem',
    cuidado: 'Que exista el nodo no significa que la cuenta esté lista. Casi todo el tiempo perdido de la primera vez se va en la credencial, no en el nodo. Y ojo: una acción por ítem significa que cuarenta ítems mandan cuarenta mensajes.'
  }
];

const COLOR_FAMILIA = {
  disparador: 'naranja',
  datos: 'acierto',
  afuera: 'alerta',
  decision: 'coral',
  juntar: 'naranja',
  invitado: 'tenue'
};

(function tablero() {
  const $lista = document.getElementById('listaNodos');
  const $detalle = document.getElementById('detalleNodo');
  if (!$lista || !$detalle) return;

  function pintarLista() {
    $lista.innerHTML = NODOS.map((n, i) => `
      <button type="button" class="nodo-boton${i === 0 ? ' viva' : ''}" data-i="${i}">
        <span class="orden">${n.orden}</span>
        <span class="punto" data-familia="${n.familia}"></span>
        <span><b>${n.nombre}</b><small>${n.sub}</small></span>
      </button>`).join('');
    pintarPuntos();
  }

  // Los puntos se colorean por código, así que hay que rehacerlos al
  // cambiar de tema: cada tema tiene su propia versión de cada tono.
  function pintarPuntos() {
    $lista.querySelectorAll('.punto').forEach(p => {
      p.style.background = window.token(COLOR_FAMILIA[p.dataset.familia] || 'naranja');
    });
  }

  function pintarDetalle(i) {
    const n = NODOS[i];
    $detalle.innerHTML = `
      <span class="capa">${n.capa}</span>
      <h3>${n.nombre}</h3>
      <p class="frase">${n.frase}</p>
      <div class="detalle-rejilla">
        <div class="detalle-celda"><span>Qué recibe</span><p>${n.recibe}</p></div>
        <div class="detalle-celda"><span>Qué entrega</span><p>${n.entrega}</p></div>
      </div>
      <span class="cardinal-sello">${n.cardinal}</span>
      <div class="cuidado"><b>Cuándo mirar dos veces.</b> ${n.cuidado}</div>`;
  }

  $lista.addEventListener('click', e => {
    const b = e.target.closest('.nodo-boton');
    if (!b) return;
    $lista.querySelectorAll('.nodo-boton').forEach(x => x.classList.remove('viva'));
    b.classList.add('viva');
    pintarDetalle(Number(b.dataset.i));
  });

  pintarLista();
  pintarDetalle(0);
  window.addEventListener('cambio-tema', pintarPuntos);
})();


/* ══════════════════════════════════════════════════════════
   3 · LOS TRES CAMBIOS DE CANTIDAD
   La deuda explícita del bloque "Vocabulario para la clase 5".
   ══════════════════════════════════════════════════════════ */

const CARDINALES = [
  { forma: '1 → 1', nombre: 'Edit Fields', tono: 'acierto',
    texto: 'Uno entra, uno sale. Casi todos los nodos hacen esto, y por eso el rastro entre entrada y salida se mantiene: el ítem tres de la salida viene del ítem tres de la entrada.',
    caso: 'En el caso de hoy: recortar el extracto del texto a seiscientos caracteres.' },
  { forma: 'N → 1', nombre: 'Merge y Summarize', tono: 'alerta',
    texto: 'Muchos entran, uno sale. Es la diferencia entre un aviso útil y cinco notificaciones sueltas que nadie lee. También es donde se corta el rastro: después de juntar, ya no hay ítem tres.',
    caso: 'En el caso de hoy: cruzar la ficha de la norma con el texto que trajo la otra rama.' },
  { forma: '1 → N', nombre: 'HTTP Request y Split Out', tono: 'coral',
    texto: 'Uno entra, muchos salen. Pasa cuando una respuesta trae una lista adentro: pedís una búsqueda y vuelven veinte resultados. Cada uno pasa a ser un ítem y todo lo que sigue corre veinte veces.',
    caso: 'En el caso de hoy: la búsqueda que devuelve varias normas con el mismo número.' }
];

(function cardinalidad() {
  const cont = document.getElementById('cardinales');
  if (!cont) return;

  function pintar() {
    cont.innerHTML = CARDINALES.map(c => `
      <div class="ficha">
        <span class="marca-capa" style="color:${window.token(c.tono)}">${c.forma}</span>
        <h3>${c.nombre}</h3>
        <p>${c.texto}</p>
        <p style="margin-top:10px;font-size:0.84rem;color:var(--texto)">${c.caso}</p>
      </div>`).join('');
  }

  pintar();
  window.addEventListener('cambio-tema', pintar);
})();


/* ══════════════════════════════════════════════════════════
   4 · EL SIMULADOR DEL CASO
   El mismo pedido recorriendo los nodos. Los datos son una captura
   preparada para la clase: la página no sale a InfoLeg.
   El id 401266 y la ruta del anexo son reales y verificables.
   ══════════════════════════════════════════════════════════ */

const PEDIDOS = [
  { etiqueta: 'ley 27742', texto: 'ley 27742', tipo: 'Ley', numero: '27742', valido: true },
  { etiqueta: 'la de bases', texto: 'che, pasame la de bases', tipo: 'Otro', numero: '', valido: false }
];

function pasosDe(p) {
  const base = [
    {
      nodo: 'Telegram Trigger', quien: 'Disparador',
      titulo: 'Llega el pedido',
      texto: 'Alguien le escribe al bot. El disparador entrega el mensaje entero, con mucho más adentro de lo que se ve en la pantalla del teléfono.',
      cardinal: ['0', '1'],
      json: { message: { chat: { id: 5512340987 }, from: { first_name: 'Mariana' }, text: p.texto } }
    },
    {
      nodo: 'Edit Fields', quien: 'Datos',
      titulo: 'Entender el pedido',
      texto: 'Se queda con cuatro campos y descarta el resto. El tipo sale de buscar la palabra en el texto; el número, de quedarse solo con los dígitos. Sin código: expresiones.',
      cardinal: ['1', '1'],
      json: { chat_id: '5512340987', pedido: p.texto, tipo: p.tipo, numero: p.numero }
    },
    {
      nodo: 'IF', quien: 'Decisión',
      titulo: '¿Entendí qué norma es?',
      texto: p.valido
        ? 'Hay número y hay tipo reconocido: el ítem sale por la puerta verdadera y sigue. La cantidad de ítems no cambió, cambió el camino.'
        : 'No hay número, o el tipo quedó en «Otro»: el ítem sale por la puerta falsa. Acá termina el recorrido, y termina bien: el bot pide los datos que faltan en vez de inventar.',
      cardinal: ['1', '1'],
      json: { chat_id: '5512340987', pedido: p.texto, tipo: p.tipo, numero: p.numero,
              rama: p.valido ? 'verdadera' : 'falsa' }
    }
  ];

  if (!p.valido) {
    base.push({
      nodo: 'Telegram', quien: 'Nodo de app',
      titulo: 'Pedir tipo y número',
      texto: 'La rama falsa siempre va conectada a algo. Un flujo que se detiene en silencio es un flujo que nadie sabe que está roto. Y este es justo el pedido que un agente entendería: lo vemos al final de la clase.',
      cardinal: ['1', '1'],
      json: { ok: true, resultado: 'No te entendí. Decime tipo y número, por ejemplo: ley 27742' }
    });
    return base;
  }

  // Un solo caso feliz, y con datos verificables: la Ley 27.742 tiene el
  // id 401266 en InfoLeg y su texto vive en anexos/400000-404999/401266/.
  const ficha = {
    titulo: 'LEY DE BASES Y PUNTOS DE PARTIDA PARA LA LIBERTAD DE LOS ARGENTINOS',
    sancion: '2024-06-27', publicacion: '2024-07-08', id_infoleg: 401266
  };
  const desde = Math.floor(ficha.id_infoleg / 5000) * 5000;
  const carpeta = `${desde}-${desde + 4999}`;

  return base.concat([
    {
      nodo: 'HTTP Request', quien: 'Salir afuera',
      titulo: 'Buscar la norma',
      texto: 'El primer pedido a la web. Vuelve la ficha con el dato que hace falta para todo lo demás: el id de InfoLeg. En el archivo del caso este nodo viene con pin data, así que el flujo corre aunque el sitio no conteste.',
      cardinal: ['1', '1'],
      json: { tipo: p.tipo, numero: p.numero, ...ficha }
    },
    {
      nodo: 'Code', quien: 'Datos',
      titulo: 'Calcular la carpeta',
      texto: 'InfoLeg guarda cada texto en una carpeta que agrupa de a cinco mil ids. El 401266 cae en la 400000-404999. Eso no viene en la respuesta: es una cuenta, y es el único lugar de la clase donde hace falta código.',
      cardinal: ['1', '1'],
      json: { id_infoleg: ficha.id_infoleg,
              carpeta: carpeta,
              url_ficha: `https://servicios.infoleg.gob.ar/infolegInternet/verNorma.do?id=${ficha.id_infoleg}`,
              url_texto: `https://servicios.infoleg.gob.ar/infolegInternet/anexos/${carpeta}/${ficha.id_infoleg}/norma.htm` }
    },
    {
      nodo: 'HTTP Request + HTML', quien: 'Salir afuera e invitado',
      titulo: 'Traer el texto y abrirlo',
      texto: 'El segundo pedido trae la página entera como un texto largo. El nodo HTML la abre por selector CSS. Acá el flujo deja de ser un contrato y pasa a ser un acuerdo tácito con la plantilla del sitio.',
      cardinal: ['1', '1'],
      json: { titulo_pagina: 'InfoLEG - Ministerio de Justicia - Argentina',
              cuerpo: '(el texto de la norma, varios miles de caracteres)' }
    },
    {
      nodo: 'Switch', quien: 'Decisión',
      titulo: 'Cómo se cita',
      texto: 'Una ley y un decreto no se citan igual, y lo que no reconocemos tiene su propia salida en vez de romperse. Tres puertas, ningún ítem perdido.',
      cardinal: ['1', '1'],
      json: { tipo: p.tipo, salida: 'ley', cita: 'Ley 27.742 (B.O. 2024-07-08)' }
    },
    {
      nodo: 'Merge', quien: 'Juntar',
      titulo: 'Ficha + texto',
      texto: 'Las dos ramas que salieron del buscador vuelven a ser un solo ítem: por un lado la ficha y la cita, por el otro el extracto. Muchos entran, uno sale.',
      cardinal: ['2', '1'],
      json: { cita: 'Ley 27.742 (B.O. 2024-07-08)',
              titulo: ficha.titulo, sancion: ficha.sancion, publicacion: ficha.publicacion,
              extracto: '(los primeros 600 caracteres del texto)',
              url_ficha: `https://servicios.infoleg.gob.ar/infolegInternet/verNorma.do?id=${ficha.id_infoleg}` }
    },
    {
      nodo: 'Telegram', quien: 'Nodo de app',
      titulo: 'Responder al chat',
      texto: 'La respuesta sale por el mismo chat del que vino el pedido. Nunca el texto completo: el extracto y el link al original. Una ejecución, catorce nodos, un mensaje.',
      cardinal: ['1', '1'],
      json: { ok: true, resultado: 'mensaje enviado al chat 5512340987' }
    }
  ]);
}

function comoJson(obj) {
  return JSON.stringify(obj, null, 2)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="clave">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="texto">"$1"</span>')
    .replace(/: (-?\d+(?:\.\d+)?)/g, ': <span class="numero">$1</span>');
}

(function simulador() {
  const $barra = document.getElementById('simBarra');
  const $pasos = document.getElementById('simPasos');
  if (!$barra || !$pasos) return;

  let iPedido = 0;
  let iPaso = 0;

  function pintarBarra() {
    $barra.innerHTML = PEDIDOS.map((p, i) =>
      `<button type="button" data-i="${i}" class="${i === iPedido ? 'viva' : ''}">${escapar(p.etiqueta)}</button>`
    ).join('') + `<span class="cuenta" id="simCuenta"></span>`;
  }

  function pintar() {
    const pasos = pasosDe(PEDIDOS[iPedido]);
    if (iPaso >= pasos.length) iPaso = pasos.length - 1;
    const paso = pasos[iPaso];

    $pasos.innerHTML = pasos.map((p, i) =>
      `<button type="button" class="sim-paso${i === iPaso ? ' viva' : ''}" data-i="${i}">${i + 1} · ${p.nodo}</button>`
    ).join('');

    document.getElementById('simQuien').textContent = paso.quien;
    document.getElementById('simTitulo').textContent = paso.titulo;
    document.getElementById('simTexto').textContent = paso.texto;
    document.getElementById('simJson').innerHTML = comoJson(paso.json);
    document.getElementById('simCardinal').innerHTML =
      `entran <b>${paso.cardinal[0]}</b> &nbsp;→&nbsp; salen <b>${paso.cardinal[1]}</b>`;

    const cuenta = document.getElementById('simCuenta');
    if (cuenta) cuenta.textContent = `paso ${iPaso + 1} de ${pasos.length} · 1 ejecución`;
  }

  $barra.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    iPedido = Number(b.dataset.i);
    iPaso = 0;
    pintarBarra();
    pintar();
  });

  $pasos.addEventListener('click', e => {
    const b = e.target.closest('.sim-paso');
    if (!b) return;
    iPaso = Number(b.dataset.i);
    pintar();
  });

  pintarBarra();
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   5 · LA LETRA CHICA DEL SCRAPING
   ══════════════════════════════════════════════════════════ */

const FRAGILIDADES = [
  { que: 'El selector',
    texto: 'El día que InfoLeg cambie su plantilla, el nodo HTML va a devolver vacío y el bot va a contestar una ficha sin texto. No falla: contesta mal, que es peor. Toda extracción por selector necesita un chequeo de que trajo algo.' },
  { que: 'Las reglas del sitio',
    texto: 'Antes de la primera consulta se lee el archivo <code>/robots.txt</code> del sitio y sus términos de uso. Es la parte que nadie enseña y la primera que pregunta un área legal. Lo hacemos juntos en clase, en vivo, sobre el sitio real.' },
  { que: 'El ritmo',
    texto: 'Un pedido por vez y con pausa. Un flujo que dispara doscientas consultas en un minuto no es más eficiente: es una molestia para un servicio público que se paga con impuestos, y una invitación a que te bloqueen.' },
  { que: 'La copia',
    texto: 'Se manda un extracto y el link al original, nunca el texto completo republicado. Además de lo legal, hay una razón práctica: el original se actualiza y tu copia no.' },
  { que: 'El plan B',
    texto: 'Si el sitio no responde, el flujo tiene que decir «no pude consultar InfoLeg», no quedarse callado ni inventar. Eso es diseño de errores, y es la clase que viene.' }
];

(function fragilidad() {
  const cont = document.getElementById('fragilidades');
  if (!cont) return;
  cont.innerHTML = FRAGILIDADES.map(f => `
    <div class="fragil-item">
      <div class="que">${f.que}</div>
      <p>${f.texto}</p>
    </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   6 · ACTIVIDAD
   Misma convención que las clases 2 y 4: se guarda en este dispositivo.
   ══════════════════════════════════════════════════════════ */

(function actividad() {
  const campos = ['q1', 'q2', 'q3'];
  const $aviso = document.getElementById('guardado');
  if (!document.getElementById('q1')) return;

  campos.forEach(id => {
    const el = document.getElementById(id);
    el.value = localStorage.getItem('clase05-' + id) || '';
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.setItem('clase05-' + id, el.value);
        const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
      }, 500);
    });
  });

  if (campos.some(id => localStorage.getItem('clase05-' + id))) {
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
