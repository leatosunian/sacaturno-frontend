/*
  Genera las imágenes de la sección de funcionalidades de la home
  (public/home/) a partir de las capturas del centro de ayuda
  (public/ayuda/). Se corre a mano, nunca en el build:

      node scripts/home-shots/crop.mjs

  De cada pantalla sale la franja útil para el mockup de desktop. Empieza
  después de la barra lateral (que termina en x=265 en las tres capturas, con
  el antialias en 266) y corta antes del margen blanco de la derecha y del pie
  de página vacío. Sin ese recorte el mockup se ve larguísimo y la interfaz
  queda chiquita adentro.

  Mobile no usa capturas: los tres detalles están dibujados en código dentro de
  components/home/Features.tsx, porque a 350px de ancho el texto de una captura
  no se lee.

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

// Las capturas nacen de un viewport de 1600x1000. Cada pantalla usa el ancho
// que necesita: la agenda estira sus controles hasta el borde, servicios y
// equipo terminan mucho antes. Lo que no cambia es la PROPORCIÓN, para que el
// panel de desktop no cambie de alto al pasar de un paso a otro.
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
  },
  {
    src: "agenda-turnos.webp",
    full: "agenda.webp",
    // Más ancho que las otras: si no, los controles de la derecha (el toggle de
    // reservas, DESDE/HASTA) quedan cortados por la mitad.
    band: band(267, 0, 1320),
  },
  {
    src: "equipo-lista.webp",
    full: "equipo.webp",
    band: band(267, 0, 1078),
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

  total += full.length;
  console.log(
    shot.src.padEnd(22),
    shot.full.padEnd(16),
    (full.length / 1024).toFixed(0).padStart(4) + " KB",
  );
}

console.log("\ntotal en public/home:", (total / 1024).toFixed(0), "KB");
console.log(
  "franja de desktop:",
  "1320x" + Math.round(1320 / RATIO),
  "(aspect-[1078/650])",
);
