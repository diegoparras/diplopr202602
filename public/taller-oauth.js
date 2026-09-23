// Taller de apoyo: n8n self-hosted + Google OAuth en producción.
// Todo el texto de la guía se escribe con las variables de la persona.
// Nada de lo que se pide acá es secreto, y no hay ningún campo donde
// pegar el Client Secret: su único lugar es la credencial de n8n.

exigirSesion();

document.getElementById('salir').addEventListener('click', e => {
  e.preventDefault();
  cerrarSesion();
});

const CORTE = '23 de septiembre de 2026';
const LLAVE_VARS = 'taller-oauth-vars';
const LLAVE_CHK  = 'taller-oauth-chk';

/* ───────────────────────── Variables ───────────────────────── */

// Valores de ejemplo, neutros y deliberadamente inexistentes.
const CAMPOS = [
  { k: 'CONTACT_EMAIL', ej: 'tu.cuenta@gmail.com',
    ayuda: 'La misma cuenta de Google que va a administrar el proyecto y autorizar la credencial. Aparece en las tres páginas públicas.' },
  { k: 'APP_NAME', ej: 'n8n Integración Personal',
    ayuda: 'El nombre que va a ver la persona en la pantalla de autorización de Google. Si lo cambiás después de verificar la marca, hay que volver a verificarla.' },
  { k: 'GOOGLE_PROJECT_NAME', ej: 'n8n-google-oauth',
    ayuda: 'El nombre del proyecto en Google Cloud. Es interno: no lo ve nadie más que vos.' },
  { k: 'FREE_DOMAIN', ej: 'tu-zona.ejemplo-dns.com',
    ayuda: 'La zona DNS entera, sin https:// y sin www. El sufijo lo elegís de la lista que ofrezca el proveedor; ejemplo-dns.com no existe.' },
  { k: 'PIKAPOD_HOST', ej: 'tu-pod.pikapod.net',
    ayuda: 'El host que PikaPods le dio a tu pod cuando lo creaste. Lo ves en el panel del pod; el sufijo exacto lo pone PikaPods, no vos.' },
  { k: 'N8N_HOST', ej: '', derivaDe: 'FREE_DOMAIN', prefijo: 'n8n.',
    ayuda: 'El subdominio donde va a vivir tu n8n. Se propone n8n. delante de la zona, pero podés cambiarlo por el que quieras.' },
  { k: 'GITHUB_USERNAME', ej: 'tu-usuario',
    ayuda: 'Tu usuario de GitHub, tal como aparece en la URL de tu perfil. Con mayúsculas y minúsculas no importa, pero escribilo como es.' },
  { k: 'GITHUB_REPO', ej: 'n8n-oauth',
    ayuda: 'El repositorio público donde van las tres páginas. Público de verdad: si es privado, GitHub Pages no lo publica en el plan gratuito.' }
];

const vars = {};

function valorPorDefecto(c) {
  if (c.derivaDe) return c.prefijo + (vars[c.derivaDe] || defEj(c.derivaDe));
  return c.ej;
}

function defEj(k) {
  const c = CAMPOS.find(x => x.k === k);
  return c ? c.ej : '';
}

function cargarVars() {
  let guardadas = {};
  try { guardadas = JSON.parse(localStorage.getItem(LLAVE_VARS) || '{}'); } catch (_) { guardadas = {}; }
  CAMPOS.forEach(c => { vars[c.k] = c.ej || ''; });
  CAMPOS.filter(c => c.derivaDe).forEach(c => { vars[c.k] = valorPorDefecto(c); });
  CAMPOS.forEach(c => {
    if (typeof guardadas[c.k] === 'string' && guardadas[c.k].trim()) vars[c.k] = guardadas[c.k].trim();
  });
  derivar();
}

// Lo que se calcula solo. Nunca se escribe a mano: una barra final de más
// es la mitad de los redirect_uri_mismatch de este procedimiento.
const DERIVADAS = [
  ['N8N_BASE_URL',         v => 'https://' + v.N8N_HOST],
  ['OAUTH_CALLBACK',       v => 'https://' + v.N8N_HOST + '/rest/oauth2-credential/callback'],
  ['WWW_HOST',             v => 'www.' + v.FREE_DOMAIN],
  ['SITE_URL',             v => 'https://www.' + v.FREE_DOMAIN + '/'],
  ['PRIVACY_URL',          v => 'https://www.' + v.FREE_DOMAIN + '/privacy/'],
  ['TERMS_URL',            v => 'https://www.' + v.FREE_DOMAIN + '/terms/'],
  ['GITHUB_PAGES_TARGET',  v => v.GITHUB_USERNAME + '.github.io'],
  ['GITHUB_PAGES_DEFAULT', v => 'https://' + v.GITHUB_USERNAME + '.github.io/' + v.GITHUB_REPO + '/']
];

function derivar() { DERIVADAS.forEach(([k, f]) => { vars[k] = f(vars); }); }

function guardarVars() {
  const soloEditables = {};
  CAMPOS.forEach(c => { soloEditables[c.k] = vars[c.k]; });
  try { localStorage.setItem(LLAVE_VARS, JSON.stringify(soloEditables)); } catch (_) {}
}

/* ─────────────────── Helpers de contenido ─────────────────── */

