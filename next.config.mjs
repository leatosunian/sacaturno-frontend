/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "sacaturno.com.ar" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    unoptimized: true,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        // Único punto enmarcable del sitio, y sólo desde el propio origen: /demo
        // muestra el escenario dentro de dos iframes. Es una pantalla sin sesión
        // ni acciones reales, así que no hay nada que secuestrar por clickjacking.
        source: "/demo/stage",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/((?!demo/stage).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Fuerza HTTPS durante 1 año. Netlify ya sirve todo por HTTPS, así que
          // no rompe nada. Sin includeSubDomains/preload por ahora (reversible).
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          // Desactiva APIs sensibles que la app no usa: si inyectan algo, no
          // puede pedir cámara/micrófono/ubicación del usuario.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;