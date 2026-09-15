/* Clase 6 — Ramas, bucles, errores y el costo de cada ejecución
   Cinco piezas: lo que quedó prendido de la clase 5, el contador de
   ejecuciones, la calculadora del mes, las cuatro formas de fallar y el
   clasificador de reintentos. */

exigirSesion();
document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function leerGuardado(clave) {
  try { return (localStorage.getItem(clave) || '').trim(); } catch (e) { return ''; }
}


/* ══════════════════════════════════════════════════════════
   1 · LO QUE QUEDÓ PRENDIDO DE LA CLASE 5
   El cierre de la 5 nombró dos; la tercera salió del propio caso.
   ══════════════════════════════════════════════════════════ */

const PENDIENTES = [
  { titulo: 'El bot anda los días en que InfoLeg contesta',
    texto: 'Probamos el flujo con el sitio de buen humor. Nadie decidió todavía qué hace un martes a las tres de la mañana, cuando el servidor devuelve un error, tarda veinte segundos o directamente no está.',
    donde: 'Se resuelve en el bloque de errores' },
  { titulo: 'Nadie sabe cuánto cuesta tenerlo prendido',
    texto: 'Dieciocho nodos y tres pedidos a internet por consulta. La pregunta no es cuántos nodos: es cuántas veces por mes se dispara, y si eso entra en el plan que tenés.',
    donde: 'Se resuelve en la calculadora' },
  { titulo: 'El bot preguntó cuál de las dos y nadie contestó',
    texto: 'Cuando la búsqueda devuelve dos normas, el flujo manda las opciones y pregunta. La respuesta llega como un mensaje nuevo, en una ejecución nueva, que no se acuerda de nada.',
    donde: 'Se nombra hoy, se resuelve en las clases 9 y 10' }
];

