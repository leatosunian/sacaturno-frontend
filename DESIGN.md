# DESIGN.md — SacaTurno Design System

**IMPORTANT FOR CLAUDE CODE:** Read this file in full before creating or modifying any UI component. Every decision about colors, spacing, typography, shadows, animations, and component structure must follow these patterns. When in doubt, copy from existing components — never invent new visual patterns.

---

## 1. CONTEXT: TWO VISUAL SURFACES

SacaTurno has two distinct UI contexts. Always identify which one you're building for before writing a single class.

| | PUBLIC (`/`, `/login`, `/[slug]`, `/public/*`) | ADMIN (`/admin/*`) |
|---|---|---|
| **Mood** | Marketing, bold, premium | Utility, dense, functional |
| **Cards** | Glassmorphism + heavy blur | Flat white + subtle shadow |
| **Buttons** | Animated color-swap on hover | Simple solid or outline |
| **Typography** | Large headlines (text-4xl–6xl) | Compact labels (text-xs–sm) |
| **Animations** | Framer Motion staggered reveals | Minimal, state-based only |
| **Input BG** | Transparent / semi-transparent | `rgb(235, 235, 235)` gray |
| **Spacing** | Generous (px-32, py-24) | Tight (p-4–6, gap-2–4) |

---

## 2. COLOR SYSTEM

### Brand Colors (always use these — never invent new brand colors)
```
Orange primary:   #dd4924   (CTAs, active states, icons, hover accents)
Orange darker:    #d92f04   (hover state of orange elements)
Dark header/nav:  #060606   (header backgrounds, dark surfaces)
Deep blue accent: #111a30   (calendar active, rare alternative dark)
```

### Tailwind Semantic Usage
```
Orange:      bg-orange-600 / text-orange-600 / border-orange-600
Black:       bg-black / text-black
White:       bg-white / text-white
Light gray:  bg-gray-100 / text-gray-500 / text-gray-800
Error red:   text-red-600 / bg-red-600    (#c41313 or #6d0b0b for dark contexts)
Success:     text-green-500               (#4bc720)
Muted text:  text-gray-400 / text-gray-500
```

### CSS Variable Colors (use via Tailwind aliases in shadcn/ui components)
```
bg-background / text-foreground       → white / near-black
bg-primary / text-primary-foreground  → near-black / white
bg-muted / text-muted-foreground      → light gray / medium gray
bg-destructive                        → red
border-input                          → light gray border
```

### Rules
- **Never use arbitrary hex colors** in Tailwind classes unless applying to `style={}` inline. Use `bg-orange-600`, not `bg-[#dd4924]`.
- The only exception is custom CSS Modules where you may write `color: #dd4924` directly.
- Use `bg-black` for header/nav backgrounds, not `bg-gray-900` or `bg-slate-900`.

---

## 3. TYPOGRAPHY

### Font
- **Montserrat** is the only font. It's set globally in `/app/layout.tsx`. Never add another font.

### Size Scale (what the project actually uses)
```
text-xs    → 12px  — table cells, form labels, badges, nav links (admin), small helper text
text-sm    → 14px  — body text, form descriptions, card subtitles
text-base  → 16px  — standard prose (rare)
text-lg    → 18px  — section subheadings, card titles (admin)
text-xl    → 20px  — medium headings
text-2xl   → 24px  — section headings
text-3xl   → 30px  — page headings
text-4xl   → 36px  — large section headings (public)
text-5xl   → 48px  — hero secondary headings (public)
text-6xl   → 60px  — hero primary heading (public only, use sparingly)
```

### Weight
```
font-medium   → labels, nav links, slightly emphasized text
font-semibold → card titles, headings, strong emphasis (most common)
font-bold     → CTAs, hero headings, primary actions
```

### Rules
- Admin panel: keep text tight — `text-xs` for labels, `text-sm` for body.
- Public site: be bold — `text-4xl font-bold` or larger for section headlines.
- Never use `font-thin` or `font-light` unless mimicking existing homepage subtitle style.

---

## 4. SPACING

### Gap (flex/grid children)
```
gap-1  → very tight (icon + label pairs)
gap-2  → default tight (form field elements, inline groups) ← most common
gap-3  → comfortable (form sections within a card)
gap-4  → standard (card-to-card, section items)
gap-5  → medium sections
gap-6  → section spacing
gap-12 → between major content blocks
```

### Padding
```
p-4 / p-6             → card interior
px-3 py-2             → button default
px-4 / px-6           → container sides
px-8 / px-12 / px-32  → wide layout sections (public hero)
pt-10 / pt-24         → section top spacing (public)
```

