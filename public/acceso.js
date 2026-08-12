// Cortina de acceso para el material de la diplomatura.
// La clave no está escrita en el código: se compara el hash SHA-256.
// Esto evita que aparezca al abrir el fuente, y nada más que eso.
// Cualquier persona con la clave puede compartirla. Es una cortina, no un candado.

const HASH_CLAVE = '3b70d161be02638e39f77b249c0454d766609eba43ead42145ea1c7c2f05c202';

async function hashear(texto) {
  const bytes = new TextEncoder().encode(texto.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function validarClave(clave) {
  return (await hashear(clave)) === HASH_CLAVE;
}

function abrirSesion() {
  sessionStorage.setItem('diplo-ok', '1');
  localStorage.setItem('diplo-ok', '1');
}

function haySesion() {
  return sessionStorage.getItem('diplo-ok') === '1' ||
         localStorage.getItem('diplo-ok') === '1';
}

function cerrarSesion() {
  sessionStorage.removeItem('diplo-ok');
  localStorage.removeItem('diplo-ok');
  location.href = 'index.html';
}

// Se llama al inicio de cada página del material.
function exigirSesion() {
  if (!haySesion()) {
    location.replace('index.html?volver=' + encodeURIComponent(location.pathname));
  }
}