function esc(t) {
  return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Bloque de código con botón de copiar. El contenido lleva {{VARIABLES}}
// y se rellena en cada "Aplicar variables".
function cod(rotulo, texto) {
  return '<div class="cod">' +
    (rotulo ? '<span class="rot-cod">' + esc(rotulo) + '</span>' : '') +
    '<button class="copiar" type="button" data-copiar>Copiar</button>' +
    '<pre data-plantilla>' + esc(texto) + '</pre>' +
    '</div>';
}

function v(k) { return '<code data-plantilla>{{' + k + '}}</code>'; }

function enlace(url, texto) {
  return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + esc(texto || url) + '</a>';
}

function aviso(tipo, titulo, ...parrafos) {
  return '<div class="aviso ' + tipo + '"><span class="titulo-aviso">' + titulo + '</span>' +
    parrafos.map(p => '<p>' + p + '</p>').join('') + '</div>';
}

function pasos(lista) { return '<ol class="pasos">' + lista.map(x => '<li>' + x + '</li>').join('') + '</ol>'; }
function puntos(lista) { return '<ul class="puntos">' + lista.map(x => '<li>' + x + '</li>').join('') + '</ul>'; }
function nota(t) { return '<p class="nota-pie">' + t + '</p>'; }

function tabla(cabeceras, filas) {
  return '<div class="tabla-caja"><table class="datos"><thead><tr>' +
    cabeceras.map(c => '<th>' + c + '</th>').join('') +
    '</tr></thead><tbody>' +
    filas.map(f => '<tr>' + f.map(c => '<td' + (c[0] === '\u0001' ? ' class="m"' : '') + '>' +
      (c[0] === '\u0001' ? c.slice(1) : c) + '</td>').join('') + '</tr>').join('') +
    '</tbody></table></div>';
}
function m(t) { return '\u0001' + t; }

/* ───────────────────────── Las etapas ───────────────────────── */

const ETAPAS = [
  {
    t: 'Crear la zona DNS gratuita',
    c: 'Zona DNS gratuita',
    html:
      '<p>Necesitás un dominio sobre el que puedas crear registros TXT, CNAME y A a mano. No sirve un subdominio que te regalen sin panel de DNS: sin esos tres tipos de registro no hay manera de verificar la propiedad en Google ni de emitir certificados.</p>' +
      '<p>La opción que usamos es la <b>Free Zone</b> de ClouDNS, que da un subdominio bajo uno de sus dominios y el panel de DNS completo. Hay otras; lo que importa es la lista de capacidades, no el proveedor.</p>' +
      '<p>' + enlace('https://www.cloudns.net/', 'cloudns.net') + ' · ' + enlace('https://www.cloudns.net/wiki/article/31/', 'cómo se crea una Free Zone') + '</p>' +
      pasos([
        'Crear una cuenta gratuita.',
        'Ir a <b>DNS Hosting</b> y elegir <b>Create zone</b>.',
        'Elegir <b>Free zone</b>.',
        'Escribir el nombre que quieras para tu zona.',
        'Elegir uno de los sufijos gratuitos que ofrezca la lista.',
        'Crear la zona y anotar el dominio completo: ese es tu ' + v('FREE_DOMAIN') + '.'
      ]) +
      aviso('cuidado', 'Un dominio gratuito dura lo que dura el proveedor',
        'Los sufijos que se ofrecen cambian con el tiempo, y ninguno está garantizado para siempre. Para un laboratorio o para uso personal está perfecto. Para algo de lo que dependa el trabajo de otra gente, un dominio propio pago cuesta unos pocos dólares al año y te saca este riesgo de encima. Esta guía no puede prometerte que un sufijo concreto vaya a seguir existiendo, y por eso el ejemplo cargado arriba no es real.') +
      nota('Si ya tenés un dominio propio, salteá esta etapa entera y cargá tu dominio en ' + v('FREE_DOMAIN') + '. El resto del procedimiento es idéntico, y de hecho te va a resultar más simple.')
  },
  {
    t: 'El subdominio donde va a vivir n8n',
    c: 'Subdominio de n8n',
    html:
      '<p>Un solo registro, en el panel de DNS de la zona que acabás de crear. Le dice a internet que tu subdominio de n8n es en realidad el pod de PikaPods.</p>' +
      cod('El registro, en el panel de tu zona', 'Tipo:    CNAME\nHost:    n8n\nDestino: {{PIKAPOD_HOST}}') +
      '<p style="margin-top:16px;">El resultado, leído de izquierda a derecha:</p>' +
      cod(null, '{{N8N_HOST}}  →  {{PIKAPOD_HOST}}') +
      aviso('peligro', 'El destino va pelado',
        'Sin <code>https://</code>, sin barra final, sin ruta. Un CNAME apunta a un <i>nombre</i>, no a una dirección web. Si el panel no te deja guardar, casi siempre es porque pegaste la URL completa.') +
      nota('El <code>Host</code> es sólo la parte de la izquierda: <code>n8n</code>, no ' + v('N8N_HOST') + '. Algunos paneles muestran el resto de la zona al costado del campo, otros no, y ahí es donde se duplica el dominio.')
  },
  {
    t: 'Asociar el dominio en PikaPods y esperar el certificado',
    c: 'Dominio en PikaPods',
    html:
      '<p>Ahora la otra mitad del acuerdo: el DNS ya manda a tu pod, pero el pod todavía no sabe que tiene que contestar por ese nombre ni tiene certificado para él.</p>' +
      '<p>' + enlace('https://docs.pikapods.com/manage/custom-domains', 'Documentación de PikaPods sobre dominios personalizados') + '</p>' +
      pasos([
        'Entrar al pod de n8n.',
        'Ir a <b>Settings</b> y abrir <b>Domain</b>.',
        'Activar <b>Custom Domain</b>.',
        'Escribir ' + v('N8N_HOST') + ' y guardar.',
        'Esperar. El certificado se emite solo, y tarda entre un par de minutos y un rato largo.',
        'Abrir ' + v('N8N_BASE_URL') + ': n8n tiene que cargar sin ninguna advertencia de certificado.'
      ]) +
      aviso('cuidado', 'Si tenés registros CAA, revisalos',
        'Un registro CAA declara qué autoridades certificadoras pueden emitir certificados para tu dominio. Si existe uno y no incluye la que usa PikaPods, el certificado nunca se emite y el error no dice eso. No crees registros CAA salvo que sepas exactamente para qué: la ausencia de CAA es la configuración que funciona.') +
      '<h4>Comprobar que el DNS ya propagó</h4>' +
      '<p>Antes de sospechar de PikaPods, confirmá que el mundo ve tu CNAME. Preguntale a un servidor de Google, no al de tu proveedor de internet, que puede tener la respuesta vieja guardada durante horas:</p>' +
      cod('Windows · PowerShell', 'Resolve-DnsName {{N8N_HOST}} -Type CNAME -Server 8.8.8.8') +
      cod('Mac o Linux · terminal', 'dig +short CNAME {{N8N_HOST}} @8.8.8.8') +
      '<p style="margin-top:16px;">Tiene que contestar ' + v('PIKAPOD_HOST') + '. Si no contesta nada, el registro todavía no propagó y no hay nada que arreglar: hay que esperar.</p>'
  },
  {
    t: 'Copiar el callback definitivo de n8n',
    c: 'El callback definitivo',
    html:
      '<p>Esta es la etapa corta y la más importante de las veinte. El callback es la dirección a la que Google devuelve a la persona después de que autoriza, y lleva adentro el nombre del host. Si registrás el equivocado, todo lo que venga después está mal.</p>' +
      aviso('peligro', 'Abrí n8n por el dominio nuevo',
        'No por el host <code>pikapod.net</code> que te dieron al crear el pod. n8n arma el callback con el dominio por el que lo estás visitando, así que si entrás por el host viejo vas a copiar el callback viejo y no te vas a dar cuenta hasta tres etapas más adelante.') +
      pasos([
        'Abrir ' + v('N8N_BASE_URL') + '.',
        'Ir a <b>Credentials</b>.',
        'Crear una credencial de Google: <b>Gmail OAuth2 API</b>, <b>Google Sheets OAuth2 API</b> o <b>Google Drive OAuth2 API</b>, la que vayas a usar primero.',
        'Copiar el campo <b>OAuth Redirect URL</b>.',
        'Dejar la credencial abierta o guardarla a medias: vamos a volver en la etapa 17 a pegarle el Client ID y el Client Secret.'
      ]) +
      '<p style="margin-top:16px;">Tiene que ser exactamente esto:</p>' +
      cod('OAUTH_CALLBACK', '{{OAUTH_CALLBACK}}') +
      aviso('peligro', 'Carácter por carácter',
        'Este valor y el que vas a cargar en Google Cloud en la etapa 15 tienen que ser idénticos: el mismo <code>https</code>, el mismo host, la misma ruta, la misma ausencia de barra final. Google no perdona ni una diferencia, y el error que devuelve —<code>redirect_uri_mismatch</code>— no te dice cuál es la diferencia. Copiá y pegá; no lo tipees.')
  },
  {
    t: 'Escribir las tres páginas que Google va a pedir',
    c: 'Las tres páginas',
    html:
      '<p>Google no publica una app sin una página de inicio, una política de privacidad y unos términos de servicio, las tres accesibles en el dominio que declarás. No hace falta un sitio: alcanzan tres archivos HTML sin estilos.</p>' +
      '<p>Los vamos a publicar con GitHub Pages, que es gratis y sirve archivos estáticos desde un repositorio.</p>' +
      '<p>' + enlace('https://docs.github.com/pages', 'Documentación de GitHub Pages') + '</p>' +
      pasos([
        'Crear un repositorio <b>público</b> llamado ' + v('GITHUB_REPO') + '.',
        'Subir los tres archivos con esta estructura exacta.'
      ]) +
      cod('Estructura del repositorio', '/index.html\n/privacy/index.html\n/terms/index.html') +
      '<p style="margin-top:16px;">Las carpetas <code>privacy</code> y <code>terms</code> con un <code>index.html</code> adentro son lo que hace que las URLs terminen en barra: ' + v('PRIVACY_URL') + ' y no <code>/privacy.html</code>. Google acepta las dos formas, pero la de la barra es la que vamos a declarar.</p>' +
      '<p>El contenido de los tres archivos, ya escrito con tus variables, está más abajo en <a href="#paginas">Los tres archivos que pide Google</a>. Copiá o descargá desde ahí.</p>' +
      aviso('bien', 'Por qué el repositorio tiene que ser público',
        'GitHub Pages publica desde repositorios privados sólo en los planes pagos. Y en este caso no importa: los tres archivos no tienen nada privado adentro, y es a propósito. Si alguna vez te da la tentación de guardar el Client Secret ahí para tenerlo a mano, acordate de que estás mirando una página web abierta a internet.')
  },
  {
    t: 'Publicar GitHub Pages',
    c: 'Publicar Pages',
    html:
      '<p>El repositorio con los archivos no es todavía un sitio. Hay que decirle a GitHub que lo publique.</p>' +
      pasos([
        'En el repositorio: <b>Settings</b>.',
        'Menú de la izquierda: <b>Pages</b>.',
        'En <b>Build and deployment</b>, elegir <b>Source: Deploy from a branch</b>.',
        'Branch: <b>main</b>. Folder: <b>/ (root)</b>.',
        'Guardar y esperar el primer despliegue, que tarda un minuto o dos.'
      ]) +
      '<p style="margin-top:16px;">La primera dirección que te da GitHub es la del subdominio de github.io:</p>' +
      cod('GITHUB_PAGES_DEFAULT', '{{GITHUB_PAGES_DEFAULT}}') +
      '<p style="margin-top:16px;">Abrila y confirmá que aparece la página de inicio. Si aparece un 404, el despliegue todavía no terminó o el <code>index.html</code> no está en la raíz del repositorio.</p>' +
      nota('Esta dirección es provisoria: en las dos etapas que siguen le vamos a poner tu dominio. Google va a ver el dominio propio, no este.')
  },
  {
    t: 'Los registros de DNS de GitHub Pages',
    c: 'DNS de Pages',
    html:
      '<p>Cinco registros en el mismo panel de la etapa 1. Uno para <code>www</code> y cuatro para la raíz del dominio.</p>' +
      '<h4>El CNAME de www</h4>' +
      cod(null, 'Tipo:    CNAME\nHost:    www\nDestino: {{GITHUB_PAGES_TARGET}}') +
      '<h4>Los cuatro registros A de la raíz</h4>' +
      '<p>Con el <code>Host</code> vacío, o como sea que tu panel nombre la raíz de la zona:</p>' +
      cod(null, '185.199.108.153\n185.199.109.153\n185.199.110.153\n185.199.111.153') +
      '<p style="margin-top:16px;">Los cuatro, no uno. Son cuatro servidores distintos y GitHub espera encontrar los cuatro.</p>' +
      '<h4>Cómo queda la zona</h4>' +
      cod('Los cinco registros de esta etapa, más el CNAME de la etapa 2',
        '{{FREE_DOMAIN}}       A       185.199.108.153\n' +
        '{{FREE_DOMAIN}}       A       185.199.109.153\n' +
        '{{FREE_DOMAIN}}       A       185.199.110.153\n' +
        '{{FREE_DOMAIN}}       A       185.199.111.153\n' +
        '{{WWW_HOST}}   CNAME   {{GITHUB_PAGES_TARGET}}\n' +
        '{{N8N_HOST}}   CNAME   {{PIKAPOD_HOST}}') +
      aviso('cuidado', 'Las cuatro direcciones conviene confirmarlas',
        'Estas cuatro direcciones IP son las que GitHub publica para Pages y son las que funcionaron en el recorrido del ' + CORTE + ', pero GitHub las ha cambiado en el pasado. Antes de pelearte con un error de DNS, chequealas contra ' + enlace('https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site', 'la documentación de GitHub') + ', que es la única fuente que manda.')
  },
  {
    t: 'El dominio personalizado y el HTTPS de GitHub',
    c: 'Dominio y HTTPS',
    html:
      '<p>Con el DNS puesto, le decimos a GitHub cuál es el dominio del sitio.</p>' +
      pasos([
        'En el repositorio: <b>Settings → Pages → Custom domain</b>.',
        'Escribir ' + v('WWW_HOST') + ' y guardar.',
        'Esperar el cartel <b>DNS check successful</b>. Puede tardar; si dice que falla, casi siempre es propagación y no configuración.',
        'Esperar la emisión del certificado TLS, que es un paso aparte y posterior.',
        'Cuando el certificado esté, activar <b>Enforce HTTPS</b>.'
      ]) +
      '<p style="margin-top:16px;">Las tres direcciones que tienen que abrir por HTTPS, sin advertencias:</p>' +
      cod(null, '{{SITE_URL}}\n{{PRIVACY_URL}}\n{{TERMS_URL}}') +
      aviso('cuidado', 'Enforce HTTPS aparece deshabilitado hasta que haya certificado',
        'Es el orden normal, no un error: GitHub primero verifica el DNS, después pide el certificado y recién entonces habilita la casilla. Si la casilla está gris, el certificado todavía no está. Guardar el custom domain también crea un archivo <code>CNAME</code> en la raíz del repositorio: es esperado, no lo borres.') +
      '<p>' + enlace('https://docs.github.com/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https', 'GitHub: HTTPS en Pages') + '</p>'
  },
  {
    t: 'Verificar el dominio en Google Search Console',
    c: 'Search Console',
    html:
      '<p>Google no te deja declarar un dominio autorizado en la app de OAuth si no probaste que el dominio es tuyo. La prueba se hace en Search Console, con un registro TXT.</p>' +
      '<p>' + enlace('https://search.google.com/search-console/', 'Google Search Console') + '</p>' +
      aviso('peligro', 'La misma cuenta, las dos veces',
        'Verificá el dominio con <b>la misma cuenta de Google</b> que va a administrar el proyecto de Google Cloud. Si lo verificás con otra, el proyecto no va a ver la verificación y el dominio autorizado va a ser rechazado sin explicar por qué.') +
      pasos([
        'Abrir Search Console con la cuenta que va a administrar el proyecto.',
        'Elegir <b>Añadir propiedad</b> y después el tipo <b>Dominio</b>, no el de prefijo de URL.',
        'Escribir ' + v('FREE_DOMAIN') + ', sin <code>https://</code> y sin <code>www</code>.',
        'Google te va a dar un registro TXT para copiar.',
        'Crearlo en el panel de DNS con el <code>Host</code> vacío o en la raíz.',
        'Volver a Search Console y pulsar <b>Verificar</b>.'
      ]) +
      cod('El TXT, con el valor que te dé Google en lugar de las X', 'Tipo:  TXT\nHost:  vacío / raíz\nValor: google-site-verification=XXXXXXXXXXXXXXXX') +
      aviso('cuidado', 'No borres ese TXT después',
        'La verificación no es un trámite que se hace una vez: Google relee el registro cada tanto y si desapareció, la propiedad deja de estar verificada y el dominio autorizado de tu app se cae con ella. El TXT se queda para siempre.') +
      '<h4>Si no verifica</h4>' +
      cod('Windows · PowerShell', 'Resolve-DnsName {{FREE_DOMAIN}} -Type TXT -Server 8.8.8.8') +
      cod('Mac o Linux · terminal', 'dig +short TXT {{FREE_DOMAIN}} @8.8.8.8') +
      '<p style="margin-top:16px;">Si el <code>google-site-verification</code> no aparece ahí, no hay nada que reintentar en Search Console: el registro todavía no propagó.</p>'
  },
  {
    t: 'Crear el proyecto en Google Cloud',
    c: 'Proyecto de Google Cloud',
    html:
      '<p>Recién ahora entramos a Google, con el dominio andando, las páginas publicadas y el callback en la mano. Todo lo que sigue se hace en un proyecto de Google Cloud.</p>' +
      '<p>' + enlace('https://console.cloud.google.com/', 'Google Cloud Console') + '</p>' +
      pasos([
        'Crear un proyecto nuevo, o elegir uno existente si ya tenés uno para esto.',
        'Ponerle un nombre que reconozcas dentro de un año: ' + v('GOOGLE_PROJECT_NAME') + '.',
        'Confirmar arriba, en el selector de proyecto, que estás trabajando en el que creaste.'
      ]) +
      aviso('cuidado', 'Mirá el selector de proyecto antes de cada paso',
        'Es el error más tonto y el más común de las diez etapas que siguen: habilitar una API o crear un cliente de OAuth en un proyecto que no es el tuyo. Google Cloud recuerda el último proyecto que usaste, no el que estás configurando. El nombre del proyecto está siempre arriba a la izquierda; acostumbrate a mirarlo.') +
      nota('Un proyecto de Google Cloud no cuesta nada por existir, y las APIs que vamos a habilitar tienen cuotas gratuitas amplias para uso personal. No hace falta habilitar facturación para nada de este taller.')
  },
  {
    t: 'Habilitar las APIs que vas a usar',
    c: 'Habilitar las APIs',
    html:
      '<p>Un permiso de OAuth no alcanza: además hay que encender la API de cada servicio en el proyecto. Son dos cosas distintas y se olvida la segunda.</p>' +
      pasos([
        'Ir a <b>APIs y servicios → Biblioteca</b>.',
        'Buscar cada API por nombre y pulsar <b>Habilitar</b>.'
      ]) +
      cod('Para una configuración típica', 'Gmail API\nGoogle Drive API\nGoogle Sheets API\nGoogle Calendar API\nGoogle Docs API') +
      '<p style="margin-top:16px;">Habilitá sólo las que vayas a usar. Siempre podés volver y encender otra.</p>' +
      aviso('cuidado', 'Sheets necesita también Drive',
        'La credencial de Google Sheets de n8n pide permisos de Drive además de los de Sheets, porque usa Drive para encontrar y abrir la planilla. Si habilitás Sheets API y no Drive API, la credencial autoriza bien y después el nodo falla al buscar el documento. Es un error que parece de permisos y es de API sin habilitar.') +
      nota('El detalle de qué permisos pide cada credencial está más abajo en <a href="#scopes">Los permisos que pide n8n</a>, leído del código fuente de n8n el ' + CORTE + '.')
  },
  {
    t: 'Branding: lo que va a ver la persona',
    c: 'Branding',
    html:
      '<p>Acá se usan las tres páginas de la etapa 5. Google llama Branding a la identidad pública de la app: el nombre que aparece en la pantalla de autorización y los enlaces legales.</p>' +
      '<p>La sección se llama <b>Google Auth Platform</b> y suele tener cinco pestañas: <code>Overview</code>, <code>Branding</code>, <code>Audience</code>, <code>Clients</code> y <code>Data Access</code>. Vamos a pasar por cuatro de las cinco.</p>' +
      '<h4>Los tres campos de identidad</h4>' +
      cod(null, 'App name:                {{APP_NAME}}\nUser support email:      {{CONTACT_EMAIL}}\nDeveloper contact email: {{CONTACT_EMAIL}}') +
      '<h4>Los tres enlaces</h4>' +
      cod('Application homepage', '{{SITE_URL}}') +
      cod('Privacy policy', '{{PRIVACY_URL}}') +
      cod('Terms of service', '{{TERMS_URL}}') +
      '<h4>El dominio autorizado</h4>' +
      '<p>Un solo valor, el dominio pelado:</p>' +
      cod('Authorized domain', '{{FREE_DOMAIN}}') +
      aviso('peligro', 'Acá no va ni https:// ni www',
        'El campo espera el dominio y nada más. Si pegás la URL completa, Google lo rechaza. Y si lo rechaza igual estando bien escrito, el problema es la etapa 9: Google sólo acepta dominios que la cuenta tenga verificados en Search Console.') +
      nota('Si más adelante cambiás el nombre de la app, el logo o alguna de estas tres URLs, y la marca ya estaba verificada, Google crea una versión borrador que puede tener que volver a pasar por verificación. Para una app personal no verificada esto no te afecta.')
  },
  {
    t: 'Audience: quién puede usar la app',
    c: 'Audience',
    html:
      '<p>Google distingue entre una app para la gente de tu propia organización de Workspace y una app para cualquier cuenta de Google. Con una cuenta personal de Gmail hay una sola opción posible.</p>' +
      tabla(['Tipo', 'Cuándo corresponde'], [
        [m('Internal'), 'Sólo si tenés Google Workspace y la app la van a usar únicamente cuentas de tu organización. Con una cuenta de Gmail personal esta opción no aparece.'],
        [m('External'), 'Todo el resto de los casos, incluido el de este taller: una cuenta personal, o usuarios que no están en tu Workspace.']
      ]) +
      '<p style="margin-top:18px;">Elegí <b>External</b>. Al crearla, la app va a quedar en:</p>' +
      cod(null, 'Publishing status: Testing') +
      '<p style="margin-top:16px;">Y ahí no se puede quedar. Mientras esté en <code>Testing</code> tenés que cargar a mano cada cuenta que vaya a autorizar, en la lista de usuarios de prueba, y las autorizaciones se vencen a los siete días. En la etapa 16 la pasamos a producción. La explicación completa de por qué está en <a href="#produccion">Testing, In production, Verified</a>.</p>' +
      aviso('cuidado', 'Si vas a autorizar ahora, agregate como usuario de prueba',
        'Mientras la app esté en <code>Testing</code>, sólo las cuentas que figuren en la lista de usuarios de prueba pueden autorizarla. Si querés probar antes de pasar a producción, agregá ' + v('CONTACT_EMAIL') + ' a esa lista. Y acordate de que esa autorización se va a vencer: en la etapa 19 hay que rehacerla.')
  },
  {
    t: 'Data Access: declarar los permisos',
    c: 'Data Access y permisos',
    html:
      '<p>Los permisos —los <i>scopes</i>— son la lista de cosas que la app va a poder hacer con la cuenta. Se declaran acá y se piden en la pantalla de autorización.</p>' +
      '<p>La regla es una sola y conviene tomársela en serio: <b>pedí el permiso más chico que te sirva</b>. No por prolijidad, por dos razones concretas. Un permiso amplio en una credencial mal guardada es un incidente de seguridad más grande, y los permisos que Google clasifica como restringidos traen requisitos de verificación adicionales el día que la app deje de ser puramente personal.</p>' +
      pasos([
        'Ir a <b>Google Auth Platform → Data Access</b>.',
        'Agregar los permisos que pida la credencial de n8n que vayas a usar.',
        'Guardar.'
      ]) +
      '<p style="margin-top:16px;">Los permisos que trae cada credencial de n8n por defecto están en <a href="#scopes">el anexo de permisos</a>, leídos del código fuente de n8n el ' + CORTE + '. Leelos antes de aceptarlos: hay uno que conviene mirar dos veces.</p>' +
      '<p>' + enlace('https://developers.google.com/workspace/gmail/api/auth/scopes', 'Google: los permisos de la API de Gmail y su clasificación') + '</p>'
  },
  {
    t: 'Crear el cliente de OAuth',
    c: 'El OAuth Client',
    html:
      '<p>El cliente de OAuth es el par de credenciales que va a usar n8n para identificarse ante Google.</p>' +
      pasos([
        'Ir a <b>Google Auth Platform → Clients</b>.',
        'Pulsar <b>Create OAuth Client</b>.',
        'En <b>Application type</b>, elegir <b>Web application</b>. Ninguna de las otras sirve para este flujo.',
        'Ponerle un nombre reconocible, por ejemplo <code>n8n</code>.',
        'Dejar <b>Authorized JavaScript origins</b> vacío: este flujo no lo usa.',
        'En <b>Authorized redirect URIs</b>, agregar exactamente el callback de la etapa 4.',
        'Crear.'
      ]) +
      cod('Authorized redirect URIs · pegá esto, no lo escribas', '{{OAUTH_CALLBACK}}') +
      '<p style="margin-top:16px;">Google te va a mostrar el <b>Client ID</b> y el <b>Client Secret</b>. El Client ID no es un secreto: viaja en la URL de autorización y cualquiera lo puede ver. El Client Secret sí lo es.</p>' +
      aviso('peligro', 'Dónde no va el Client Secret, nunca',
        'No va en GitHub Pages. No va en un repositorio, ni público ni privado. No va en JavaScript del navegador. No va en una captura de pantalla que después pegás en un chat. No va en la política de privacidad. No va en un formulario web, y por eso esta página no tiene ningún campo donde pegarlo.',
        'Su único lugar es el campo correspondiente de la credencial de n8n, que lo guarda cifrado y no lo incluye cuando exportás el workflow. Ese es justamente el motivo por el que los JSON de esta cursada se pueden descargar sin que nadie regale nada.',
        'Si alguna vez se te escapa a un lugar público: no lo borres y sigas, andá a <b>Clients</b> en Google Cloud y rotalo. Un secreto que estuvo diez minutos en internet está quemado.')
  },
  {
    t: 'Pasar la app a In production',
    c: 'In production',
    html:
      '<p>Dos clics, y son los que hacen que todo esto haya valido la pena.</p>' +
      pasos([
        'Ir a <b>Google Auth Platform → Audience</b>.',
        'Buscar el botón <b>Publish app</b> y confirmar.',
        'El estado tiene que pasar de <code>Testing</code> a <code>In production</code>.'
      ]) +
      aviso('peligro', 'Publish app no es Submit for verification',
        'Son dos botones distintos y hacen dos cosas distintas. <b>Publish app</b> publica la app y es lo que necesitás: sale del régimen de usuarios de prueba y de los siete días. <b>Submit for verification</b> manda la app a revisión de Google, que es un trámite con ida y vuelta que puede llevar semanas.',
        'Para una app estrictamente personal, dentro de la excepción de uso personal de Google, <b>no hace falta pedir la verificación</b> sólo para poder usarla vos. No pulses ese botón por si acaso.') +
      '<p>El detalle de qué cambia y qué no, con las palabras de la documentación de Google, está en <a href="#produccion">Testing, In production, Verified</a>.</p>'
  },
  {
    t: 'Cargar las credenciales en n8n',
    c: 'La credencial en n8n',
    html:
      '<p>Volvemos a la credencial que dejamos abierta en la etapa 4.</p>' +
      pasos([
        'Abrir ' + v('N8N_BASE_URL') + ' y entrar a la credencial.',
        'Confirmar que el <b>OAuth Redirect URL</b> que muestra n8n es el mismo que registraste en Google.',
        'Pegar el <b>Client ID</b>.',
        'Pegar el <b>Client Secret</b>. Acá sí, y sólo acá.',
        'Guardar.',
        'Pulsar <b>Sign in with Google</b> o el botón equivalente que muestre tu versión.'
      ]) +
      cod('Tiene que coincidir con lo que registraste en Google Cloud', '{{OAUTH_CALLBACK}}') +
      aviso('bien', 'Qué pasa cuando pulsás el botón',
        'Se abre una ventana de Google, autorizás con la cuenta, y Google te devuelve al callback con un código de un solo uso. n8n cambia ese código por dos cosas: un <i>access token</i> de vida corta, que usa para cada llamada, y un <i>refresh token</i> de vida larga, que usa para renovar el primero sin molestarte. El refresh token es la pieza que se vence a los siete días si la app está en Testing, y es la razón de existir de este taller.') +
      nota('Este taller no automatiza ni puede automatizar ese login: la autorización la tenés que hacer vos, a mano, en la ventana de Google. Cualquier página que te ofrezca hacerlo por vos te está pidiendo la cuenta.')
  },
  {
    t: 'La pantalla de app no verificada',
    c: 'App no verificada',
    html:
      '<p>Con una app personal no verificada, Google va a mostrar una advertencia antes de dejarte autorizar. Es esperable y no significa que algo esté mal configurado.</p>' +
      '<p>Lo que corresponde hacer frente a esa pantalla, cada vez, sea tu app o la de otro:</p>' +
      puntos([
        'Leer el nombre de la app y confirmar que es el que pusiste vos: ' + v('APP_NAME') + '.',
        'Confirmar que la cuenta con la que vas a autorizar es la que corresponde.',
        'Leer los permisos que pide y confirmar que son los que declaraste en la etapa 14. Si aparece uno que no reconocés, pará.',
        'Continuar solamente si sos el dueño de la integración y entendés qué le estás dando acceso.'
      ]) +
      aviso('cuidado', 'Esa pantalla es una protección, no un obstáculo',
        'Existe para que nadie autorice a ciegas una app que no conoce. Lo que hacemos acá es pasarla con conocimiento de causa sobre nuestra propia app, y eso es distinto de enseñar a ignorarla. Si esta integración algún día la va a usar otra persona, explicale qué va a ver y por qué, en lugar de decirle que apriete continuar.',
        'Google también puede mantener el límite de usuarios para apps no verificadas: la excepción de uso personal llega hasta 100.')
  },
  {
    t: 'Reautorizar después de pasar a producción',
    c: 'Reautorizar',
    html:
      '<p>El paso que casi todo el mundo se saltea, y el que hace que a la semana siguiente parezca que nada funcionó.</p>' +
      aviso('peligro', 'Cambiar el estado no arregla el token que ya tenés',
        'Si conectaste n8n mientras la app estaba en <code>Testing</code>, el refresh token que tenés guardado se emitió bajo ese régimen y <b>se va a vencer a los siete días igual</b>, aunque después hayas pasado la app a producción. Pasar a producción cambia cómo se emiten los tokens nuevos, no los viejos.',
        'O sea: si no rehacés la autorización, vas a creer que terminaste, el flujo va a andar una semana, y el octavo día te va a aparecer <code>invalid_grant</code> sin que hayas tocado nada.') +
      pasos([
        'Abrir la credencial en n8n.',
        'Volver a pulsar <b>Sign in with Google</b> para reconectar.',
        'Conceder los permisos otra vez en la ventana de Google.',
        'Guardar.'
      ]) +
      nota('Una manera de verificar que quedó bien: anotá la fecha de hoy y volvé a probar el flujo dentro de diez días. Si sigue andando, el token se emitió bajo producción. Si falla con <code>invalid_grant</code>, era de Testing y hay que rehacer esta etapa.')
  },
  {
    t: 'Probar que de verdad funciona',
    c: 'Las pruebas',
    html:
      '<p>Tres flujos de dos nodos cada uno. No hacen nada útil: existen para separar un problema de credenciales de un problema de flujo, que es la primera bifurcación de cualquier diagnóstico.</p>' +
      cod('Gmail · leer', 'Manual Trigger\n  → Gmail: Get Many Messages') +
      cod('Gmail · escribir', 'Manual Trigger\n  → Gmail: Send') +
      cod('Google Sheets', 'Manual Trigger\n  → Google Sheets: Get Rows') +
      cod('Google Drive', 'Manual Trigger\n  → Google Drive: Search') +
      '<p style="margin-top:16px;">Probá una de lectura y una de escritura, porque los permisos son distintos y una credencial puede leer perfectamente y fallar al escribir.</p>' +
      aviso('bien', 'Estas ejecuciones no te cuentan cuota',
        'Las ejecuciones manuales no consumen cuota, ni en n8n Cloud ni en tu instancia propia, como vimos en la clase 6. Probá todo lo que necesites con el botón de ejecutar a mano antes de publicar nada.') +
      aviso('cuidado', 'Antes de terminar, dejale un aviso al futuro',
        'Una credencial de OAuth se cae sola algún día: por un cambio de contraseña, por una revocación, por seis meses sin uso. Si un flujo que importa depende de esta credencial, armale el flujo de error de la clase 6 para que alguien se entere el día que deje de andar. Es literalmente el mejor caso de uso que tiene esa herramienta, y los flujos de error no cuentan cuota.') +
      nota('Con esto el taller termina. Marcá la última casilla del <a href="#checklist">checklist</a> y anotate en algún lado la fecha de hoy: la vas a querer cuando dentro de unos meses algo deje de funcionar y no te acuerdes qué configuraste.')
  }
];

/* ──────────────────────── Los tres archivos ──────────────────────── */

const ARCHIVOS = [
  {
    ruta: 'index.html', rot: 'La raíz del repositorio · se publica en {{SITE_URL}}',
    t: [
      '<!DOCTYPE html>',
      '<html lang="es">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <title>{{APP_NAME}}</title>',
      '</head>',
      '<body>',
      '  <h1>{{APP_NAME}}</h1>',
      '',
      '  <p>',
      '    Esta aplicación es una integración personal utilizada para conectar',
      '    una instancia privada de n8n con servicios de Google mediante OAuth 2.0.',
      '  </p>',
      '',
      '  <p>',
      '    Su finalidad es permitir que el propietario de la cuenta ejecute',
      '    automatizaciones y flujos de trabajo configurados por él mismo.',
      '  </p>',
      '',
      '  <p>',
      '    La aplicación no se ofrece como un servicio público general.',
      '  </p>',
      '',
      '  <p>',
      '    <a href="/privacy/">Política de privacidad</a> |',
      '    <a href="/terms/">Términos y condiciones</a>',
      '  </p>',
      '',
      '  <p>',
      '    Contacto: <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a>',
      '  </p>',
      '</body>',
      '</html>'
    ].join('\n')
  },
  {
    ruta: 'privacy/index.html', rot: 'La carpeta privacy · se publica en {{PRIVACY_URL}}',
    t: [
      '<!DOCTYPE html>',
      '<html lang="es">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <title>Política de Privacidad — {{APP_NAME}}</title>',
      '</head>',
      '<body>',
      '  <h1>Política de Privacidad</h1>',
      '',
      '  <p>',
      '    {{APP_NAME}} es una integración de uso personal destinada a conectar',
      '    una instancia privada de n8n con servicios de Google mediante OAuth 2.0.',
      '  </p>',
      '',
      '  <h2>Datos a los que puede acceder la integración</h2>',
      '',
      '  <p>',
      '    Dependiendo de los permisos autorizados por el usuario, la integración',
      '    puede acceder a datos de servicios de Google como Gmail, Google Drive,',
      '    Google Sheets, Google Calendar u otros servicios habilitados expresamente.',
      '  </p>',
      '',
      '  <h2>Finalidad del acceso</h2>',
      '',
      '  <p>',
      '    Los datos se utilizan exclusivamente para ejecutar automatizaciones,',
      '    procesos y workflows configurados por el propietario de la cuenta.',
      '  </p>',
      '',
      '  <h2>Tratamiento y transferencia de datos</h2>',
      '',
      '  <p>',
      '    Los datos pueden ser procesados por la instancia privada de n8n.',
      '    Si un workflow ha sido configurado por el propietario para enviar datos',
      '    a otro servicio, dicha transferencia se produce únicamente como consecuencia',
      '    de esa configuración explícita.',
      '  </p>',
      '',
      '  <p>',
      '    La aplicación no vende datos personales ni los utiliza para publicidad.',
      '  </p>',
      '',
      '  <h2>Revocación del acceso</h2>',
      '',
      '  <p>',
      '    El usuario puede revocar en cualquier momento el acceso de esta aplicación',
      '    desde la configuración de seguridad de su Cuenta de Google.',
      '  </p>',
      '',
      '  <h2>Contacto</h2>',
      '',
      '  <p>',
      '    <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a>',
      '  </p>',
      '',
      '  <p>',
      '    <a href="/">Volver al inicio</a>',
      '  </p>',
      '</body>',
      '</html>'
    ].join('\n')
  },
  {
    ruta: 'terms/index.html', rot: 'La carpeta terms · se publica en {{TERMS_URL}}',
    t: [
      '<!DOCTYPE html>',
      '<html lang="es">',
      '<head>',
      '  <meta charset="UTF-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '  <title>Términos y Condiciones — {{APP_NAME}}</title>',
      '</head>',
      '<body>',
      '  <h1>Términos y Condiciones</h1>',
      '',
      '  <p>',
      '    {{APP_NAME}} es una integración de uso personal destinada a conectar',
      '    una instancia privada de n8n con servicios de Google mediante OAuth 2.0.',
      '  </p>',
      '',
      '  <p>',
      '    La aplicación no se ofrece como un servicio público o comercial de uso general.',
      '  </p>',
      '',
      '  <p>',
      '    El propietario es responsable de los workflows, automatizaciones,',
      '    integraciones y acciones ejecutadas mediante su instancia de n8n.',
      '  </p>',
      '',
      '  <p>',
      '    El acceso a los servicios de Google queda limitado a los permisos',
      '    expresamente autorizados durante el proceso OAuth.',
      '  </p>',
      '',
      '  <p>',
      '    El usuario puede revocar el acceso en cualquier momento desde la',
      '    configuración de seguridad de su Cuenta de Google.',
      '  </p>',
      '',
      '  <p>',
      '    Contacto:',
      '    <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a>',
      '  </p>',
      '',
      '  <p>',
      '    <a href="/">Volver al inicio</a>',
      '  </p>',
      '</body>',
      '</html>'
    ].join('\n')
  }
];

/* ──────────────────────────── Permisos ──────────────────────────── */

// Leídos el 23 de septiembre de 2026 de packages/nodes-base/credentials/
// en la rama master del repositorio de n8n. No de la memoria de nadie.
const SCOPES = [
  { cred: 'Gmail OAuth2 API', lista: [
    ['https://www.googleapis.com/auth/gmail.labels', 'Ver y administrar etiquetas.'],
    ['https://www.googleapis.com/auth/gmail.addons.current.action.compose', 'Componer en el contexto de un complemento.'],
    ['https://www.googleapis.com/auth/gmail.addons.current.message.action', 'Leer el mensaje abierto en un complemento.'],
    ['https://mail.google.com/', 'Acceso total a la casilla, incluido borrar mensajes de forma permanente. Es el m\u00e1s amplio de los seis.'],
    ['https://www.googleapis.com/auth/gmail.modify', 'Leer, escribir y modificar mensajes, sin borrado permanente.'],
    ['https://www.googleapis.com/auth/gmail.compose', 'Crear, redactar y enviar mensajes.']
  ]},
  { cred: 'Google Sheets OAuth2 API', lista: [
    ['https://www.googleapis.com/auth/drive.file', 'S\u00f3lo los archivos que la app crea o que la persona abre con ella. Es el permiso de Drive m\u00e1s acotado.'],
    ['https://www.googleapis.com/auth/spreadsheets', 'Ver y editar todas las planillas de la cuenta.'],
    ['https://www.googleapis.com/auth/drive.metadata', 'Ver y administrar los metadatos de los archivos de Drive, sin leer su contenido.']
  ]},
  { cred: 'Google Drive OAuth2 API', lista: [
    ['https://www.googleapis.com/auth/drive', 'Ver, editar, crear y borrar todos los archivos de Drive. Es el permiso m\u00e1s amplio de Drive.'],
    ['https://www.googleapis.com/auth/drive.appdata', 'La carpeta de configuraci\u00f3n oculta propia de la app.'],
    ['https://www.googleapis.com/auth/drive.photos.readonly', 'Ver las fotos y los \u00e1lbumes de la cuenta.']
  ]}
];

/* ─────────────────────── Cuando algo no anda ─────────────────────── */

const LIOS = [
  { sint: 'redirect_uri_mismatch al autorizar', html:
    '<p>Google recibió un callback distinto del que tiene registrado. Comparalos carácter por carácter:</p>' +
    cod('Lo que tiene que estar registrado en Google Cloud', '{{OAUTH_CALLBACK}}') +
    '<p style="margin-top:14px;">Las cuatro diferencias que se pasan por alto: <code>http</code> en lugar de <code>https</code>; el host viejo de <code>pikapod.net</code> en lugar de tu dominio; una barra al final que no va; y una ruta mal copiada, que es <code>/rest/oauth2-credential/callback</code> y no <code>/rest/oauth2-credentials/callback</code>.</p>' +
    '<p>El sospechoso número uno es el segundo: si registraste el callback antes de poner el dominio personalizado, quedó el host de PikaPods.</p>' },

  { sint: 'invalid_grant, y justo a los siete días', html:
    '<p>El refresh token se emitió mientras la app estaba en <code>Testing</code>. Que hayas pasado la app a producción después no rescata el token viejo.</p>' +
    '<p>Se arregla en tres pasos: confirmar en <b>Audience</b> que el estado dice <code>In production</code>, abrir la credencial en n8n, y volver a autorizar desde cero. Ver la <a href="#produccion">tabla de los tres estados</a>.</p>' +
    '<p>Si pasó sin que hayan sido siete días y la app ya estaba en producción, la causa es otra: un cambio de contraseña de la cuenta, una revocación manual desde la configuración de seguridad de Google, un cambio en los permisos que pide la credencial, o la app sin usarse durante seis meses.</p>' },

  { sint: 'GitHub Pages dice que el DNS no verifica', html:
    '<p>Preguntale a un servidor de Google qué ve, no al de tu proveedor:</p>' +
    cod('Windows · PowerShell', 'Resolve-DnsName {{WWW_HOST}} -Type CNAME -Server 8.8.8.8\nResolve-DnsName {{FREE_DOMAIN}} -Type A -Server 8.8.8.8') +
    cod('Mac o Linux · terminal', 'dig +short CNAME {{WWW_HOST}} @8.8.8.8\ndig +short A {{FREE_DOMAIN}} @8.8.8.8') +
    '<p style="margin-top:14px;">El primero tiene que devolver ' + v('GITHUB_PAGES_TARGET') + '. El segundo, las cuatro direcciones de la etapa 7, las cuatro. Si falta alguna, ahí está el problema.</p>' +
    '<p>Si los dos contestan bien y GitHub sigue diciendo que no, es propagación: esperá y volvé a pedir la verificación.</p>' },

  { sint: 'GitHub Pages no emite el certificado HTTPS', html:
    '<p>Es el paso siguiente al anterior, y sólo arranca cuando el DNS verifica. Revisá, en este orden: que el CNAME de <code>www</code> esté; que estén los cuatro registros A; que no haya registros viejos conflictivos sobre el mismo host; y que el <b>Custom domain</b> en Settings → Pages sea ' + v('WWW_HOST') + '.</p>' +
    '<p>Un truco que suele destrabarlo: borrar el custom domain, guardar, volver a escribirlo y guardar de nuevo. Eso obliga a GitHub a rehacer la verificación en lugar de esperar su próximo reintento.</p>' +
    '<p>' + enlace('https://docs.github.com/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https', 'GitHub: HTTPS en Pages') + '</p>' },

  { sint: 'PikaPods no emite el certificado SSL', html:
    '<p>Casi siempre el CNAME no propagó todavía:</p>' +
    cod('Windows · PowerShell', 'Resolve-DnsName {{N8N_HOST}} -Type CNAME -Server 8.8.8.8') +
    cod('Mac o Linux · terminal', 'dig +short CNAME {{N8N_HOST}} @8.8.8.8') +
    '<p style="margin-top:14px;">Tiene que devolver ' + v('PIKAPOD_HOST') + '. Si devuelve eso y el certificado sigue sin emitirse, mirá si hay registros CAA en la zona: un CAA que no incluya la autoridad certificadora que usa PikaPods bloquea la emisión sin decirlo.</p>' +
    '<p>' + enlace('https://docs.pikapods.com/manage/custom-domains', 'PikaPods: dominios personalizados') + '</p>' },

  { sint: 'Google no acepta el dominio autorizado', html:
    '<p>El campo <b>Authorized domain</b> acepta solamente dominios que la cuenta tenga verificados. Dos causas, en orden de frecuencia:</p>' +
    '<p>La primera: lo verificaste con otra cuenta de Google. La verificación de Search Console y el proyecto de Google Cloud tienen que estar en la misma cuenta.</p>' +
    '<p>La segunda: pegaste la URL y no el dominio. Va ' + v('FREE_DOMAIN') + ' pelado, sin <code>https://</code> y sin <code>www</code>.</p>' +
    '<p>Para confirmar que el TXT sigue en su lugar:</p>' +
    cod('Windows · PowerShell', 'Resolve-DnsName {{FREE_DOMAIN}} -Type TXT -Server 8.8.8.8') +
    cod('Mac o Linux · terminal', 'dig +short TXT {{FREE_DOMAIN}} @8.8.8.8') },

  { sint: 'La credencial autoriza bien pero el nodo falla', html:
    '<p>Si la autorización terminó sin errores y el nodo falla igual, el problema no es OAuth: es una API sin habilitar. Son dos permisos distintos y se olvida el segundo.</p>' +
    '<p>El caso clásico es Google Sheets: la credencial de n8n pide permisos de Drive además de los de Sheets, porque usa Drive para encontrar la planilla. Si habilitaste Sheets API y no Drive API, autoriza perfecto y falla al buscar el documento.</p>' +
    '<p>Andá a <b>APIs y servicios → APIs habilitadas</b> y confirmá que estén todas las de la etapa 11. Y mirá el selector de proyecto: habilitarlas en otro proyecto no cuenta.</p>' },

  { sint: 'n8n abre por el dominio pero el callback sigue siendo el viejo', html:
    '<p>n8n arma el callback a partir de la dirección por la que se lo está visitando, salvo que tenga configurada una URL propia. Si el campo muestra el host de <code>pikapod.net</code> estando vos en el dominio nuevo, tu instancia tiene fijada la variable <code>WEBHOOK_URL</code> —o su equivalente en la configuración del pod— apuntando al host viejo.</p>' +
    '<p>Cambiala a ' + v('N8N_BASE_URL') + ' en la configuración del pod, reiniciá, y volvé a mirar el campo. Esto afecta también a las direcciones de los webhooks de producción, así que vale revisarlo aunque el callback esté bien.</p>' }
];

/* ──────────────────────────── Checklist ──────────────────────────── */

const CHK = [
  'Tengo una zona de DNS gratuita con panel para crear TXT, CNAME y A.',
  'Tengo el dominio {{FREE_DOMAIN}}.',
  '{{N8N_HOST}} apunta por CNAME a {{PIKAPOD_HOST}}.',
  '{{N8N_BASE_URL}} abre por HTTPS sin advertencias de certificado.',
  'El OAuth Redirect URL de n8n usa el dominio propio y no el host de PikaPods.',
  'El repositorio público tiene index.html, privacy/index.html y terms/index.html.',
  'GitHub Pages está publicado y la dirección de github.io abre.',
  'Los cuatro registros A y el CNAME de www están creados.',
  '{{SITE_URL}} abre por HTTPS con Enforce HTTPS activado.',
  '{{PRIVACY_URL}} y {{TERMS_URL}} abren las dos.',
  'Search Console muestra {{FREE_DOMAIN}} como propiedad verificada, y el TXT sigue en la zona.',
  'Estoy trabajando en el proyecto de Google Cloud correcto.',
  'Las APIs que voy a usar están habilitadas en ese proyecto.',
  'Branding tiene el nombre, los dos correos y las tres URLs.',
  '{{FREE_DOMAIN}} está agregado como Authorized domain y Google lo aceptó.',
  'Los permisos declarados en Data Access son los que necesito, y miré si mail.google.com hace falta.',
  'El OAuth Client es de tipo Web application y su redirect URI es idéntico al de n8n.',
  'La app está In production, y no pulsé Submit for verification sin querer.',
  'El Client ID y el Client Secret están cargados sólo en n8n, en ningún otro lugar.',
  'Volví a autorizar la credencial DESPUÉS de pasar la app a producción.',
  'Probé un flujo de lectura y uno de escritura, y los dos funcionan.',
  'El flujo que depende de esta credencial tiene un flujo de error que avisa si se cae.'
];

/* ──────────────────────────── Fuentes ──────────────────────────── */

const FUENTES = [
  { grupo: 'n8n', items: [
    ['https://docs.n8n.io/integrations/builtin/credentials/google/', 'Credenciales de Google en n8n', 1],
    ['https://docs.n8n.io/integrations/builtin/credentials/google/oauth-single-service/', 'OAuth para un solo servicio, y el callback de localhost', 1],
    ['https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/credentials/GmailOAuth2Api.credentials.ts', 'Permisos de la credencial de Gmail, en el código', 1],
    ['https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/credentials/GoogleSheetsOAuth2Api.credentials.ts', 'Permisos de la credencial de Sheets, en el código', 1],
    ['https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/credentials/GoogleDriveOAuth2Api.credentials.ts', 'Permisos de la credencial de Drive, en el código', 1]
  ]},
  { grupo: 'Google', items: [
    ['https://support.google.com/cloud/answer/13464323', 'Cuándo no hace falta verificar la app, y la excepción de menos de 100 usuarios', 1],
    ['https://support.google.com/cloud/answer/15549945', 'Usuarios de prueba y el vencimiento a los siete días', 1],
    ['https://support.google.com/cloud/answer/15549049', 'Verificación de marca y de permisos', 1],
    ['https://support.google.com/cloud/answer/9110914', 'Los tres niveles de permiso y cuándo hace falta verificar', 1],
    ['https://developers.google.com/identity/protocols/oauth2', 'Cómo funciona OAuth 2.0 en Google', 0],
    ['https://developers.google.com/workspace/gmail/api/auth/scopes', 'Los permisos de Gmail y su clasificación', 0],
    ['https://developers.google.com/workspace/workspace-api-user-data-developer-policy', 'Política de datos de usuario para desarrolladores', 0],
    ['https://search.google.com/search-console/', 'Search Console, para verificar el dominio', 0],
    ['https://console.cloud.google.com/', 'Google Cloud Console', 0]
  ]},
  { grupo: 'GitHub Pages', items: [
    ['https://docs.github.com/pages', 'GitHub Pages', 0],
    ['https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site', 'Dominio personalizado y los cuatro registros A', 0],
    ['https://docs.github.com/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https', 'HTTPS en Pages', 0]
  ]},
  { grupo: 'PikaPods y DNS', items: [
    ['https://docs.pikapods.com/manage/custom-domains', 'PikaPods: dominios personalizados y la advertencia de CAA', 0],
    ['https://www.cloudns.net/', 'ClouDNS', 0],
    ['https://www.cloudns.net/wiki/article/31/', 'ClouDNS: cómo se crea una Free Zone', 0]
  ]}
];

/* ═══════════════════════ Pintar la página ═══════════════════════ */

// Las plantillas se guardan la primera vez que se ve el elemento, para que
// aplicar variables muchas veces no vaya degradando el texto.
const plantillas = new Map();

function rellenar() {
  document.querySelectorAll('[data-plantilla]').forEach(el => {
    if (!plantillas.has(el)) plantillas.set(el, el.textContent);
    el.textContent = plantillas.get(el).replace(/\{\{([A-Z0-9_]+)\}\}/g,
      (todo, k) => (k in vars ? vars[k] : todo));
  });
}

/* ── Panel de variables ── */

function pintarVars() {
  document.getElementById('rejillaVars').innerHTML = CAMPOS.map(c =>
    '<div class="campo-var">' +
      '<label for="v-' + c.k + '">' + c.k + '</label>' +
      '<input id="v-' + c.k + '" type="text" spellcheck="false" autocapitalize="off" autocomplete="off">' +
      '<span class="ayuda">' + esc(c.ayuda) + '</span>' +
    '</div>').join('');
  CAMPOS.forEach(c => { document.getElementById('v-' + c.k).value = vars[c.k]; });

  document.getElementById('listaDerivadas').innerHTML = DERIVADAS.map(([k]) =>
    '<div><b>' + k + '</b><span data-plantilla>{{' + k + '}}</span></div>').join('');
}

function leerCampos() {
  CAMPOS.forEach(c => {
    const el = document.getElementById('v-' + c.k);
    const val = el.value.trim();
    vars[c.k] = val || valorPorDefecto(c);
    el.value = vars[c.k];
  });
  derivar();
}

function aplicar(guardando) {
  leerCampos();
  if (guardando) guardarVars();
  rellenar();
  pintarArchivo();
  const est = document.getElementById('estadoVars');
  est.textContent = 'Guía reescrita con tus valores.';
  clearTimeout(aplicar.reloj);
  aplicar.reloj = setTimeout(() => { est.textContent = ''; }, 3200);
}

/* ── Etapas e índice ── */

function pintarEtapas() {
  document.getElementById('etapas').innerHTML = ETAPAS.map((e, i) =>
    '<section class="etapa" id="e' + (i + 1) + '">' +
      '<span class="num">Etapa ' + (i + 1) + ' de ' + ETAPAS.length + '</span>' +
      '<h3>' + e.t + '</h3>' +
      e.html +
    '</section>').join('');
}

function pintarIndice() {
  const extra = [
    ['paginas', 'Los tres archivos'],
    ['scopes', 'Los permisos'],
    ['produccion', 'Los tres estados'],
    ['lios', 'Cuando algo no anda'],
    ['checklist', 'Checklist'],
    ['fuentes', 'Fuentes']
  ];
  document.getElementById('indiceLista').innerHTML =
    '<li><a href="#orden"><em>0</em>Por qué este orden</a></li>' +
    ETAPAS.map((e, i) => '<li><a href="#e' + (i + 1) + '"><em>' +
      String(i + 1).padStart(2, '0') + '</em>' + esc(e.c) + '</a></li>').join('') +
    extra.map((x, j) => '<li' + (j === 0 ? ' class="aparte"' : '') +
      '><a href="#' + x[0] + '"><em>·</em>' + esc(x[1]) + '</a></li>').join('');
}

/* ── Los tres archivos ── */

let archActivo = 0;

function pintarPestanas() {
  document.getElementById('pestanasArch').innerHTML = ARCHIVOS.map((a, i) =>
    '<button type="button" role="tab" data-arch="' + i + '" aria-selected="' +
    (i === archActivo) + '">' + esc(a.ruta) + '</button>').join('');
}

function conVars(t) {
  return t.replace(/\{\{([A-Z0-9_]+)\}\}/g, (todo, k) => (k in vars ? vars[k] : todo));
}

function pintarArchivo() {
  const a = ARCHIVOS[archActivo];
  document.getElementById('rotArch').textContent = conVars(a.rot);
  document.getElementById('preArch').textContent = conVars(a.t);
  document.querySelectorAll('#pestanasArch button').forEach(b => {
    b.setAttribute('aria-selected', String(Number(b.dataset.arch) === archActivo));
  });
}

function bajar(nombre, contenido) {
  const url = URL.createObjectURL(new Blob([contenido], { type: 'text/html;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Las carpetas no se pueden representar en un nombre de archivo descargado,
// así que privacy/index.html baja como privacy-index.html y se renombra al subir.
function nombrePlano(ruta) { return ruta.replace(/\//g, '-'); }

/* ── Permisos ── */

function pintarScopes() {
  document.getElementById('tablasScopes').innerHTML = SCOPES.map(s =>
    '<h4>' + esc(s.cred) + '</h4>' +
    tabla(['Permiso', 'Qu\u00e9 habilita'],
      s.lista.map(([url, que]) => [m(esc(url)), esc(que)]))
  ).join('');
}

/* ── Cuando algo no anda ── */

function pintarLios() {
  document.getElementById('listaLios').innerHTML = LIOS.map(l =>
    '<details class="lio"><summary>' + esc(l.sint) + '</summary>' +
    '<div class="adentro">' + l.html + '</div></details>').join('');
}

/* ── Checklist ── */

function leerChk() {
  try { return JSON.parse(localStorage.getItem(LLAVE_CHK) || '[]'); } catch (_) { return []; }
}

function pintarChk() {
  const marcadas = leerChk();
  document.getElementById('listaChk').innerHTML = CHK.map((t, i) =>
    '<label><input type="checkbox" data-chk="' + i + '"' +
    (marcadas.includes(i) ? ' checked' : '') + '>' +
    '<span data-plantilla>' + esc(t) + '</span></label>').join('');
  contarChk();
}

function contarChk() {
  const n = leerChk().length;
  const total = CHK.length;
  document.getElementById('avanceBarra').style.width = Math.round((n / total) * 100) + '%';
  document.getElementById('avanceTxt').textContent = n + ' de ' + total + ' marcadas';
  document.getElementById('resumenChk').textContent = n === total
    ? 'Las ' + total + ' listas. Anotate la fecha de hoy.'
    : n + ' de ' + total + ' · faltan ' + (total - n);
}

function guardarChk() {
  const marcadas = [...document.querySelectorAll('#listaChk input:checked')]
    .map(i => Number(i.dataset.chk));
  try { localStorage.setItem(LLAVE_CHK, JSON.stringify(marcadas)); } catch (_) {}
  contarChk();
}

/* ── Fuentes ── */

function pintarFuentes() {
  document.getElementById('listaFuentes').innerHTML = FUENTES.map(g =>
    '<div><h4>' + esc(g.grupo) + '</h4><ul>' +
    g.items.map(([url, texto, verificado]) =>
      '<li>' + enlace(url, texto) +
      '<span class="verif' + (verificado ? '' : ' no') + '">' +
      (verificado ? 'verificado' : 'del recorrido') + '</span></li>').join('') +
    '</ul></div>').join('');
}

/* ═══════════════ El diagrama de dependencias ═══════════════ */

const CAJAS = [
  { x:  10, y: 104, l: ['Zona DNS', 'gratuita'], col: 0 },
  { x: 224, y:  14, l: ['CNAME n8n', '\u2192 PikaPods'], col: 1 },
  { x: 224, y: 104, l: ['Repo p\u00fablico', '+ Pages'], col: 1 },
  { x: 224, y: 194, l: ['TXT de', 'verificaci\u00f3n'], col: 1 },
  { x: 438, y:  14, l: ['Certificado y', 'callback propio'], col: 2 },
  { x: 438, y: 104, l: ['www + cuatro A', 'y HTTPS'], col: 2 },
  { x: 438, y: 194, l: ['Dominio', 'verificado'], col: 2 },
  { x: 640, y:  14, l: ['OAuth Client', 'Web application'], col: 3, fin: true },
  { x: 640, y: 104, l: ['In production'], col: 3, fin: true },
  { x: 640, y: 194, l: ['Credencial', 'autorizada'], col: 3, fin: true }
];
const ANCHO_CAJA = 158, ALTO_CAJA = 58;
const FLECHAS = [[0,1],[0,2],[0,3],[1,4],[2,5],[3,6],[4,7],[5,7],[6,7],[7,8],[8,9]];
const ROTULOS_COL = [
  { x:  10 + ANCHO_CAJA / 2, t: 'Una vez' },
  { x: 224 + ANCHO_CAJA / 2, t: 'Tres registros' },
  { x: 438 + ANCHO_CAJA / 2, t: 'Tres resultados' },
  { x: 640 + ANCHO_CAJA / 2, t: 'Reci\u00e9n ahora, Google' }
];

function dibujarGrafo() {
  const naranja = window.token('naranja');
  const texto   = window.token('texto');
  const tenue   = window.token('tenue');
  const linea   = window.token('linea');
  const sup2    = window.token('sup2');
  const brasa   = window.token('brasa');

  const partes = [];
  partes.push('<svg viewBox="0 0 808 268" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">');
  partes.push('<defs><marker id="pta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">' +
    '<path d="M0 0 L10 5 L0 10 z" fill="' + naranja + '"/></marker></defs>');

  ROTULOS_COL.forEach(r => {
    partes.push('<text x="' + r.x + '" y="10" text-anchor="middle" fill="' + tenue +
      '" font-family="' + window.token('dato') + '" font-size="8.5" letter-spacing="1.1">' +
      r.t.toUpperCase() + '</text>');
  });

  FLECHAS.forEach(([a, b]) => {
    const ca = CAJAS[a], cb = CAJAS[b];
    const mismaCol = ca.col === cb.col;
    let x1, y1, x2, y2;
    if (mismaCol) {
      x1 = ca.x + ANCHO_CAJA / 2; y1 = ca.y + ALTO_CAJA;
      x2 = x1;                    y2 = cb.y - 3;
    } else {
      x1 = ca.x + ANCHO_CAJA; y1 = ca.y + ALTO_CAJA / 2;
      x2 = cb.x - 3;          y2 = cb.y + ALTO_CAJA / 2;
    }
    const mx = (x1 + x2) / 2;
    const d = mismaCol
      ? 'M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2
      : 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2;
    partes.push('<path d="' + d + '" fill="none" stroke="' + naranja +
      '" stroke-width="1.3" opacity="0.62" marker-end="url(#pta)"/>');
  });

  CAJAS.forEach(c => {
    partes.push('<rect x="' + c.x + '" y="' + c.y + '" width="' + ANCHO_CAJA + '" height="' + ALTO_CAJA +
      '" rx="10" fill="' + (c.fin ? brasa : sup2) + '" stroke="' + (c.fin ? naranja : linea) + '" stroke-width="1"/>');
    const cx = c.x + ANCHO_CAJA / 2;
    const y0 = c.y + (c.l.length === 1 ? ALTO_CAJA / 2 + 4 : ALTO_CAJA / 2 - 4);
    c.l.forEach((t, i) => {
      partes.push('<text x="' + cx + '" y="' + (y0 + i * 15) + '" text-anchor="middle" fill="' + texto +
        '" font-family="' + window.token('cuerpo') + '" font-size="11.5">' + esc(t) + '</text>');
    });
  });

  partes.push('</svg>');
  document.getElementById('grafo').innerHTML = partes.join('');
}

/* ═══════════════════════════ Arranque ═══════════════════════════ */

cargarVars();
pintarVars();
pintarEtapas();
pintarIndice();
pintarPestanas();
pintarScopes();
pintarLios();
pintarChk();
pintarFuentes();
rellenar();
pintarArchivo();
dibujarGrafo();

document.getElementById('aplicarVars').addEventListener('click', () => aplicar(true));

document.getElementById('resetVars').addEventListener('click', () => {
  try { localStorage.removeItem(LLAVE_VARS); } catch (_) {}
  cargarVars();
  CAMPOS.forEach(c => { document.getElementById('v-' + c.k).value = vars[c.k]; });
  rellenar();
  pintarArchivo();
  document.getElementById('estadoVars').textContent = 'Volvimos a los valores de ejemplo.';
});

// Enter en cualquier campo aplica, que es lo que uno espera de un formulario.
document.getElementById('rejillaVars').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); aplicar(true); }
});

// Un solo escucha para todos los botones de copiar, incluidos los de los
// bloques que se redibujan.
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-copiar], [data-copia-arch]');
  if (!b) return;
  const pre = b.hasAttribute('data-copia-arch')
    ? document.getElementById('preArch')
    : b.parentElement.querySelector('pre');
  if (!pre) return;
  const antes = b.textContent;
  try {
    await navigator.clipboard.writeText(pre.textContent);
    b.textContent = 'Copiado';
  } catch (_) {
    // Sin permiso de portapapeles: al menos dejamos el texto seleccionado.
    const r = document.createRange();
    r.selectNodeContents(pre);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
    b.textContent = 'Copialo';
  }
  b.classList.add('hecho');
  setTimeout(() => { b.textContent = antes; b.classList.remove('hecho'); }, 1800);
});