### Margin
```
mb-2 / mb-3 / mb-4    → spacing below headings/labels
mt-4 / mt-10          → section separation
```

---

## 5. BORDER RADIUS

```
rounded-sm  → subtle (very rare)
rounded-md  → 6px — default for most elements (inputs, small cards, badges in admin)
rounded-lg  → 8px — buttons, medium cards
rounded-xl  → 12px — larger cards, containers
rounded-2xl → 16px — dialog close button, pill-shaped elements
rounded-full → circles, pill badges, avatar containers
```

**CSS Module custom values (in .module.css files):**
```css
border-radius: 7px;   /* form inputs */
border-radius: 8px;   /* nav items, dropdowns */
border-radius: 15px;  /* large card containers */
```

---

## 6. SHADOWS

### Tailwind
```
shadow-sm  → subtle (input, small button)
shadow-md  → standard card
shadow-lg  → elevated card
shadow-xl  → modal, prominent card
shadow-2xl → hero elements
```

### CSS Module Custom Shadows (copy exactly)
```css
/* Standard card shadow */
box-shadow: -10px 10px 25px 1px rgba(0, 0, 0, 0.16);
-webkit-box-shadow: 7px 10px 25px 1px rgba(0, 0, 0, 0.16);

/* Heavy card shadow */
box-shadow: -10px 10px 25px 1px rgba(0, 0, 0, 0.3);

/* Light utility shadow */
box-shadow: 5px 5px 8px hsla(0, 0%, 12%, 0.17);
```

---

## 7. GLASSMORPHISM (PUBLIC SURFACE ONLY)

Use glassmorphism **only** on public-facing pages. Never in the admin panel.

```css
/* Standard glass card */
background-color: rgba(0, 0, 0, 0.082);
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
border: 1px solid rgba(156, 156, 156, 0.1);
border-radius: 15px;
box-shadow: -10px 10px 25px 1px rgba(0, 0, 0, 0.2);

/* Premium glass card (pricing, hero) */
background-color: rgba(0, 0, 0, 0.116);
backdrop-filter: blur(30px);
-webkit-backdrop-filter: blur(30px);
border: 1px solid rgba(156, 156, 156, 0.1);
border-radius: 15px;
box-shadow: -10px 10px 25px 1px rgba(0, 0, 0, 0.2);
```

**Modal overlay (both surfaces):**
```css
background-color: rgba(0, 0, 0, 0.4);
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
```

---

## 8. COMPONENT RECIPES

### 8.1 BUTTONS

#### Public — Animated Primary (CSS Module)
```css
/* In .module.css */
.btnPrimary {
  padding: 10px 23px;
  color: white;
  background: #dd4924;
  border: 2px solid #dd4924;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  box-shadow: inset 0 0 0 0 white;
  transition: ease-out 0.5s;
  cursor: pointer;
}
.btnPrimary:hover {
  box-shadow: inset 0 -100px 0 0 white;
  color: #dd4924;
}
```

#### Public — Dark Secondary (CSS Module)
```css
.btnSecondary {
  padding: 10px 23px;
  color: white;
  background-color: rgb(15, 23, 42);
  border: 1px solid rgb(15, 23, 42);
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  transition: 0.3s ease-in-out;
  cursor: pointer;
}
.btnSecondary:hover {
  background-color: white;
  color: rgb(15, 23, 42);
}
```

#### Public — Translucent (login/auth pages, CSS Module)
```css
.btnTranslucent {
  background-color: rgba(0, 0, 0, 0.082);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 6px 13px;
  border-radius: 7px;
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease-in-out all;
}
.btnTranslucent:hover {
  border: 1px solid #dd4924;
}
```

#### Admin — Solid Orange (Tailwind, most common CTA)
```tsx
<button className="bg-orange-600 hover:bg-[#d92f04] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
  Guardar
</button>
```

#### Admin — Outline (secondary action)
```tsx
<button className="border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
  Cancelar
</button>
```

#### Admin — Destructive
```tsx
<button className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
  Eliminar
</button>
```

#### shadcn/ui Button (when using the component)
```tsx
import { Button } from "@/components/ui/button"
// Variants: default | destructive | outline | secondary | ghost | link
// Sizes: default | sm | lg | icon
<Button variant="outline" size="sm">Acción</Button>
```

---

### 8.2 FORM INPUTS

