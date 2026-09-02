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
    cuidado: 'La prueba para saber si corresponde: ¿existe un nodo que hace esto? En el caso de hoy corresponde una sola vez, porque el nodo HTML devuelve tres listas paralelas (enlaces, títulos, fechas) y hay que cruzarlas por posición para armar una norma por fila. Eso ningún nodo lo hace.'
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
    caso: 'En el caso de hoy, verificado: pedir «decreto 70 2023» devuelve dos normas distintas, el DNU de diciembre y una de nomenclatura del Mercosur.' }
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
   El mismo pedido recorriendo los nodos. Todo lo que se ve en el panel
   son respuestas reales de InfoLeg capturadas el 2 de septiembre de 2026
   para preparar la clase; la página no sale a internet.
   ══════════════════════════════════════════════════════════ */

const PEDIDOS = [
  { etiqueta: 'ley 27742', texto: 'ley 27742', tipo: 'Ley', tipoNorma: '1', numero: '27742', anio: '', caso: 'una' },
  { etiqueta: 'decreto 70 2023', texto: 'decreto 70 2023', tipo: 'Decreto', tipoNorma: '2', numero: '70', anio: '2023', caso: 'varias' },
  { etiqueta: 'la de bases', texto: 'che, pasame la de bases', tipo: 'Otro', tipoNorma: '', numero: '', anio: '', caso: 'no-entiende' }
];

// Todo lo que sigue es la respuesta real de InfoLeg, capturada el 2 de
// septiembre de 2026 para preparar la clase. La página no sale a internet.
const RESPUESTAS = {
  una: {
    tabla: {
      cantidad_texto: 'Cantidad de Normas Encontradas: 1 en 1 página.',
      enlaces: ['/infolegInternet/verNorma.do?id=401266'],
      etiquetas: ['Ley 27742'],
      titulos: ['LEY DE BASES Y PUNTOS DE PARTIDA PARA LA LIBERTAD DE LOS ARGENTINOS'],
      fechas: ['08-jul-2024']
    },
    normas: [{
      cantidad: 1, id: '401266', etiqueta: 'Ley 27742',
      titulo: 'LEY DE BASES Y PUNTOS DE PARTIDA PARA LA LIBERTAD DE LOS ARGENTINOS',
      publicacion: '2024-07-08',
      url_ficha: 'https://servicios.infoleg.gob.ar/infolegInternet/verNorma.do?id=401266'
    }],
    ficha: {
      encabezado: 'Ley 27742 HONORABLE CONGRESO DE LA NACION ARGENTINA',
      sancion: '27-jun-2024',
      titulo_ficha: 'LEY DE BASES Y PUNTOS DE PARTIDA PARA LA LIBERTAD DE LOS ARGENTINOS',
      rubro: 'DISPOSICIONES',
      texto_completo: 'anexos/400000-404999/401266/norma.htm',
      vinculos: ['Esta norma modifica o complementa a 38 norma(s).',
                 'Esta norma es complementada o modificada por 116 norma(s).']
    }
  },
  varias: {
    tabla: {
      cantidad_texto: 'Cantidad de Normas Encontradas: 2 en 1 página.',
      enlaces: ['/infolegInternet/verNorma.do?id=395521', '/infolegInternet/verNorma.do?id=379436'],
      etiquetas: ['Decreto DNU 70 / 2023', 'Decreto 70 / 2023'],
      titulos: ['BASES PARA LA RECONSTRUCCION DE LA ECONOMIA ARGENTINA', 'NOMENCLATURA COMUN DEL MERCOSUR'],
      fechas: ['21-dic-2023', '10-feb-2023']
    },
    normas: [
      { cantidad: 2, id: '395521', etiqueta: 'Decreto DNU 70 / 2023',
        titulo: 'BASES PARA LA RECONSTRUCCION DE LA ECONOMIA ARGENTINA', publicacion: '2023-12-21',
        url_ficha: 'https://servicios.infoleg.gob.ar/infolegInternet/verNorma.do?id=395521' },
      { cantidad: 2, id: '379436', etiqueta: 'Decreto 70 / 2023',
        titulo: 'NOMENCLATURA COMUN DEL MERCOSUR', publicacion: '2023-02-10',
        url_ficha: 'https://servicios.infoleg.gob.ar/infolegInternet/verNorma.do?id=379436' }
    ]
  }
};

