# -*- coding: utf-8 -*-
# Arma una version suelta del taller: un solo archivo, sin cortina de acceso
# y sin ninguna referencia a la diplomatura. Tiene que abrir igual desde un
# servidor que con doble clic sobre el archivo.
import io, re

html = io.open('taller-oauth.html', encoding='utf-8').read()
js   = io.open('taller-oauth.js',   encoding='utf-8').read()
css  = io.open('estilo.css',        encoding='utf-8').read()

def cambiar(t, viejo, nuevo, donde):
    assert viejo in t, 'no encontre: ' + donde
    return t.replace(viejo, nuevo, 1)

# ─────────────── El JavaScript ───────────────
js = cambiar(js, """// Taller de apoyo: n8n self-hosted + Google OAuth en producción.
// Todo el texto de la guía se escribe con las variables de la persona.
// Nada de lo que se pide acá es secreto, y no hay ningún campo donde
// pegar el Client Secret: su único lugar es la credencial de n8n.

exigirSesion();

document.getElementById('salir').addEventListener('click', e => {
  e.preventDefault();
  cerrarSesion();
});
""", """// n8n self-hosted + Google OAuth en producción.
// Todo el texto de la guía se escribe con las variables de la persona.
// Nada de lo que se pide acá es secreto, y no hay ningún campo donde
// pegar el Client Secret: su único lugar es la credencial de n8n.
""", 'cabecera del JS')

js = cambiar(js,
  'Ese es justamente el motivo por el que los JSON de esta cursada se pueden descargar sin que nadie regale nada.',
  'Por eso un workflow exportado se puede compartir sin que nadie regale nada, aunque adentro use credenciales.',
  'JSON de la cursada')

js = cambiar(js,
  'Las ejecuciones manuales no consumen cuota, ni en n8n Cloud ni en tu instancia propia, como vimos en la clase 6. Probá todo lo que necesites con el botón de ejecutar a mano antes de publicar nada.',
  'Las ejecuciones manuales no consumen cuota, ni en n8n Cloud ni en tu instancia propia: la cuota cuenta sólo las ejecuciones de producción, y sólo en los planes pagos. Probá todo lo que necesites con el botón de ejecutar a mano antes de publicar nada.',
  'cuota clase 6')

js = cambiar(js,
  'Si un flujo que importa depende de esta credencial, armale el flujo de error de la clase 6 para que alguien se entere el día que deje de andar. Es literalmente el mejor caso de uso que tiene esa herramienta, y los flujos de error no cuentan cuota.',
  'Si un flujo que importa depende de esta credencial, armale un <b>flujo de error</b> —un workflow aparte con un nodo Error Trigger, declarado en Settings → Error Workflow— para que alguien se entere el día que deje de andar. Es literalmente el mejor caso de uso que tiene esa herramienta, y los flujos de error no consumen cuota.',
  'flujo de error clase 6')

# ─────────────── El HTML ───────────────
h = html

# Cabeza: sin iconos del sitio, sin hoja externa, sin tema.js
h = cambiar(h, '<title>Taller · n8n self-hosted + Google OAuth en producción · FCE-UBA</title>',
               '<title>n8n self-hosted + Google OAuth en producción</title>', 'title')
h = re.sub(r'\n<link rel="icon"[^>]*>|\n<link rel="apple-touch-icon"[^>]*>|\n<link rel="manifest"[^>]*>', '', h)
h = cambiar(h, '<script src="tema.js"></script>\n<link rel="stylesheet" href="estilo.css">\n<style>',
               '<style>\n/* ══ Base ══ */\n' + css.split('*/', 1)[1].lstrip() + '\n\n/* ══ Esta página ══ */', 'hoja de estilos')

# Barra: sin marca de la casa, sin cronograma, sin selector de clases, sin salir
vieja_barra = h[h.index('<header class="barra">'):h.index('</header>') + len('</header>')]
nueva_barra = '''<header class="barra">
  <div class="barra-int">
    <span class="marca"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 32 H30 M38 22 H30 M38 42 H30 M30 22 V42" fill="none" stroke="#FB923C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="32" r="5.5" fill="#F97316"/><circle cx="44" cy="21" r="5" fill="#FDBA74"/><circle cx="44" cy="43" r="5" fill="#FDBA74"/></svg>n8n <span>+</span> Google OAuth</span>
    <nav>
      <a href="#orden">El orden</a>
      <a href="#variables">Variables</a>
      <a href="#lios">Problemas</a>
      <a href="#checklist">Checklist</a>
      <button class="tema" type="button" title="Cambiar tema">
        <svg class="luna" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        <svg class="sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.2v2M12 19.8v2M2.2 12h2M19.8 12h2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M19.1 4.9l-1.5 1.5M6.4 17.6l-1.5 1.5"/></svg>
      </button>
    </nav>
  </div>
</header>'''
h = h.replace(vieja_barra, nueva_barra, 1)