#### Admin — Standard Input (Tailwind)
```tsx
<div className="flex flex-col gap-1">
  <label className="text-xs font-medium text-gray-700">Nombre</label>
  <input
    className="h-8 w-full rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 text-xs
               transition-all duration-200 ease-in-out
               hover:border-orange-600 focus:border-orange-600 focus:outline-none focus:bg-gray-100"
    placeholder="Ingresá el nombre"
  />
</div>
```

#### Admin — Input with Error (React Hook Form + Zod)
```tsx
<div className="flex flex-col gap-1">
  <label className="text-xs font-medium text-gray-700">Email</label>
  <input
    {...register("email")}
    className={`h-8 w-full rounded-md border px-3 text-xs bg-[rgb(235,235,235)]
               transition-all duration-200 ease-in-out
               hover:border-orange-600 focus:border-orange-600 focus:outline-none
               ${errors.email ? "border-red-500" : "border-gray-200"}`}
  />
  {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
</div>
```

#### Public — Transparent Input (login/auth, CSS Module)
```css
.input {
  height: 30px;
  width: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 7px;
  background-color: rgba(0, 0, 0, 0.05);
  font-size: 13px;
  padding: 0 10px;
  transition: all ease-in-out 0.2s;
}
.input:hover { border: 1px solid #dd4924; }
.input:focus {
  background-color: rgba(0, 0, 0, 0.08);
  border: 1px solid #dd4924;
  outline: none;
}
```

#### Select (shadcn/ui)
```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
<Select>
  <SelectTrigger className="h-8 text-xs border-gray-200 bg-[rgb(235,235,235)]">
    <SelectValue placeholder="Seleccioná" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1" className="text-xs">Opción 1</SelectItem>
  </SelectContent>
</Select>
```

---

### 8.3 CARDS

#### Admin — Standard Card (Tailwind)
```tsx
<div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-lg">
  <h2 className="text-lg font-semibold text-gray-800">Título</h2>
  <p className="text-sm text-gray-500">Descripción o contenido</p>
</div>
```

#### Admin — Card with Header and Action
```tsx
<div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
    <h2 className="text-sm font-semibold text-gray-800">Sección</h2>
    <button className="text-xs text-orange-600 hover:underline">Ver todo</button>
  </div>
  <div className="p-6">
    {/* content */}
  </div>
</div>
```

#### Public — Glass Card (CSS Module)
```css
.glassCard {
  border-radius: 15px;
  padding: 30px;
  background-color: rgba(0, 0, 0, 0.116);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(156, 156, 156, 0.1);
  box-shadow: -10px 10px 25px 1px rgba(0, 0, 0, 0.2);
}
```

#### Public — White Feature Card (CSS Module)
```css
.featureCard {
  border-radius: 15px;
  padding: 30px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: -10px 10px 25px 1px rgba(0, 0, 0, 0.15);
}
```

#### shadcn/ui Card
```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
<Card className="shadow-lg">
  <CardHeader>
    <CardTitle className="text-sm font-semibold">Título</CardTitle>
    <CardDescription className="text-xs">Descripción</CardDescription>
  </CardHeader>
  <CardContent className="text-xs text-gray-600">
    Contenido
  </CardContent>
</Card>
```

---

### 8.4 MODALS / DIALOGS

#### Admin — shadcn/ui Dialog (preferred)
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="rounded-2xl max-w-lg">
    <DialogHeader>
      <DialogTitle className="text-base font-semibold">Título del modal</DialogTitle>
    </DialogHeader>
    <div className="flex flex-col gap-4 pt-2">
      {/* form or content */}
    </div>
    <div className="flex justify-end gap-2 pt-2">
      <button onClick={() => setOpen(false)}
        className="border border-gray-200 text-gray-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">
        Cancelar
      </button>
      <button className="bg-orange-600 hover:bg-[#d92f04] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300">
        Confirmar
      </button>
    </div>
  </DialogContent>
</Dialog>
```

#### Custom Modal Overlay (CSS Module, when not using shadcn)
```css
.modalOverlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modalContainer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30px;
  width: 55vw;
  max-width: 600px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 15px;
  box-shadow: -10px 10px 25px 1px rgba(0, 0, 0, 0.15);
}
```

---

### 8.5 BADGES / TAGS

#### Status Badge (Tailwind)
```tsx
/* Success */
<span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">Activo</span>

/* Warning */
<span className="text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">Pendiente</span>

/* Error */
<span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700">Cancelado</span>

/* Neutral */
<span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">Inactivo</span>
```

#### Public Brand Badge (section labels)
```tsx
<span className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium">
  ¿Por qué elegirnos?
