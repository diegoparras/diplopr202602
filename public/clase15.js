/* Clase 15 — Self-hosting e instancia propia: Docker, credenciales y backups
   Piezas: lo que trajo de las clases 13 y 14, la escalera de dónde vive
   n8n, el decisor con la cuenta de costos, Docker en tres ideas con el
   simulador del volumen, el armador de la instalación, la terminal del
   primer arranque, la clave de cifrado con cifrado de verdad en el
   navegador, el simulador de desastres, el diagnóstico y la actividad.

   Nada se dibuja con colores leídos desde JavaScript: todo sale de las
   variables de estilo.css. El armador sólo maneja valores que no son
   secretos y no guarda nada: la clave de cifrado se genera en tu máquina
   con un comando, nunca en esta página. */

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
function copiar(texto, boton) {
  const original = boton.textContent;
  const listo = ok => { boton.textContent = ok ? 'Copiado' : 'Seleccioná y copiá a mano'; setTimeout(() => { boton.textContent = original; }, 1800); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texto).then(() => listo(true), () => listo(false));
  else listo(false);
}
function bajar(nombre, texto) {
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.querySelectorAll('[data-copiar]').forEach(b => b.addEventListener('click', () => copiar(document.getElementById(b.dataset.copiar).textContent, b)));

// Datos verificados de n8n que usan varias piezas. Salen de la documentación
// y del paquete de la versión estable; la fecha está en las notas al pie.
const N8N = {
 "estable": "2.46.6",
 "edadEjecuciones": 336,
 "planes": [
  {
   "nombre": "Starter",
   "euros": 20,
   "ejecuciones": 2500
  },
  {
   "nombre": "Pro",
   "euros": 50,
   "ejecuciones": 10000
  }
 ],
 "errorClave": "n8n muestra «Credentials could not be decrypted. The likely reason is that a different \"encryptionKey\" was used to encrypt the data.»",
 "explicaciones": {
  "image": "La receta. <code>n8nio/n8n</code> es la imagen oficial, y la versión sale de <code>N8N_VERSION</code> en el .env. Fijar la versión quiere decir que nada cambia hasta que vos la cambies; <code>latest</code> te actualiza sin avisar.",
  "N8N_VERSION": "La versión que corre. Hoy la estable es la 2.46.6. La 3.0 existe desde el 27 de octubre como acceso anticipado, sólo en Docker: para producción, esperá a que la marquen estable.",
  "restart": "Si el contenedor se cae o el servidor se reinicia, Docker lo vuelve a levantar solo. Salvo que lo hayas parado vos a propósito.",
  "ports": "n8n escucha en el puerto 5678, pero sólo para la propia máquina (127.0.0.1). Desde internet se entra por HTTPS a través de un proxy que pone el certificado; la guía oficial de n8n usa Traefik. Abrir el 5678 directo a internet es dejar el editor sin cifrar.",
  "env_file": "Todas las variables viven en el archivo .env, al lado. Así el docker-compose.yml se puede compartir y los secretos no.",
  "volumes": "La heladera: el volumen <code>n8n_data</code> guarda todo lo de <code>/home/node/.n8n</code>, que es donde n8n escribe flujos, credenciales, la base SQLite y su configuración. Sin esta línea, cada actualización empieza de cero.",
  "respaldos": "Una carpeta del servidor, <code>./respaldos</code>, montada donde n8n deja escribir archivos (<code>/home/node/.n8n-files</code>, lo que viene desde la 2.0). Ahí escribe el flujo de respaldo de la clase.",
  "depends_on": "n8n arranca después de la base de datos.",
  "N8N_HOST": "El nombre con el que se llega a tu n8n desde afuera. n8n lo usa para armar sus propias direcciones.",
  "N8N_PROTOCOL": "https: detrás del proxy que pone el certificado. Con http, el navegador no guarda la sesión, porque n8n pide cookies seguras por defecto (<code>N8N_SECURE_COOKIE=true</code>).",
  "N8N_WEBHOOK_URL": "La dirección pública de los webhooks. Sin ella, detrás de un proxy n8n muestra <code>http://localhost:5678/...</code> y nadie de afuera puede llamarte. Reemplaza a <code>WEBHOOK_URL</code>, que desde la 2.35 está deprecada.",
  "N8N_PROXY_HOPS": "Le dice a n8n que hay un proxy adelante (uno), para que lea bien la dirección real de quien llama.",
  "GENERIC_TIMEZONE": "La zona horaria de los nodos que trabajan con horarios, como el Schedule Trigger. Si no la ponés, n8n usa la de Nueva York y tu «todos los días a las 9» corre a otra hora.",
  "TZ": "La zona horaria del sistema dentro del contenedor: la de los registros y la de los comandos.",
  "N8N_ENCRYPTION_KEY": "La clave con la que n8n cifra cada credencial. Si no la ponés, n8n inventa una y la guarda dentro del volumen; si después pierde el volumen o la cambiás, ninguna credencial se puede leer. Generala con el comando de abajo, ponela acá y guardá una copia fuera del servidor. Si el valor de acá no coincide con el que n8n ya guardó, no arranca: «Mismatching encryption keys».",
  "EXECUTIONS_DATA_PRUNE": "Borrar las ejecuciones viejas. Viene prendido. Cada ejecución guarda los datos que pasaron por cada nodo, y sin poda el disco se llena.",
  "EXECUTIONS_DATA_MAX_AGE": "Cuántas horas se guardan las ejecuciones: 336 son 14 días, el valor que trae n8n. Además se guardan, como mucho, 10.000.",
  "DB_TYPE": "Postgres en lugar de SQLite. n8n usa SQLite si no le decís nada y recomienda Postgres para producción: soporta las versiones 17 y 18.",
  "DB_POSTGRESDB_HOST": "El nombre del servicio de Postgres en este mismo compose. Entre contenedores se llaman por su nombre.",
  "DB_POSTGRESDB_DATABASE": "El nombre de la base.",
  "DB_POSTGRESDB_USER": "El usuario de la base.",
  "DB_POSTGRESDB_PASSWORD": "La clave de la base. Generala igual que la de cifrado y no la repitas.",
  "pgimage": "La imagen oficial de Postgres, versión 18, la misma que usa el compose oficial de n8n.",
  "pgenv": "Postgres crea la base y el usuario la primera vez que arranca.",
  "pgpass": "La misma clave de la base, tomada del .env: se escribe una sola vez.",
  "pgdata": "Dónde guarda Postgres sus datos adentro del contenedor. El compose oficial de n8n lo fija así para que coincida con el volumen.",
  "pgvol": "El volumen de Postgres: la heladera de la base. Con Postgres, el respaldo de la base se hace con sus propias herramientas."
 },
 "terminal": [
  {
   "rot": "Levantar todo",
   "cmd": "docker compose up -d",
   "sal": "[+] Running 3/3\n ✔ Volume \"n8n_data\"   Created\n ✔ Container n8n        Started",
   "expl": "Lee el docker-compose.yml, baja la imagen si no la tiene, crea el volumen y arranca el contenedor. La <code>-d</code> lo deja corriendo en segundo plano."
  },
  {
   "rot": "Ver qué está corriendo",
   "cmd": "docker compose ps",
   "sal": "NAME   IMAGE              STATUS         PORTS\nn8n    n8nio/n8n:2.46.6   Up 20 seconds  127.0.0.1:5678->5678/tcp",
   "expl": "«Up» quiere decir que está corriendo. Si dice «Restarting» una y otra vez, algo falla al arrancar: el paso siguiente te dice qué."
  },
  {
   "rot": "Leer los registros",
   "cmd": "docker compose logs -f n8n",
   "sal": "n8n  | Editor is now accessible via:\nn8n  | https://n8n.tu-dominio.com",
   "expl": "Lo que n8n va contando. Es lo primero que se mira cuando algo no anda. Con <code>Ctrl+C</code> dejás de mirar; n8n sigue corriendo."
  },
  {
   "rot": "Preguntarle si está vivo",
   "cmd": "curl -sf http://localhost:5678/healthz",
   "sal": "(responde con el código 200: la instancia está viva)",
   "expl": "<code>/healthz</code> contesta si la instancia responde. <code>/healthz/readiness</code>, además, si la base de datos está conectada. Es lo que mira un servicio de monitoreo."
  },
  {
   "rot": "Abrir el navegador",
   "cmd": "https://n8n.tu-dominio.com",
   "sal": "Set up owner account",
   "expl": "La primera vez, n8n pide crear la cuenta de dueño. Es la cuenta que administra la instancia: usá una clave fuerte. Si querés lo gratis de Community registrada (carpetas, depurar en el editor), registrala con tu correo."
  }
 ],
 "diagnosticoOpciones": [
  [
   "webhook",
   "N8N_WEBHOOK_URL"
  ],
  [
   "clave",
   "La clave de cifrado"
  ],
  [
   "zona",
   "GENERIC_TIMEZONE"
  ],
  [
   "volumen",
   "El volumen"
  ],
  [
   "poda",
   "La poda de ejecuciones"
  ],
  [
   "https",
   "HTTPS"
  ]
 ],
 "diagnostico": [
  {
   "t": "El Webhook de tu flujo muestra la dirección <code>http://localhost:5678/webhook/...</code> y el formulario de afuera no llega nunca.",
   "ok": "webhook",
   "por": "Detrás de un proxy, n8n arma la dirección con su propio host y puerto. <code>N8N_WEBHOOK_URL</code> le dice cuál es la pública."
  },
  {
   "t": "Reinstalaste n8n en otro servidor, importaste todo, y cada flujo falla con «Credentials could not be decrypted».",
   "ok": "clave",
   "por": "Las credenciales se cifraron con otra clave. Sin la original, hay que volver a cargarlas."
  },
  {
   "t": "n8n no arranca y en los registros dice «Mismatching encryption keys».",
   "ok": "clave",
   "por": "La clave del .env no coincide con la que n8n ya había guardado en el volumen. Una de las dos está mal copiada."
  },
  {
   "t": "El flujo «todos los días a las 9» corre a las 10 de la mañana.",
   "ok": "zona",
   "por": "Sin <code>GENERIC_TIMEZONE</code>, n8n usa la hora de Nueva York."
  },
  {
   "t": "Actualizaste n8n y apareció vacío, como recién instalado.",
   "ok": "volumen",
   "por": "Los datos estaban adentro del contenedor, sin volumen, o alguien corrió <code>docker compose down -v</code>, que borra los volúmenes."
  },
  {
   "t": "El disco del servidor se llena cada semana, aunque tenés pocos flujos.",
   "ok": "poda",
   "por": "Cada ejecución guarda sus datos. Revisá que la poda esté prendida y achicá cuánto tiempo se guardan."
  },
  {
   "t": "Entrás al editor por <code>http://</code>, ponés tu clave y te vuelve a pedir que entres.",
   "ok": "https",
   "por": "n8n pide cookies seguras por defecto, que sólo viajan por HTTPS. La solución es el certificado, no apagar la protección."
  }
 ],
 "textos": {
  "ctNota": "Precios de n8n Cloud de la grilla de n8n.io, con facturación anual, verificados el 4 de noviembre de 2026. El plan Business (667 € y 40.000 ejecuciones) es sólo para instancia propia. Las ejecuciones manuales y los flujos de error no cuentan.",
  "arNota": "Verificado el 4 de noviembre de 2026 en docs.n8n.io, Docker Hub y el código de la versión estable (n8n 2.46.6). Es para entender cada línea. Para instalar de verdad, n8n ofrece un script oficial, <code>curl -fsSL https://get.n8n.io | sh</code>, que arma estos archivos con los secretos ya generados y con los <i>task runners</i> en un contenedor aparte, que es lo que recomienda para producción. La guía oficial con HTTPS usa Traefik y pide al menos 2 núcleos y 4 GB de memoria.",
  "termNota": "Las salidas están abreviadas y su texto exacto cambia entre versiones. Verificado el 4 de noviembre de 2026 en docs.n8n.io, Docker Hub y el código de la versión estable.",
  "cfNota": "Si no definís la clave, n8n la genera en el primer arranque y la guarda en el archivo <code>config</code> de la carpeta <code>.n8n</code>, dentro del volumen. Con la 3.0 se suma una segunda capa de claves que se pueden rotar desde Settings, y una advertencia: después de rotarlas, no vuelvas a una versión anterior. Verificado el 4 de noviembre de 2026 en docs.n8n.io, Docker Hub y el código de la versión estable.",
  "cmdRespaldo": "<div class=\"prompt\"><div class=\"cabeza\"><b>Exportar flujos y credenciales (las credenciales salen cifradas)</b></div><pre>docker compose exec -u node n8n n8n export:workflow --backup --output=/home/node/.n8n-files/flujos/\ndocker compose exec -u node n8n n8n export:credentials --backup --output=/home/node/.n8n-files/credenciales/</pre><p style=\"margin-top:10px;font-size:0.88rem;color:var(--tenue)\">Quedan en la carpeta <code>respaldos</code> del servidor. Con <code>--decrypted</code> las credenciales salen legibles: no lo uses salvo para mudarte, y borrá el archivo después. Usá carpetas distintas para flujos y credenciales. Para importar: <code>import:workflow --separate --input=…</code> e <code>import:credentials --separate --input=…</code>; los flujos importados quedan sin publicar.</p></div><div class=\"prompt\"><div class=\"cabeza\"><b>La instancia entera, de una</b></div><pre>docker compose exec -u node n8n n8n export:entities --outputDir=/home/node/.n8n-files/instancia/</pre><p style=\"margin-top:10px;font-size:0.88rem;color:var(--tenue)\">Exporta todo lo de la base, y sirve para pasar de SQLite a Postgres con <code>import:entities</code>. Existe desde n8n 1.116. Con Postgres, la base se respalda además con sus propias herramientas, y con SQLite, parando n8n y copiando la carpeta <code>.n8n</code>.</p></div>",
  "respNota": "Comandos y advertencias de la página de respaldo y restauración de docs.n8n.io. Usuarios, ejecuciones y la configuración de la instancia no viajan en las exportaciones de flujos y credenciales. Verificado el 4 de noviembre de 2026 en docs.n8n.io, Docker Hub y el código de la versión estable.",
  "pasosActualizar": "<li><b>Leé las notas de la versión</b> a la que vas. n8n recomienda actualizar al menos una vez por mes.</li><li><b>Respaldá todo</b>: exportaciones y base de datos. Antes de un salto grande como la 3.0, es obligatorio.</li><li><b>Cambiá <code>N8N_VERSION</code></b> en el .env.</li><li><code>docker compose pull</code>, <code>docker compose down</code> y <code>docker compose up -d</code>. Nunca <code>down -v</code>: la <code>-v</code> borra los volúmenes.</li><li><b>Probá</b> tus flujos importantes. Si algo se rompió, volvés a la versión anterior y restaurás la copia de la base.</li>",
  "txtEntornos": "Lo sano es tener dos instancias: una para probar y otra que usa la organización. Lo probado pasa a producción, nunca al revés. Con Git, n8n lo resuelve en los planes Business y Enterprise (<i>Environments</i>: cada instancia en su rama, con push y pull). En Community se hace a mano: exportar de una e importar en la otra, o con los paquetes <code>.n8np</code> y la n8n CLI, que están en Preview. Y antes de pasar algo, se corre con los casos de la clase 12.",
  "versNota": "La 3.0 salió el 27 de octubre de 2026 como acceso anticipado, sólo como imagen de Docker (ya va por la 3.1), y las etiquetas <code>latest</code> y <code>stable</code> todavía apuntan a la 2.46.6. Antes de pasar, revisá Settings → Migration Report, que lista lo que se rompe en tus flujos. Entre otras cosas, el nodo Code pasa a cortar a los 60 segundos y los nodos de comunidad sin verificar vienen apagados. Verificado el 4 de noviembre de 2026 en docs.n8n.io, Docker Hub y el código de la versión estable."
 }
};

// Las notas y los textos que llevan cifras de n8n salen del mismo objeto.
Object.entries(N8N.textos).forEach(([id, html]) => { const el = document.getElementById(id); if (el) el.innerHTML = html; });


/* ══════════════════════════════════════════════════════════
   1 · LO QUE TRAJISTE
   ══════════════════════════════════════════════════════════ */

(function traido() {
  const cont = document.getElementById('traido');
  if (!cont) return;
  const partes = [
    { clave: 'clase13-q2', rot: 'Si tu n8n viviera en una máquina de la organización (clase 13)',
      hoy: 'Quién lo cuida y qué pasa un viernes a la noche: hoy le ponemos nombre a cada tarea, y la mayoría se resuelve con un respaldo bien hecho.' },
    { clave: 'clase14-q1', rot: 'Los documentos que no saldrían nunca (clase 14)',
      hoy: 'Esta es la razón más fuerte para alojar adentro: si el documento no puede salir, el que lo procesa tiene que estar adentro.' },
    { clave: 'clase14-q2', rot: 'Lo que te traerías a casa (clase 14)',
      hoy: 'En el decisor de más abajo vas a ver qué cuesta cada pieza que traigas.' }
  ].map(p => ({ ...p, texto: leerGuardado(p.clave) }));
  if (!partes.some(p => p.texto)) {
    cont.innerHTML = `
      <span class="rot">Todavía no hay nada guardado acá</span>
      <p class="vacio" style="margin-top:12px">Las actividades de las clases 13 y 14 preguntaban quién cuidaría un n8n propio, qué documentos no saldrían nunca y qué te traerías a una máquina de la organización. Si las hiciste en otro dispositivo no las voy a ver. Podés completarlas en <a href="13.html">la 13</a> y <a href="14.html">la 14</a>, o traerlas pensadas.</p>`;
    return;
  }
  cont.innerHTML = '<span class="rot">Lo que escribiste en las últimas dos clases</span>' +
    partes.filter(p => p.texto).map(p => `
      <div class="linea">
        <b>${p.rot}</b>
        <p style="white-space:pre-wrap">${escapar(p.texto)}</p>
        <p style="font-size:0.84rem;color:var(--tenue);margin-top:4px">${p.hoy}</p>
      </div>`).join('');
})();


/* ══════════════════════════════════════════════════════════
   2 · LA ESCALERA: QUIÉN SE OCUPA DE QUÉ
   ══════════════════════════════════════════════════════════ */

(function escalera() {
  const $t = document.getElementById('escTabla');
  if (!$t) return;
  const $opc = document.getElementById('escOpc');
  const $txt = document.getElementById('escTxt');
  const ESCALONES = [
    { id: 'cloud', nom: 'n8n Cloud', t: 'n8n se ocupa de casi todo. Pagás por ejecuciones y tus datos viven en sus servidores. Es donde arrancó la cursada.' },
    { id: 'pod', nom: 'Hosting administrado', t: 'Un proveedor corre el contenedor por vos, como PikaPods en el taller de OAuth. La instancia es tuya y sin límite de ejecuciones; las actualizaciones y los respaldos dependen del proveedor y de vos.' },
    { id: 'vps', nom: 'Servidor propio en la nube', t: 'Alquilás un servidor (un VPS) y le instalás Docker y n8n. Todo es tuyo: la instalación, el certificado, las actualizaciones, los respaldos y la seguridad del servidor.' },
    { id: 'casa', nom: 'Una máquina de la organización', t: 'Lo mismo que el servidor propio, pero la máquina está en la oficina. Los datos no salen del edificio; para que te lleguen webhooks de afuera hay que abrir una puerta a internet, y eso es otro trabajo.' }
  ];
  const TAREAS = [
    ['Instalar n8n', ['n8n', 'Proveedor', 'Vos', 'Vos']],
    ['Actualizar a cada versión', ['n8n', 'Proveedor o vos', 'Vos', 'Vos']],
    ['Respaldar flujos y credenciales', ['n8n', 'Proveedor y vos', 'Vos', 'Vos']],
    ['Certificado HTTPS y dominio', ['n8n', 'Proveedor', 'Vos', 'Vos']],
    ['Seguridad del servidor', ['n8n', 'Proveedor', 'Vos', 'Vos']],
    ['Dónde quedan los datos', ['Servidores de n8n', 'Servidores del proveedor', 'El servidor que alquilás', 'Tu edificio']],
    ['Límite de ejecuciones', ['El del plan', 'Ninguno', 'Ninguno', 'Ninguno']],
    ['Nodos que sólo andan en instancia propia', ['No', 'Sí', 'Sí', 'Sí']]
  ];
  let sel = 0;
  function pintar() {
    $t.innerHTML = `<thead><tr><th></th>${ESCALONES.map((e, i) => `<th class="${i === sel ? 'on' : ''}">${e.nom}</th>`).join('')}</tr></thead>
      <tbody>${TAREAS.map(([t, v]) => `<tr><td><b>${t}</b></td>${v.map((x, i) => `<td class="${i === sel ? 'on' : ''}${/^Vos$/.test(x) ? ' vos' : ''}">${x}</td>`).join('')}</tr>`).join('')}</tbody>`;
    $txt.innerHTML = `<p>${ESCALONES[sel].t}</p>`;
    marcar($opc, $opc.querySelectorAll('button')[sel]);
  }
  $opc.innerHTML = ESCALONES.map((e, i) => `<button type="button" data-i="${i}" aria-pressed="false">${i + 1} · ${e.nom}</button>`).join('');
  $opc.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) { sel = +b.dataset.i; pintar(); } });
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   3 · EL DECISOR Y LA CUENTA
   Los precios de Cloud son los de la grilla, con fecha. Lo de la
   instancia propia lo pone cada uno: no hay un precio de servidor que
   valga para todos.
   ══════════════════════════════════════════════════════════ */