document.getElementById('pestanasArch').addEventListener('click', e => {
  const b = e.target.closest('button[data-arch]');
  if (!b) return;
  archActivo = Number(b.dataset.arch);
  pintarArchivo();
});

document.getElementById('bajarArch').addEventListener('click', () => {
  const a = ARCHIVOS[archActivo];
  bajar(nombrePlano(a.ruta), conVars(a.t));
});

document.getElementById('bajarTodos').addEventListener('click', () => {
  ARCHIVOS.forEach((a, i) => {
    setTimeout(() => bajar(nombrePlano(a.ruta), conVars(a.t)), i * 350);
  });
});

document.getElementById('listaChk').addEventListener('change', guardarChk);

document.getElementById('limpiarChk').addEventListener('click', () => {
  document.querySelectorAll('#listaChk input:checked').forEach(i => { i.checked = false; });
  guardarChk();
});

// El índice marca la etapa que se está leyendo.
const enlacesIndice = new Map();
document.querySelectorAll('#indiceLista a').forEach(a => {
  enlacesIndice.set(a.getAttribute('href').slice(1), a);
});

const observador = new IntersectionObserver(entradas => {
  entradas.forEach(en => {
    if (!en.isIntersecting) return;
    enlacesIndice.forEach(a => a.classList.remove('aqui'));
    const a = enlacesIndice.get(en.target.id);
    if (a) a.classList.add('aqui');
  });
}, { rootMargin: '-90px 0px -65% 0px', threshold: 0 });

document.querySelectorAll('.etapa[id], #orden').forEach(s => observador.observe(s));

// El diagrama está dibujado a mano: se repinta cuando cambia el tema.
window.addEventListener('cambio-tema', dibujarGrafo);
