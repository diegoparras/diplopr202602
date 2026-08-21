// Cronograma de la cohorte agosto - diciembre 2026.
// Miércoles de 18 a 21:30, más tres encuentros en viernes.
// `pagina` en null significa que la clase todavía no está publicada:
// el enlace cae en el 404 y avisa que estará disponible próximamente.

// Cada módulo lleva dos tonos: el saturado se lee sobre fondo oscuro y el
// profundo sobre fondo claro. Usar siempre colorModulo(), nunca el campo suelto.
const MODULOS = {
  M1: { nombre: 'Entender el terreno',        color: '#F97316', claro: '#DD5F0B' },
  M2: { nombre: 'Anatomía de un flujo',       color: '#EAB308', claro: '#A16207' },
  M3: { nombre: 'Construir de verdad',        color: '#22C55E', claro: '#15803D' },
  M4: { nombre: 'Contexto e inteligencia',    color: '#3B82F6', claro: '#1D4ED8' },
  M5: { nombre: 'Orquestar y alojar',         color: '#A855F7', claro: '#7E22CE' },
  M6: { nombre: 'Evaluar y mejorar',          color: '#F43F5E', claro: '#BE123C' }
};

function colorModulo(id) {
  const m = MODULOS[id];
  const esClaro = window.temaActual && window.temaActual() === 'claro';
  return esClaro ? m.claro : m.color;
}

