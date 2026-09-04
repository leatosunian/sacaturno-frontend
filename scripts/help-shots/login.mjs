// Abre un Chromium visible en /login y espera a que VOS inicies sesión a mano.
// Detecta la cookie sacaturno_token, guarda la sesión y cierra. Nunca lee ni
// escribe tu contraseña.
import { chromium } from "playwright";

const profile = process.argv[2] || "owner";
const WAIT_MIN = Number(process.argv[3] || 30);
const BASE = "http://localhost:3000";

const ctx = await chromium.launchPersistentContext(`./pw-profile-${profile}`, {
  headless: false,
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  locale: "es-AR",
  timezoneId: "America/Argentina/Buenos_Aires",
  args: ["--window-size=1460,1000"],
});

const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto(`${BASE}/login`, { waitUntil: "domcontentloaded" }).catch(() => {});

console.log(`\n>>> Perfil "${profile}": iniciá sesión en la ventana abierta.`);
console.log(`>>> Espero hasta ${WAIT_MIN} minutos. Podés navegar libremente.\n`);

const deadline = Date.now() + WAIT_MIN * 60_000;
let ok = false;

while (Date.now() < deadline) {
  const cookies = await ctx.cookies(BASE).catch(() => []);
  const tok = cookies.find((c) => c.name === "sacaturno_token" && c.value);
  if (tok) {
    const url = ctx.pages().map((p) => p.url()).join(" ");
    if (/\/admin/.test(url)) { ok = true; break; }
  }
  await new Promise((r) => setTimeout(r, 2000));
}

if (ok) {
  await ctx.storageState({ path: `./state-${profile}.json` });
  console.log(`OK -> state-${profile}.json`);
} else {
  console.log("SIN LOGIN: se agotó la espera.");
}
await ctx.close();
process.exit(ok ? 0 : 1);
