<div align="center">

<img src="public/sacaturno-orange.svg" alt="SacaTurno" width="220" />

### La plataforma de turnos online para peluquerías, barberías, spas y centros de estética en Argentina

[![Live Site](https://img.shields.io/badge/demo-sacaturno.com.ar-orange?style=flat-square)](https://sacaturno.com.ar)
[![Next.js](https://img.shields.io/badge/Next.js-13-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[Sitio en producción](https://sacaturno.com.ar) · [Repo del backend](https://github.com/tosunian-dev/sacaturno-server)

</div>

---

## Qué es SacaTurno

**SacaTurno** es un SaaS full-stack de gestión de turnos pensado para negocios de servicios (peluquerías, barberías, spas, consultorios, etc.) en Argentina. Cada negocio obtiene su propia página pública de reservas (`sacaturno.com.ar/su-negocio`) y un panel de administración completo para manejar agenda, empleados, sucursales, servicios y cobros.

Este repositorio es el **frontend**: una app Next.js que sirve tanto el sitio público (landing, búsqueda de negocios, páginas de reserva) como el panel de administración privado. Toda la lógica de negocio vive en un [backend Express/MongoDB separado](https://github.com/tosunian-dev/sacaturno-server), consumido vía API REST.

> Proyecto personal desarrollado end-to-end (producto, diseño y código) por [Leandro Tosunian](https://github.com/leatosunian), actualmente en producción con usuarios reales.

## Funcionalidades principales

**Sitio público**
- Landing page con features, precios y testimonios
- Búsqueda de negocios por rubro/localidad (`/public/search`)
- Página de reserva por negocio (`/[slug]`) con selección de servicio, profesional, sucursal y horario disponible
- Cobro de seña online vía Mercado Pago cuando el servicio lo requiere
- Cancelación de turnos por parte del cliente (con link único, sin necesidad de cuenta)

**Panel de administración (`/admin`)**
- Agenda con calendario (React Big Calendar), filtrable por empleado y sucursal
- Gestión de servicios, precios y seña requerida por servicio
- Gestión de empleados con permisos granulares y login propio
- Gestión de múltiples sucursales (soft delete, asignación de empleados)
- Conexión de la cuenta de Mercado Pago del negocio (OAuth Marketplace) para cobrar señas directo a su cuenta
- Suscripción del negocio a SacaTurno por niveles (Básico / Pro / Full)
- Centro de ayuda integrado con guías paso a paso
- Analytics de uso del negocio

**Cuenta y accesos**
- Registro/login con email y contraseña o con Google (Identity Services)
- Recuperación de contraseña por email
- Verificación de cuenta por email
- Rutas protegidas por rol (dueño, empleado) vía middleware de Next.js

## Stack técnico

| Área | Tecnología |
|---|---|
| Framework | Next.js 13 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS + shadcn/ui + CSS Modules |
| Formularios | React Hook Form + Zod |
| Data fetching | Axios + SWR |
| Estado de auth | React Context |
| Calendario | React Big Calendar |
| Animaciones | Framer Motion |
| Notificaciones | Sonner |
| Pagos | Mercado Pago (Checkout Pro, vía backend) |
| Deploy | Netlify |

## Arquitectura del repo

```
app/
├── (home)/            # Landing pública
├── [slug]/            # Página pública de reserva de cada negocio
├── admin/             # Panel de administración (protegido)
├── backstage/         # Panel interno del dueño de la plataforma (analytics globales)
├── public/            # Búsqueda de negocios
├── login/ register/   # Autenticación
├── comparar/          # Landings comparativas / SEO
├── api/               # API routes de Next.js (proxy delgado hacia el backend)
└── schemas/           # Esquemas Zod para formularios

components/            # Componentes React (UI, dashboard, público)
config/axios.tsx       # Instancia de Axios apuntando al backend
context/               # AuthContext (estado global de sesión)
interfaces/            # Interfaces TS compartidas, calcadas de los schemas de Mongoose
middleware.ts          # Protección de rutas /admin/*
lib/                   # Utilidades (categorías de negocio, imágenes, toasts, etc.)
```

### Flujo de autenticación

1. El usuario envía sus credenciales a la API route `/api/login` de Next.js.
2. Esa ruta reenvía la petición al backend Express, que valida y devuelve un JWT.
3. El token se guarda en cookies `httpOnly` (`sacaturno_token`, `sacaturno_userID`).
4. `middleware.ts` valida esas cookies antes de dejar pasar a cualquier ruta `/admin/*`.
5. `AuthContext` mantiene el estado de sesión en el cliente; `/api/checkauth` revalida el JWT contra el backend.

Las API routes de Next.js son solo una capa fina de proxy: **toda la lógica de negocio vive en el backend**.

### Pagos: seña con Mercado Pago

Cuando un servicio tiene `depositAmount > 0`, la reserva exige el pago de una seña antes de confirmarse. El negocio conecta su propia cuenta de Mercado Pago vía OAuth (Marketplace), así que el dinero de la seña va directo a su cuenta — SacaTurno nunca lo retiene. El checkout se resuelve en el backend; ver el repo del servidor para el detalle del flujo y los webhooks.

## Poner el proyecto a correr localmente

```bash
git clone https://github.com/leatosunian/sacaturno-frontend.git
cd sacaturno-frontend
npm install
```

Crear un archivo `.env` en la raíz:

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000/api
MONGO_URL=
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
SERVER_URL=http://localhost:4000
```

> Necesita el [backend](https://github.com/tosunian-dev/sacaturno-server) corriendo en paralelo en `http://localhost:4000`.

```bash
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run lint     # ESLint
```

## Repos relacionados

- 🔗 **Backend** (API REST, Express + MongoDB): [sacaturno-server](https://github.com/tosunian-dev/sacaturno-server)

---

<div align="center">

Hecho por [Leandro Tosunian](https://github.com/leatosunian)

</div>
