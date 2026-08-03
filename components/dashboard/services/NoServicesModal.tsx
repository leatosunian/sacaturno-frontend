"use client";
import Link from "next/link";
import { Wrench } from "lucide-react";

const NoServicesModal: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-6 py-2 text-center">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 border border-orange-100">
        <Wrench className="w-7 h-7 text-orange-600" />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase  text-orange-600">
          Acción requerida
        </span>
        <h3 className="text-xl font-bold text-gray-800">
          No tenés servicios creados
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
          Necesitás al menos un servicio para empezar a gestionar tus turnos.
        </p>
      </div>

      <Link href="/admin/services" className="w-full mt-1">
        <button className="w-full bg-primary hover:bg-orange-500 text-white text-sm font-semibold py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
          Crear mi primer servicio
        </button>
      </Link>
    </div>
  );
};

export default NoServicesModal;
