import { open, go, shot } from "./lib.mjs";
const { browser, page } = await open("empleado-ctx");
const S = [
  ["empleado-panel", "/admin/dashboard", 7000],
  ["empleado-agenda", "/admin/schedule", 8000],
  ["empleado-perfil", "/admin/profile", 6000],
];
const fails = [];
for (const [name, path, w] of S) {
  try { await go(page, path, w); await shot(page, name); }
  catch (e) { fails.push(`${name}: ${e.message.split("\n")[0].slice(0,90)}`); console.log("  ✗", name); }
}
// Qué rutas del dueño le quedan bloqueadas: dato duro para el capítulo de permisos.
console.log("\n--- acceso a rutas restringidas ---");
for (const r of ["/admin/schedule/automate","/admin/business","/admin/services","/admin/team/employees","/admin/analytics","/admin/account/subscription"]) {
  try { await go(page, r, 4000); console.log(r.padEnd(32), "->", page.url().replace("http://localhost:3000","")); }
  catch { console.log(r.padEnd(32), "-> ERROR"); }
}
console.log(fails.length ? "\nFALLARON:\n"+fails.join("\n") : "\nTodo OK");
await browser.close();
