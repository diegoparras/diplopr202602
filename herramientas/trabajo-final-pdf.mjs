// Regenera la consigna del trabajo final en PDF a partir de la página
// public/trabajo-final.html, que es la única fuente: si se cambia la página,
// se corre esto y el PDF queda igual a la página.
//
//   node herramientas/trabajo-final-pdf.mjs
//
// Necesita Node, Playwright con Chromium y pdfunite (viene con poppler).
// No es parte del sitio: Vercel sólo sirve public/ y esto no se ejecuta al
// publicar. Toma de la página lo que está entre las marcas tf:portada,
// tf:contenido y tf:comun, imprime la portada sin pie y el cuerpo con el pie
// numerado desde 1, y une los dos.

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const pagina = readFileSync(join(raiz, 'public/trabajo-final.html'), 'utf8');
const salida = join(raiz, 'public/archivos/trabajo-final-miercoles-2026.pdf');

function entre(texto, abre, cierra) {
  const i = texto.indexOf(abre), j = texto.indexOf(cierra);
  if (i < 0 || j < i) throw new Error('No encuentro la marca ' + abre + ' en trabajo-final.html');
  return texto.slice(i + abre.length, j);
}
const portada = entre(pagina, '<!-- tf:portada -->', '<!-- /tf:portada -->');
const contenido = entre(pagina, '<!-- tf:contenido -->', '<!-- /tf:contenido -->');
const comun = entre(pagina, '/* tf:comun */', '/* /tf:comun */');
const [arriba, datos] = portada.split('<div class="tf-datos">');
if (!datos) throw new Error('La portada no tiene el bloque tf-datos');

// Los colores del PDF viven acá: el PDF no usa estilo.css.
const css = `
@page { size: A4; margin: 18mm 17mm 20mm; }
@page :first { margin: 0; }
:root { --fondo: #FFFFFF; --sup: #FBFAF8; --texto: #1A1917; --tenue: #4F4B45; --linea: #E4E0D9; --naranja: #E8650F; --brasa: #FDF1E8;
        --oscuro: #121112; --claro: #F4F1EC; --dato: 'JetBrains Mono', 'DejaVu Sans Mono', monospace; --cuerpo: 'Inter', 'DejaVu Sans', sans-serif; }
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--fondo); color: var(--texto); font-family: var(--cuerpo); font-size: 10pt; line-height: 1.55; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
h1, h2, h3 { font-family: 'Inter Display', 'Inter', sans-serif; letter-spacing: -0.02em; }
.portada { height: 297mm; background: var(--oscuro); color: var(--claro); padding: 26mm 20mm 20mm; display: flex; flex-direction: column; }
.portada .marca { font-weight: 800; font-size: 11pt; } .portada .marca span { color: var(--naranja); }
.portada .medio { margin-top: auto; }
.tf-sello { font-family: var(--dato); font-size: 7.5pt; letter-spacing: 0.18em; text-transform: uppercase; color: var(--naranja); }
.tf-sello::before { content: ""; display: inline-block; width: 22px; height: 1px; background: var(--naranja); vertical-align: middle; margin-right: 10px; }
.tf-titulo { font-size: 30pt; line-height: 1.08; margin: 12px 0 0; font-weight: 800; color: #FFFFFF; }
.tf-bajada { margin-top: 16px; font-size: 11.5pt; color: #CFCAC2; max-width: 150mm; }
.portada .abajo { margin-top: auto; }
.tf-datos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; border-top: 1px solid #3A3836; padding-top: 6mm; }
.tf-datos b { display: block; margin-top: 4px; color: #FFFFFF; font-size: 9.5pt; }
.portada .tf-rot { color: #A39E95; }
.tf-pie-portada { margin-top: 8mm; font-size: 7.5pt; color: #8E897F; }
${comun}
.tf-sec { margin-top: 9mm; }
.tf-sec:first-child { margin-top: 0; }
.tf-sec h2 { font-size: 16pt; margin-bottom: 4mm; page-break-after: avoid; }
.tf-sec h3 { font-size: 11pt; page-break-after: avoid; }
.tf-camino, .tf-aviso, .tf-pedido, .tf-fechas > div, tr { page-break-inside: avoid; }
.tf-tabla { font-size: 8.6pt; }
.tf-tabla th { font-size: 6.6pt; }`;
const doc = cuerpo => `<!doctype html><html lang="es"><head><meta charset="utf-8"><style>${css}</style></head><body>${cuerpo}</body></html>`;
const htmlPortada = doc(`<div class="portada"><div class="marca">Diplomatura <span>Procesos</span> · FCE-UBA</div>
  <div class="medio">${arriba}</div><div class="abajo"><div class="tf-datos">${datos}</div></div>`);
const htmlCuerpo = doc(`<div class="contenido">${contenido}</div>`);

const pie = `<div style="width:100%;font-family:Inter,sans-serif;font-size:6.5pt;color:#8E897F;padding:0 17mm;display:flex;justify-content:space-between">
  <span>Trabajo final integrador · Diplomatura en Diseño de Procesos de Negocios con Automatización e IA Agéntica · FCE-UBA · Cohorte de los miércoles 2026</span>
  <span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`;

const tmp = mkdtempSync(join(tmpdir(), 'tf-'));
const navegador = await chromium.launch();
async function imprimir(html, archivo, conPie) {
  const ruta = join(tmp, archivo + '.html');
  writeFileSync(ruta, html);
  const p = await navegador.newPage();
  await p.goto('file://' + ruta, { waitUntil: 'load' });
  await p.pdf({ path: join(tmp, archivo + '.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: conPie, headerTemplate: '<span></span>', footerTemplate: conPie ? pie : '<span></span>' });
  await p.close();
  return join(tmp, archivo + '.pdf');
}
const a = await imprimir(htmlPortada, 'portada', false);
const b = await imprimir(htmlCuerpo, 'cuerpo', true);
await navegador.close();

const r = spawnSync('pdfunite', [a, b, salida], { stdio: 'inherit' });
if (r.status !== 0) throw new Error('pdfunite falló: ¿está instalado poppler?');
console.log('Listo:', salida);