</span>
```

---

### 8.6 TABLES (Admin Data Lists)

```tsx
<div className="w-full overflow-hidden rounded-xl border border-gray-100 shadow-lg">
  <table className="w-full text-xs">
    <thead>
      <tr className="bg-gray-50 border-b border-gray-100">
        <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
        <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
        <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
        <th className="px-4 py-3"></th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b border-gray-50 hover:bg-gray-50 transition-colors duration-150">
        <td className="px-4 py-3 text-gray-800 font-medium">Juan García</td>
        <td className="px-4 py-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">Activo</span>
        </td>
        <td className="px-4 py-3 text-gray-500">12/04/2026</td>
        <td className="px-4 py-3 text-right">
          <button className="text-orange-600 hover:underline text-xs font-medium">Editar</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### 8.7 LOADING STATES

#### Spinner (from globals.css `.loader`)
```tsx
<div className="loader" /> {/* Uses global CSS animation */}
```

#### shadcn/ui Skeleton
```tsx
import { Skeleton } from "@/components/ui/skeleton"
<Skeleton className="h-8 w-full rounded-md" />
<Skeleton className="h-4 w-3/4 rounded-md" />
```

#### Inline Loading Button State
```tsx
<button disabled={isLoading} className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300">
  {isLoading ? "Guardando..." : "Guardar"}
</button>
```

---

### 8.8 NAVIGATION

#### Admin Header Nav Link (CSS Module pattern)
```css
.navLink {
  color: white;
  text-transform: uppercase;
  font-size: 11.5px;
  font-weight: 500;
  letter-spacing: -0.2px;
  padding: 6px 10px;
  border-radius: 6px;
  transition: 0.2s ease-in-out all;
  cursor: pointer;
}
.navLink:hover { color: #dd4924; }
.navLinkActive { color: #dd4924; }
```

#### Public Header Nav Link (Tailwind)
```tsx
<a className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white
              bg-black border border-white border-opacity-30 rounded-lg
              hover:bg-orange-600 hover:border-orange-600
              transition-all duration-300 ease-in-out cursor-pointer">
  Funcionalidades
</a>
```

---

### 8.9 SECTION LAYOUTS

#### Public — Hero Section
```tsx
<section className="flex flex-col items-center justify-center text-center px-6 md:px-32"
  style={{ height: "calc(100vh - 64px)" }}>
  <span className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium mb-4">
    Label de sección
  </span>
  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
    Título principal
  </h1>
  <p className="text-lg text-gray-500 max-w-2xl mb-8">
    Subtítulo descriptivo con información clave
  </p>
  <div className="flex items-center gap-4">
    {/* CTA buttons */}
  </div>
</section>
```

#### Public — Feature Section
```tsx
<section className="flex flex-col items-center py-24 px-6 md:px-32">
  <span className="rounded-full text-orange-600 bg-orange-50 px-4 py-1.5 text-sm font-medium mb-4">
    Funcionalidades
  </span>
  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
    Título de sección
  </h2>
  <p className="text-base text-gray-500 text-center max-w-xl mb-12">
    Descripción corta de la sección
  </p>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
    {/* Cards */}
  </div>
</section>
```

#### Admin — Dashboard Page Layout
```tsx
<div className="flex flex-col gap-6 w-full max-w-screen-lg mx-auto px-4 py-6">
  <div className="flex items-center justify-between">
    <h1 className="text-lg font-semibold text-gray-800">Título de página</h1>
    <button className="bg-orange-600 hover:bg-[#d92f04] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300">
      + Nueva acción
    </button>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Content cards */}
  </div>
</div>
```

#### Admin — Form Page Layout
```tsx
<div className="flex flex-col gap-6 w-full max-w-screen-lg mx-auto px-4 py-6">
  <h1 className="text-lg font-semibold text-gray-800">Configuración</h1>
  <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-gray-100 shadow-lg">
    <h2 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">Sección del formulario</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Form inputs */}
    </div>
    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
      <button className="bg-orange-600 hover:bg-[#d92f04] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-300">
        Guardar cambios
      </button>
    </div>
  </div>
</div>
```

---

## 9. ANIMATIONS

### Framer Motion (PUBLIC surface only, minimal use in admin)

```tsx
import { motion } from "framer-motion"

// Container with staggered children
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
}

<motion.ul variants={container} initial="hidden" animate="show">
  {items.map(i => (
    <motion.li key={i} variants={item}>...</motion.li>
  ))}
</motion.ul>

// Scroll reveal
<motion.div
  initial={{ opacity: 0, x: 10 }}
  whileInView={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.7, ease: "easeInOut" }}
>
```