(function decisor() {
  const $d = document.getElementById('decPreg');
  if (!$d) return;
  const $v = document.getElementById('decVeredicto');
  const PREGUNTAS = [
    { k: 'datos', t: '¿Hay datos o documentos que no pueden salir de la organización?', o: [['si', 'Sí'], ['no', 'No']] },
    { k: 'quien', t: '¿Hay alguien que pueda ocuparse del servidor, también un viernes a la noche?', o: [['si', 'Sí'], ['no', 'No, nadie']] },
    { k: 'volumen', t: '¿Cuántas ejecuciones de producción por mes esperás?', o: [['poco', 'Menos de 2.500'], ['medio', 'Hasta 10.000'], ['mucho', 'Más de 10.000']] },
    { k: 'nodos', t: '¿Necesitás algo que sólo anda en instancia propia, como nodos de comunidad que n8n no verificó o Python en el nodo Code?', o: [['si', 'Sí'], ['no', 'No']] }
  ];
  const r = {};
  $d.innerHTML = PREGUNTAS.map(p => `
    <div class="decisor-p"><b>${p.t}</b><div class="opciones">${p.o.map(([v, t]) => `<button type="button" data-k="${p.k}" data-v="${v}" aria-pressed="false">${t}</button>`).join('')}</div></div>`).join('');
  function decidir() {
    if (Object.keys(r).length < PREGUNTAS.length) { $v.hidden = true; return; }
    const razones = [];
    let cual;
    if (r.datos === 'si' && r.quien === 'si') { cual = 'Instancia propia'; razones.push('Los datos no pueden salir, y hay quien la cuide.'); }
    else if (r.datos === 'si' && r.quien === 'no') { cual = 'Todavía no: primero, alguien que la cuide'; razones.push('Los datos piden quedarse adentro, pero una instancia sin quien la actualice y la respalde es un riesgo mayor que el que se quiere evitar.', 'Mientras tanto: Cloud para lo que no es sensible, y lo sensible a mano.'); }
    else if (r.quien === 'no') { cual = 'n8n Cloud'; razones.push('Nadie va a poder ocuparse del servidor. Cloud cobra justamente por eso.'); }
    else if (r.nodos === 'si' || r.volumen === 'mucho') { cual = 'Instancia propia, o un hosting administrado'; razones.push(r.nodos === 'si' ? 'Lo que necesitás no anda en Cloud.' : 'Con más de 10.000 ejecuciones por mes, en Cloud ya no alcanza el plan Pro.'); }
    else { cual = 'Cualquiera de las dos: decide la cuenta'; razones.push('No hay nada que obligue. Hacé la cuenta de abajo con tus números, incluyendo tus horas.'); }
    if (r.volumen === 'mucho' && cual === 'n8n Cloud') razones.push('Ojo: con más de 10.000 ejecuciones por mes, en Cloud el siguiente paso es Enterprise, a precio de consulta.');
    $v.hidden = false;
    $v.innerHTML = `<div class="cual">${cual}</div>${razones.map(x => `<p>${x}</p>`).join('')}`;
  }
  $d.addEventListener('click', e => {
    const b = e.target.closest('button[data-k]');
    if (!b) return;
    r[b.dataset.k] = b.dataset.v;
    $d.querySelectorAll(`button[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    decidir();
  });
})();

(function cuenta() {
  const $e = document.getElementById('ctEjec');
  if (!$e) return;
  const $s = document.getElementById('ctServidor');
  const $h = document.getElementById('ctHoras');
  const $vh = document.getElementById('ctValorHora');
  const $res = document.getElementById('ctRes');
  const num = el => { const v = parseFloat(String(el.value).replace(',', '.')); return isFinite(v) && v >= 0 ? v : null; };
  const plata = (v, mon) => `${mon === '€' ? '' : 'USD '}${v.toLocaleString('es-AR', { maximumFractionDigits: 0 })}${mon === '€' ? ' €' : ''}`;
  function pintar() {
    const ej = num($e);
    document.getElementById('ctEjecV').textContent = ej === null ? '—' : ej.toLocaleString('es-AR');
    const plan = N8N.planes.find(p => ej !== null && ej <= p.ejecuciones);
    const cloud = plan
      ? `<div class="calc-tile"><span>n8n Cloud</span><b>${plata(plan.euros, '€')}</b><p>Plan ${plan.nombre}, hasta ${plan.ejecuciones.toLocaleString('es-AR')} ejecuciones por mes, facturación anual.</p></div>`
      : `<div class="calc-tile"><span>n8n Cloud</span><b>A consultar</b><p>Más de ${N8N.planes[N8N.planes.length - 1].ejecuciones.toLocaleString('es-AR')} ejecuciones por mes: Enterprise, a precio de consulta.</p></div>`;
    const s = num($s), h = num($h), vh = num($vh);
    let propio;
    if (s === null || h === null || vh === null) {
      propio = `<div class="calc-tile"><span>Instancia propia</span><b>—</b><p>Completá el costo del servidor, tus horas y cuánto vale tu hora.</p></div>`;
    } else {
      const total = s + h * vh;
      propio = `<div class="calc-tile"><span>Instancia propia</span><b>${plata(total)}</b><p>${plata(s)} de servidor y ${plata(h * vh)} de tu tiempo (${h} ${h === 1 ? 'hora' : 'horas'}). Sin límite de ejecuciones.</p></div>`;
    }
    $res.innerHTML = cloud + propio + `<div class="calc-tile"><span>Lo que no entra en la cuenta</span><b>Riesgo</b><p>Si nadie respalda ni actualiza, el costo no es mensual: llega todo junto el día que se rompe.</p></div>`;
  }
  [$e, $s, $h, $vh].forEach(el => el.addEventListener('input', pintar));
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   4 · DOCKER EN TRES IDEAS: EL VOLUMEN
   ══════════════════════════════════════════════════════════ */

(function volumen() {
  const $c = document.getElementById('volCaja');
  if (!$c) return;
  const $log = document.getElementById('volLog');
  let conVolumen = true, corriendo = true, flujos = 0, guardados = 0;
  function pintar() {
    $c.innerHTML = `
      <div class="vol-img"><span class="rot">Imagen</span><b>n8nio/n8n</b><small>la receta: siempre igual</small></div>
      <div class="vol-flecha">→</div>
      <div class="vol-cont ${corriendo ? 'on' : 'off'}"><span class="rot">Contenedor</span><b>${corriendo ? 'n8n corriendo' : 'borrado'}</b><small>${corriendo ? `${flujos} ${flujos === 1 ? 'flujo' : 'flujos'} en memoria` : '—'}</small></div>
      <div class="vol-flecha">${conVolumen ? '⇄' : '✕'}</div>
      <div class="vol-vol ${conVolumen ? 'on' : 'off'}"><span class="rot">Volumen</span><b>${conVolumen ? 'n8n_data' : 'sin volumen'}</b><small>${conVolumen ? `${guardados} ${guardados === 1 ? 'flujo guardado' : 'flujos guardados'}` : 'nada sobrevive afuera'}</small></div>`;
    document.getElementById('volCon').setAttribute('aria-pressed', String(conVolumen));
    document.getElementById('volSin').setAttribute('aria-pressed', String(!conVolumen));
  }
  function anotar(t, k) { $log.insertAdjacentHTML('afterbegin', `<div class="bit ${k}"><i>${k === 'ok' ? '✓' : k === 'mal' ? '✗' : '·'}</i><span>${t}</span></div>`); }
  document.getElementById('volCon').addEventListener('click', () => { conVolumen = true; flujos = 0; guardados = 0; corriendo = true; $log.innerHTML = ''; pintar(); });
  document.getElementById('volSin').addEventListener('click', () => { conVolumen = false; flujos = 0; guardados = 0; corriendo = true; $log.innerHTML = ''; pintar(); });
  document.getElementById('volCrear').addEventListener('click', () => {
    if (!corriendo) { anotar('No hay contenedor: primero levantalo de nuevo.', 'mal'); return; }
    flujos++; if (conVolumen) guardados = flujos;
    anotar(`Creaste un flujo. ${conVolumen ? 'Queda escrito en el volumen.' : 'Queda adentro del contenedor, y en ningún otro lado.'}`, 'ok'); pintar();
  });
  document.getElementById('volBorrar').addEventListener('click', () => {
    if (!corriendo) return;
    corriendo = false; flujos = 0;
    anotar('Borraste el contenedor, como pasa en cada actualización.', 'rep'); pintar();
  });
  document.getElementById('volLevantar').addEventListener('click', () => {
    if (corriendo) { anotar('Ya está corriendo.', 'rep'); return; }
    corriendo = true; flujos = conVolumen ? guardados : 0;
    anotar(conVolumen ? `Levantaste un contenedor nuevo con la misma imagen y el mismo volumen: aparecen tus ${guardados} ${guardados === 1 ? 'flujo' : 'flujos'}.` : 'Levantaste un contenedor nuevo: n8n arranca vacío. Todo lo que habías hecho se perdió con el contenedor viejo.', conVolumen ? 'ok' : 'mal');
    pintar();
  });
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   5 · EL ARMADOR DE LA INSTALACIÓN
   Sólo valores que no son secretos. No se guarda nada.
   ══════════════════════════════════════════════════════════ */

(function armador() {
  const $dom = document.getElementById('arDominio');
  if (!$dom) return;
  const $tz = document.getElementById('arZona');
  const $ver = document.getElementById('arVersion');
  const $base = document.getElementById('arBase');
  const $compose = document.getElementById('arCompose');
  const $env = document.getElementById('arEnv');
  const $expl = document.getElementById('arExpl');
  let base = 'sqlite';

  function lineas() {
    const dominio = $dom.value.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'n8n.tu-dominio.com';
    const zona = $tz.value.trim() || 'America/Argentina/Buenos_Aires';
    const version = $ver.value.trim() || N8N.estable;
    const env = [
      ['# Copiá este archivo como .env, al lado del docker-compose.yml.', null],
      ['# No lo subas a GitHub ni lo mandes por chat.', null],
      ['', null],
      [`N8N_VERSION=${version}`, 'N8N_VERSION'],
      [`N8N_HOST=${dominio}`, 'N8N_HOST'],
      ['N8N_PROTOCOL=https', 'N8N_PROTOCOL'],
      [`N8N_WEBHOOK_URL=https://${dominio}/`, 'N8N_WEBHOOK_URL'],
      ['N8N_PROXY_HOPS=1', 'N8N_PROXY_HOPS'],
      [`GENERIC_TIMEZONE=${zona}`, 'GENERIC_TIMEZONE'],
      [`TZ=${zona}`, 'TZ'],
      ['N8N_ENCRYPTION_KEY=PEGAR_ACA_LA_CLAVE_GENERADA', 'N8N_ENCRYPTION_KEY'],
      ['EXECUTIONS_DATA_PRUNE=true', 'EXECUTIONS_DATA_PRUNE'],
      [`EXECUTIONS_DATA_MAX_AGE=${N8N.edadEjecuciones}`, 'EXECUTIONS_DATA_MAX_AGE']
    ];
    if (base === 'postgres') env.push(
      ['', null],
      ['DB_TYPE=postgresdb', 'DB_TYPE'],
      ['DB_POSTGRESDB_HOST=postgres', 'DB_POSTGRESDB_HOST'],
      ['DB_POSTGRESDB_DATABASE=n8n', 'DB_POSTGRESDB_DATABASE'],
      ['DB_POSTGRESDB_USER=n8n', 'DB_POSTGRESDB_USER'],
      ['DB_POSTGRESDB_PASSWORD=PEGAR_ACA_OTRA_CLAVE_GENERADA', 'DB_POSTGRESDB_PASSWORD']
    );
    const compose = [
      ['services:', null],
      ['  n8n:', null],
      ['    image: n8nio/n8n:${N8N_VERSION}', 'image'],
      ['    restart: unless-stopped', 'restart'],
      ['    ports:', null],
      ['      - "127.0.0.1:5678:5678"', 'ports'],
      ['    env_file: .env', 'env_file'],
      ['    volumes:', null],
      ['      - n8n_data:/home/node/.n8n', 'volumes'],
      ['      - ./respaldos:/home/node/.n8n-files', 'respaldos'],
      ...(base === 'postgres' ? [['    depends_on:', null], ['      - postgres', 'depends_on']] : []),
      ...(base === 'postgres' ? [
        ['', null],
        ['  postgres:', null],
        ['    image: postgres:18', 'pgimage'],
        ['    restart: unless-stopped', 'restart'],
        ['    environment:', null],
        ['      - POSTGRES_DB=n8n', 'pgenv'],
        ['      - POSTGRES_USER=n8n', 'pgenv'],
        ['      - POSTGRES_PASSWORD=${DB_POSTGRESDB_PASSWORD}', 'pgpass'],
        ['      - PGDATA=/var/lib/postgresql/data', 'pgdata'],
        ['    volumes:', null],
        ['      - postgres_data:/var/lib/postgresql/data', 'pgvol']
      ] : []),
      ['', null],
      ['volumes:', null],
      ['  n8n_data:', 'volumes'],
      ...(base === 'postgres' ? [['  postgres_data:', 'pgvol']] : [])
    ];
    return { env, compose };
  }
  function pintarArchivo($el, ls) {
    $el.innerHTML = ls.map(([t, k]) => k ? `<button type="button" class="linea-ar" data-k="${k}">${escapar(t)}</button>` : `<span class="linea-ar quieta">${escapar(t) || ' '}</span>`).join('');
  }
  function pintar() {
    const { env, compose } = lineas();
    pintarArchivo($compose, compose);
    pintarArchivo($env, env);
    $compose.dataset.texto = compose.map(l => l[0]).join('\n') + '\n';
    $env.dataset.texto = env.map(l => l[0]).join('\n') + '\n';
  }
  function explicar(k) {
    const e = N8N.explicaciones[k];
    if (!e) return;
    $expl.innerHTML = `<span class="rot">${escapar(k)}</span><p>${e}</p>`;
    document.querySelectorAll('.linea-ar').forEach(b => b.classList.toggle('on', b.dataset.k === k));
  }
  [$compose, $env].forEach($el => $el.addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) explicar(b.dataset.k); }));
  $ver.placeholder = N8N.estable;
  [$dom, $tz, $ver].forEach(el => el.addEventListener('input', pintar));
  $base.addEventListener('click', e => {
    const b = e.target.closest('button[data-b]');
    if (!b) return;
    base = b.dataset.b; marcar($base, b); pintar();
  });
  document.getElementById('arBajarCompose').addEventListener('click', () => bajar('docker-compose.yml', $compose.dataset.texto));
  document.getElementById('arBajarEnv').addEventListener('click', () => bajar('env-de-ejemplo.txt', $env.dataset.texto));
  pintar();
  explicar('N8N_ENCRYPTION_KEY');
})();


/* ══════════════════════════════════════════════════════════
   6 · LA TERMINAL DEL PRIMER ARRANQUE
   ══════════════════════════════════════════════════════════ */

(function terminal() {
  const $t = document.getElementById('term');
  if (!$t) return;
  const $cmd = document.getElementById('termCmd');
  const $exp = document.getElementById('termExpl');
  const COMANDOS = N8N.terminal;
  let n = 0;
  function pintarBotones() {
    $cmd.innerHTML = COMANDOS.map((c, i) => `<button type="button" data-i="${i}" ${i > n ? 'disabled' : ''} aria-pressed="${i < n}">${i + 1} · ${escapar(c.rot)}</button>`).join('');
  }
  $cmd.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (!b) return;
    const i = +b.dataset.i, c = COMANDOS[i];
    $t.insertAdjacentHTML('beforeend', `<div class="t-cmd"><span>$</span> ${escapar(c.cmd)}</div><div class="t-sal">${escapar(c.sal)}</div>`);
    $t.scrollTop = $t.scrollHeight;
    $exp.innerHTML = `<p>${c.expl}</p>`;
    if (i === n) n = Math.min(COMANDOS.length, n + 1);
    pintarBotones();
  });
  document.getElementById('termReset').addEventListener('click', () => { n = 0; $t.innerHTML = '<div class="t-sal">Una terminal en el servidor, en la carpeta donde están docker-compose.yml y .env.</div>'; $exp.innerHTML = ''; pintarBotones(); });
  document.getElementById('termReset').click();
})();


/* ══════════════════════════════════════════════════════════
   7 · LA CLAVE DE CIFRADO, CON CIFRADO DE VERDAD
   AES-GCM del navegador. Nada sale de esta página y nada se guarda.
   ══════════════════════════════════════════════════════════ */

(function cifrado() {
  const $tok = document.getElementById('cfToken');
  if (!$tok) return;
  const $k1 = document.getElementById('cfClave');
  const $k2 = document.getElementById('cfOtra');
  const $base = document.getElementById('cfBase');
  const $res = document.getElementById('cfRes');
  const enc = new TextEncoder(), dec = new TextDecoder();
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  const azar = n => hex(crypto.getRandomValues(new Uint8Array(n)));
  let guardado = null;

  async function llave(texto) {
    const material = await crypto.subtle.digest('SHA-256', enc.encode(texto));
    return crypto.subtle.importKey('raw', material, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  if (!window.crypto || !crypto.subtle) {
    $res.innerHTML = '<p class="sim-vacia">Este navegador no permite cifrar desde la página. Lo de abajo se entiende igual leyéndolo.</p>';
    return;
  }
  $k1.value = azar(16);
  $k2.value = azar(16);
  document.getElementById('cfNueva').addEventListener('click', () => { $k2.value = azar(16); });
  document.getElementById('cfCifrar').addEventListener('click', async () => {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const c = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await llave($k1.value), enc.encode($tok.value));
    guardado = { iv, c };
    $base.textContent = hex(iv) + ':' + hex(c);
    $res.innerHTML = '<div class="bit ok"><i>✓</i><span>Guardado. En la base de datos queda esto, que sin la clave no se puede leer. Es lo mismo que hace n8n con cada credencial.</span></div>';
  });
  async function abrir(clave, rot) {
    if (!guardado) { $res.innerHTML = '<div class="bit rep"><i>·</i><span>Primero guardá la credencial.</span></div>'; return; }
    try {
      const p = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: guardado.iv }, await llave(clave), guardado.c);
      $res.innerHTML = `<div class="bit ok"><i>✓</i><span>${rot}: se descifra. n8n lee <b>${escapar(dec.decode(p))}</b> y el flujo anda.</span></div>`;
    } catch (e) {
      $res.innerHTML = `<div class="bit mal"><i>✗</i><span>${rot}: no se puede descifrar. ${N8N.errorClave} Los flujos están, las credenciales también, pero ninguna sirve hasta que vuelva la clave original.</span></div>`;
    }
  }
  document.getElementById('cfMisma').addEventListener('click', () => abrir($k1.value, 'Con la misma clave'));
  document.getElementById('cfDistinta').addEventListener('click', () => abrir($k2.value, 'Con otra clave'));
})();


/* ══════════════════════════════════════════════════════════
   8 · EL SIMULADOR DE DESASTRES
   ══════════════════════════════════════════════════════════ */

(function desastres() {
  const $r = document.getElementById('dsResp');
  if (!$r) return;
  const $d = document.getElementById('dsDesastre');
  const $res = document.getElementById('dsRes');
  const RESPALDOS = [
    ['flujos', 'Exportar los flujos todos los días'],
    ['credenciales', 'Exportar las credenciales'],
    ['clave', 'Guardar la clave de cifrado aparte, fuera del servidor'],
    ['base', 'Copiar la base de datos completa (el volumen o un volcado de Postgres)'],
    ['afuera', 'Que las copias vivan en otro lugar, no en el mismo servidor']
  ];
  const DESASTRES = [
    { id: 'disco', t: 'Se murió el disco del servidor', necesita: ['afuera', 'clave'], y: ['flujos', 'base'],
      ok: 'Levantás un servidor nuevo, ponés la misma clave en el .env y recuperás desde la copia que estaba afuera.',
      falta: { afuera: 'Las copias estaban en el mismo disco que se murió.', clave: 'Recuperás flujos y credenciales, pero las credenciales no se descifran sin la clave original.', y: 'No tenías ni los flujos ni la base copiados.' } },
    { id: 'borre', t: 'Borraste un flujo por error', necesita: [], y: ['flujos', 'base'],
      ok: 'Lo importás de la exportación de ayer y listo. Con el historial de versiones del flujo, si tu plan lo tiene, a veces ni hace falta.',
      falta: { y: 'Sin exportación ni copia de la base, el flujo se rehace de memoria.' } },
    { id: 'actualice', t: 'Actualizaste n8n y algo dejó de andar', necesita: ['base'], y: [],
      ok: 'Volvés a la versión anterior de la imagen y restaurás la copia de la base de antes de actualizar. Por eso se copia antes de cada actualización.',
      falta: { base: 'La versión nueva ya modificó la base. Sin una copia de antes, volver atrás puede no andar.' } },
    { id: 'env', t: 'Perdiste el archivo .env', necesita: ['clave'], y: [],
      ok: 'Rearmás el .env con la clave que guardaste aparte. Todo vuelve a andar.',
      falta: { clave: 'Sin la clave, las credenciales guardadas no se pueden descifrar: hay que volver a cargarlas una por una, en cada servicio.' } },
    { id: 'robo', t: 'Se robaron la notebook donde estaba todo', necesita: ['afuera', 'clave'], y: ['flujos', 'base'],
      ok: 'Las copias y la clave estaban en otro lado: armás todo en otra máquina. Y cambiás las credenciales, porque alguien tiene una copia.',
      falta: { afuera: 'Las copias estaban en la misma notebook.', clave: 'Sin la clave aparte, las credenciales de las copias no se pueden usar.', y: 'No había ninguna copia.' } }
  ];
  const tengo = new Set();
  let desastre = DESASTRES[0];
  $r.innerHTML = RESPALDOS.map(([k, t]) => `<label class="ds-item"><input type="checkbox" data-k="${k}"> ${t}</label>`).join('');
  $d.innerHTML = DESASTRES.map((x, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${x.t}</button>`).join('');
  function evaluar() {
    const faltan = desastre.necesita.filter(k => !tengo.has(k));
    const sinNinguno = desastre.y.length && !desastre.y.some(k => tengo.has(k));
    if (!faltan.length && !sinNinguno) {
      $res.innerHTML = `<div class="cual" style="color:var(--acierto)">✓ Recuperás todo</div><p>${desastre.ok}</p>`;
    } else {
      const motivos = [...faltan.map(k => desastre.falta[k]), ...(sinNinguno ? [desastre.falta.y] : [])].filter(Boolean);
      $res.innerHTML = `<div class="cual" style="color:var(--fallo)">✗ Perdés algo</div>${motivos.map(m => `<p>${m}</p>`).join('')}`;
    }
  }
  $r.addEventListener('change', e => { const c = e.target.closest('input[data-k]'); if (!c) return; c.checked ? tengo.add(c.dataset.k) : tengo.delete(c.dataset.k); evaluar(); });
  $d.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (!b) return; desastre = DESASTRES[+b.dataset.i]; marcar($d, b); evaluar(); });
  document.getElementById('dsTodo').addEventListener('click', () => { $r.querySelectorAll('input').forEach(c => { c.checked = true; tengo.add(c.dataset.k); }); evaluar(); });
  evaluar();
})();


/* ══════════════════════════════════════════════════════════
   9 · PRUEBAS RÁPIDAS: EL DIAGNÓSTICO
   ══════════════════════════════════════════════════════════ */

(function diagnostico() {
  const $c = document.getElementById('diag');
  if (!$c) return;
  const $total = document.getElementById('diagTotal');
  const CASOS = N8N.diagnostico;
  const OPC = N8N.diagnosticoOpciones;
  const resp = {};
  $c.innerHTML = CASOS.map((it, i) => `
    <div class="prueba-item" data-i="${i}">
      <p>${it.t}</p>
      <div class="opciones">${OPC.map(o => `<button type="button" data-o="${o[0]}" aria-pressed="false">${o[1]}</button>`).join('')}</div>
      <p class="prueba-fb" hidden></p>
    </div>`).join('');
  function contar() {
    const bien = Object.values(resp).filter(Boolean).length, faltan = CASOS.length - Object.keys(resp).length;
    $total.textContent = `${bien} de ${CASOS.length} bien${faltan ? ' · faltan ' + faltan : ''}`;
  }
  $c.addEventListener('click', e => {
    const b = e.target.closest('button[data-o]');
    if (!b) return;
    const $it = b.closest('.prueba-item'), it = CASOS[+$it.dataset.i];
    marcar($it.querySelector('.opciones'), b);
    const ok = b.dataset.o === it.ok;
    resp[$it.dataset.i] = ok;
    const $fb = $it.querySelector('.prueba-fb');
    $fb.hidden = false; $fb.className = 'prueba-fb ' + (ok ? 'ok' : 'mal');
    $fb.innerHTML = (ok ? '✓ ' : '✗ ') + it.por;
    contar();
  });
  contar();
})();


/* ══════════════════════════════════════════════════════════
   10 · ACTIVIDAD
   ══════════════════════════════════════════════════════════ */

(function actividad() {
  const campos = ['q1', 'q2'];
  const $aviso = document.getElementById('guardado');
  if (!document.getElementById('q1')) return;
  campos.forEach(id => {
    const el = document.getElementById(id);
    el.value = leerGuardado('clase15-' + id);
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (guardar('clase15-' + id, el.value)) {
          const hora = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
          $aviso.textContent = `Guardado en este dispositivo a las ${hora}.`;
        } else {
          $aviso.textContent = 'No pude guardar: el navegador tiene bloqueado el almacenamiento.';
        }
      }, 500);
    });
  });
  if (campos.some(id => leerGuardado('clase15-' + id))) $aviso.textContent = 'Recuperado de tu última visita.';
})();


/* ══════════════════════════════════════════════════════════
   11 · REVELADO AL SCROLL
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
