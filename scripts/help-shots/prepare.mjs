import { open, BASE } from "./lib.mjs";
const profile = process.argv[2] || "owner";
const rol = process.argv[3] || "Dueño";
const { browser, ctx, page } = await open(profile);

await page.goto(BASE + "/admin/dashboard", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);

if (page.url().includes("select-context")) {
  const btn = page.locator("button", { hasText: rol }).first();
  await btn.waitFor({ state: "visible", timeout: 30000 });
  await btn.click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 150000 });
  await page.waitForTimeout(6000);
}

// Comprobación real: una ruta interna no debe rebotar a select-context.
await page.goto(BASE + "/admin/schedule", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5000);
if (page.url().includes("select-context")) {
  console.log("FALLO: sigue rebotando a select-context");
  process.exit(1);
}
await ctx.storageState({ path: `./state-${profile}-ctx.json` });
console.log(`OK -> state-${profile}-ctx.json (verificado en ${page.url()})`);
await browser.close();
