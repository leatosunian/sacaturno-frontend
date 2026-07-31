"use client";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createBusinessSchema } from "@/app/schemas/createBusinessSchema";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { LuBuilding2, LuLink, LuMail, LuPlus } from "react-icons/lu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import RubroPicker from "./RubroPicker";

interface Props {
  userEmail: string;
}

interface formInputs {
  name: string;
  businessCategory: string;
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

const FormCreateBusiness: React.FC<Props> = ({ userEmail }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(createBusinessSchema),
    defaultValues: {
      appointmentDuration: "30",
      dayStart: "6",
      dayEnd: "22",
      businessCategory: "",
      businessType: "",
    },
  });

  register("businessCategory");
  register("businessType");
  const businessCategory = watch("businessCategory");
  const businessType = watch("businessType");

  const [loading, setLoading] = useState<boolean>(false);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setValue("dayStart", "8");
    setValue("dayEnd", "17");
    setValue("appointmentDuration", "60");
    if (userEmail) setValue("email", userEmail);
    return () => setLoading(false);
  }, [userEmail, setValue]);

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
        router.push("/admin/services");
      }, 4000);
    } catch {
      setLoading(false);
      toast.error("Error al crear empresa");
    }
  };

  return (
    <>
      <Dialog open={isCreated}>
        <DialogContent className="rounded-2xl max-w-sm" hideCloseButton>
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

      <form onSubmit={handleSubmit(createBusiness)} className="flex flex-col gap-6 sm:gap-4 w-full max-w-4xl">
        {/* Identidad */}
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <LuBuilding2 size={16} className="text-primary" />
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

            <div className="flex flex-col gap-1 md:col-span-2">
              <RubroPicker
                category={businessCategory}
                type={businessType}
                onChange={(cat, type) => {
                  setValue("businessCategory", cat, { shouldValidate: !!errors.businessCategory });
                  setValue("businessType", type, { shouldValidate: !!errors.businessType });
                }}
                categoryError={errors.businessCategory?.message}
                typeError={errors.businessType?.message}
              />
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">
                Domicilio del negocio <span className="text-xs font-normal text-gray-400">(opcional)</span>
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
            <LuMail size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-gray-800">Contacto y link público</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email de contacto</label>
              <input
                type="text"
                maxLength={40}
                placeholder="contacto@empresa.com"
                {...register("email")}
                className={inputClass(!!errors.email)}
              />
              {errors.email?.message ? (
                <span className="text-xs text-red-500">{errors.email.message}</span>
              ) : (
                <span className="text-xs text-gray-400">Heredado de tu cuenta. Podés cambiarlo.</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Teléfono de contacto</label>
              <input
                type="number"
                maxLength={40}
                placeholder="Ej: 2234567890"
                {...register("phone")}
                className={inputClass(!!errors.phone)}
              />
              {errors.phone?.message && (
                <span className="text-xs text-red-500">{errors.phone.message}</span>
              )}
            </div>

            <div className="md:col-span-2 mt-1">
              <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/60 p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-600 text-white flex-shrink-0 shadow-sm">
                    <LuLink size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Tu link público de reservas</p>
                    <p className="text-xs text-gray-500">Compartí este link para que tus clientes reserven turnos online</p>
                  </div>
                </div>
                <div
                  className={`flex items-center h-9 rounded-lg border overflow-hidden bg-white shadow-sm transition-all duration-200 ease-in-out focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 ${
                    errors.slug ? "border-red-400" : "border-orange-200"
                  }`}
                >
                  <span className="px-3 text-sm text-orange-600 font-medium bg-orange-50 h-full flex items-center border-r border-orange-200 whitespace-nowrap flex-shrink-0">
                    sacaturno.com.ar/
                  </span>
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="mi-empresa"
                    {...register("slug")}
                    className="flex-1 h-full px-3 text-sm bg-white focus:outline-none text-gray-700 font-medium"
                  />
                </div>
                {errors.slug?.message && (
                  <span className="text-xs text-red-500">{errors.slug.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Configuración de turnos */}
        {/* <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <LuClock size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-gray-800">Franja horaria inicial</h2>
          </div>
          <div className="px-6 pt-4 pb-0">
            <p className="text-sm text-gray-400">
              Configurá tu franja horaria de trabajo habitual. Son valores estimativos que podés ajustar en cualquier momento desde el panel de agenda.
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Duración de cada turno</label>
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
              <label className="text-sm font-medium text-gray-700">Hora de apertura</label>
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
              <label className="text-sm font-medium text-gray-700">Hora de cierre</label>
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
        </div> */}

        {/* Submit */}
        <div className="flex justify-end">
          {loading ? (
            <div className="flex items-center justify-center w-32 h-9">
              <div className="loaderSmall" />
            </div>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
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
