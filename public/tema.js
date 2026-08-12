// Tema claro / oscuro.
// La preferencia se guarda; si no hay ninguna guardada, manda el sistema.
// Este archivo se carga en el <head>, antes de pintar, para que no haya
// un destello del tema equivocado al abrir la página.

(function () {
  const LLAVE = 'diplo-tema';

  function delSistema() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro';
  }

  function aplicar(tema) {
    document.documentElement.setAttribute('data-tema', tema);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', tema === 'claro' ? '#F7F6F3' : '#0B0B0D');
  }

  const guardado = localStorage.getItem(LLAVE);
  aplicar(guardado || delSistema());

  // Si la persona nunca eligió, seguimos al sistema cuando cambia.
  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
    if (!localStorage.getItem(LLAVE)) aplicar(delSistema());
  });

  window.temaActual = () => document.documentElement.getAttribute('data-tema') || 'oscuro';

  window.alternarTema = function () {
    const nuevo = window.temaActual() === 'claro' ? 'oscuro' : 'claro';
    localStorage.setItem(LLAVE, nuevo);
    aplicar(nuevo);
    window.dispatchEvent(new CustomEvent('cambio-tema', { detail: { tema: nuevo } }));
  };

  // Devuelve el valor calculado de una variable de la hoja de estilos,
  // para que el canvas y los SVG dibujados a mano usen la misma paleta.
  window.token = function (nombre) {
    return getComputedStyle(document.documentElement).getPropertyValue('--' + nombre).trim();
  };

  // Engancha cualquier botón .tema que exista en la página.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tema').forEach(b => {
      b.addEventListener('click', window.alternarTema);
      if (!b.getAttribute('aria-label')) b.setAttribute('aria-label', 'Cambiar entre tema claro y oscuro');
    });
  });
})();