### CSS Transitions (ALL surfaces)
```
transition-all duration-300 ease-in-out   ← default for interactive elements
transition-colors duration-200             ← for color-only changes
transition-transform duration-300          ← for scale/translate
```

### Rules
- Admin: **no Framer Motion**. Use Tailwind transitions only.
- Public: use Framer Motion for scroll reveals and staggered lists.
- Hover transitions: always `duration-300 ease-in-out` or `duration-200 ease-in-out`.
- Never use `duration-500` or longer for interactive elements.

---

## 10. TOAST NOTIFICATIONS

```tsx
import { toast } from "sonner"

toast.success("Turno guardado correctamente")
toast.error("Ocurrió un error al guardar")
toast.warning("Verificá los datos ingresados")
toast("Procesando...")
```

The Sonner component is globally configured in the layout — just call `toast()` anywhere.

---

## 11. RESPONSIVENESS

### Breakpoints used
```
Default (mobile-first) → base styles for mobile
md: → 768px — tablet and desktop layout changes
lg: → 1024px — wide desktop
xl: → 1280px — extra wide
```

### Common Responsive Patterns
```tsx
// Layout switch
<div className="flex flex-col md:flex-row gap-4">

// Text size scaling
<h1 className="text-3xl md:text-5xl font-bold">

// Grid columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Visibility toggle
<nav className="hidden md:flex items-center gap-3">
<button className="block md:hidden">  {/* hamburger */}

// Width adaptation
<div className="w-full md:w-2/5">

// Padding scaling
<section className="px-6 md:px-32">
```

---

## 12. UTILITIES & HELPER CLASSES (globals.css)

These global classes are available without importing a CSS module:

```
.loader          → orange spinning animation for full-page loading
.loaderSmall     → smaller version of loader
.modalCont       → full-screen blur overlay (backdrop-filter: blur(8px))
.borderShadow    → standard card shadow with border
.perfilPageCont  → centered page container (max-width, shadow, padding)
.orangeHover     → orange background hover effect
.blackOrangeHover → black background that turns orange on hover
.dottedBg        → dotted background pattern (public pages)
.backgroundOrangHover → background transitions to orange on hover
.textHoverToOrange → text transitions to #dd4924 on hover
```

---

## 13. CODING PATTERNS

### Component File Structure
```tsx
"use client" // only if needed (interactivity, hooks)

import { useState } from "react"
import styles from "@/app/css-modules/ComponentName.module.css"
// or: pure Tailwind if simple enough

interface Props {
  // typed props
}

export default function ComponentName({ prop }: Props) {
  return (
    <div className={styles.container}>
      {/* or Tailwind */}
    </div>
  )
}
```

### CSS Module vs Tailwind Decision
- **Use CSS Modules** when: complex hover animations (button color-swap), glassmorphism cards, multiple pseudo-elements, custom responsive breakpoints with many property changes.
- **Use Tailwind only** when: simple layout, static appearance, shadcn/ui components, admin panel components.
- **Avoid mixing both** in the same element — pick one per element.

### cn() Utility (conditional classes)
```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "flex flex-col gap-4 p-6 rounded-xl",
  isActive && "border-orange-600",
  isError && "border-red-500"
)}>
```

---

## 14. RULES SUMMARY (read before every component)

1. **Brand orange is `#dd4924`** — as `bg-orange-600` in Tailwind, as `#dd4924` in CSS Modules.
2. **Admin = no glassmorphism, no heavy animations, compact text (text-xs/sm).**
3. **Public = bold typography, glass effects allowed, Framer Motion for scroll reveals.**
4. **All interactive elements need** `transition-all duration-300 ease-in-out` minimum.
5. **Input hover and focus: always change border to orange (`border-orange-600` or `border: 1px solid #dd4924`).**
6. **Headers/navbars use `#060606` background** — not `bg-gray-900`, not `bg-slate-900`.
7. **Buttons in admin: primary = `bg-orange-600`, danger = `bg-red-600`, secondary = outline.**
8. **Font is Montserrat everywhere** — never import or declare another font.
9. **Spacing in admin: gap-2 to gap-4, p-4 to p-6** — keep it tight.
10. **Modals: use shadcn/ui `Dialog` in admin; custom CSS Module overlay in public** (or when Dialog doesn't fit).
11. **Never use Tailwind arbitrary values** like `bg-[#dd4924]` — map to closest Tailwind class or use CSS Module.
12. **Toasts via `toast()` from sonner** — never build custom notification UI.
13. **Always type component props** with a TypeScript `interface`.
14. **Validate forms with React Hook Form + Zod** — never manual state for form validation.
