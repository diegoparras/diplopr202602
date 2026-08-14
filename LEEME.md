# Diplomatura en Diseño de Procesos de Negocios con Automatización e IA Agéntica — FCE-UBA

Sitio de material de cursada de la cohorte agosto — diciembre 2026.
Miércoles de 18 a 21:30, más tres encuentros en viernes.

## Árbol

```
diplomatura-ia/
├── api/
│   └── datos.mjs          función serverless: Artificial Analysis con caché de 24 h
├── CLAUDE.md              contexto permanente para Claude Code
├── .claude/               reglas, skills y permisos de Claude Code
├── material/              PDF y apuntes de cada clase (no se publica)
├── public/
│   ├── index.html         portada con la cortina de acceso
│   ├── cronograma.html    las 20 clases, los 6 módulos y la regla temporal
│   ├── 01.html            Clase 1
│   ├── 02.html            Clase 2
│   ├── 404.html           aviso de clase todavía no publicada
│   ├── estilo.css         tokens y componentes compartidos
│   ├── tema.js            conmutador claro / oscuro, se carga en el <head>
│   ├── acceso.js          validación de la clave
│   ├── clases.js          datos del cronograma
│   ├── clase01.js         lógica de la Clase 1
│   ├── clase02.js         lógica de la Clase 2
│   ├── workflows/         los JSON importables a n8n de cada clase
│   ├── favicon.svg        el ícono: tres nodos conectados
│   ├── favicon.ico · apple-touch-icon.png · icono-192.png · icono-512.png
│   └── site.webmanifest
├── vercel.json
└── .gitignore
```

## Deploy en Vercel

Subí la carpeta tal cual a un repositorio e importala. En la pantalla de
importación dejá todo vacío:

- Framework Preset: **Other**
- Build Command: vacío
- Output Directory: vacío
- Install Command: vacío

Vercel sirve `public/` como estático y `api/` como funciones sin configuración.
Si le ponés un output directory, rompe.

### La clave de Artificial Analysis

Settings → Environment Variables:

- Name: `AA_API_KEY`
- Value: tu clave de Artificial Analysis
- Environments: Production, Preview y Development, las tres

Si la cargás después del primer deploy, Vercel no la toma sola: Deployments →
el último → Redeploy.

### Verificación

Entrá a `https://tu-dominio.vercel.app/api/datos`. Tiene que devolver un JSON con
`fecha` y `modelos`. Si devuelve error, la variable no quedó cargada o falta el
redeploy.

Después entrá a la portada: si el recuadro de abajo a la derecha dice cuántos
modelos hay medidos hoy, la cadena completa funciona.

## La clave de acceso

La clave de esta cohorte es `diploprocesos2026`. En `acceso.js` no está escrita: se
guarda el hash SHA-256 y se compara contra lo que escribe la persona.

Esto evita que la clave aparezca al abrir el código fuente, y nada más que eso.
Cualquiera que la tenga puede compartirla, y las páginas de clase siguen siendo
accesibles por URL directa si alguien ya pasó por la portada. Es una cortina,
no un candado. Para acceso real haría falta validar del lado del servidor y
poner las páginas detrás de una cookie firmada.

Para cambiar la clave:

```
node -e "console.log(require('crypto').createHash('sha256').update('LA_NUEVA').digest('hex'))"
```

y pegá el resultado en `HASH_CLAVE`.

## Publicar una clase nueva

1. Creá `public/NN.html` (por ejemplo `02.html`).
2. En `public/clases.js`, poné `pagina: '02.html'` en esa clase.

Las clases con `pagina: null` apuntan a una URL que no existe, así que Vercel
sirve `404.html`, que lee `clases.js`, reconoce el número y muestra el título y
la fecha de esa clase con el aviso de que estará disponible próximamente.

## Los datos cableados de la Clase 2

Ninguno nuevo. La clase 2 no repite cifras de n8n: enlaza al bloque de la clase 1
para que el dato viva en un solo lugar. Lo único con fecha propia es la del
encuentro, 19 de agosto de 2026, y el aviso de que la clase 3 cae viernes 21.

Tres constantes de contenido, todas en `clase02.js`: las nueve frases del relato
de Valentina con su clasificación, las once líneas del pseudocódigo del caso 02 y
los tres pedidos de la mesa de prueba. Si cambia el caso, cambian ahí y en
`public/workflows/02-caso-valentina-dos-n8n.json`.