(function pendientes() {
  const cont = document.getElementById('pendientes');
  if (!cont) return;
  cont.innerHTML = PENDIENTES.map(d => `
    <div class="pendiente-item">
      <b>${d.titulo}</b>
      <p>${d.texto}</p>
      <span class="donde">${d.donde}</span>
    </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   2 · QUÉ CUENTA COMO EJECUCIÓN
   Reglas de la documentación de n8n consultada el 8/9/2026.
   Cada tarjeta se abre y explica el porqué.
   ══════════════════════════════════════════════════════════ */

const CASOS_CUENTA = [
  { suma: true, cuanto: '1',
    titulo: 'El bot de InfoLeg responde una consulta',
    texto: 'Dieciocho nodos, tres pedidos a internet, tres ramas posibles.',
    porque: 'Una corrida completa del workflow es una ejecución, sin importar el tamaño. Por eso agregarle nodos a un flujo que ya existe es la mejora más barata que hay.' },
  { suma: false, cuanto: '0',
    titulo: 'Probás el flujo desde el editor',
    texto: 'Apretás «Execute workflow» veinte veces mientras lo armás.',
    porque: 'Las ejecuciones manuales no cuentan. Esto es lo que hace que valga la pena probar cada nodo por separado en vez de publicar y rezar.' },
  { suma: true, cuanto: '1 por disparo',
    titulo: 'Un flujo por horario que corre cada cinco minutos',
    texto: 'Revisa si hay algo nuevo. Casi siempre no hay nada.',
    porque: 'El disparador por horario cuenta cada vez que se activa, encuentre algo o no. Cada cinco minutos son casi 8.640 corridas al mes: es la forma más común de fundirse el plan sin darse cuenta.' },
  { suma: false, cuanto: '0',
    titulo: 'Un disparador que consulta y no encuentra nada',
    texto: 'Los disparadores de aplicación que revisan si hay novedades.',
    porque: 'Cuando el disparador consulta y no hay datos nuevos, esa consulta no cuenta como ejecución. Distinto del horario, que cuenta siempre: por eso, cuando existen los dos, conviene el de la aplicación.' },
  { suma: true, cuanto: '1 por pedido',
    titulo: 'Alguien llama a tu webhook',
    texto: 'Incluso si el pedido llega vacío.',
    porque: 'Cada pedido entrante que activa el disparador cuenta, aunque el cuerpo venga vacío. Un webhook público es una puerta abierta también para la facturación.' },
  { suma: false, cuanto: '0',
    titulo: 'El flujo de errores se dispara y avisa',
    texto: 'El que armamos en esta misma clase, el que manda el mensaje cuando otro falla.',
    porque: 'Las corridas de un workflow puesto como error workflow no cuentan para la cuota. O sea: enterarte de que algo se rompió es gratis, y no hay ninguna excusa para no tenerlo.' },
  { suma: false, cuanto: '0',
    titulo: 'Un flujo llama a otro como sub-workflow',
    texto: 'El bot con agente de la clase 5 usaba el flujo determinista como herramienta.',
    porque: 'Solo cuenta la ejecución de arriba. Partir un flujo grande en sub-workflows ordena sin costar más, y esa es exactamente la arquitectura que vamos a usar de la clase 10 en adelante.' }
];

(function contador() {
  const cont = document.getElementById('cuentaCasos');
  if (!cont) return;

  function pintar() {
    cont.innerHTML = CASOS_CUENTA.map((c, i) => `
      <button type="button" class="cuenta-tarjeta" data-i="${i}">
        <span class="sello" data-suma="${c.suma}">${c.cuanto === '0' ? '0' : '+'}</span>
        <span>
          <b>${c.titulo}</b>
          <p>${c.texto}</p>
          <span class="porque">${c.porque}</span>
          <span class="pista">${c.cuanto === '0' ? 'no suma' : 'suma ' + c.cuanto} · tocá para ver por qué</span>
        </span>
      </button>`).join('');
    pintarSellos();
  }

  // El color del sello lo pone el código, así que hay que rehacerlo cuando
  // alguien conmuta el tema: cada tema tiene su propia versión del tono.
  function pintarSellos() {
    cont.querySelectorAll('.sello').forEach(s => {
      const suma = s.dataset.suma === 'true';
      s.style.color = window.token(suma ? 'naranja' : 'acierto');
      s.style.borderColor = window.token(suma ? 'naranja' : 'acierto');
    });
  }

  cont.addEventListener('click', e => {
    const t = e.target.closest('.cuenta-tarjeta');
    if (t) t.classList.toggle('abierta');
  });

  pintar();
  window.addEventListener('cambio-tema', pintarSellos);
})();


/* ══════════════════════════════════════════════════════════
   3 · LA CALCULADORA DEL MES
   Retoma lo que la persona escribió en la actividad de la clase 5.
   El límite es editable a propósito: el número del plan cambia y el
   que manda es el del panel de cada uno.
   ══════════════════════════════════════════════════════════ */

(function calculadora() {
  const $porDia = document.getElementById('porDia');
  const $pico = document.getElementById('pico');
  const $picos = document.getElementById('picos');
  const $limite = document.getElementById('limite');
  if (!$porDia) return;

  const $total = document.getElementById('totalMes');
  const $pie = document.getElementById('totalPie');
  const $lleno = document.getElementById('rielLleno');
  const $rielPie = document.getElementById('rielPie');
  const $veredicto = document.getElementById('veredictoCalc');

  const DIAS = 30;

  function calcular() {
    const porDia = Number($porDia.value);
    const pico = Number($pico.value);
    const picos = Math.min(Number($picos.value), DIAS);
    const limite = Math.max(1, Number($limite.value) || 1);

    const total = porDia * (DIAS - picos) + pico * picos;
    const proporcion = total / limite;

    document.getElementById('porDiaVal').textContent = porDia;
    document.getElementById('picoVal').textContent = pico;
    document.getElementById('picosVal').textContent = picos;

    $total.textContent = total.toLocaleString('es-AR');
    $pie.textContent = total === 1 ? 'ejecución por mes' : 'ejecuciones por mes';

    const tono = proporcion > 1 ? 'fallo' : (proporcion > 0.8 ? 'alerta' : 'acierto');
    $lleno.style.width = Math.min(proporcion, 1) * 100 + '%';
    $lleno.style.background = window.token(tono);
    $rielPie.textContent = Math.round(proporcion * 100) + '% de tu límite de ' +
      limite.toLocaleString('es-AR') + ' por mes';

    // El día del mes en que se acaba el plan, contando parejo.
    if (proporcion > 1) {
      const porDiaPromedio = total / DIAS;
      const dia = Math.max(1, Math.ceil(limite / porDiaPromedio));
      $veredicto.innerHTML = 'A este ritmo el plan se te termina alrededor del <b>día ' + dia +
        '</b>. Lo que pase después no falla con un error: el flujo simplemente deja de dispararse, ' +
        'que es la peor manera de enterarse.';
    } else if (proporcion > 0.8) {
      $veredicto.innerHTML = 'Entrás, pero sin aire. Un mes con dos días malos de más y te quedás afuera. ' +
        'Este es el momento de decidir si el disparador tiene que correr tan seguido.';
    } else {
      $veredicto.innerHTML = 'Entra cómodo. Guardá el número igual: cuando alguien proponga ' +
        '«y que además revise cada cinco minutos», esta cuenta es la respuesta.';
    }
  }

  [$porDia, $pico, $picos, $limite].forEach(el => el.addEventListener('input', calcular));

  // Atajos con los límites de los planes, verificados en la grilla de n8n
  // el 15 de septiembre de 2026. El del plan gratuito sale del panel de la
  // cuenta, no de la grilla, y es el que más conviene reconfirmar.
  const $atajos = document.getElementById('atajosLimite');
  if ($atajos) {
    $atajos.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      $limite.value = b.dataset.limite;
      calcular();
    });
  }
  window.addEventListener('cambio-tema', calcular);
  calcular();

  // Lo que escribió en la clase 5, si lo escribió: la actividad de aquella
  // clase preguntaba exactamente por estos números.
  const dela5 = leerGuardado('clase05-q3');
  if (dela5) {
    const $mem = document.getElementById('memoria5');
    $mem.hidden = false;
    $mem.innerHTML = '<span>Esto escribiste en la clase 5</span>' +
      dela5.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  }
})();


/* ══════════════════════════════════════════════════════════
   4 · LAS CUATRO FORMAS DE FALLAR
   ══════════════════════════════════════════════════════════ */

const FALLAS = [
  { nombre: 'El que grita', tono: 'fallo', codigo: 'error 500 · sin conexión',
    texto: 'El servidor devuelve un error o directamente no está. El nodo se pone rojo, la ejecución queda marcada como fallida y el flujo se detiene ahí.',
    hacer: 'Es el más fácil de todos, y por eso el menos peligroso. Reintento con espera si la operación se puede repetir, y flujo de errores para que alguien se entere.' },
  { nombre: 'El que miente', tono: 'alerta', codigo: 'error 200 OK',
    texto: 'El servidor contesta que todo salió bien y manda cualquier cosa: una página vacía, el formulario de búsqueda otra vez, una lista sin resultados. n8n lo muestra en verde porque técnicamente no falló nada.',
    hacer: 'No se arregla con reintentos: se arregla preguntando. Después de traer datos, un IF que verifique que lo que llegó tiene cara de lo que esperábamos.' },
  { nombre: 'El que tarda', tono: 'alerta', codigo: 'timeout',
    texto: 'El otro lado no responde nunca. Sin un límite de espera configurado, el flujo se queda colgado ocupando una ejecución que ya no sirve.',
    hacer: 'Poner un tiempo máximo de espera en el nodo. Vale más un error a los diez segundos que una ejecución zombi de diez minutos.' },
  { nombre: 'El que te frena', tono: 'fallo', codigo: 'error 429 · demasiados pedidos',
    texto: 'Mandaste demasiado rápido y del otro lado te cortan el chorro. Aparece cuando un flujo procesa cuarenta ítems y dispara cuarenta pedidos sin respirar.',
    hacer: 'Esperar entre pedidos y, si son muchos, ir de a tandas. Reintentar sin cambiar el ritmo solo empeora las cosas: te van a frenar otra vez.' }
];

(function fallas() {
  const cont = document.getElementById('fallas');
  if (!cont) return;

  function pintar() {
    cont.innerHTML = FALLAS.map(f => `
      <div class="falla" style="border-left:2px solid ${window.token(f.tono)}">
        <div class="cara">
          <b style="color:${window.token(f.tono)}">${f.nombre}</b>
          <span>${f.codigo}</span>
        </div>
        <div>
          <p>${f.texto}</p>
          <div class="queHacer"><b>Qué se hace.</b> ${f.hacer}</div>
        </div>
      </div>`).join('');
  }

  pintar();
  window.addEventListener('cambio-tema', pintar);
})();


/* ══════════════════════════════════════════════════════════
   5 · ¿REINTENTAR O NO?
   Mismo mecanismo que el clasificador de la clase 1: se elige, se
   corrige y se explica. Acá lo que se entrena es una sola pregunta.
   ══════════════════════════════════════════════════════════ */

const ACCIONES = [
  { texto: 'Pedirle a InfoLeg la ficha de una norma', seguro: true,
    razon: 'Leer no cambia nada del otro lado. Podés pedir la misma página diez veces y el mundo queda igual.' },
  { texto: 'Mandar el mensaje de respuesta al chat', seguro: false,
    razon: 'Si el envío salió pero la respuesta se perdió en el camino, el reintento manda el mismo mensaje dos veces. Preferimos ninguno a dos.' },
  { texto: 'Agregar una fila a la planilla de pedidos', seguro: false,
    razon: 'Dos intentos, dos filas iguales. Se puede volver seguro si antes buscás si la fila ya existe, pero eso es otro nodo y otra decisión.' },
  { texto: 'Consultar la cotización del día', seguro: true,
    razon: 'Otra lectura. Además, si el primer intento falló por una caída momentánea, el segundo tiene buenas chances de andar.' },
  { texto: 'Marcar el pedido como procesado en la fila 14', seguro: true,
    razon: 'Escribir siempre el mismo valor en el mismo lugar deja el mismo resultado. Escribir no es lo peligroso: lo peligroso es agregar.' },
  { texto: 'Emitir la factura del cliente', seguro: false,
    razon: 'El caso extremo, y el que explica la regla. Dos intentos pueden ser dos facturas, y eso no lo arregla ningún nodo después.' }
];

(function reintentos() {
  const cont = document.getElementById('reintento');
  const $marcador = document.getElementById('marcadorReintento');
  if (!cont) return;

  let respondidas = 0, correctas = 0;

  cont.innerHTML = ACCIONES.map((a, i) => `
    <div class="accion" data-i="${i}">
      <span>${a.texto}</span>
      <button type="button" data-r="si">Se puede repetir</button>
      <button type="button" data-r="no">Mejor no</button>
      <span class="razon"></span>
    </div>`).join('');

  cont.addEventListener('click', e => {
    const boton = e.target.closest('button');
    if (!boton) return;
    const fila = boton.closest('.accion');
    if (fila.classList.contains('resuelta')) return;

    const a = ACCIONES[Number(fila.dataset.i)];
    const eligioSeguro = boton.dataset.r === 'si';
    const acerto = eligioSeguro === a.seguro;

    fila.classList.add('resuelta', acerto ? 'ok' : 'mal');
    boton.classList.add('elegida');
    fila.querySelector('.razon').textContent = (acerto ? '' : 'Era al revés. ') + a.razon;

    respondidas++;
    if (acerto) correctas++;
    $marcador.textContent = respondidas < ACCIONES.length
      ? `${correctas} de ${respondidas} · faltan ${ACCIONES.length - respondidas}`
      : `${correctas} de ${ACCIONES.length}. La pregunta no es si la operación es importante: es si repetirla deja el mundo igual.`;
  });
})();


/* ══════════════════════════════════════════════════════════
   6 · ACTIVIDAD
   Misma convención que las clases 2, 4 y 5.
   ══════════════════════════════════════════════════════════ */

(function actividad() {
  const campos = ['q1', 'q2', 'q3'];
  const $aviso = document.getElementById('guardado');
  if (!document.getElementById('q1')) return;

  campos.forEach(id => {
    const el = document.getElementById(id);
    el.value = leerGuardado('clase06-' + id);
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.setItem('clase06-' + id, el.value);
        const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
      }, 500);
    });
  });

  if (campos.some(id => leerGuardado('clase06-' + id))) {
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
