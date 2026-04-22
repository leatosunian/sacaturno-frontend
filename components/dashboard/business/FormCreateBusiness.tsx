"use client";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createBusinessSchema } from "@/app/schemas/createBusinessSchema";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { LuBuilding2, LuClock, LuMail, LuMapPin, LuPhone, LuPlus } from "react-icons/lu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

interface formInputs {
  name: string;
  businessType: string;
  address: string;
  appointmentDuration: string;
  dayStart: string;
  dayEnd: string;
  email: string;
  phone: number;
  slug: string;
}

const inputClass = (hasError: boolean) =>
  `h-9 w-full rounded-md border px-3 text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${
    hasError ? "border-red-500" : "border-gray-200"
  }`;

const FormCreateBusiness: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(createBusinessSchema),
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setValue("dayStart", "8");
    setValue("dayEnd", "17");
    setValue("appointmentDuration", "60");
    return () => setLoading(false);
  }, []);

  const createBusiness = async (data: FieldValues) => {
    if (parseInt(data.dayStart) > parseInt(data.dayEnd)) {
      toast.error("El horario de inicio no puede ser mayor al horario de cierre");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      const userID = localStorage.getItem("sacaturno_userID");
      data.ownerID = userID;
      const authHeader = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axiosReq.post("/business/create", data, authHeader);
      if (res.data.businessData === "BUSINESS_EXISTS") {
        toast.error("Solo podés añadir una empresa");
        setLoading(false);
        return;
      }
      setLoading(false);
      setIsCreated(true);
      setTimeout(() => {
        router.refresh();
        router.push("/admin/business/settings");
      }, 4000);
    } catch {
      setLoading(false);
      toast.error("Error al crear empresa");
    }
  };

  return (
    <>
      <Dialog open={isCreated}>
        <DialogContent className="rounded-2xl max-w-sm">
          <div className="flex flex-col items-center gap-4 py-6">
            <BsFillCheckCircleFill size={64} color="#4bc720" />
            <h4 className="text-base font-semibold text-gray-800 text-center">
              ¡Empresa creada exitosamente!
            </h4>
            <p className="text-sm text-gray-500 text-center">
              Ahora agregá un servicio antes de comenzar a cargar tus turnos.
            </p>
            <div className="loaderSmall mt-2" />
            <span className="text-sm text-gray-400">Redirigiendo...</span>
          </div>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit(createBusiness)} className="flex flex-col gap-4 w-full">
        {/* Identidad */}
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <LuBuilding2 size={16} className="text-orange-600" />
            <h2 className="text-base font-semibold text-gray-800">Identidad</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nombre de la empresa</label>
              <input
                type="text"
                maxLength={30}
                placeholder="Ej: Peluquería Central"
                {...register("name")}
                className={inputClass(!!errors.name)}
              />
              {errors.name?.message && (
                <span className="text-sm text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Rubro principal</label>
              <input
                type="text"
                maxLength={20}
                placeholder="Ej: Peluquería"
                {...register("businessType")}
                className={inputClass(!!errors.businessType)}
              />
              {errors.businessType?.message && (
                <span className="text-sm text-red-500">{errors.businessType.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                <LuMapPin size={11} className="inline mr-1 text-gray-400" />
                Domicilio de sucursal
              </label>
              <input
                type="text"
                maxLength={40}
                placeholder="Calle, número, ciudad"
                {...register("address")}
                className={inputClass(!!errors.address)}
              />
              {errors.address?.message && (
                <span className="text-sm text-red-500">{errors.address.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Contacto y link */}
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <LuMail size={16} className="text-orange-600" />
            <h2 className="text-base font-semibold text-gray-800">Contacto y link público</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                <LuMail size={11} className="inline mr-1 text-gray-400" />
                Email de contacto
              </label>
              <input
                type="text"
                maxLength={40}
                placeholder="contacto@empresa.com"
                {...register("email")}
                className={inputClass(!!errors.email)}
              />
              {errors.email?.message && (
                <span className="text-sm text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                <LuPhone size={11} className="inline mr-1 text-gray-400" />
                Teléfono de contacto
              </label>
              <input
                type="number"
                maxLength={40}
                placeholder="Ej: 2234567890"
                {...register("phone")}
                className={inputClass(!!errors.phone)}
              />
              {errors.phone?.message && (
                <span className="text-sm text-red-500">{errors.phone.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Link público</label>
              <p className="text-sm text-gray-400">
                El link que compartís con tus clientes para que reserven turnos online.
              </p>
              <div
                className={`flex items-center h-9 rounded-md border overflow-hidden bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus-within:border-orange-600 ${
                  errors.slug ? "border-red-500" : "border-gray-200"
                }`}
              >
                <span className="px-3 text-sm text-gray-500 bg-gray-100 h-full flex items-center border-r border-gray-200 whitespace-nowrap flex-shrink-0">
                  sacaturno.com.ar/
                </span>
                <input
                  type="text"
                  maxLength={30}
                  placeholder="mi-empresa"
                  {...register("slug")}
                  className="flex-1 h-full px-3 text-sm bg-[rgb(235,235,235)] focus:outline-none"
                />
              </div>
              {errors.slug?.message && (
                <span className="text-sm text-red-500">{errors.slug.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Configuración de turnos */}
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <LuClock size={16} className="text-orange-600" />
            <h2 className="text-base font-semibold text-gray-800">Configuración de turnos</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Duración del turno (min)</label>
              <select
                {...register("appointmentDuration")}
                className="h-9 w-full rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Apertura (hora)</label>
              <select
                {...register("dayStart")}
                className="h-9 w-full rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i)}>
                    {String(i).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Cierre (hora)</label>
              <select
                {...register("dayEnd")}
                className="h-9 w-full rounded-md border border-gray-200 bg-[rgb(235,235,235)] px-3 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={String(i)}>
                    {String(i).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          {loading ? (
            <div className="flex items-center justify-center w-32 h-9">
              <div className="loaderSmall" />
            </div>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 bg-orange-600 hover:bg-[#d92f04] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
            >
              <LuPlus size={14} />
              Crear empresa
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default FormCreateBusiness;