function pasosDe(p) {
  const pasos = [
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
      texto: 'Se queda con seis campos y descarta el resto. El código del tipo de norma no lo inventamos: sale del formulario de InfoLeg, donde Ley es 1 y Decreto es 2.',
      cardinal: ['1', '1'],
      json: { chat_id: '5512340987', pedido: p.texto, tipo: p.tipo, tipoNorma: p.tipoNorma, numero: p.numero, anio: p.anio }
    },
    {
      nodo: 'IF', quien: 'Decisión',
      titulo: '¿Entendí qué norma es?',
      texto: p.caso === 'no-entiende'
        ? 'No hay número ni tipo reconocido: el ítem sale por la puerta falsa. Acá termina el recorrido, y termina bien: el bot pide los datos que faltan en vez de adivinar.'
        : 'Hay número y hay código de tipo: el ítem sale por la puerta verdadera. La cantidad de ítems no cambió, cambió el camino.',
      cardinal: ['1', '1'],
      json: { numero: p.numero, tipoNorma: p.tipoNorma, rama: p.caso === 'no-entiende' ? 'falsa' : 'verdadera' }
    }
  ];

  if (p.caso === 'no-entiende') {
    pasos.push({
      nodo: 'Telegram', quien: 'Nodo de app',
      titulo: 'Pedir tipo y número',
      texto: 'La rama falsa siempre va conectada a algo. Un flujo que se detiene en silencio es un flujo que nadie sabe que está roto. Y este es justo el pedido que un agente entendería: lo vemos al final de la clase.',
      cardinal: ['1', '1'],
      json: { ok: true, resultado: 'No te entendí. Decime tipo y número, por ejemplo: ley 27742' }
    });
    return pasos;
  }

  const r = RESPUESTAS[p.caso];

  pasos.push(
    {
      nodo: 'HTTP Request', quien: 'Salir afuera',
      titulo: 'Golpear la puerta',
      texto: 'Este pedido no busca nada: existe para que el servidor nos dé una sesión. Probado el 2 de septiembre: el mismo POST de búsqueda, sin cookie, devuelve 200 OK y ninguna norma. InfoLeg no tiene API, pero tiene memoria.',
      cardinal: ['1', '1'],
      json: { statusCode: 200, headers: { 'set-cookie': ['JSESSIONID=F8FD5469EEEEEAD2130C3BA591734E16; Path=/infolegInternet/; HttpOnly', 'IDNODO=.cluster1; path=/'] } }
    },
    {
      nodo: 'Edit Fields', quien: 'Datos',
      titulo: 'Quedarse con la llave',
      texto: 'De todo el encabezado nos sirve una sola cosa. Una expresión corta la cookie en el primer punto y coma: sin nodo Code, sin biblioteca.',
      cardinal: ['1', '1'],
      json: { cookie: 'JSESSIONID=F8FD5469EEEEEAD2130C3BA591734E16' }
    },
    {
      nodo: 'HTTP Request', quien: 'Salir afuera',
      titulo: 'Buscar la norma',
      texto: 'Ahora sí: POST con la llave en el encabezado y los tres campos del formulario en el cuerpo. Lo que vuelve es una página entera, no un JSON.',
      cardinal: ['1', '1'],
      json: { data: '<html>… ' + (p.caso === 'varias' ? '6.171' : '4.732') + ' caracteres de HTML …</html>' }
    },
    {
      nodo: 'HTML', quien: 'Invitado',
      titulo: 'Leer la tabla',
      texto: 'Cinco selectores CSS sacados del HTML real de InfoLeg. Fijate la forma de lo que devuelve: no son normas, son listas paralelas.',
      cardinal: ['1', '1'],
      json: r.tabla
    },
    {
      nodo: 'Code', quien: 'Datos',
      titulo: 'Una norma por fila',
      texto: 'Acá sí hace falta código, y se ve por qué: hay que cruzar tres listas por posición para armar una norma por fila, y de paso pasar la fecha de «21-dic-2023» a formato comparable. Un ítem entra, salen ' + r.normas.length + '.',
      cardinal: ['1', String(r.normas.length)],
      json: r.normas.length === 1 ? r.normas[0] : r.normas
    },
    {
      nodo: 'Switch', quien: 'Decisión',
      titulo: 'Cuántas encontró',
      texto: p.caso === 'varias'
        ? 'Dos decretos distintos con el mismo número y el mismo año: el DNU de diciembre y uno de nomenclatura del Mercosur. Esto es exactamente lo que pasa en el estudio cuando alguien pega la norma equivocada. El flujo no elige por nosotros: pregunta.'
        : 'Una sola norma: sale por la puerta del medio y el flujo sigue a buscar su ficha.',
      cardinal: [String(r.normas.length), String(r.normas.length)],
      json: { cantidad: r.normas.length, salida: p.caso === 'varias' ? 'varias' : 'una' }
    }
  );

  if (p.caso === 'varias') {
    pasos.push(
      {
        nodo: 'Edit Fields', quien: 'Datos',
        titulo: 'Una línea por opción',
        texto: 'Una línea de texto por cada norma encontrada. Uno entra, uno sale, dos veces.',
        cardinal: ['2', '2'],
        json: r.normas.map(n => ({ linea: '• ' + n.etiqueta + ' (B.O. ' + n.publicacion + ') — ' + n.titulo }))
      },
      {
        nodo: 'Summarize', quien: 'Invitado',
        titulo: 'Juntar las opciones',
        texto: 'Las dos líneas se vuelven un texto solo. Esta es la deuda de la clase 4 saldada en vivo: el mismo resultado que aquella expresión de JavaScript, sin escribir código.',
        cardinal: ['2', '1'],
        json: { concatenated_linea: r.normas.map(n => '• ' + n.etiqueta + ' (B.O. ' + n.publicacion + ') — ' + n.titulo).join('\n') }
      },
      {
        nodo: 'Telegram', quien: 'Nodo de app',
        titulo: 'Preguntar cuál',
        texto: 'Un solo mensaje con las dos opciones, no dos mensajes sueltos. La diferencia entre un aviso útil y una notificación que nadie lee.',
        cardinal: ['1', '1'],
        json: { ok: true, resultado: 'mensaje enviado al chat 5512340987' }
      }
    );
    return pasos;
  }

  const n = r.normas[0];
  pasos.push(
    {
      nodo: 'HTTP Request + HTML', quien: 'Salir afuera e invitado',
      titulo: 'Traer la ficha y extraerla',
      texto: 'El tercer pedido trae la ficha de la norma. Y acá está el hallazgo que nos ahorró un nodo: la página ya trae el link al texto completo, así que no hay que calcular nada.',
      cardinal: ['1', '1'],
      json: r.ficha
    },
    {
      nodo: 'Merge', quien: 'Juntar',
      titulo: 'Fila + ficha',
      texto: 'Lo que trajo el listado y lo que trajo la ficha se vuelven un solo ítem. Dos entradas, una salida.',
      cardinal: ['2', '1'],
      json: Object.assign({}, n, r.ficha)
    },
    {
      nodo: 'Telegram', quien: 'Nodo de app',
      titulo: 'Responder al chat',
      texto: 'La respuesta sale por el mismo chat del que vino el pedido, con las dos advertencias que importan en un estudio: cuántas normas la modifican y el link al original. Nunca el texto completo copiado.',
      cardinal: ['1', '1'],
      json: {
        ok: true,
        resultado: n.etiqueta + ' — B.O. ' + n.publicacion + ' · ' + r.ficha.vinculos.length + ' avisos de vínculos · link a InfoLeg'
      }
    }
  );
  return pasos;
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
  { que: 'No hay robots.txt',
    texto: 'Lo primero que hicimos fue pedirlo, y no existe: <code>404</code> en los dos dominios de InfoLeg. Que no haya archivo no es un permiso, es un silencio. Quedan en pie los términos de uso del sitio y el sentido común, que es de lo que se ocupan los cuatro puntos que siguen.' },
  { que: 'El sitio tiene memoria',
    texto: 'El buscador no contesta si no reconoce una sesión. El mismo POST, con cookie y sin cookie, devuelve la norma o una página vacía: 200 OK las dos veces. Por eso el flujo hace un pedido previo que no busca nada, solo golpea la puerta.' },
  { que: 'El silencio no es un error',
    texto: 'Buscar una ley que no existe devuelve 200 OK y la página del buscador otra vez, 130 KB en vez de 5. No hay error, no hay mensaje. Un flujo que confía en el código de estado nunca se entera. Por eso miramos si la tabla trajo filas.' },
  { que: 'El selector se rompe',
    texto: 'Los selectores de este flujo salieron del HTML real y están verificados, pero el día que InfoLeg cambie su plantilla van a devolver vacío. No va a fallar: va a contestar mal, que es peor. Toda extracción necesita un chequeo de que trajo algo.' },
  { que: 'La copia y el ritmo',
    texto: 'Un pedido por vez y sin ráfagas: es un servicio público que se paga con impuestos. Y se manda el extracto con el link al original, nunca el texto completo republicado, que además se desactualiza cuando la norma se modifica.' }
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
