"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosReq from "@/config/axios";

const BackstageLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const login = await axiosReq.post("/superadmin/login", { email, password });
      const { token } = login.data;

      await fetch("/api/backstage/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });

      router.push("/backstage");
      router.refresh();
    } catch (err) {
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase text-gray-400">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-orange-600"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium uppercase text-gray-400">Contraseña</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition-colors focus:border-orange-600"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 h-10 w-full rounded-lg bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
};

export default BackstageLoginForm;
