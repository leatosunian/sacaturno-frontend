import Link from "next/link";
import { LuBuilding2 } from "react-icons/lu";

const NoBusinessEmptyState: React.FC = () => {
  return (
    <div
      style={{ height: "calc(100vh - 64px)" }}
      className="flex flex-col items-center justify-center gap-6 text-center"
    >
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 border border-orange-100">
        <LuBuilding2 className="w-7 h-7 text-orange-600" />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase text-orange-600">
          Acción requerida
        </span>
        <h3 className="text-xl font-bold text-gray-800">
          Todavía no tenés una empresa
        </h3>
        <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
          Creá tu empresa para configurar tu agenda y empezar a recibir turnos.
        </p>
      </div>
      <Link href="/admin/business/create">
        <button className="bg-orange-600 hover:bg-[#d92f04] text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
          Crear mi empresa
        </button>
      </Link>
    </div>
  );
};

export default NoBusinessEmptyState;
