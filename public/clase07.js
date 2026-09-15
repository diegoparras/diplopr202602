/* Clase 7 — Del proceso manual al workflow: primer caso completo
   Cinco piezas: lo que trajo de la clase 6, el relato clasificable, el
   descompositor que arma el algoritmo y el esqueleto de n8n, la tabla de
   traducción y los cuatro olvidos. */

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
   1 · LO QUE TRAJO DE LA CLASE 6
   La actividad de aquella clase pedía exactamente estas tres cosas.
   ══════════════════════════════════════════════════════════ */

(function traido() {
  const cont = document.getElementById('traido');
  if (!cont) return;

  const partes = [
    { clave: 'clase06-q1', rot: 'Tu proceso, en una frase' },
    { clave: 'clase06-q2', rot: 'Qué pasa hoy cuando falla' },
    { clave: 'clase06-q3', rot: 'Cuál es su peor día' }
  ].map(p => ({ ...p, texto: leerGuardado(p.clave) }));

  if (!partes.some(p => p.texto)) {
    cont.innerHTML = `
      <span class="rot">Todavía no hay nada guardado acá</span>
      <p class="vacio" style="margin-top:12px">Puede ser que la hayas contestado en otro dispositivo, o que no la hayas hecho. Las dos cosas se arreglan igual: abrí <a href="06.html">la clase 6</a> y completá la actividad del final, o escribí tu proceso directamente en el taller de más abajo. Cinco minutos.</p>`;
    return;
  }

  cont.innerHTML = '<span class="rot">Lo que escribiste el miércoles pasado</span>' +
    partes.filter(p => p.texto).map(p => `
      <div class="linea">
        <b>${p.rot}</b>
        <p>${escapar(p.texto)}</p>
      </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   2 · EL RELATO EN DESORDEN
   Nueve frases, cinco casilleros y dos que no van a ninguno.
   Tocar una frase la clasifica y explica por qué.
   ══════════════════════════════════════════════════════════ */

const CASILLEROS = {
  disparador: { nombre: 'Disparador', tono: 'naranja' },
  datos:      { nombre: 'Datos',      tono: 'acierto' },
  decision:   { nombre: 'Decisión',   tono: 'alerta' },
  accion:     { nombre: 'Acción',     tono: 'coral' },
  excepcion:  { nombre: 'Excepción',  tono: 'fallo' },
  contexto:   { nombre: 'Contexto',   tono: 'tenue' }
};

const RELATO = [
  { t: 'Mirá, lo que me come la vida son las facturas de proveedores.',
    c: 'contexto',
    p: 'Es el encabezado de la queja, no un paso del proceso. Sirve para saber de qué vamos a hablar y nada más. Descartarla también es parte del trabajo.' },
  { t: 'Llegan todo el día al correo de facturación, con el PDF adjunto.',
    c: 'disparador',
    p: 'Acá está el disparador, y viene con un dato de regalo: el adjunto. «Todo el día» además nos dice que no hay un horario, así que el flujo tiene que ser por evento y no por reloj.' },
  { t: 'Yo abro cada una, miro el proveedor, el número y el monto, y la cargo en la planilla de pagos.',
    c: 'datos',
    p: 'Los tres campos que importan, dichos con el nombre que tienen en la vida real. Fijate que están escondidos en el medio de una acción: el que escucha tiene que saber separarlos.' },
  { t: 'Si es de más de doscientos mil tengo que pasársela al socio antes de cargarla.',
    c: 'decision',
    p: 'La decisión principal, dicha al pasar y con un «si» minúsculo. Este es el tipo de frase que se pierde si uno anota mientras piensa en otra cosa.' },
  { t: 'Y bueno, después archivo el correo en la etiqueta de facturas para no volver a verlo.',
    c: 'accion',
    p: 'Una acción del final, contada como si fuera un detalle. Si no está en el flujo, el buzón queda igual de lleno que antes y la persona sigue mirándolo.' },
  { t: 'A veces mandan la misma factura dos veces y la cargo repetida sin darme cuenta.',
    c: 'excepcion',
    p: 'La excepción más cara de todas: no rompe nada, ensucia. Y aparece recién a los dos minutos de conversación, cuando la persona ya se soltó.' },
  { t: 'Otras veces me escriben «te mando la factura» y se olvidan el adjunto.',
    c: 'excepcion',
    p: 'La segunda excepción. Las dos que nombró Marcela son de datos, no de sistemas: el correo llega bien, lo que viene mal es el contenido.' },
  { t: 'El mes pasado se me pasó una de vencimiento y la pagamos con recargo.',
    c: 'contexto',
    p: 'Duele, pero es la consecuencia de no tener el proceso, no un paso. Sirve para justificar el proyecto ante quien firma, no para diseñarlo.' },
  { t: 'Ah, y si es del estudio contable de Rosario va a otra planilla, porque eso lo lleva Pablo.',
    c: 'decision',
    p: 'La segunda decisión, presentada con un «ah» y al final. Casi siempre hay una de estas, y casi siempre aparece cuando ya guardaste el anotador.' }
];

(function relato() {
  const cont = document.getElementById('relato');
  const panel = document.getElementById('panelFrase');
  const pie = document.getElementById('relatoPie');
  if (!cont) return;

  cont.innerHTML = RELATO.map((f, i) =>
    `<span class="frase" data-i="${i}">${escapar(f.t)}</span> `).join('');

  function pintarPie() {
    pie.innerHTML = Object.entries(CASILLEROS).map(([id, c]) =>
      `<span class="etiqueta-tipo" data-c="${id}" style="color:${window.token(c.tono)};border-color:${window.token(c.tono)}">${c.nombre} · <b id="cuenta-${id}">0</b></span>`
    ).join('');
    contar();
  }

  function contar() {
    const vistas = cont.querySelectorAll('.frase.marcada');
    const porTipo = {};
    vistas.forEach(v => {
      const c = RELATO[Number(v.dataset.i)].c;
      porTipo[c] = (porTipo[c] || 0) + 1;
    });
    Object.keys(CASILLEROS).forEach(id => {
      const el = document.getElementById('cuenta-' + id);
      if (el) el.textContent = porTipo[id] || 0;
    });
  }

  function pintarPanel(i) {
    const f = RELATO[i];
    const c = CASILLEROS[f.c];
    panel.innerHTML =
      `<span class="cual" style="color:${window.token(c.tono)}">${c.nombre}</span>
       <p>${f.p}</p>`;
  }

  cont.addEventListener('click', e => {
    const f = e.target.closest('.frase');
    if (!f) return;
    cont.querySelectorAll('.frase').forEach(x => x.classList.remove('activa'));
    f.classList.add('marcada');
    pintarPanel(Number(f.dataset.i));
    contar();
  });

  panel.innerHTML = '<span class="cual">Empezá por cualquiera</span><p>Nueve frases, dichas en el orden en que se le fueron ocurriendo. Tocá una y te digo en qué casillero cae y por qué.</p>';
  pintarPie();
  window.addEventListener('cambio-tema', () => {
    pintarPie();
    const activa = cont.querySelector('.frase.marcada:last-of-type');
    if (activa) pintarPanel(Number(activa.dataset.i));
  });
})();


/* ══════════════════════════════════════════════════════════
   3 · EL DESCOMPOSITOR
   Cinco casilleros → pseudocódigo en castellano → esqueleto de n8n.
   El archivo que genera no tiene credenciales: cada acción sale como
   un nodo vacío con su nombre, para completar en clase.
   ══════════════════════════════════════════════════════════ */

const DISPARADORES = {
  correo:     { nodo: 'n8n-nodes-base.gmailTrigger',        v: 1.2, nombre: 'Llega un correo',        verbo: 'CUANDO llega un correo' },
  planilla:   { nodo: 'n8n-nodes-base.googleSheetsTrigger', v: 1,   nombre: 'Se carga una fila',      verbo: 'CUANDO se carga una fila' },
  mensaje:    { nodo: 'n8n-nodes-base.telegramTrigger',     v: 1.2, nombre: 'Llega un mensaje',       verbo: 'CUANDO llega un mensaje' },
  formulario: { nodo: 'n8n-nodes-base.formTrigger',         v: 2.2, nombre: 'Completan el formulario', verbo: 'CUANDO alguien completa el formulario' },
  horario:    { nodo: 'n8n-nodes-base.scheduleTrigger',     v: 1.2, nombre: 'A la hora fijada',       verbo: 'CADA DÍA a la hora fijada' },
  manual:     { nodo: 'n8n-nodes-base.manualTrigger',       v: 1,   nombre: 'Alguien aprieta el botón', verbo: 'CUANDO alguien aprieta el botón' }
};

(function descompositor() {
  const campos = ['tNombre', 'tTipoDisparador', 'tDisparador', 'tDatos', 'tDecision', 'tSi', 'tNo', 'tExcepcion'];
  const $salida = document.getElementById('pseudoSalida');
  const $aviso = document.getElementById('tallerAviso');
  if (!$salida) return;

  const val = id => (document.getElementById(id).value || '').trim();
  const lineas = id => val(id).split('\n').map(l => l.trim()).filter(Boolean);

  function armarPseudo() {
    const tipo = DISPARADORES[val('tTipoDisparador')] || DISPARADORES.manual;
    const detalle = val('tDisparador');
    const datos = lineas('tDatos');
    const decision = val('tDecision').replace(/^¿|\?$/g, '');
    const si = lineas('tSi');
    const no = lineas('tNo');
    const excepcion = val('tExcepcion');

    const falta = t => `‹${t}›`;
    const L = [];

    L.push(`${tipo.verbo}${detalle ? ' ' + detalle : ''}:`);
    L.push(`    leer { ${datos.length ? datos.join(', ') : falta('todavía no nombraste los datos')} }`);
    L.push('');

    if (excepcion) {
      L.push(`    SI ${falta('escribí acá la condición: cómo se da cuenta el flujo')}:`);
      excepcion.split('\n').map(x => x.trim()).filter(Boolean)
        .forEach(x => L.push(`        ${x}`));
      L.push('        FIN');
      L.push('');
    }

    if (decision) {
      L.push(`    SI ${decision}:`);
      (si.length ? si : [falta('qué se hace si la respuesta es sí')]).forEach(a => L.push(`        ${a}`));
      L.push('    SI NO:');
      (no.length ? no : [falta('qué se hace si la respuesta es no')]).forEach(a => L.push(`        ${a}`));
    } else {
      L.push(`    ${falta('todavía no escribiste la decisión')}`);
      [...si, ...no].forEach(a => L.push(`    ${a}`));
    }

    L.push('FIN');
    return L.join('\n');
  }

  function pintar() {
    const texto = armarPseudo();
    $salida.innerHTML = escapar(texto)
      .replace(/^(CUANDO|CADA DÍA)([^\n:]*)/gm, '<span class="clave">$1</span>$2')
      .replace(/(\s)(SI NO|SI|FIN|leer)(\s|:|$)/g, '$1<span class="clave">$2</span>$3')
      .replace(/‹([^›]*)›/g, '<span class="falta">‹$1›</span>');

    const completo = val('tNombre') && val('tDisparador') && lineas('tDatos').length &&
                     (lineas('tSi').length || lineas('tNo').length);
    $aviso.textContent = completo
      ? 'Listo para bajar. En n8n: Workflows → Import from File.'
      : 'Completá al menos el nombre, el disparador, los datos y una acción para poder bajar el esqueleto.';
    document.getElementById('bajarWorkflow').disabled = !completo;
  }

  campos.forEach(id => {
    const el = document.getElementById(id);
    const guardado = leerGuardado('clase07-' + id);
    if (guardado) el.value = guardado;
    el.addEventListener('input', () => {
      try { localStorage.setItem('clase07-' + id, el.value); } catch (e) {}
      pintar();
    });
    el.addEventListener('change', () => {
      try { localStorage.setItem('clase07-' + id, el.value); } catch (e) {}
      pintar();
    });
  });

  /* ── El esqueleto de n8n ──
     Un identificador por nodo, posiciones en fila y ninguna credencial:
     las acciones salen como nodos vacíos con el nombre que la persona
     escribió, para reemplazarlos por el nodo de la app que corresponda. */

  function id(n) {
    return 'c7000000-0000-4000-8000-' + String(n).padStart(12, '0');
  }

  function armarWorkflow() {
    const tipo = DISPARADORES[val('tTipoDisparador')] || DISPARADORES.manual;
    const datos = lineas('tDatos');
    const decision = val('tDecision');
    const si = lineas('tSi');
    const no = lineas('tNo');

    const nodos = [];
    const conexiones = {};
    let n = 1;
    let x = 0;

    nodos.push({
      parameters: { content: '## ' + (val('tNombre') || 'Mi proceso') +
        '\n\nEl algoritmo, antes de los nodos:\n\n```\n' + armarPseudo() + '\n```\n\n' +
        'Esqueleto generado en la clase 7. Cada nodo "sin hacer nada" hay que\n' +
        'reemplazarlo por el nodo de la aplicación que corresponda.',
        height: 620, width: 520, color: 4 },
      type: 'n8n-nodes-base.stickyNote', typeVersion: 1,
      position: [-600, -60], id: id(n++), name: 'El algoritmo'
    });

    const disparador = { parameters: {}, type: tipo.nodo, typeVersion: tipo.v,
      position: [x, 200], id: id(n++), name: tipo.nombre };
    if (tipo.nodo.includes('telegramTrigger')) disparador.parameters = { updates: ['message'], additionalFields: {} };
    nodos.push(disparador);
    x += 220;

    const set = {
      parameters: {
        assignments: { assignments: datos.map((d, i) => ({
          id: id(900 + i),
          name: d.replace(/\s+/g, '_').toLowerCase(),
          value: '=' + '{{ $json.' + d.replace(/\s+/g, '_').toLowerCase() + ' }}',
          type: 'string'
        })) },
        includeOtherFields: false, options: {}
      },
      type: 'n8n-nodes-base.set', typeVersion: 3.4,
      position: [x, 200], id: id(n++), name: 'Quedarse con lo que importa'
    };
    nodos.push(set);
    conexiones[tipo.nombre] = { main: [[{ node: set.name, type: 'main', index: 0 }]] };
    x += 220;

    let anterior = set.name;

    if (decision) {
      const nombreIf = decision.length > 60 ? decision.slice(0, 57) + '…' : decision;
      nodos.push({
        parameters: {
          conditions: {
            options: { caseSensitive: true, leftValue: '', typeValidation: 'loose', version: 2 },
            conditions: [{
              id: id(950),
              leftValue: '', rightValue: '',
              operator: { type: 'string', operation: 'equals' }
            }],
            combinator: 'and'
          },
          looseTypeValidation: true, options: {}
        },
        type: 'n8n-nodes-base.if', typeVersion: 2.2,
        position: [x, 200], id: id(n++), name: nombreIf
      });
      conexiones[anterior] = { main: [[{ node: nombreIf, type: 'main', index: 0 }]] };
      x += 220;

      const ramas = [si, no];
      conexiones[nombreIf] = { main: [[], []] };
      ramas.forEach((acciones, rama) => {
        let px = x, previo = null;
        acciones.forEach((a, i) => {
          const nombre = a.length > 60 ? a.slice(0, 57) + '…' : a;
          nodos.push({
            parameters: {}, type: 'n8n-nodes-base.noOp', typeVersion: 1,
            position: [px, rama === 0 ? 40 : 360], id: id(n++), name: nombre
          });
          if (previo) conexiones[previo] = { main: [[{ node: nombre, type: 'main', index: 0 }]] };
          else conexiones[nombreIf].main[rama].push({ node: nombre, type: 'main', index: 0 });
          previo = nombre;
          px += 220;
        });
      });
    } else {
      [...si, ...no].forEach(a => {
        const nombre = a.length > 60 ? a.slice(0, 57) + '…' : a;
        nodos.push({
          parameters: {}, type: 'n8n-nodes-base.noOp', typeVersion: 1,
          position: [x, 200], id: id(n++), name: nombre
        });
        conexiones[anterior] = { main: [[{ node: nombre, type: 'main', index: 0 }]] };
        anterior = nombre;
        x += 220;
      });
    }

    return {
      name: val('tNombre') || 'Mi proceso',
      nodes: nodos,
      connections: conexiones,
      settings: { executionOrder: 'v1' },
      pinData: {}
    };
  }

  document.getElementById('bajarWorkflow').addEventListener('click', () => {
    const wf = armarWorkflow();
    const blob = new Blob([JSON.stringify(wf, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (val('tNombre') || 'mi-proceso')
      .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) + '-n8n.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    $aviso.textContent = 'Bajado. En n8n: Workflows → Import from File.';
  });

  document.getElementById('copiarPseudo').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(armarPseudo());
      $aviso.textContent = 'Copiado. Pegalo en una nota adhesiva del lienzo para tenerlo a la vista.';
    } catch (e) {
      $aviso.textContent = 'No pude copiarlo. Seleccioná el texto y copialo a mano.';
    }
  });

  pintar();
})();


/* ══════════════════════════════════════════════════════════
   4 · LA TABLA DE TRADUCCIÓN
   ══════════════════════════════════════════════════════════ */

const TRADUCCION = [
  { izq: 'CUANDO …', nodo: 'Un disparador', texto: 'El de la aplicación que corresponda: correo, planilla, formulario, mensaje. Uno solo por flujo.' },
  { izq: 'CADA DÍA a las …', nodo: 'Schedule Trigger', texto: 'Ojo con la clase 6: cuenta una ejecución cada vez que se dispara, encuentre algo o no.' },
  { izq: 'leer { … }', nodo: 'Edit Fields', texto: 'Quedarse con los campos que importan y ponerles el nombre que van a tener el resto del flujo.' },
  { izq: 'SI … : … SI NO: …', nodo: 'IF', texto: 'Dos salidas. La rama falsa existe aunque no la conectes, y ahí se detienen los ítems en silencio.' },
  { izq: 'SEGÚN … :', nodo: 'Switch', texto: 'Cuando los caminos son más de dos. Siempre con salida por defecto para lo que no encaje.' },
  { izq: 'PARA CADA …', nodo: 'Ningún nodo', texto: 'Ya está pasando: un nodo se ejecuta una vez por ítem. Solo hace falta un bucle para ir de a tandas o paginar.' },
  { izq: 'juntar … en uno', nodo: 'Merge o Summarize', texto: 'Merge cruza dos ramas; Summarize junta muchos ítems en uno. Los dos cortan el rastro entre entrada y salida.' },
  { izq: 'avisar / cargar / archivar', nodo: 'Un nodo de app', texto: 'Un verbo, un nodo. Si tu línea tiene dos verbos, son dos nodos.' },
  { izq: 'calcular …', nodo: 'Code, y último', texto: 'Solo cuando ningún nodo sabe hacer esa cuenta. Antes de escribirlo, fijate si el dato ya está en algún lado.' },
  { izq: 'FIN', nodo: 'Nada', texto: 'El flujo termina cuando se termina la rama. No hace falta un nodo de cierre.' }
];

(function traduccion() {
  const cuerpo = document.getElementById('tablaTraduccion');
  if (!cuerpo) return;
  cuerpo.innerHTML = TRADUCCION.map(t => `
    <tr>
      <td class="izq">${escapar(t.izq)}</td>
      <td class="der"><b>${t.nodo}</b><span>${t.texto}</span></td>
    </tr>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   5 · LOS CUATRO OLVIDOS
   ══════════════════════════════════════════════════════════ */

const OLVIDOS = [
  { titulo: 'Solo está el camino feliz',
    texto: 'El relato que te cuentan es el del día que todo sale bien, porque es el que la persona repite ochenta veces por mes. Las excepciones las vivió, pero no las tiene ordenadas.',
    pregunta: '¿Qué fue lo último que te hizo perder media hora con esto?' },
  { titulo: 'Nadie preguntó qué pasa si llega dos veces',
    texto: 'Duplicados, reenvíos, alguien que aprieta el botón dos veces. No rompen nada: ensucian los datos y se descubren un mes después, cuando los números no cierran.',
    pregunta: '¿Cómo sabrías que esto ya lo procesaste antes?' },
  { titulo: 'Los datos vienen más sucios de lo que dicen',
    texto: 'El CUIT a veces con guiones, el monto con signo pesos, la fecha escrita a mano. Lo vimos en la clase 4 con los tipos y vuelve siempre, porque del otro lado hay personas.',
    pregunta: '¿Me mostrás tres ejemplos reales, no uno inventado?' },
  { titulo: 'El flujo no tiene dueño',
    texto: 'Se arma para alguien, se publica, y a los dos meses falla un martes sin que nadie lo note. La clase 6 le puso nombre: sin aviso y sin dueño, no está en producción.',
    pregunta: '¿Quién se tiene que enterar cuando esto deje de andar?' }
];

(function olvidos() {
  const cont = document.getElementById('olvidos');
  if (!cont) return;
  cont.innerHTML = OLVIDOS.map(o => `
    <div class="olvido-item">
      <b>${o.titulo}</b>
      <p>${o.texto}</p>
      <span class="pregunta-clave"><b>La pregunta que lo destapa:</b> «${o.pregunta}»</span>
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
    el.value = leerGuardado('clase07-' + id);
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.setItem('clase07-' + id, el.value);
        const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
      }, 500);
    });
  });

  if (campos.some(id => leerGuardado('clase07-' + id))) {
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
