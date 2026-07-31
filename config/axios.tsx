import axios from "axios";

const axiosReq = axios.create({
  baseURL:  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api'
})

// Sesión expirada / inválida: el backend responde 401. En navegaciones lo
// resuelve el middleware, pero si el token vence estando ya dentro del panel las
// llamadas client-side fallan sin redirigir. Acá limpiamos cookies y mandamos a
// /login para no dejar el panel con datos a medio cargar.
axiosReq.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/login")) {
        try { await fetch("/api/logout"); } catch {}
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosReq

