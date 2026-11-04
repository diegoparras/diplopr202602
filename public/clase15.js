/* Clase 15 — Docker, máquinas virtuales y servidores
   Una clase general: qué es un contenedor, qué es una máquina virtual,
   qué es un VPS y qué es un servidor dedicado, dónde se consiguen las
   imágenes y cómo se corren en tu máquina con Docker Desktop.

   Piezas: las capas (computadora, máquinas virtuales, contenedores), el
   edificio (VPS, dedicado), el glosario que se da vuelta, el buscador de
   imágenes, los puertos, el volumen, la terminal de práctica con su
   navegador, el recorrido por Docker Desktop, la licencia, la prueba final
   y la actividad. Nada se dibuja con colores leídos desde JavaScript: todo
   sale de las variables de estilo.css. Nada se descarga ni se instala. */

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

// Datos verificados: catálogo de la terminal, recorrido de Docker Desktop,
// licencia, distintivos de Docker Hub y textos con fecha.
const DOCKER = {
 "catalogo": {
  "hello-world": {
   "tags": [
    "latest",
    "linux"
   ],
   "tam": "<1MB",
   "servicio": false,
   "comando": "/hello",
   "salida": "Hello from Docker!\nThis message shows that your installation appears to be working correctly.\n\nTo generate this message, Docker took the following steps:\n 1. The Docker client contacted the Docker daemon.\n 2. The Docker daemon pulled the \"hello-world\" image from the Docker Hub.\n    (amd64)\n 3. The Docker daemon created a new container from that image which runs the\n    executable that produces the output you are currently reading.\n 4. The Docker daemon streamed that output to the Docker client, which sent it\n    to your terminal.\n\nTo try something more ambitious, you can run an Ubuntu container with:\n $ docker run -it ubuntu bash"
  },
  "nginx": {
   "tags": [
    "latest",
    "stable",
    "mainline",
    "1.30",
    "1.31"
   ],
   "tam": "64MB",
   "servicio": true,
   "comando": "/docker-entrypoint.…",
   "logs": "/docker-entrypoint.sh: Configuration complete; ready for start up",
   "pagina": "<h4>Welcome to nginx!</h4><p>La página que trae nginx de fábrica. Si la ves, el servidor web anda: lo que sigue es reemplazarla por tu sitio.</p>"
  },
  "httpd": {
   "tags": [
    "latest",
    "2.4",
    "2"
   ],
   "tam": "45MB",
   "servicio": true,
   "comando": "httpd-foreground",
   "logs": "AH00094: Command line: 'httpd -D FOREGROUND'",
   "pagina": "<h4>It works!</h4><p>La página de fábrica de Apache httpd, otro servidor web.</p>"
  },
  "postgres": {
   "tags": [
    "latest",
    "18",
    "17",
    "16"
   ],
   "tam": "162MB",
   "servicio": true,
   "comando": "docker-entrypoint.s…",
   "necesita": "POSTGRES_PASSWORD=",
   "sinEnv": "Error: Database is uninitialized and superuser password is not specified.\n       You must specify POSTGRES_PASSWORD to a non-empty value for the\n       superuser. For example, \"-e POSTGRES_PASSWORD=password\" on \"docker run\".",
   "logs": "database system is ready to accept connections"
  },
  "mysql": {
   "tags": [
    "latest",
    "lts"
   ],
   "tam": "299MB",
   "servicio": true,
   "comando": "docker-entrypoint.s…",
   "necesita": "MYSQL_ROOT_PASSWORD=",
   "sinEnv": "error: database is uninitialized and password option is not specified\n    You need to specify one of the following as an environment variable:\n    - MYSQL_ROOT_PASSWORD\n    - MYSQL_ALLOW_EMPTY_PASSWORD\n    - MYSQL_RANDOM_ROOT_PASSWORD",
   "logs": "ready for connections"
  },
  "redis": {
   "tags": [
    "latest",
    "8.8"
   ],
   "tam": "56MB",
   "servicio": true,
   "comando": "docker-entrypoint.s…",
   "logs": "Ready to accept connections tcp"
  },
  "wordpress": {
   "tags": [
    "latest"
   ],
   "tam": "275MB",
   "servicio": true,
   "comando": "docker-entrypoint.s…",
   "logs": "apache2 -D FOREGROUND",
   "pagina": "<h4>WordPress</h4><p>La pantalla de instalación: elegir el idioma y crear el sitio. (Para guardar algo necesitaría una base de datos al lado: un trabajo para Compose.)</p>"
  },
  "alpine": {
   "tags": [
    "latest",
    "3.24"
   ],
   "tam": "4MB",
   "servicio": false,
   "comando": "/bin/sh",
   "salida": ""
  },
  "ubuntu": {
   "tags": [
    "latest",
    "noble"
   ],
   "tam": "42MB",
   "servicio": false,
   "comando": "/bin/bash",
   "salida": ""
  },
  "python": {
   "tags": [
    "latest",
    "3.13",
    "3.13-slim"
   ],
   "tam": "419MB",
   "servicio": false,
   "comando": "python3",
   "salida": ""
  }
 },
 "sellos": {
  "oficial": {
   "nombre": "Docker Official Image",
   "que": "Un conjunto curado de imágenes que Docker revisa y mantiene al día. Es el punto de partida más seguro."
  },
  "verificado": {
   "nombre": "Verified Publisher",
   "que": "La publica una empresa que Docker verificó: sabés que viene de quien dice."
  },
  "oss": {
   "nombre": "Sponsored OSS",
   "que": "La publica y mantiene un proyecto de código abierto que Docker patrocina."
  },
  "hardened": {
   "nombre": "Hardened",
   "que": "Imágenes reforzadas por Docker: mínimas, con menos cosas que puedan fallar. La versión Community es gratis."
  },
  "comunidad": {
   "nombre": "Sin sello",
   "que": "Cualquiera puede subir una imagen. Sin sello no quiere decir mala: quiere decir que Docker no la verificó. Mirá quién la publica y cuánta gente la usa."
  }
 },
 "hub": [
  {
   "nombre": "nginx",
   "desc": "Servidor web: sirve páginas y hace de puerta de entrada a otras aplicaciones.",
   "sello": "oficial",
   "ejemplo": "nginx:1.30",
   "nota": "Hoy la rama estable es la 1.30 y la principal, la 1.31."
  },
  {
   "nombre": "postgres",
   "desc": "Base de datos relacional, de las más usadas.",
   "sello": "oficial",
   "ejemplo": "postgres:18",
   "nota": "Pide una contraseña para arrancar: se la pasás con -e POSTGRES_PASSWORD=…"
  },
  {
   "nombre": "httpd",
   "desc": "Apache HTTP Server, el otro servidor web clásico.",
   "sello": "oficial",
   "ejemplo": "httpd:2.4",
   "nota": "Su página de fábrica dice «It works!»."
  },
  {
   "nombre": "redis",
   "desc": "Base de datos en memoria, muy rápida, para guardar datos de paso.",
   "sello": "oficial",
   "ejemplo": "redis:8.8",
   "nota": "La misma empresa publica también imágenes propias, con sello de Verified Publisher."
  },
  {
   "nombre": "wordpress",
   "desc": "El gestor de sitios web más usado.",
   "sello": "oficial",
   "ejemplo": "wordpress",
   "nota": "Necesita una base de datos al lado: es el ejemplo típico de Docker Compose."
  },
  {
   "nombre": "python",
   "desc": "El lenguaje Python, listo para correr programas.",
   "sello": "oficial",
   "ejemplo": "python:3.13-slim",
   "nota": "Las variantes «slim» pesan mucho menos que la completa."
  },
  {
   "nombre": "grafana/grafana",
   "desc": "Tableros y gráficos sobre datos.",
   "sello": "verificado",
   "ejemplo": "grafana/grafana",
   "nota": "Fijate el nombre: «grafana/» adelante quiere decir que la publica la cuenta de Grafana, no Docker."
  },
  {
   "nombre": "portainer/portainer-ce",
   "desc": "Una interfaz web para manejar contenedores en un servidor.",
   "sello": "verificado",
   "ejemplo": "portainer/portainer-ce",
   "nota": "Útil en un VPS, donde no hay Docker Desktop."
  },
  {
   "nombre": "ollama/ollama",
   "desc": "Corre modelos de lenguaje en tu propia máquina.",
   "sello": "oss",
   "ejemplo": "ollama/ollama",
   "nota": "Un modelo pide mucha más memoria que el contenedor mismo."
  },
  {
   "nombre": "dhi/nginx",
   "desc": "nginx en su versión reforzada por Docker.",
   "sello": "hardened",
   "ejemplo": "dhi.io/nginx",
   "nota": "Para producción. Para aprender, alcanza con la oficial."
  },
  {
   "nombre": "metabase/metabase",
   "desc": "Tableros y preguntas sobre bases de datos, sin programar.",
   "sello": "comunidad",
   "ejemplo": "metabase/metabase",
   "nota": "La publica la cuenta del propio proyecto, pero esta imagen no tiene sello. Por eso conviene mirar quién la publica, y no sólo el sello."
  }
 ],
 "glosario": [
  [
   "Imagen",
   "Un paquete cerrado con un programa y todo lo que necesita para correr. Es la receta: se baja una vez y se usa muchas veces.",
   "nginx, postgres, python"
  ],
  [
   "Contenedor",
   "Lo que corre de verdad, hecho a partir de una imagen. Se crea, se para y se borra; de una imagen salen muchos contenedores.",
   "docker run nginx"
  ],
  [
   "Registro",
   "El lugar de donde se bajan las imágenes. El más usado es Docker Hub.",
   "hub.docker.com, ghcr.io"
  ],
  [
   "Etiqueta (tag)",
   "La versión de una imagen, después de los dos puntos. Si no ponés ninguna, Docker usa «latest».",
   "postgres:18"
  ],
  [
   "Puerto",
   "La puerta por donde se llega al contenedor desde afuera. Se abre con -p afuera:adentro.",
   "-p 8080:80"
  ],
  [
   "Volumen",
   "Una carpeta que vive fuera del contenedor y sobrevive cuando se lo borra. Ahí van los datos.",
   "-v datos:/var/lib/postgresql/data"
  ],
  [
   "Dockerfile",
   "El archivo con las instrucciones para fabricar una imagen propia. Para empezar no hace falta: se usan las que ya existen.",
   "FROM python:3.13-slim"
  ],
  [
   "Compose",
   "Un archivo que describe varios contenedores que van juntos, y un comando que los levanta a todos.",
   "docker compose up -d"
  ]
 ],
 "desktop": [
  {
   "nombre": "Containers",
   "que": "Los contenedores que están corriendo y los que paraste. Desde acá se arrancan, se paran, se borran, se leen sus registros y se abre una terminal adentro.",
   "prueba": "Después de correr nginx, tocá el puerto 8080 que aparece al lado: abre el navegador."
  },
  {
   "nombre": "Images",
   "que": "Las imágenes que bajaste. Se pueden correr con un botón, ver sus vulnerabilidades conocidas y borrar las que no usás para liberar espacio.",
   "prueba": "Borrá hello-world cuando termines: no hace falta guardarla."
  },
  {
   "nombre": "Volumes",
   "que": "Los volúmenes: las heladeras. Se pueden crear, mirar por dentro, clonar, exportar y borrar.",
   "prueba": "Mirá adentro del volumen de una base de datos: ahí están sus archivos."
  },
  {
   "nombre": "Builds",
   "que": "El historial de las imágenes que fabricaste vos con un Dockerfile.",
   "prueba": null
  },
  {
   "nombre": "Docker Hub",
   "que": "El buscador de Docker Hub adentro de la aplicación: buscás una imagen, ves su sello y la bajás.",
   "prueba": "Buscá postgres y fijate el sello de Docker Official Image."
  },
  {
   "nombre": "Models",
   "que": "Modelos de lenguaje que corren en tu máquina, bajados como si fueran imágenes.",
   "prueba": null
  },
  {
   "nombre": "MCP Toolkit",
   "que": "Servidores MCP, los de la clase 13, empaquetados en contenedores y listos para conectar a tu asistente.",
   "prueba": null
  },
  {
   "nombre": "Gordon",
   "que": "El asistente con IA de Docker: le preguntás en lenguaje común y te sugiere comandos.",
   "prueba": null
  },
  {
   "nombre": "Extensions",
   "que": "Herramientas de terceros que se suman a la aplicación.",
   "prueba": null
  },
  {
   "nombre": "Settings",
   "que": "La configuración. Lo más importante para empezar: Resources, cuánta memoria y procesador le das a Docker.",
   "prueba": "Si la notebook se pone lenta con Docker abierto, bajale la memoria acá."
  }
 ],
 "version": "Client:\n Version:   29.9\nServer: Docker Desktop 4.98.0\n Engine:\n  Version:  29.9\n(simulación)",
 "bienvenida": "Una terminal de práctica: entiende docker run, ps, images, pull, stop, start, rm, rmi, logs, exec, volume y compose. Las respuestas imitan a las de verdad, resumidas. Escribí «ayuda» para ver la lista.",
 "ayuda": "docker run [-d] [-p 8080:80] [--name web] [-e CLAVE=valor] [-v volumen:/ruta] IMAGEN\ndocker ps            lo que está corriendo   (docker ps -a: también lo parado)\ndocker images        las imágenes que bajaste\ndocker pull IMAGEN   bajar una imagen sin correrla\ndocker logs NOMBRE   lo que cuenta un contenedor\ndocker stop NOMBRE   pararlo          docker start NOMBRE   volver a arrancarlo\ndocker rm NOMBRE     borrarlo         docker rmi IMAGEN     borrar una imagen\ndocker volume ls     los volúmenes\ndocker compose up -d / docker compose down\nlimpiar              borrar la pantalla\nImágenes de esta práctica: hello-world, nginx, httpd, postgres, mysql, redis, wordpress, alpine, ubuntu, python.",
 "licencia": {
  "chica": "Una empresa con menos de 250 personas y menos de USD 10 millones de facturación anual usa Docker Desktop gratis.",
  "grande": "Una empresa más grande, o un organismo público, necesita una suscripción paga para usar Docker Desktop en el trabajo: Pro, Team o Business, desde USD 9 a 24 por persona y por mes.",
  "alternativa": "Docker Engine, el motor sin ventanas que se usa en los servidores Linux, es de código abierto y gratis para todos. Y hay alternativas a Docker Desktop: Podman Desktop y Rancher Desktop son de código abierto."
 },
 "textos": {
  "notaVm": "Definiciones de la documentación de Docker, verificado el 4 de noviembre de 2026: una máquina virtual «es un sistema operativo entero con su propio kernel»; un contenedor «es un proceso aislado con todos los archivos que necesita», y todos comparten el mismo kernel. Los tamaños y tiempos de la tabla son órdenes de magnitud, no mediciones. Docker Desktop, en Mac y en Windows, corre los contenedores adentro de una pequeña máquina virtual Linux: las dos ideas conviven.",
  "precioVps": "USD 4 por mes en DigitalOcean (1 vCPU y 512 MB) · 3,81 € + IVA en OVHcloud (2 vCPU y 4 GB)",
  "precioDed": "59 € + IVA por mes en Hetzner (AX41: 6 núcleos y 64 GB)",
  "notaPrecios": "Precios de las páginas de cada proveedor, verificado el 4 de noviembre de 2026. No son una recomendación: son para ver el orden de magnitud. Cambian seguido —Hetzner, por ejemplo, subió sus precios dos veces en 2026— y algunos planes figuran agotados. Antes de contratar, mirá el precio del día y si incluye impuestos.",
  "sellosOps": "<div class=\"op\"><b><span class=\"sello sello-oficial\">Docker Official Image</span></b><p>Un conjunto curado de imágenes que Docker revisa y mantiene al día. Es el punto de partida más seguro.</p></div><div class=\"op\"><b><span class=\"sello sello-verificado\">Verified Publisher</span></b><p>La publica una empresa que Docker verificó: sabés que viene de quien dice.</p></div><div class=\"op\"><b><span class=\"sello sello-oss\">Sponsored OSS</span></b><p>La publica y mantiene un proyecto de código abierto que Docker patrocina.</p></div><div class=\"op\"><b><span class=\"sello sello-hardened\">Hardened</span></b><p>Imágenes reforzadas por Docker: mínimas, con menos cosas que puedan fallar. La versión Community es gratis.</p></div><div class=\"op\"><b><span class=\"sello sello-comunidad\">Sin sello</span></b><p>Cualquiera puede subir una imagen. Sin sello no quiere decir mala: quiere decir que Docker no la verificó. Mirá quién la publica y cuánta gente la usa.</p></div>",
  "otrosRegistros": "<div class=\"op\"><b>GitHub Container Registry</b><p><code>ghcr.io</code>: imágenes publicadas junto al código en GitHub. Las públicas se bajan sin cuenta.</p></div><div class=\"op\"><b>Amazon ECR Public</b><p>El registro público de Amazon Web Services.</p></div><div class=\"op\"><b>Google Artifact Registry</b><p>El de Google Cloud, para imágenes y otros paquetes.</p></div><div class=\"op\"><b>Microsoft Artifact Registry</b><p><code>mcr.microsoft.com</code>: las imágenes oficiales de Microsoft.</p></div>",
  "txtLimites": "<b>Docker Hub limita cuántas imágenes bajás</b>: sin cuenta, 100 cada 6 horas por dirección de internet; con una cuenta gratuita y la sesión iniciada, 200. En un aula con una sola conexión, mejor que cada uno inicie sesión. Verificado en la documentación de Docker el 4 de noviembre de 2026.",
  "txtDesktop": "Docker Desktop es una aplicación para Windows, Mac y Linux que trae todo lo necesario para correr contenedores en tu computadora: el motor de Docker, los comandos, Compose y una ventana para verlo todo sin escribir. La versión de hoy es la 4.98.0, del 3 de noviembre de 2026.",
  "instalar": "<div class=\"op destacada\"><b>Windows</b><p>Windows 10 22H2 o Windows 11 23H2 en adelante, de 64 bits. Usa WSL 2, que el instalador configura. La virtualización tiene que estar activada en la BIOS, y Docker pide 8 GB de memoria.</p></div><div class=\"op destacada\"><b>Mac</b><p>Hay un instalador para Apple silicon (M1 en adelante) y otro para Intel. Funciona con la versión actual de macOS y las dos anteriores. Al menos 4 GB de memoria.</p></div><div class=\"op destacada\"><b>Linux</b><p>Ubuntu, Debian, Fedora o RHEL. En un servidor no hace falta Docker Desktop: se instala Docker Engine solo, sin ventanas.</p></div>",
  "licPregTam": "¿La empresa tiene menos de 250 personas y factura menos de USD 10 millones por año?",
  "notaLicencia": "Licencia y precios de docs.docker.com y docker.com/pricing, verificado el 4 de noviembre de 2026.",
  "notaDesktop": "Las secciones salen de la documentación de Docker Desktop 4.98, verificado el 4 de noviembre de 2026. La barra lateral se puede personalizar, así que en tu computadora el orden puede ser otro.",
  "notaTerminal": "Es una simulación: nada se descarga y nada se instala. Los tamaños son los de descarga que muestra Docker Hub hoy; en tu máquina, <code>docker images</code> muestra el tamaño ya descomprimido, que es mayor, y desde Docker Engine 29 su tabla se ve un poco distinta. Los textos de hello-world y de los errores de las bases de datos son los que muestran las imágenes reales."
 }
};
Object.entries(DOCKER.textos).forEach(([id, html]) => { const el = document.getElementById(id); if (el) el.innerHTML = html; });


/* ══════════════════════════════════════════════════════════
   1 · LO QUE TRAJISTE
   ══════════════════════════════════════════════════════════ */

(function traido() {
  const cont = document.getElementById('traido');
  if (!cont) return;
  const q = leerGuardado('clase14-q2');
  cont.innerHTML = q
    ? `<span class="rot">Lo que escribiste el miércoles</span>
       <div class="linea"><b>Qué te traerías a una máquina de la organización</b><p style="white-space:pre-wrap">${escapar(q)}</p>
       <p style="font-size:0.84rem;color:var(--tenue);margin-top:4px">Para traer cualquiera de esas cosas hace falta saber tres cosas: en qué máquina, cómo se instala y cómo se separa de lo demás. Es la clase de hoy.</p></div>`
    : `<span class="rot">Todavía no hay nada guardado acá</span>
       <p class="vacio" style="margin-top:12px">La actividad de la clase 14 preguntaba qué te traerías a una máquina de la organización. Si la hiciste en otro dispositivo no la voy a ver. Pensalo mientras avanzamos: hoy vemos qué máquina y cómo.</p>`;
})();


/* ══════════════════════════════════════════════════════════
   2 · LAS CAPAS: UNA COMPUTADORA, MÁQUINAS VIRTUALES, CONTENEDORES
   ══════════════════════════════════════════════════════════ */

(function capas() {
  const $opc = document.getElementById('capOpc');
  if (!$opc) return;
  const $dib = document.getElementById('capDibujo');
  const $txt = document.getElementById('capTxt');
  const $arr = document.getElementById('capArrancar');
  const $res = document.getElementById('capRes');
  const MODOS = {
    nada: {
      capas: [['apps', ['Planilla', 'Navegador', 'Sistema de ventas']], ['so', ['Sistema operativo']], ['hw', ['La computadora: procesador, memoria, disco']]],
      t: 'Una sola máquina, un solo sistema operativo, y todos los programas mezclados adentro. Si el sistema de ventas necesita una versión de algo y la planilla otra, se pelean. Si uno rompe algo, rompe a todos.'
    },
    vm: {
      capas: [['apps', ['App A', 'App B', 'App C']], ['guest', ['Sistema completo', 'Sistema completo', 'Sistema completo']], ['hyp', ['Hipervisor']], ['hw', ['La computadora']]],
      t: 'Una <b>máquina virtual</b> es una computadora entera hecha de software: su propio sistema operativo, su memoria reservada, su disco. El <b>hipervisor</b> reparte la máquina real entre varias virtuales. Cada una está muy aislada de las otras, pero cada una carga un sistema operativo completo.'
    },
    contenedor: {
      capas: [['apps', ['App A', 'App B', 'App C']], ['libs', ['Lo que necesita A', 'Lo que necesita B', 'Lo que necesita C']], ['motor', ['Docker']], ['so', ['Un solo sistema operativo']], ['hw', ['La computadora']]],
      t: 'Un <b>contenedor</b> empaqueta una aplicación con lo justo que necesita para correr, y comparte el corazón del sistema operativo de la máquina con los demás contenedores. No arranca un sistema entero: arranca un programa, aislado. Por eso pesa menos y prende más rápido.'
    }
  };
  let modo = 'nada';
  function pintar() {
    const m = MODOS[modo];
    $dib.innerHTML = m.capas.map(([k, cajas]) => `<div class="capa capa-${k}">${cajas.map(c => `<span>${c}</span>`).join('')}</div>`).join('');
    $txt.innerHTML = `<p>${m.t}</p>`;
    $arr.hidden = modo === 'nada';
    $res.innerHTML = '';
  }
  $opc.addEventListener('click', e => { const b = e.target.closest('button[data-m]'); if (!b) return; modo = b.dataset.m; marcar($opc, b); pintar(); });
  $arr.addEventListener('click', () => {
    const vm = modo === 'vm';
    const filas = ['App A', 'App B', 'App C'].map(a => `<div class="arranque"><span>${a}</span><div class="barra-ctx"><i style="width:${reducido ? 100 : 0}%"></i></div><b>${reducido ? (vm ? 'lista, después de arrancar su sistema' : 'lista') : ''}</b></div>`).join('');
    $res.innerHTML = filas + `<p class="nota-pie">${vm ? 'Cada máquina virtual tiene que arrancar un sistema operativo entero antes de poder abrir la aplicación: hablamos de minutos.' : 'Cada contenedor arranca sólo el programa: hablamos de segundos o menos.'} Es un orden de magnitud, no una medición.</p>`;
    if (reducido) return;
    const dur = vm ? 2600 : 500;
    setTimeout(() => $res.querySelectorAll('.arranque').forEach((f, i) => {
      const barra = f.querySelector('i');
      barra.style.transition = `width ${dur + i * (vm ? 500 : 120)}ms ease-out`;
      barra.style.width = '100%';
      setTimeout(() => { f.querySelector('b').textContent = vm ? 'lista, después de arrancar su sistema' : 'lista'; }, dur + i * (vm ? 500 : 120));
    }), 40);
  });
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   3 · EL EDIFICIO: VPS Y SERVIDOR DEDICADO
   ══════════════════════════════════════════════════════════ */

(function edificio() {
  const $opc = document.getElementById('edOpc');
  if (!$opc) return;
  const $ed = document.getElementById('edDibujo');
  const $txt = document.getElementById('edTxt');
  const $ruido = document.getElementById('edRuido');
  const $velo = document.getElementById('edVelocidad');
  let modo = 'vps', ruido = false;
  const TXT = {
    vps: 'Un <b>VPS</b> (servidor privado virtual) es una máquina virtual en un servidor físico del proveedor, que comparte con otros clientes. Es como un departamento: tus paredes, tu llave, tu espacio reservado; pero el edificio, los caños y el ascensor son de todos.',
    dedicado: 'Un <b>servidor dedicado</b> es una máquina física entera para vos. Es como una casa: nadie más vive ahí, toda la potencia es tuya, y también lo son el mantenimiento y el precio de todo el terreno.',
    nube: 'Una <b>instancia en la nube</b> es un VPS que se alquila por hora y se agranda o se achica con un clic. Es como un hotel: entrás, usás lo que necesitás y pagás por noche.'
  };
  function pintar() {
    const pisos = modo === 'dedicado' ? 1 : 6;
    const mio = modo === 'dedicado' ? 0 : 3;
    $ed.innerHTML = `<div class="techo">Un servidor físico, en el centro de datos del proveedor</div>` +
      Array.from({ length: pisos }, (_, i) => `<div class="piso${i === mio ? ' mio' : ''}${ruido && modo !== 'dedicado' && i === 1 ? ' ruidoso' : ''}">${modo === 'dedicado' ? 'Todo el servidor: tuyo' : i === mio ? (modo === 'nube' ? 'Tu instancia, por hora' : 'Tu VPS') : ruido && i === 1 ? 'Un vecino usando todo el procesador' : 'Otro cliente'}</div>`).join('');
    $txt.innerHTML = `<p>${TXT[modo]}</p>`;
    $ruido.hidden = modo === 'dedicado';
    const vel = modo === 'dedicado' ? 100 : ruido ? 55 : 92;
    $velo.innerHTML = `<span class="rot">Lo que rinde tu servidor</span><div class="barra-ctx"><i style="width:${vel}%"></i></div><p>${modo === 'dedicado' ? 'Siempre todo: no hay vecinos.' : ruido ? 'Un vecino ruidoso: cuando otro cliente usa mucho la máquina física, a veces lo sentís en la tuya. Los proveedores lo limitan, pero en los planes compartidos puede pasar.' : 'Casi todo, casi siempre.'}</p>`;
    $ruido.setAttribute('aria-pressed', String(ruido));
  }
  $opc.addEventListener('click', e => { const b = e.target.closest('button[data-m]'); if (!b) return; modo = b.dataset.m; ruido = false; marcar($opc, b); pintar(); });
  $ruido.addEventListener('click', () => { ruido = !ruido; pintar(); });
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   4 · EL GLOSARIO QUE SE DA VUELTA
   ══════════════════════════════════════════════════════════ */

(function glosario() {
  const $g = document.getElementById('glosario');
  if (!$g) return;
  $g.innerHTML = DOCKER.glosario.map(([t, def, ej], i) => `
    <button type="button" class="carta" aria-pressed="false" data-i="${i}">
      <span class="frente"><b>${t}</b><small>Tocá para ver qué es</small></span>
      <span class="dorso"><b>${t}</b><span>${def}</span>${ej ? `<em>${ej}</em>` : ''}</span>
    </button>`).join('');
  $g.addEventListener('click', e => { const b = e.target.closest('.carta'); if (b) b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); });
})();


/* ══════════════════════════════════════════════════════════
   5 · EL BUSCADOR DE IMÁGENES
   ══════════════════════════════════════════════════════════ */

(function buscador() {
  const $q = document.getElementById('hubQ');
  if (!$q) return;
  const $lista = document.getElementById('hubLista');
  const $det = document.getElementById('hubDetalle');
  const IM = DOCKER.hub;
  function pintar() {
    const q = $q.value.trim().toLowerCase();
    const res = IM.filter(i => !q || (i.nombre + ' ' + i.desc).toLowerCase().includes(q));
    $lista.innerHTML = res.length ? res.map(i => `
      <button type="button" class="hub-item" data-n="${i.nombre}">
        <b>${escapar(i.nombre)}</b><span class="sello sello-${i.sello}">${DOCKER.sellos[i.sello].nombre}</span><small>${escapar(i.desc)}</small>
      </button>`).join('') : '<p class="sim-vacia">No hay nada con ese nombre en esta lista de ejemplo.</p>';
  }
  $lista.addEventListener('click', e => {
    const b = e.target.closest('.hub-item');
    if (!b) return;
    const i = IM.find(x => x.nombre === b.dataset.n);
    $lista.querySelectorAll('.hub-item').forEach(x => x.classList.toggle('on', x === b));
    const s = DOCKER.sellos[i.sello];
    $det.innerHTML = `<span class="rot">${escapar(i.nombre)}</span>
      <p style="margin-top:6px">${escapar(i.desc)}</p>
      <p style="margin-top:10px"><span class="sello sello-${i.sello}">${s.nombre}</span> ${s.que}</p>
      <span class="rot-chica" style="margin-top:14px;display:block">Para bajarla</span>
      <pre class="codigo">docker pull ${escapar(i.ejemplo)}</pre>
      <p style="font-size:0.86rem;color:var(--tenue)">${i.nota}</p>`;
  });
  $q.addEventListener('input', pintar);
  pintar();
  $lista.querySelector('.hub-item').click();
})();


/* ══════════════════════════════════════════════════════════
   6 · LOS PUERTOS
   ══════════════════════════════════════════════════════════ */

(function puertos() {
  const $h = document.getElementById('ptH');
  if (!$h) return;
  const $c = document.getElementById('ptC');
  const $d = document.getElementById('ptDibujo');
  function pintar() {
    const h = parseInt($h.value, 10), c = parseInt($c.value, 10);
    const ok = h > 0 && h < 65536 && c > 0 && c < 65536;
    const reservado = h > 0 && h < 1024;
    $d.innerHTML = ok ? `
      <div class="pt-caja"><span class="rot">Tu navegador</span><b>localhost:${h}</b></div>
      <div class="pt-flecha">→</div>
      <div class="pt-caja mio"><span class="rot">Tu máquina</span><b>puerto ${h}</b><small>la puerta de afuera</small></div>
      <div class="pt-flecha">→</div>
      <div class="pt-caja"><span class="rot">El contenedor</span><b>puerto ${c}</b><small>la puerta de adentro</small></div>
      <p class="pt-cmd"><code>docker run -d -p ${h}:${c} nginx</code></p>
      <p class="pt-nota">${c === 80 ? 'nginx escucha en el 80 adentro del contenedor.' : 'nginx escucha en el 80 adentro: con ' + c + ' la puerta de adentro no lleva a ningún lado y la página no carga.'} ${reservado ? 'Los puertos por debajo de 1024 suelen estar reservados en tu máquina: mejor uno alto, como 8080.' : ''}</p>`
      : '<p class="sim-vacia">Los puertos van de 1 a 65535.</p>';
  }
  [$h, $c].forEach(el => el.addEventListener('input', pintar));
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   7 · EL VOLUMEN
   ══════════════════════════════════════════════════════════ */

(function volumen() {
  const $c = document.getElementById('volCaja');
  if (!$c) return;
  const $log = document.getElementById('volLog');
  let conVolumen = true, corriendo = true, filas = 0, guardadas = 0;
  function pintar() {
    $c.innerHTML = `
      <div><span class="rot">Imagen</span><b>postgres</b><small>la receta: siempre igual</small></div>
      <div class="vol-flecha">→</div>
      <div class="${corriendo ? 'on' : 'off'}"><span class="rot">Contenedor</span><b>${corriendo ? 'base de datos corriendo' : 'borrado'}</b><small>${corriendo ? `${filas} ${filas === 1 ? 'cliente cargado' : 'clientes cargados'}` : '—'}</small></div>
      <div class="vol-flecha">${conVolumen ? '⇄' : '✕'}</div>
      <div class="${conVolumen ? 'on' : 'off'}"><span class="rot">Volumen</span><b>${conVolumen ? 'datos' : 'sin volumen'}</b><small>${conVolumen ? `${guardadas} guardados afuera` : 'nada sobrevive al contenedor'}</small></div>`;
    document.getElementById('volCon').setAttribute('aria-pressed', String(conVolumen));
    document.getElementById('volSin').setAttribute('aria-pressed', String(!conVolumen));
  }
  function anotar(t, k) { $log.insertAdjacentHTML('afterbegin', `<div class="bit ${k}"><i>${k === 'ok' ? '✓' : k === 'mal' ? '✗' : '·'}</i><span>${t}</span></div>`); }
  const reiniciar = con => { conVolumen = con; corriendo = true; filas = 0; guardadas = 0; $log.innerHTML = ''; pintar(); };
  document.getElementById('volCon').addEventListener('click', () => reiniciar(true));
  document.getElementById('volSin').addEventListener('click', () => reiniciar(false));
  document.getElementById('volCrear').addEventListener('click', () => {
    if (!corriendo) { anotar('No hay contenedor: primero levantá uno nuevo.', 'mal'); return; }
    filas++; if (conVolumen) guardadas = filas;
    anotar(conVolumen ? 'Cargaste un cliente. Queda escrito en el volumen.' : 'Cargaste un cliente. Queda adentro del contenedor, y en ningún otro lado.', 'ok'); pintar();
  });
  document.getElementById('volBorrar').addEventListener('click', () => { if (!corriendo) return; corriendo = false; filas = 0; anotar('Borraste el contenedor. Pasa cada vez que actualizás a una versión nueva de la imagen.', 'rep'); pintar(); });
  document.getElementById('volLevantar').addEventListener('click', () => {
    if (corriendo) { anotar('Ya está corriendo.', 'rep'); return; }
    corriendo = true; filas = conVolumen ? guardadas : 0;
    anotar(conVolumen ? `Contenedor nuevo, mismo volumen: aparecen tus ${guardadas} clientes.` : 'Contenedor nuevo: la base arranca vacía. Lo que habías cargado se fue con el contenedor viejo.', conVolumen ? 'ok' : 'mal'); pintar();
  });
  pintar();
})();


/* ══════════════════════════════════════════════════════════
   LA TERMINAL DE PRÁCTICA
   Un Docker de mentira que entiende los comandos de todos los días.
   Las respuestas imitan a las de verdad, resumidas. Nada se descarga.
   ══════════════════════════════════════════════════════════ */

(function terminal() {
  const $out = document.getElementById('dkSalida');
  if (!$out) return;
  const $in = document.getElementById('dkEntrada');
  const $form = document.getElementById('dkForm');
  const $nav = document.getElementById('dkNavegador');
  const $ej = document.getElementById('dkEjercicios');
  const $chips = document.getElementById('dkChips');

  const CATALOGO = DOCKER.catalogo;
  const estado = { imagenes: [], contenedores: [], volumenes: [], historial: [], pos: 0, hechos: new Set() };
  const hexa = n => [...crypto.getRandomValues(new Uint8Array(n))].map(x => x.toString(16).padStart(2, '0')).join('');
  const ADJ = ['amable', 'curiosa', 'veloz', 'tranquila', 'valiente', 'prolija', 'astuta', 'serena'];
  const SUS = ['borges', 'storni', 'favaloro', 'houssay', 'leloir', 'milstein', 'sadosky', 'quino'];
  const nombreAzar = () => ADJ[Math.floor(Math.random() * ADJ.length)] + '_' + SUS[Math.floor(Math.random() * SUS.length)];

  function linea(t, k) { $out.insertAdjacentHTML('beforeend', `<div class="t-${k || 'sal'}">${t}</div>`); $out.scrollTop = $out.scrollHeight; }
  function sal(t) { linea(escapar(t)); }
  function err(t) { linea(escapar(t), 'err'); }
  function tabla(cab, filas) {
    const anchos = cab.map((c, i) => Math.max(c.length, ...filas.map(f => String(f[i]).length)) + 3);
    const fmt = f => f.map((x, i) => String(x).padEnd(anchos[i])).join('').trimEnd();
    sal([fmt(cab), ...filas.map(fmt)].join('\n'));
  }
  function separarRef(ref) {
    const [repo, tag] = ref.includes(':') ? ref.split(':') : [ref, 'latest'];
    return { repo: repo.toLowerCase(), tag: tag || 'latest' };
  }
  function buscarImagen(ref) { const { repo, tag } = separarRef(ref); return estado.imagenes.find(i => i.repo === repo && i.tag === tag); }
  function buscarCont(x) { return estado.contenedores.find(c => c.nombre === x || c.id.startsWith(x)); }
  function hace(t) { const s = Math.round((Date.now() - t) / 1000); return s < 60 ? `${s} seconds ago` : `${Math.round(s / 60)} minutes ago`; }

  function bajar(ref, silencioso) {
    const { repo, tag } = separarRef(ref);
    const c = CATALOGO[repo];
    if (!c) { err(`Error response from daemon: pull access denied for ${repo}, repository does not exist or may require 'docker login'`); return null; }
    if (!c.tags.includes(tag)) { err(`Error response from daemon: manifest for ${repo}:${tag} not found: manifest unknown`); return null; }
    let img = buscarImagen(ref);
    if (img) { if (!silencioso) sal(`${tag}: Pulling from library/${repo}\nStatus: Image is up to date for ${repo}:${tag}`); return img; }
    img = { repo, tag, id: hexa(6), creada: Date.now(), tam: c.tam };
    estado.imagenes.push(img);
    sal(`${tag}: Pulling from library/${repo}\n${hexa(6)}: Pull complete\n${hexa(6)}: Pull complete\nDigest: sha256:${hexa(32)}\nStatus: Downloaded newer image for ${repo}:${tag}`);
    return img;
  }

  function parsear(texto) {
    const t = []; let act = '', comilla = null;
    for (const ch of texto) {
      if (comilla) { if (ch === comilla) comilla = null; else act += ch; }
      else if (ch === '"' || ch === "'") comilla = ch;
      else if (/\s/.test(ch)) { if (act) { t.push(act); act = ''; } }
      else act += ch;
    }
    if (act) t.push(act);
    return t;
  }

  function puertoOcupado(h) { return estado.contenedores.find(c => c.estado === 'up' && c.puertos.some(p => p.h === h)); }

  function run(args) {
    const op = { d: false, puertos: [], nombre: null, env: [], vols: [], rm: false };
    let i = 0;
    for (; i < args.length; i++) {
      const a = args[i];
      if (a === '-d' || a === '--detach') op.d = true;
      else if (a === '-it' || a === '-ti' || a === '-i' || a === '-t') op.it = true;
      else if (a === '--rm') op.rm = true;
      else if (a === '-p' || a === '--publish') { const v = args[++i] || ''; const m = v.match(/^(\d+):(\d+)$/); if (!m) { err(`invalid argument "${v}" for "-p" flag: el formato es puerto_de_tu_máquina:puerto_del_contenedor, por ejemplo 8080:80`); return; } op.puertos.push({ h: +m[1], c: +m[2] }); }
      else if (a === '--name') op.nombre = args[++i];
      else if (a === '-e' || a === '--env') op.env.push(args[++i]);
      else if (a === '-v' || a === '--volume') { const v = args[++i] || ''; const m = v.match(/^([^:]+):(\/.+)$/); if (!m) { err(`invalid argument "${v}" for "-v" flag: el formato es volumen:/ruta/adentro, por ejemplo datos:/var/lib/postgresql/data`); return; } op.vols.push({ v: m[1], ruta: m[2] }); }
      else if (a.startsWith('-')) { err(`unknown flag: ${a}`); return; }
      else break;
    }
    const ref = args[i];
    if (!ref) { err('"docker run" requires at least 1 argument.\nUsage:  docker run [OPTIONS] IMAGE [COMMAND] [ARG...]'); return; }
    if (op.nombre && estado.contenedores.some(c => c.nombre === op.nombre)) { err(`docker: Error response from daemon: Conflict. The container name "/${op.nombre}" is already in use. You have to remove (or rename) that container to be able to reuse that name.`); return; }
    for (const p of op.puertos) { const o = puertoOcupado(p.h); if (o) { err(`docker: Error response from daemon: Bind for 0.0.0.0:${p.h} failed: port is already allocated.`); estado.hechos.add('puerto'); marcarEjercicios(); return; } }
    let img = buscarImagen(ref);
    if (!img) { const { repo, tag } = separarRef(ref); if (CATALOGO[repo]) sal(`Unable to find image '${repo}:${tag}' locally`); img = bajar(ref, true); if (!img) return; }
    const c = CATALOGO[img.repo];
    if (c.necesita && !op.env.some(e => e.startsWith(c.necesita.split('=')[0] + '='))) {
      const cont = crearCont(img, op, 'exited');
      sal(c.sinEnv); cont.salida = 1; estado.hechos.add('env'); marcarEjercicios(); return;
    }
    op.vols.forEach(v => { if (!estado.volumenes.includes(v.v)) estado.volumenes.push(v.v); });
    const queda = c.servicio ? 'up' : 'exited';
    const cont = crearCont(img, op, queda);
    if (op.vols.length) estado.hechos.add('volumen');
    if (!c.servicio) { sal(c.salida); if (op.rm) estado.contenedores = estado.contenedores.filter(x => x !== cont); }
    else if (op.d) sal(cont.idLargo);
    else { sal(c.logs); linea('(En una terminal de verdad, quedaría mostrando estos mensajes hasta Ctrl+C. Con -d corre en segundo plano.)', 'nota'); }
    if (img.repo === 'hello-world') estado.hechos.add('hello');
    if (c.servicio && op.puertos.length && op.d) estado.hechos.add('web');
    pintarNavegador(); marcarEjercicios();
  }
  function crearCont(img, op, est) {
    const id = hexa(32);
    const cont = { id: id.slice(0, 12), idLargo: id, nombre: op.nombre || nombreAzar(), imagen: `${img.repo}${img.tag === 'latest' ? '' : ':' + img.tag}`, img, estado: est, puertos: est === 'up' ? op.puertos : op.puertos, creado: Date.now(), comando: CATALOGO[img.repo].comando, vols: op.vols };
    estado.contenedores.push(cont);
    return cont;
  }

  const COMANDOS = {
    ps(args) {
      const todos = args.includes('-a') || args.includes('--all');
      const lista = estado.contenedores.filter(c => todos || c.estado === 'up');
      tabla(['CONTAINER ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'NAMES'],
        lista.map(c => [c.id, c.imagen, `"${c.comando}"`, hace(c.creado), c.estado === 'up' ? 'Up' : `Exited (${c.salida || 0})`, c.estado === 'up' ? c.puertos.map(p => `0.0.0.0:${p.h}->${p.c}/tcp`).join(', ') : '', c.nombre]));
      estado.hechos.add(todos ? 'psa' : 'ps'); marcarEjercicios();
    },
    images() {
      tabla(['REPOSITORY', 'TAG', 'IMAGE ID', 'SIZE'], estado.imagenes.map(i => [i.repo, i.tag, i.id, i.tam]));
      estado.hechos.add('images'); marcarEjercicios();
    },
    pull(args) { if (!args[0]) { err('"docker pull" requires exactly 1 argument.'); return; } bajar(args[0]); },
    run,
    stop(args) {
      if (!args.length) { err('"docker stop" requires at least 1 argument.'); return; }
      args.forEach(x => { const c = buscarCont(x); if (!c) { err(`Error response from daemon: No such container: ${x}`); return; } c.estado = 'exited'; c.salida = 0; sal(x); });
      estado.hechos.add('stop'); pintarNavegador(); marcarEjercicios();
    },
    start(args) {
      args.forEach(x => { const c = buscarCont(x); if (!c) { err(`Error response from daemon: No such container: ${x}`); return; }
        const o = c.puertos.map(p => puertoOcupado(p.h)).find(Boolean);
        if (o && o !== c) { err(`Error response from daemon: Bind for 0.0.0.0:${c.puertos[0].h} failed: port is already allocated.`); return; }
        if (CATALOGO[c.img.repo].servicio) c.estado = 'up'; sal(x); });
      pintarNavegador();
    },
    rm(args) {
      const forzar = args.includes('-f') || args.includes('--force');
      args.filter(a => !a.startsWith('-')).forEach(x => { const c = buscarCont(x); if (!c) { err(`Error response from daemon: No such container: ${x}`); return; }
        if (c.estado === 'up' && !forzar) { err(`Error response from daemon: cannot remove container "/${c.nombre}": container is running: stop the container before removing or force remove`); return; }
        estado.contenedores = estado.contenedores.filter(y => y !== c); sal(x); estado.hechos.add('rm'); });
      pintarNavegador(); marcarEjercicios();
    },
    rmi(args) {
      args.forEach(x => { const img = buscarImagen(x); if (!img) { err(`Error response from daemon: No such image: ${x}`); return; }
        const usa = estado.contenedores.find(c => c.img === img);
        if (usa) { err(`Error response from daemon: conflict: unable to remove repository reference "${x}" (must force) - container ${usa.id} is using its referenced image ${img.id}`); return; }
        estado.imagenes = estado.imagenes.filter(y => y !== img); sal(`Untagged: ${img.repo}:${img.tag}\nDeleted: sha256:${img.id}${hexa(26)}`); });
    },
    logs(args) { const c = buscarCont(args.filter(a => !a.startsWith('-'))[0] || ''); if (!c) { err(`Error response from daemon: No such container: ${args[0] || ''}`); return; } sal(CATALOGO[c.img.repo].logs || CATALOGO[c.img.repo].salida || ''); estado.hechos.add('logs'); marcarEjercicios(); },
    exec(args) { const x = args.filter(a => !a.startsWith('-'))[0]; const c = buscarCont(x || ''); if (!c) { err(`Error response from daemon: No such container: ${x || ''}`); return; } if (c.estado !== 'up') { err(`Error response from daemon: container ${c.id} is not running`); return; } linea(`(Entrarías a una terminal adentro de «${escapar(c.nombre)}»: su propio sistema de archivos, sus propios programas. Se sale con exit.)`, 'nota'); },
    volume(args) {
      if (args[0] === 'ls') tabla(['DRIVER', 'VOLUME NAME'], estado.volumenes.map(v => ['local', v]));
      else if (args[0] === 'create' && args[1]) { if (!estado.volumenes.includes(args[1])) estado.volumenes.push(args[1]); sal(args[1]); }
      else err('Usage:  docker volume COMMAND (ls | create NOMBRE)');
    },
    version() { sal(DOCKER.version); },
    compose(args) {
      if (args[0] === 'up') {
        ['web', 'db'].forEach(n => { if (estado.contenedores.some(c => c.nombre === 'tienda-' + n + '-1')) return;
          const ref = n === 'web' ? 'nginx:1.30' : 'postgres:18';
          const img = buscarImagen(ref) || bajar(ref, true);
          crearCont(img, { nombre: 'tienda-' + n + '-1', puertos: n === 'web' ? [{ h: 8081, c: 80 }] : [], vols: n === 'db' ? [{ v: 'tienda_datos', ruta: '/var/lib/postgresql/data' }] : [] }, 'up'); });
        if (!estado.volumenes.includes('tienda_datos')) estado.volumenes.push('tienda_datos');
        sal('[+] Running 4/4\n ✔ Network tienda_default    Created\n ✔ Volume "tienda_datos"     Created\n ✔ Container tienda-db-1     Started\n ✔ Container tienda-web-1    Started');
        estado.hechos.add('compose'); pintarNavegador(); marcarEjercicios();
      } else if (args[0] === 'down') {
        estado.contenedores = estado.contenedores.filter(c => !c.nombre.startsWith('tienda-'));
        sal('[+] Running 3/3\n ✔ Container tienda-web-1    Removed\n ✔ Container tienda-db-1     Removed\n ✔ Network tienda_default    Removed' + (args.includes('-v') ? '\n ✔ Volume tienda_datos       Removed' : ''));
        if (args.includes('-v')) estado.volumenes = estado.volumenes.filter(v => v !== 'tienda_datos');
        pintarNavegador();
      } else err('En esta práctica: docker compose up -d  o  docker compose down');
    }
  };
  COMANDOS.image = args => args[0] === 'ls' ? COMANDOS.images() : err('Usage:  docker image ls');
  COMANDOS.container = args => args[0] === 'ls' ? COMANDOS.ps(args.slice(1)) : err('Usage:  docker container ls');

  function ejecutar(texto) {
    linea(`<span>$</span> ${escapar(texto)}`, 'cmd');
    const t = parsear(texto.trim());
    if (!t.length) return;
    if (t[0] === 'clear' || t[0] === 'limpiar') { $out.innerHTML = ''; return; }
    if (t[0] === 'help' || t[0] === 'ayuda') { sal(DOCKER.ayuda); return; }
    if (t[0] !== 'docker') { err(`${t[0]}: command not found. Los comandos empiezan con «docker». Probá «ayuda».`); return; }
    const sub = t[1], f = COMANDOS[sub];
    if (!sub) { sal(DOCKER.ayuda); return; }
    if (!f) { err(`docker: '${sub}' is not a docker command.\nSee 'docker --help'`); return; }
    f(t.slice(2));
  }

  function pintarNavegador() {
    const vivos = estado.contenedores.filter(c => c.estado === 'up' && c.puertos.length);
    $nav.innerHTML = vivos.length ? vivos.map(c => c.puertos.map(p => {
      const pag = CATALOGO[c.img.repo].pagina;
      return `<div class="nav-tab"><div class="nav-barra">localhost:${p.h}</div><div class="nav-cuerpo">${pag ? pag : `<p class="sim-vacia">${escapar(c.img.repo)} no muestra una página web: es un servicio que usan otros programas.</p>`}</div></div>`;
    }).join('')).join('') : '<p class="sim-vacia">Ningún contenedor publica un puerto todavía. Cuando corras uno con <code>-p 8080:80</code>, su página aparece acá, como si abrieras <code>localhost:8080</code> en el navegador.</p>';
  }

  function marcarEjercicios() {
    $ej.querySelectorAll('[data-h]').forEach(li => li.classList.toggle('hecho', estado.hechos.has(li.dataset.h)));
    const n = $ej.querySelectorAll('.hecho').length, tot = $ej.querySelectorAll('[data-h]').length;
    document.getElementById('dkProgreso').textContent = `${n} de ${tot}`;
  }

  $form.addEventListener('submit', e => {
    e.preventDefault();
    const v = $in.value;
    if (!v.trim()) return;
    estado.historial.push(v); estado.pos = estado.historial.length;
    ejecutar(v); $in.value = '';
  });
  $in.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp' && estado.pos > 0) { estado.pos--; $in.value = estado.historial[estado.pos]; e.preventDefault(); }
    if (e.key === 'ArrowDown') { estado.pos = Math.min(estado.historial.length, estado.pos + 1); $in.value = estado.historial[estado.pos] || ''; e.preventDefault(); }
  });
  $chips.addEventListener('click', e => { const b = e.target.closest('button[data-c]'); if (!b) return; $in.value = b.dataset.c; $in.focus(); });
  document.getElementById('dkReset').addEventListener('click', () => {
    estado.imagenes = []; estado.contenedores = []; estado.volumenes = []; estado.hechos.clear();
    $out.innerHTML = ''; linea(DOCKER.bienvenida, 'nota'); pintarNavegador(); marcarEjercicios();
  });
  linea(DOCKER.bienvenida, 'nota');
  pintarNavegador(); marcarEjercicios();
})();



/* ══════════════════════════════════════════════════════════
   9 · EL RECORRIDO POR DOCKER DESKTOP
   Un dibujo hecho con la página, no una captura.
   ══════════════════════════════════════════════════════════ */

(function desktop() {
  const $m = document.getElementById('ddMenu');
  if (!$m) return;
  const $p = document.getElementById('ddPanel');
  $m.innerHTML = DOCKER.desktop.map((s, i) => `<button type="button" data-i="${i}" aria-pressed="${i === 0}">${escapar(s.nombre)}</button>`).join('');
  function pintar(i) {
    const s = DOCKER.desktop[i];
    $p.innerHTML = `<span class="rot">${escapar(s.nombre)}</span><p style="margin-top:8px">${s.que}</p>${s.prueba ? `<p class="dd-prueba"><b>Probá:</b> ${s.prueba}</p>` : ''}`;
  }
  $m.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (!b) return; marcar($m, b); pintar(+b.dataset.i); });
  pintar(0);
})();


/* ══════════════════════════════════════════════════════════
   10 · ¿DOCKER DESKTOP ES GRATIS PARA VOS?
   ══════════════════════════════════════════════════════════ */

(function licencia() {
  const $d = document.getElementById('licPreg');
  if (!$d) return;
  const $v = document.getElementById('licVer');
  const r = {};
  function decidir() {
    let v = null;
    if (r.uso === 'personal' || r.uso === 'educacion' || r.uso === 'abierto') v = ['Gratis', 'Uso personal, educación o un proyecto de código abierto sin fines comerciales: Docker Desktop no se paga.'];
    else if (r.uso === 'empresa' && r.tam === 'chica') v = ['Gratis', DOCKER.licencia.chica];
    else if (r.uso === 'empresa' && r.tam === 'grande') v = ['Con suscripción paga', DOCKER.licencia.grande];
    $d.querySelector('[data-si="empresa"]').hidden = r.uso !== 'empresa';
    $v.hidden = !v;
    if (v) $v.innerHTML = `<div class="cual">${v[0]}</div><p>${v[1]}</p><p style="color:var(--tenue);font-size:0.86rem">${DOCKER.licencia.alternativa}</p>`;
  }
  $d.addEventListener('click', e => {
    const b = e.target.closest('button[data-k]');
    if (!b) return;
    r[b.dataset.k] = b.dataset.v;
    if (b.dataset.k === 'uso') delete r.tam;
    $d.querySelectorAll(`button[data-k="${b.dataset.k}"]`).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    if (b.dataset.k === 'uso') $d.querySelectorAll('button[data-k="tam"]').forEach(x => x.setAttribute('aria-pressed', 'false'));
    decidir();
  });
  decidir();
})();


/* ══════════════════════════════════════════════════════════
   11 · LA PRUEBA FINAL
   ══════════════════════════════════════════════════════════ */

(function prueba() {
  const $c = document.getElementById('final');
  if (!$c) return;
  const $total = document.getElementById('finalTotal');
  const OPC = [['contenedor', 'Un contenedor'], ['vm', 'Una máquina virtual'], ['vps', 'Un VPS'], ['dedicado', 'Un servidor dedicado']];
  const CASOS = [
    { t: 'Querés probar una base de datos en tu notebook, sin instalarla, y borrarla cuando termines.', ok: 'contenedor', por: 'Un contenedor: se baja la imagen, se corre y se borra. Tu notebook queda como estaba.' },
    { t: 'Necesitás usar un programa que sólo existe para Windows, y tu computadora es una Mac.', ok: 'vm', por: 'Una máquina virtual: un Windows entero adentro de la Mac. Un contenedor comparte el sistema de la máquina, así que no sirve para correr otro sistema operativo.' },
    { t: 'Una pyme quiere tener su sistema funcionando las 24 horas, accesible desde internet, sin comprar hardware y gastando poco.', ok: 'vps', por: 'Un VPS: una máquina virtual en el centro de datos de un proveedor, que se paga por mes y está siempre prendida.' },
    { t: 'Un estudio contable con datos muy sensibles y mucho procesamiento no quiere compartir el hardware con nadie.', ok: 'dedicado', por: 'Un servidor dedicado: la máquina física entera es suya. Más caro, sin vecinos.' },
    { t: 'Tu sistema funciona en tu máquina pero no en la del compañero, porque él tiene otra versión de algo.', ok: 'contenedor', por: 'Un contenedor: la aplicación viaja con todo lo que necesita, y corre igual en cualquier máquina que tenga Docker.' },
    { t: 'Un proveedor te alquila «2 vCPU y 4 GB de RAM» por mes, en una máquina que también usan otros clientes.', ok: 'vps', por: 'Eso es un VPS. La «v» de vCPU quiere decir virtual: un pedazo del procesador de la máquina física.' }
  ];
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
   12 · ACTIVIDAD
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
        } else $aviso.textContent = 'No pude guardar: el navegador tiene bloqueado el almacenamiento.';
      }, 500);
    });
  });
  if (campos.some(id => leerGuardado('clase15-' + id))) $aviso.textContent = 'Recuperado de tu última visita.';
})();


if (!reducido && 'IntersectionObserver' in window) {
  const ojo = new IntersectionObserver(entradas => {
    entradas.forEach(en => { if (en.isIntersecting) { en.target.classList.add('visible'); ojo.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.revelar').forEach(s => ojo.observe(s));
} else {
  document.querySelectorAll('.revelar').forEach(s => s.classList.add('visible'));
}
