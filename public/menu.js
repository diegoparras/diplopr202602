// Selector de clases publicadas para la barra superior.
// La única fuente es CLASES (clases.js): una clase entra en el menú cuando
// tiene `pagina`. Al publicar una clase no hay que tocar ninguna barra.
//
// Uso en el <nav> de la barra, con un enlace adentro que sirve de reserva
// si el JavaScript no corre:
//   <span data-selector-clases><a href="cronograma.html">Clases</a></span>
//
// El componente no vive en estilo.css: como lo dibuja este mismo archivo,
// se trae sus estilos con él y así cada clase nueva sólo suma el <script>.

(function () {
  if (typeof CLASES === 'undefined') return;

  const ESTILOS = `
  .selector { position: relative; display: inline-flex; }

  .selector-boton {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 5px 11px 5px 13px;
    border: 1px solid var(--linea);
    border-radius: 999px;
    background: transparent;
    color: var(--tenue);
    font-family: var(--cuerpo);
    font-size: 0.87rem;
    line-height: 1.3;
    cursor: pointer;
    transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  }
  .selector-boton.actual { color: var(--texto); }
  .selector-boton:hover,
  .selector-boton[aria-expanded="true"] {
    color: var(--texto);
    border-color: var(--naranja);
    background: var(--brasa);
  }
  .selector-cuenta {
    font-family: var(--dato);
    font-size: 0.68rem;
    color: var(--naranja);
  }
  .selector-flecha {
    width: 11px;
    height: 11px;
    flex-shrink: 0;
    transition: transform 0.18s ease;
  }
  .selector-boton[aria-expanded="true"] .selector-flecha { transform: rotate(180deg); }

  .selector-panel {
    position: absolute;
    top: calc(100% + 11px);
    right: 0;
    z-index: 60;
    width: min(350px, calc(100vw - 32px));
    max-height: min(70vh, 470px);
    overflow-y: auto;
    padding: 7px;
    background: var(--sup);
    border: 1px solid var(--linea);
    border-radius: 14px;
    box-shadow: var(--sombra);
  }
  .selector-panel[hidden] { display: none; }

  .selector-encabezado {
    padding: 8px 11px 7px;
    font-family: var(--dato);
    font-size: 0.66rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--tenue);
  }

  .selector-item {
    display: flex;
    align-items: flex-start;
    gap: 11px;
    padding: 9px 11px;
    border-radius: 10px;
    color: var(--texto);
    text-decoration: none;
  }
  .selector-item:hover,
  .selector-item:focus-visible { background: var(--sup2); text-decoration: none; }
  .selector-item.actual { background: var(--brasa); }
  .selector-num {
    flex-shrink: 0;
    font-family: var(--dato);
    font-size: 0.74rem;
    line-height: 1.55;
  }
  .selector-item b {
    display: block;
    font-weight: 600;
    font-size: 0.87rem;
    line-height: 1.35;
  }
  .selector-item small {
    display: block;
    margin-top: 2px;
    font-family: var(--dato);
    font-size: 0.71rem;
    color: var(--tenue);
  }

  .selector-vacio {
    padding: 6px 11px 12px;
    font-size: 0.84rem;
    color: var(--tenue);
  }

  .selector-pie {
    margin: 6px 5px 0;
    padding: 9px 6px 4px;
    border-top: 1px solid var(--linea);
    font-size: 0.81rem;
  }

  @media (max-width: 720px) {
    .selector-boton { font-size: 0.8rem; gap: 6px; padding: 4px 9px 4px 11px; }
    .selector-cuenta { display: none; }
  }
  `;

  const FLECHA = '<svg class="selector-flecha" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  function estilos() {
    if (document.getElementById('estilo-selector-clases')) return;
    const hoja = document.createElement('style');
    hoja.id = 'estilo-selector-clases';
    hoja.textContent = ESTILOS;
    document.head.appendChild(hoja);
  }

  function paginaActual() {
    const archivo = location.pathname.split('/').pop();
    return archivo === '' ? 'index.html' : archivo;
  }

  function dosDigitos(n) {
    return String(n).padStart(2, '0');
  }

  function armar(hueco) {
    const publicadas = CLASES.filter(c => c.pagina);
    const aqui = paginaActual();
    const actual = publicadas.find(c => c.pagina === aqui) || null;

    const caja = document.createElement('div');
    caja.className = 'selector';

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'selector-boton' + (actual ? ' actual' : '');
    boton.id = 'selectorClasesBoton';
    boton.setAttribute('aria-expanded', 'false');
    boton.setAttribute('aria-controls', 'selectorClasesPanel');
    boton.setAttribute('aria-haspopup', 'true');
    boton.innerHTML =
      '<span>' + (actual ? 'Clase ' + dosDigitos(actual.n) : 'Clases') + '</span>' +
      '<span class="selector-cuenta">' + publicadas.length + '</span>' + FLECHA;

    const panel = document.createElement('div');
    panel.className = 'selector-panel';
    panel.id = 'selectorClasesPanel';
    panel.setAttribute('role', 'menu');
    panel.setAttribute('aria-labelledby', 'selectorClasesBoton');
    panel.hidden = true;

    const encabezado = document.createElement('div');
    encabezado.className = 'selector-encabezado';
    encabezado.textContent = publicadas.length === 1
      ? 'Una clase publicada'
      : publicadas.length + ' clases publicadas';
    panel.appendChild(encabezado);

    if (!publicadas.length) {
      const vacio = document.createElement('p');
      vacio.className = 'selector-vacio';
      vacio.textContent = 'Todavía no hay material publicado. Cada encuentro se sube después de dictarse.';
      panel.appendChild(vacio);
    }

    publicadas.forEach(c => {
      const a = document.createElement('a');
      a.className = 'selector-item' + (c === actual ? ' actual' : '');
      a.href = c.pagina;
      a.setAttribute('role', 'menuitem');
      a.dataset.modulo = c.mod;
      if (c === actual) a.setAttribute('aria-current', 'page');
      const num = document.createElement('span');
      num.className = 'selector-num';
      num.textContent = dosDigitos(c.n);
      num.style.color = colorModulo(c.mod);
      const texto = document.createElement('span');
      const titulo = document.createElement('b');
      titulo.textContent = c.titulo;
      const pie = document.createElement('small');
      pie.textContent = MODULOS[c.mod].nombre + ' · ' + fechaLarga(c.fecha);
      texto.appendChild(titulo);
      texto.appendChild(pie);
      a.appendChild(num);
      a.appendChild(texto);
      panel.appendChild(a);
    });

    const pie = document.createElement('div');
    pie.className = 'selector-pie';
    pie.innerHTML = '<a href="cronograma.html">Ver las veinte clases del cronograma →</a>';
    panel.appendChild(pie);

    caja.appendChild(boton);
    caja.appendChild(panel);
    hueco.replaceWith(caja);

    /* ── Apertura, cierre y teclado ── */
    const opciones = () => Array.from(panel.querySelectorAll('.selector-item, .selector-pie a'));

    function abrir(foco) {
      panel.hidden = false;
      boton.setAttribute('aria-expanded', 'true');
      if (foco) {
        const lista = opciones();
        const preferida = panel.querySelector('.selector-item.actual') || lista[0];
        if (preferida) preferida.focus();
      }
    }

    function cerrar(devolverFoco) {
      if (panel.hidden) return;
      panel.hidden = true;
      boton.setAttribute('aria-expanded', 'false');
      if (devolverFoco) boton.focus();
    }

    boton.addEventListener('click', () => {
      panel.hidden ? abrir(false) : cerrar(false);
    });

    boton.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        if (panel.hidden) { e.preventDefault(); abrir(true); }
      }
    });

    panel.addEventListener('keydown', e => {
      const lista = opciones();
      const i = lista.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' && lista.length) {
        e.preventDefault();
        lista[(i + 1 + lista.length) % lista.length].focus();
      } else if (e.key === 'ArrowUp' && lista.length) {
        e.preventDefault();
        lista[(i - 1 + lista.length) % lista.length].focus();
      } else if (e.key === 'Home' && lista.length) {
        e.preventDefault(); lista[0].focus();
      } else if (e.key === 'End' && lista.length) {
        e.preventDefault(); lista[lista.length - 1].focus();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') cerrar(true);
    });

    document.addEventListener('click', e => {
      if (!caja.contains(e.target)) cerrar(false);
    });

    document.addEventListener('focusin', e => {
      if (!caja.contains(e.target)) cerrar(false);
    });

    // El número de cada clase se pinta con el color de su módulo, que cambia
    // con el tema: hay que rehacerlo cuando alguien lo conmuta.
    window.addEventListener('cambio-tema', () => {
      panel.querySelectorAll('.selector-item').forEach(item => {
        item.querySelector('.selector-num').style.color = colorModulo(item.dataset.modulo);
      });
    });
  }

  function iniciar() {
    const hueco = document.querySelector('[data-selector-clases]');
    if (!hueco) return;
    estilos();
    armar(hueco);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