La clase 2 define dos variables de color que `estilo.css` no tiene, `--acierto` y
`--fallo`, en el `<style>` de la página y en los dos temas. Si alguna clase más
las necesita, conviene moverlas a los dos bloques de `:root` de `estilo.css`.

## Los datos cableados de la Clase 1

Tres bloques, todos con fecha de corte visible en la página:

- La constante `NODOS` de `clase01.js` describe el workflow de Valentina. Si
  cambia el caso, cambia ahí y en los dos JSON de `public/workflows/`.
- La calculadora usa tres constantes al principio de su función: 30 días,
  20% de pedidos altos y 50 ejecuciones de límite gratuito.
- Las cifras de n8n en `01.html`: valuación de 5.200 millones de dólares tras
  la inversión de SAP del 12 de mayo de 2026, 1,7 millones de constructores
  mensuales, 1.400 clientes corporativos y la adopción de Mercedes-Benz.

Las condiciones del plan gratuito (50 ejecuciones de producción, pruebas sin
límite, auto-pausa a los 7 días, unos 6 meses) no figuran en la grilla pública
de precios de n8n: se verificaron en el panel de la cuenta el 12 de agosto de
2026. Reverificar antes de cada cohorte.

## Los dos temas

El sitio arranca con el tema del sistema operativo de quien entra y recuerda la
elección si toca el conmutador de la barra. La preferencia queda en
`localStorage` bajo `diplo-tema`.

`tema.js` se carga en el `<head>`, antes de la hoja de estilos, para que no haya
un destello del tema equivocado al abrir la página.

Todos los colores salen de las variables de `:root` en `estilo.css`, que se
redefinen bajo `:root[data-tema="claro"]`. Nunca escribas un color literal en
una página: si te falta un tono, agregá la variable en los dos bloques.

Lo que se dibuja por JavaScript (los dos lienzos 3D y el gráfico de Artificial
Analysis) no lo alcanza el CSS, así que lee los valores con `window.token()` y
se vuelve a pintar cuando llega el evento `cambio-tema`. Si agregás una pieza
dibujada a mano, enganchate a ese evento.

Los seis módulos tienen dos tonos cada uno en `clases.js`, porque los colores
saturados que funcionan sobre negro no se leen sobre blanco. Se piden siempre
con `colorModulo(id)`.

## El ícono

Un disparador que se abre en dos ramas: la forma del flujo de Valentina, que es
el primer workflow de la cursada. Comparte el sistema visual con la diplomatura
de IA y se diferencia solo en el ícono. El SVG es la fuente; los PNG y el ICO se
regeneran desde él.

## Los workflows

Cada clase que construya algo deja su JSON en `public/workflows/`, con el nombre
`NN-nombre-del-caso-n8n.json`, y la página lo enlaza con `download`.

Se importan desde n8n en Workflows → Create Workflow → los tres puntos →
Import from File. Van sin credenciales: cada persona conecta las suyas.

Los dos de la Clase 1 llevan una nota adhesiva adentro con la consigna y el
pseudocódigo, así que el archivo se explica solo cuando alguien lo abre suelto.

## Feriados

Ningún feriado nacional cae miércoles en el tramo de la cursada. Los tres del
período caen lunes: 17 de agosto, 12 de octubre y 23 de noviembre. El 8 de
diciembre, único martes feriado, queda fuera porque la clase 20 es el 2 de
diciembre.

## Claude Code

El repositorio trae la configuración para trabajar con Claude Code desde la raíz.

- `CLAUDE.md` entra en toda sesión: qué es el sitio, la estructura y los
  invariantes duros.
- `.claude/rules/` son instrucciones con `paths:` en el frontmatter, así que
  entran solo cuando se tocan los archivos que corresponden. El sistema visual no
  hace falta mientras se edita `api/datos.mjs`.
- `.claude/skills/clase/` y `.claude/skills/revisar-clase/` dan los comandos
  `/clase` y `/revisar-clase`.
- `.claude/settings.json` fija los permisos del proyecto. Los ajustes personales
  quedan en `.claude/settings.local.json`, que está en el `.gitignore`.

Para armar una clase nueva: `/clase 05 material/clase05.pdf`.

No corras `/init`: genera un `CLAUDE.md` desde cero analizando el repositorio y
va a dar algo peor que el que ya está escrito.

## Lo que falta verificar

- `vercel.json` se rearmó con lo mínimo. Si el original tenía reescrituras o
  cabeceras propias, reemplazalo.
- `favicon.ico` se regeneró desde `icono-512.png` y `favicon.svg` desde el ícono
  que está embebido en las páginas. Si tenías las fuentes originales, usá esas.
