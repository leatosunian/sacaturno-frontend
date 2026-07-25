"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { HiOutlineBuildingOffice2, HiOutlineUser } from "react-icons/hi2";

interface Context {
  role: "owner" | "employee";
  businessID: string;
  businessName: string;
  employeeID?: string;
}

export default function SelectContextPage() {
  const [contexts, setContexts] = useState<Context[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchContexts = async () => {
      try {
        const res = await fetch("/api/contexts");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const ctxs: Context[] = await res.json();

        if (ctxs.length === 0) {
          await selectContext({ role: "owner", businessID: "", businessName: "" });
          return;
        }
        if (ctxs.length === 1) {
          await selectContext(ctxs[0]);
          return;
        }
        setContexts(ctxs);
        setLoading(false);
      } catch {
        router.push("/login");
      }
    };
    fetchContexts();
  }, []);

  const selectContext = async (ctx: Context) => {
    setSelecting(true);
    const res = await fetch("/api/select-context", {
      method: "POST",
      body: JSON.stringify({ role: ctx.role, businessID: ctx.businessID, employeeID: ctx.employeeID }),
      headers: { "content-type": "application/json" },
    });
    const data = await res.json();
    if (data.contextToken) {
      localStorage.setItem("sacaturno_token", data.contextToken);
    }
    router.push("/admin/dashboard");
    router.refresh();
  };

  if (loading || selecting) {
    return (
      <div className="pageLoader">
        <div className="pageLoaderInner">
          <Image
            src="/sacaturno-orange.svg"
            alt="SacaTurno"
            width={180}
            height={45}
            className="pageLoaderLogo"
          />
          <div className="pageLoaderTrack">
            <div className="pageLoaderFill" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "calc(100vh - 64px)" }} className="flex flex-col items-center justify-center w-full px-4">
      <div className="flex flex-col items-center gap-2 mb-8 text-center">
        <h1 className="text-xl font-semibold text-gray-800">Iniciá sesión como</h1>
        <p className="text-sm text-gray-400">Seleccioná el perfil con el que querés continuar</p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        {contexts.map((ctx, i) => (
          <button
            key={i}
            onClick={() => selectContext(ctx)}
            className="flex items-center gap-4 w-full px-5 py-4 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-800 hover:border-orange-300 hover:shadow-md transition-all duration-200 text-left"
          >
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
              style={{
                backgroundColor: ctx.role === "owner" ? "#dd4924" : "#f5f5f5",
              }}
            >
              {ctx.role === "owner" ? (
                <HiOutlineBuildingOffice2 size={18} color="white" />
              ) : (
                <HiOutlineUser size={18} color="#666" />
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold leading-tight">{ctx.businessName || "Mi empresa"}</span>
              <span className="text-xs text-gray-400 capitalize">
                {ctx.role === "owner" ? "Dueño" : "Empleado"}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
