/*
  Genera las imágenes de la sección de funcionalidades de la home
  (public/home/) a partir de las capturas del centro de ayuda
  (public/ayuda/). Se corre a mano, nunca en el build:

      node scripts/home-shots/crop.mjs

  De cada pantalla salen dos piezas:

  - CONTENT_BAND: la franja útil para desktop y tablet (>= 768px). Empieza
    después de la barra lateral (que termina en x=265 en las tres capturas) y
    corta antes del margen blanco de la derecha y del pie de página vacío. Sin
    ese recorte el mockup se ve larguísimo y la interfaz queda chiquita adentro.
    Las tres comparten el mismo rectángulo, así el crossfade del panel de
    desktop no mueve nada de lugar.

  - un recorte de detalle mucho más chico, para mobile: a 350px de ancho la
    captura entera entra al 30% de su tamaño y no se lee una palabra. Estos
    entran entre el 70% y el 100%, que es donde el texto sigue siendo legible.
    Los bordes van apoyados en los espacios vacíos entre tarjetas o chips: si
    cortan un elemento por la mitad se ve como un error, no como un recorte.

  OJO: las coordenadas de abajo son píxeles de las capturas actuales de
  public/ayuda. Si regenerás esas capturas con scripts/help-shots, volvé a
  correr este script y mirá los recortes antes de commitear.
*/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(ROOT, "public/ayuda");
const OUT = path.join(ROOT, "public/home");

// Las capturas nacen de un viewport de 1600x1000 con la barra lateral a la
// izquierda, cuyo borde con antialias termina en x=266 en las tres. Cada pantalla usa el ancho que
// necesita: la agenda estira sus controles hasta el borde, servicios y equipo
// terminan mucho antes. Lo que no cambia es la PROPORCIÓN, para que el panel de
// desktop no cambie de alto al pasar de un paso a otro.
const RATIO = 1078 / 650;
const band = (left, top, width) => ({
  left,
  top,
  width,
  height: Math.round(width / RATIO),
});

const SHOTS = [
  {
    src: "servicios-lista.webp",
    full: "servicios.webp",
    band: band(267, 0, 1078),
    // Una tarjeta de servicio entera, con precio, duración y seña.
    detail: { out: "servicios-detalle.webp", left: 331, top: 203, width: 464, height: 132 },
  },
  {
    src: "agenda-turnos.webp",
    full: "agenda.webp",
    // Más ancho que las otras: si no, los controles de la derecha (el toggle de
    // reservas, DESDE/HASTA) quedan cortados por la mitad.
    band: band(267, 0, 1320),
    // Un turno reservado y el hueco libre de al lado.
    detail: { out: "agenda-detalle.webp", left: 724, top: 246, width: 330, height: 95 },
  },
  {
    src: "equipo-lista.webp",
    full: "equipo.webp",
    band: band(267, 0, 1078),
    // Un integrante del equipo con sus servicios asignados.
    detail: { out: "equipo-detalle.webp", left: 330, top: 372, width: 344, height: 210 },
  },
];

fs.mkdirSync(OUT, { recursive: true });

let total = 0;
for (const shot of SHOTS) {
  const input = path.join(SRC, shot.src);

  const full = await sharp(input)
    .extract(shot.band)
    .resize({ width: 1320, withoutEnlargement: false })
    .webp({ quality: 74 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, shot.full), full);

  const detail = await sharp(input)
    .extract({
      left: shot.detail.left,
      top: shot.detail.top,
      width: shot.detail.width,
      height: shot.detail.height,
    })
    .webp({ quality: 80 })
    .toBuffer();
  fs.writeFileSync(path.join(OUT, shot.detail.out), detail);

  total += full.length + detail.length;
  console.log(
    shot.src.padEnd(22),
    shot.full.padEnd(16),
    (full.length / 1024).toFixed(0).padStart(4) + " KB   ",
    shot.detail.out.padEnd(24),
    (detail.length / 1024).toFixed(0).padStart(3) + " KB",
  );
}

console.log("\ntotal en public/home:", (total / 1024).toFixed(0), "KB");
console.log(
  "franja de desktop:",
  "1320x" + Math.round(1320 / RATIO),
  "(aspect-[1078/650])",
);