# Portada
h = cambiar(h, '<span class="rotulo">Taller de apoyo · Módulo 5 · Orquestar y alojar</span>',
               '<span class="rotulo">Guía paso a paso</span>', 'rotulo portada')
h = cambiar(h,
  'Este taller no es una clase: es un procedimiento que vas a seguir con el navegador abierto en cinco pestañas. Aparece acá porque es la pieza que separa un n8n de juguete de un n8n que sirve, y porque el 90&nbsp;% de la gente que abandona el self-hosting abandona exactamente en este paso. Las veinte etapas están en el orden que evita hacer el trabajo dos veces.',
  'Esto es un procedimiento, no una lectura: vas a seguirlo con el navegador abierto en cinco pestañas. Existe porque es la pieza que separa un n8n de juguete de un n8n que sirve, y porque casi todo el que abandona el self-hosting abandona exactamente en este paso. Las veinte etapas están en el orden que evita hacer el trabajo dos veces.',
  'intro portada')
h = cambiar(h, '<span>Se usa en las clases 14 y 15</span>',
               '<span>Guía para consultar y volver</span>', 'meta portada')

# Etapa 0
h = cambiar(h,
  'Acá también vale lo que venimos haciendo toda la cursada: antes de tocar la herramienta, el proceso. Este procedimiento tiene una sola propiedad interesante',
  'Antes de tocar la herramienta, el proceso. Este procedimiento tiene una sola propiedad interesante',
  'intro etapa 0')

# Permisos
h = cambiar(h,
  'porque esa lista la mueve Google y copiarla sería exactamente lo que esta cursada no hace',
  'porque esa lista la mueve Google y una copia pegada acá envejece mal',
  'nota de permisos')

# Comandos
h = cambiar(h,
  'Los comandos de comprobación están en dos versiones porque el aula está mitad en Windows y mitad en Mac.',
  'Los comandos de comprobación están en dos versiones, una para Windows y otra para Mac o Linux.',
  'nota de comandos')

# Fuentes
h = cambiar(h,
  'Regla de la cursada: cada dato con su fecha de corte y su origen.',
  'Cada dato, con su fecha de corte y su origen.',
  'intro de fuentes')

# La barra en telefono: ese CSS lo inyectaba menu.js, que acá no está
h = cambiar(h, "  @media (prefers-reduced-motion: reduce) {\n    .avance i, .boton { transition: none; }\n  }",
"""  /* En telefono la barra envuelve en dos renglones. Esto lo traia el
     selector de clases del sitio original, que esta version no usa. */
  @media (max-width: 720px) {
    .barra-int { flex-wrap: wrap; column-gap: 12px; row-gap: 7px; padding: 11px 20px; }
    .barra .marca { min-width: 0; font-size: 0.88rem; }
    .barra nav { margin-left: auto; gap: 13px; }
    .barra nav a { font-size: 0.78rem; }
  }
  @media (max-width: 400px) {
    .barra nav a { font-size: 0.74rem; }
    .barra nav { gap: 10px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .avance i, .boton { transition: none; }
  }""", 'barra en telefono')

# Este vive en el HTML y no en el JS, por eso va aparte
h = cambiar(h,
  'Eso es exactamente el flujo de error de la clase 6, y acá tiene su mejor caso de uso.',
  'Para eso existe el <b>flujo de error</b> de n8n, y acá tiene su mejor caso de uso.',
  'flujo de error en el HTML')

# Pie
viejo_pie = h[h.index('<footer class="pie">'):h.index('</footer>') + len('</footer>')]
nuevo_pie = '''<footer class="pie">
  <div class="envoltura">
    <span>Guía validada con las interfaces disponibles al 23 de septiembre de 2026.</span>
    <span>Las fuentes oficiales mandan sobre esta página.</span>
  </div>
</footer>'''
h = h.replace(viejo_pie, nuevo_pie, 1)

# Scripts: todo adentro
tema_js = io.open('tema.js', encoding='utf-8').read()
h = cambiar(h, '''<script src="acceso.js"></script>
<script src="clases.js"></script>
<script src="menu.js"></script>
<script src="taller-oauth.js"></script>''',
  '<script>\n' + tema_js + '\n</script>\n\n<script>\n' + js + '\n</script>', 'scripts')

# La clave del tema en localStorage tambien nombraba a la cursada
h = cambiar(h, "const LLAVE = 'diplo-tema';", "const LLAVE = 'tema-taller-n8n';", 'clave del tema')

io.open('n8n-google-oauth.html', 'w', encoding='utf-8').write(h)

sobras = [p for p in ['cursada', 'diplomatura', 'FCE', 'clase 6', 'clases 14', 'Módulo 5',
                      'cronograma', 'acceso.js', 'exigirSesion', 'data-selector-clases', 'el aula']
          if p in h]
print('escrito n8n-google-oauth.html · %d KB' % (len(h.encode('utf-8')) // 1024))
print('referencias que quedan:', sobras or 'ninguna')
