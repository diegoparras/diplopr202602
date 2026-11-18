// Trabajo final integrador: la consigna. No tiene lógica propia más allá
// de la cortina de acceso y el botón de salir.
exigirSesion();
document.getElementById('salir').addEventListener('click', e => { e.preventDefault(); cerrarSesion(); });
