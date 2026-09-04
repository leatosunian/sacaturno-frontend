# Capturas del centro de ayuda

Scripts para regenerar las imágenes de `/admin/ayuda` (viven en `public/ayuda/`).
Se corren a mano cuando cambia la UI del panel, no en el build.

Playwright **no** está en las dependencias del proyecto a propósito: se instalaría
en el build de Netlify sin hacer falta. Instalalo aparte, fuera del repo.

## Preparación

```bash
mkdir -p /tmp/sacaturno-shots && cd /tmp/sacaturno-shots
npm init -y && npm i playwright && npx playwright install chromium
cp /ruta/a/sacaturno/scripts/help-shots/*.mjs .
```

Necesitás el frontend en `localhost:3000` y el backend en `localhost:4000`.

## Uso

Los scripts nunca leen ni escriben contraseñas: abrís una ventana, iniciás sesión
vos, y guardan la sesión en un archivo.

```bash
node login.mjs owner 30          # abre el navegador y espera tu login (30 min)
node prepare.mjs owner "Dueño"   # resuelve la pantalla "Iniciá sesión como"
node capture.mjs owner-ctx       # saca todas las capturas del dueño
```

Para el panel de empleado, lo mismo con el otro perfil:

```bash
node login.mjs empleado 30
node prepare.mjs empleado "Empleado"
node capture-emp.mjs
```

Un solo grupo de capturas: `node capture.mjs owner-ctx agenda-`

## Cuentas

Las capturas actuales se sacaron con los datos del seed
(`server/src/scripts/seed.ts`), sobre **Odontología Belgrano**, que es el único
negocio en Plan Full y por lo tanto el único que muestra el panel completo
—sucursales, equipo y las tres ventanas de recordatorio—.

| Rol | Cuenta | Por qué |
|---|---|---|
| Dueño | `carolina.ferrari@sacaturno.test` | Plan Full: 6 empleados, 3 sucursales, 3 servicios con seña, Mercado Pago vinculado |
| Empleado | `federico.iriarte@sacaturno.test` | Solo `manage_own_appointments`: el panel más recortado posible |

Contraseña de todas las cuentas del seed: `SEED_PASSWORD` en
`server/src/scripts/seedData.ts`.

## Optimización

Las capturas salen en PNG a 2x. Antes de commitearlas hay que pasarlas a WebP
con `sharp`, que ya es dependencia del proyecto (5,2 MB → 1,4 MB):

```bash
node -e "
const sharp=require('sharp'), fs=require('fs'), path=require('path');
const SRC='/tmp/sacaturno-shots/shots', DST='public/ayuda';
(async()=>{ for(const f of fs.readdirSync(SRC).filter(f=>f.endsWith('.png')))
  await sharp(path.join(SRC,f)).resize({width:1600,withoutEnlargement:true})
    .webp({quality:82}).toFile(path.join(DST,f.replace(/\.png\$/,'.webp')));
})();"
```

## Al agregar una captura

1. Sumá el `def(...)` correspondiente en `capture.mjs`.
2. Referenciala desde `lib/helpContent.ts` con un bloque `{ k: "img", ... }`.
   Si el archivo queda sin referenciar, es peso muerto en el bundle.
