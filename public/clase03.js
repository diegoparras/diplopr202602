exigirSesion();

document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });
const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ZONAS = {
  lienzo: { estado:'Modo de edición', rot:'Lienzo', titulo:'El mapa del proceso', texto:'Las flechas no significan “después” solamente: llevan los ítems que produjo el nodo anterior.', lista:['Nombrá cada nodo por su función','Leé el flujo de izquierda a derecha','No mezcles ramas sin decidir cómo reunirlas'], nodo:'trigger' },
  nodo: { estado:'Nodo seleccionado', rot:'Configuración', titulo:'Qué hace este paso', texto:'Cada nodo combina una operación, parámetros y, a veces, una credencial. Configurarlo es traducir una línea del algoritmo.', lista:['Usá nombres que describan la acción','Probá el nodo antes de seguir','Separá configuración de datos'], nodo:'datos' },
  datos: { estado:'Datos de ejecución', rot:'Entrada y salida', titulo:'La evidencia del flujo', texto:'La pestaña de datos muestra ítems, campos, valores y tipos. Es el primer lugar para mirar cuando algo no coincide.', lista:['Compará entrada con salida','Revisá número versus texto','Buscá campos vacíos o ausentes'], nodo:'datos' },
  expresiones: { estado:'Editor de expresión', rot:'Expresiones', titulo:'Datos que se vuelven dinámicos', texto:'Una expresión toma valores de la ejecución. La vista previa confirma si apunta al campo correcto antes de correr.', lista:['Arrastrá el campo cuando puedas','Leé la vista previa','No adivines rutas largas'], nodo:'si' },
  ejecuciones: { estado:'Historial de ejecución', rot:'Ejecuciones', titulo:'La caja negra queda abierta', texto:'Cada corrida guarda el camino, los tiempos y la salida de los nodos. Un error se investiga sobre una ejecución concreta.', lista:['Abrí la última ejecución fallida','Localizá el primer desvío','Conservá el mensaje exacto'], nodo:'no' },
  activar: { estado:'Workflow inactivo', rot:'Prueba y activación', titulo:'Construir no es producir', texto:'Durante el taller ejecutamos a mano. Activar deja al disparador escuchando y recién ahí el flujo opera sin intervención.', lista:['Probá más de un caso','Soltá los datos fijados','Activá solo cuando haya responsable'], nodo:'trigger' }
};

document.getElementById('tourNav').addEventListener('click', e => {
  const boton = e.target.closest('button[data-zona]');
  if (!boton) return;
  document.querySelectorAll('#tourNav button').forEach(b => b.classList.toggle('activo', b === boton));
  const z = ZONAS[boton.dataset.zona];
  document.getElementById('editorEstado').textContent = z.estado;
  document.getElementById('panelRot').textContent = z.rot;
  document.getElementById('panelTitulo').textContent = z.titulo;
  document.getElementById('panelTexto').textContent = z.texto;
  document.getElementById('panelLista').innerHTML = z.lista.map(x => `<li>${x}</li>`).join('');
  document.querySelectorAll('.nodo').forEach(n => n.classList.toggle('activo', n.dataset.nodo === z.nodo));
});

const checks = [...document.querySelectorAll('#ruta input')];
const guardados = JSON.parse(localStorage.getItem('clase03-ruta') || '[]');
checks.forEach((c, i) => { c.checked = Boolean(guardados[i]); c.addEventListener('change', actualizarRuta); });
function actualizarRuta() {
  const estado = checks.map(c => c.checked);
  localStorage.setItem('clase03-ruta', JSON.stringify(estado));
  const hechos = estado.filter(Boolean).length;
  document.getElementById('barraProgreso').style.width = `${hechos / checks.length * 100}%`;
  document.getElementById('progresoTexto').textContent = hechos === checks.length ? 'Ruta completa. Ya tenés una ejecución para investigar.' : `${hechos} de ${checks.length} pasos completados`;
}
actualizarRuta();