const CLASES = [
  { n:  1, fecha: '2026-08-12', dia: 'Miércoles', mod: 'M1', pagina: '01.html',
    titulo: 'El ecosistema no-code en 2026 y por qué n8n',
    bajada: 'Qué es automatizar un proceso, qué plataformas existen hoy y con qué criterio se elige una.' },
  { n:  2, fecha: '2026-08-19', dia: 'Miércoles', mod: 'M1', pagina: '02.html',
    titulo: 'Pensamiento algorítmico: disparador, condición, acción',
    bajada: 'Los cuatro pilares y el modelo que vamos a usar todo el cuatrimestre. El algoritmo se piensa antes que los nodos.' },
  { n:  3, fecha: '2026-08-21', dia: 'Viernes',   mod: 'M1', pagina: '03.html',
    titulo: 'n8n en modo taller: construir, probar y destrabar',
    bajada: 'Del algoritmo al lienzo: editor, datos de ejecución, diagnóstico de errores y un chatbot como copiloto.' },
  { n:  4, fecha: '2026-08-26', dia: 'Miércoles', mod: 'M2', pagina: null,
    titulo: 'Anatomía de un workflow: nodos, ítems y datos que viajan',
    bajada: 'Lo que nadie ve en un diagrama plano: cómo se mueven los datos de nodo en nodo.' },
  { n:  5, fecha: '2026-09-02', dia: 'Miércoles', mod: 'M2', pagina: null,
    titulo: 'Los ocho nodos que resuelven el noventa por ciento',
    bajada: 'Trigger, HTTP Request, IF, Switch, Merge, Edit Fields, Code y nodos de app.' },
  { n:  6, fecha: '2026-09-09', dia: 'Miércoles', mod: 'M2', pagina: null,
    titulo: 'Ramas, bucles, errores y el costo de cada ejecución',
    bajada: 'Qué cuenta como ejecución, por qué probar es gratis y producir no, y cómo se diseña con eso en la cabeza.' },
  { n:  7, fecha: '2026-09-16', dia: 'Miércoles', mod: 'M3', pagina: null,
    titulo: 'Del proceso manual al workflow: primer caso completo',
    bajada: 'Un proceso real contado en desorden, descompuesto, escrito en pseudocódigo y construido.' },
  { n:  8, fecha: '2026-09-18', dia: 'Viernes',   mod: 'M3', pagina: null,
    titulo: 'APIs, webhooks y HTTP Request: conectar lo que no tiene nodo',
    bajada: 'Cuando la integración no existe, se construye. JSON, autenticación y disparadores por webhook.' },
  { n:  9, fecha: '2026-09-23', dia: 'Miércoles', mod: 'M3', pagina: null,
    titulo: 'Datos: Data Tables, expresiones y transformaciones',
    bajada: 'Guardar estado dentro de n8n, escribir expresiones y ordenar datos que vienen sucios.' },
  { n: 10, fecha: '2026-09-30', dia: 'Miércoles', mod: 'M4', pagina: null,
    titulo: 'n8n + IA: el nodo AI Agent',
    bajada: 'Un modelo que razona, decide y usa herramientas adentro de un flujo. Memoria y tools.' },
  { n: 11, fecha: '2026-10-07', dia: 'Miércoles', mod: 'M4', pagina: null,
    titulo: 'Ingeniería de contexto en flujos automatizados',
    bajada: 'Qué información recibe el modelo, en qué orden y con qué límite. Iterar sin romper lo que anda.' },
  { n: 12, fecha: '2026-10-14', dia: 'Miércoles', mod: 'M4', pagina: null,
    titulo: 'Agentes de código, primer contacto',
    bajada: 'Claude Code, Codex y OpenCode como herramienta para construir: nodo Code, expresiones y JSON de workflows.' },
  { n: 13, fecha: '2026-10-21', dia: 'Miércoles', mod: 'M5', pagina: null,
    titulo: 'MCP: el protocolo que conecta la IA con tus herramientas',
    bajada: 'n8n como servidor y como cliente MCP. Una IA que arma el workflow hablándole en lenguaje natural.' },
  { n: 14, fecha: '2026-10-28', dia: 'Miércoles', mod: 'M5', pagina: null,
    titulo: 'Self-hosting: Docker, VPS y soberanía de datos',
    bajada: 'Por qué una organización querría alojar esto adentro, y qué implica hacerlo.' },
  { n: 15, fecha: '2026-11-04', dia: 'Miércoles', mod: 'M5', pagina: null,
    titulo: 'Instancia propia en serio: credenciales, entornos y backups',
    bajada: 'Variables de entorno, control de versiones con Git, respaldos y qué mirar cuando algo falla.' },
  { n: 16, fecha: '2026-11-11', dia: 'Miércoles', mod: 'M5', pagina: null,
    titulo: 'Orquestación: el agente de código maneja n8n desde afuera',
    bajada: 'La instancia expuesta como servidor MCP y un agente que crea, corrige y despliega workflows.' },
  { n: 17, fecha: '2026-11-18', dia: 'Miércoles', mod: 'M5', pagina: null,
    titulo: 'Sistemas multi-agente, memoria y gobernanza',
    bajada: 'Varios agentes coordinados, memoria persistente y los límites que hay que ponerles.' },
  { n: 18, fecha: '2026-11-25', dia: 'Miércoles', mod: 'M6', pagina: null,
    titulo: 'Evaluar un flujo: Insights, métricas y evaluaciones de agentes',
    bajada: 'Medir antes de opinar. Éxitos, fallos, tiempo ahorrado y cómo se evalúa un agente sin soltarlo a ciegas.' },
  { n: 19, fecha: '2026-11-27', dia: 'Viernes',   mod: 'M6', pagina: null,
    titulo: 'Mejora continua: refactor, costos y anti-fragilidad',
    bajada: 'Rehacer un flujo que funciona para que cueste menos y se caiga menos.' },
  { n: 20, fecha: '2026-12-02', dia: 'Miércoles', mod: 'M6', pagina: null,
    titulo: 'Proyecto integrador: presentación y defensa',
    bajada: 'Un proceso real de tu organización, pensado, construido, medido y defendido.' }
];

const MESES = ['enero','febrero','marzo','abril','mayo','junio',
               'julio','agosto','septiembre','octubre','noviembre','diciembre'];

function fechaLarga(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]}`;
}
