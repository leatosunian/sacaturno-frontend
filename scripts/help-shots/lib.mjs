import { chromium } from "playwright";
import fs from "fs";

export const BASE = "http://localhost:3000";
export const OUT = "./shots";

export async function open(profile) {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    storageState: `./state-${profile}.json`,
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: "es-AR",
    timezoneId: "America/Argentina/Buenos_Aires",
    reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  page.setDefaultNavigationTimeout(180000);
  return { browser, ctx, page };
}

// Entra al panel resolviendo la pantalla "Iniciá sesión como" si aparece.
export async function enter(page, rol = "Dueño") {
  await page.goto(BASE + "/admin/dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  if (page.url().includes("select-context")) {
    const btn = page.locator("button", { hasText: rol }).first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForURL(/\/admin\/dashboard/, { timeout: 120000 });
      await page.waitForTimeout(4000);
    }
  }
}

export async function go(page, path, wait = 4500) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(wait);
}

export async function shot(page, name, opts = {}) {
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${name}.png`, ...opts });
  console.log("  ✓", name);
}