const CASOS = [
  { titulo:'Campo ausente', subtitulo:'La expresión devuelve undefined', error:'Problem in node “Evaluar monto”\nCould not find field "monto_total" in input item', acciones:[['Revisar la salida del nodo anterior','bien'],['Volver a conectar la credencial','mal'],['Activar el workflow','mal']], explicacion:'Bien: primero verificá si el campo existe y cómo se llama en la salida anterior. Puede ser monto, Monto o estar dentro de otro objeto.' },
  { titulo:'Tipo incorrecto', subtitulo:'El monto llegó como texto', error:'Wrong type: "75000" is a string but was expecting a number', acciones:[['Mirar el tipo y convertir explícitamente','bien'],['Cambiar el umbral al azar','mal'],['Reintentar muchas veces','mal']], explicacion:'Bien: el valor se ve numérico, pero sigue siendo texto. Confirmá el tipo y convertí el dato antes de compararlo.' },
  { titulo:'Credencial vencida', subtitulo:'El servicio rechaza la llamada', error:'Authorization failed - please check your credentials\nHTTP status: 401', acciones:[['Probar la credencial en una conexión controlada','bien'],['Pegar el token en un chatbot','mal'],['Editar la condición IF','mal']], explicacion:'Bien: un 401 apunta a autenticación. Verificá la credencial sin exponerla y revisá permisos, vencimiento y cuenta seleccionada.' },
  { titulo:'Expresión inválida', subtitulo:'La ruta no coincide con los datos', error:'ExpressionError: Cannot read properties of undefined (reading "email")', acciones:[['Abrir la entrada y reconstruir la expresión desde el campo','bien'],['Agregar signos de pregunta al azar','mal'],['Borrar el historial','mal']], explicacion:'Bien: inspeccioná la estructura real y volvé a seleccionar el campo desde el panel. El mensaje dice que el objeto anterior a email no existe.' }
];
let casoActual = 0;
const $errores = document.getElementById('errores');
const $pistas = document.getElementById('pistas');
CASOS.forEach((c, i) => { const b=document.createElement('button'); b.innerHTML=`<b>${c.titulo}</b><span>${c.subtitulo}</span>`; b.addEventListener('click',()=>mostrarCaso(i)); $errores.appendChild(b); });
function mostrarCaso(i) {
  casoActual=i; const c=CASOS[i];
  [...$errores.children].forEach((b,j)=>b.classList.toggle('activo',j===i));
  document.getElementById('errorExacto').textContent=c.error;
  document.getElementById('diagnostico').className='diagnostico';
  document.getElementById('diagnostico').textContent='Elegí la acción que harías primero.';
  $pistas.innerHTML='';
  c.acciones.forEach(([texto,tipo])=>{ const b=document.createElement('button'); b.textContent=texto; b.addEventListener('click',()=>{ const d=document.getElementById('diagnostico'); d.className='diagnostico'+(tipo==='bien'?' ok':''); d.textContent=tipo==='bien'?c.explicacion:'Esa acción no prueba la causa más probable. Conservá la ejecución y empezá por la evidencia más cercana al nodo que falló.'; }); $pistas.appendChild(b); });
}
mostrarCaso(0);

const $error=document.getElementById('errorUsuario');
const $esperado=document.getElementById('esperadoUsuario');
const $datos=document.getElementById('datosUsuario');
const $prompt=document.getElementById('promptGenerado');
[$error,$esperado,$datos].forEach((el,i)=>{ el.value=localStorage.getItem(`clase03-campo-${i}`)||''; el.addEventListener('input',()=>localStorage.setItem(`clase03-campo-${i}`,el.value)); });
function generarPrompt() {
  const extras=[];
  document.querySelectorAll('[data-contexto]:checked').forEach(c=>{
    const m={ultimo:'Preguntame cuál fue el último nodo que produjo la salida correcta.',tipo:'Revisá primero nombres de campos y tipos de datos.',hipotesis:'Dame hasta tres hipótesis ordenadas por probabilidad, con una prueba concreta para cada una.',cambio:'Proponé un solo cambio reversible por vez y explicá cómo verificarlo.'}; extras.push(m[c.dataset.contexto]);
  });
  const limpio=s=>s.trim()||'[COMPLETAR]';
  $prompt.textContent=`Actuá como especialista en n8n y ayudame a diagnosticar, no a reescribir todo el workflow.\n\nOBJETIVO Y RESULTADO OBSERVADO\n${limpio($esperado.value)}\n\nERROR EXACTO\n${limpio($error.value)}\n\nENTRADA MÍNIMA SANITIZADA\n${limpio($datos.value)}\n\nREGLAS DE LA AYUDA\n- ${extras.join('\n- ')}\n- No supongas que podés ver mi pantalla.\n- Si falta contexto, pedime una sola evidencia específica.\n- No solicites credenciales ni datos personales.`;
}
document.getElementById('generarPrompt').addEventListener('click', generarPrompt);
document.querySelectorAll('[data-contexto]').forEach(c=>c.addEventListener('change',generarPrompt));
document.getElementById('copiarPrompt').addEventListener('click', async e => { try { await navigator.clipboard.writeText($prompt.textContent); e.currentTarget.textContent='Copiado'; setTimeout(()=>e.currentTarget.textContent='Copiar',1500); } catch { e.currentTarget.textContent='Seleccioná y copiá'; } });
generarPrompt();

document.getElementById('acordeon').addEventListener('click', e => { const b=e.target.closest('button'); if(!b)return; const abierto=b.classList.toggle('abierto'); b.setAttribute('aria-expanded',abierto); b.querySelector('span').textContent=abierto?'−':'＋'; });

if (!reducido && 'IntersectionObserver' in window) {
  const ojo=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ojo.unobserve(e.target);}}),{threshold:.08});
  document.querySelectorAll('section.bloque > .envoltura').forEach(el=>{el.classList.add('revelar');ojo.observe(el);});
}

