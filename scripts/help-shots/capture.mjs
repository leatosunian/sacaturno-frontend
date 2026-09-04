import { open, go, shot } from "./lib.mjs";

const only = process.argv[3] || null;
const { browser, page } = await open(process.argv[2] || "owner-ctx");

const S = [];
const def = (name, fn) => S.push({ name, fn });
const btn = (n) => page.getByRole("button", { name: n }).first();
const esc = async () => { await page.keyboard.press("Escape"); await page.waitForTimeout(700); };
// El diálogo abierto, no la página entera: recorte limpio para el manual.
const dialog = () => page.locator('[role="dialog"]').first();
const shotDialog = async (name) => {
  await dialog().waitFor({ state: "visible", timeout: 12000 });
  await page.waitForTimeout(1200);
  await dialog().screenshot({ path: `./shots/${name}.png` });
  console.log("  ✓", name);
};

/* ── Panel de inicio ─────────────────────────────────────────────── */
def("panel-inicio", async () => { await go(page, "/admin/dashboard", 6000); await shot(page, "panel-inicio"); });

/* ── Agenda / Turnos ─────────────────────────────────────────────── */
def("agenda-turnos", async () => { await go(page, "/admin/schedule", 7000); await shot(page, "agenda-turnos"); });

def("agenda-ayuda", async () => {
  await go(page, "/admin/schedule", 7000);
  await btn("¿Cómo agrego turnos?").click();
  await shotDialog("agenda-ayuda");
  await esc();
});

def("agenda-crear-turno", async () => {
  await go(page, "/admin/schedule", 7000);
  await page.getByRole("button", { name: /^Agregar turno a las/ }).first().click();
  await shotDialog("agenda-crear-turno");
  await esc();
});

def("agenda-generar-dia", async () => {
  await go(page, "/admin/schedule", 7000);
  await btn("Generar turnos").click();
  await shotDialog("agenda-generar-dia");
  await esc();
});

def("agenda-cancelados", async () => {
  await go(page, "/admin/schedule", 7000);
  await btn("Turnos cancelados").click();
  await shotDialog("agenda-cancelados");
  await esc();
});

def("agenda-detalle-turno", async () => {
  await go(page, "/admin/schedule", 7000);
  const card = page.getByText(/Consulta y diagnóstico|Limpieza y profilaxis|Blanqueamiento/).first();
  await card.click({ timeout: 12000 });
  await shotDialog("agenda-detalle-turno");
  await esc();
});

/* ── Automatizar agenda ──────────────────────────────────────────── */
def("automatizar-agenda", async () => { await go(page, "/admin/schedule/automate", 8000); await shot(page, "automatizar-agenda"); });

def("automatizar-tutorial", async () => {
  await go(page, "/admin/schedule/automate", 8000);
  await btn("Tutorial").click();
  await shotDialog("automatizar-tutorial");
  await esc();
});

def("automatizar-lote", async () => {
  await go(page, "/admin/schedule/automate", 8000);
  await btn("Asignar en lote").click();
  await shotDialog("automatizar-lote");
  await esc();
});

def("automatizar-frecuencia", async () => {
  await go(page, "/admin/schedule/automate", 8000);
  await page.getByText("Frecuencia y cantidad", { exact: false }).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await shot(page, "automatizar-frecuencia");
});

/* ── Mi empresa ──────────────────────────────────────────────────── */
def("empresa-config", async () => { await go(page, "/admin/business", 7000); await shot(page, "empresa-config", { fullPage: true }); });

def("empresa-cancelacion", async () => {
  await go(page, "/admin/business", 7000);
  await page.getByText("Política de cancelación", { exact: false }).first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await shot(page, "empresa-cancelacion");
});

def("empresa-sucursales", async () => { await go(page, "/admin/business/branches", 7000); await shot(page, "empresa-sucursales"); });

def("sucursal-nueva", async () => {
  await go(page, "/admin/business/branches", 7000);
  await btn("Nueva sucursal").click();
  await shotDialog("sucursal-nueva");
  await esc();
});

/* ── Servicios ───────────────────────────────────────────────────── */
def("servicios-lista", async () => { await go(page, "/admin/services", 7000); await shot(page, "servicios-lista"); });

def("servicio-nuevo", async () => {
  await go(page, "/admin/services", 7000);
  await btn("Nuevo servicio").click();
  await shotDialog("servicio-nuevo");
  await esc();
});

/* ── Equipo ──────────────────────────────────────────────────────── */
def("equipo-lista", async () => { await go(page, "/admin/team/employees", 7000); await shot(page, "equipo-lista"); });

def("equipo-invitar", async () => {
  await go(page, "/admin/team/employees", 7000);
  await btn("Invitar empleado").click();
  await shotDialog("equipo-invitar");
  await esc();
});

/* ── Resto ───────────────────────────────────────────────────────── */
def("estadisticas", async () => { await go(page, "/admin/analytics", 9000); await shot(page, "estadisticas"); });
def("mercadopago", async () => { await go(page, "/admin/account/mercadopago", 7000); await shot(page, "mercadopago"); });
def("suscripcion", async () => { await go(page, "/admin/account/subscription", 7000); await shot(page, "suscripcion"); });
def("suscripcion-planes", async () => {
  await go(page, "/admin/account/subscription", 7000);
  await btn("Cambiar de plan").click();
  await page.waitForTimeout(1500);
  await shot(page, "suscripcion-planes");
});
def("perfil", async () => { await go(page, "/admin/profile", 7000); await shot(page, "perfil"); });

const fails = [];
for (const s of S) {
  if (only && !s.name.includes(only)) continue;
  try { await s.fn(); }
  catch (e) { fails.push(`${s.name}  ->  ${e.message.split("\n")[0].slice(0,110)}`); console.log("  ✗", s.name); }
}
console.log(fails.length ? "\nFALLARON " + fails.length + ":\n" + fails.join("\n") : "\nTodo OK");
await browser.close();
