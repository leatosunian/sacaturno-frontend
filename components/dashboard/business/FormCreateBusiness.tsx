"use client";
import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { createBusinessSchema } from "@/app/schemas/createBusinessSchema";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { LuBuilding2, LuCamera, LuLink, LuMail, LuMapPin, LuPlus, LuX } from "react-icons/lu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import RubroPicker from "./RubroPicker";
import CancellationPolicyCard from "./CancellationPolicyCard";

interface Props {
  userEmail: string;
  userPhone?: number | null;
}

interface formInputs {
  name: string;
  businessCategory: string;
  businessType: string;
  street: string;
  number: string;
  city: string;
  province: string;
  appointmentDuration: string;
  dayStart: string;
  dayEnd: string;
  email: string;
  phone: number;
  slug: string;
  cancellationWindowHours: number;
}

const inputClass = (hasError: boolean) =>
  `h-9 w-full rounded-md border px-3 text-sm bg-gray-50 transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${
    hasError ? "border-red-500" : "border-gray-200"
  }`;

const FormCreateBusiness: React.FC<Props> = ({ userEmail, userPhone }) => {
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
  register("cancellationWindowHours", { valueAsNumber: true });
  const businessCategory = watch("businessCategory");
  const businessType = watch("businessType");
  const cancellationWindowHours = watch("cancellationWindowHours");

  const [loading, setLoading] = useState<boolean>(false);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const slugField = register("slug");
  const streetField = register("street");
  const numberField = register("number");

  useEffect(() => {
    setValue("dayStart", "8");
    setValue("dayEnd", "17");
    setValue("appointmentDuration", "60");
    if (userEmail) setValue("email", userEmail);
    if (userPhone) setValue("phone", userPhone);
    return () => setLoading(false);
  }, [userEmail, userPhone, setValue]);

  // El preview es un object URL: hay que liberarlo al reemplazarlo y al desmontar.
  useEffect(() => {
    if (!logoPreview) return;
    return () => URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  const handleLogoInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const image = e.target.files?.[0];
    e.target.value = "";
    if (!image) return;

    // Los mismos tipos que acepta el multer del backend.
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(image.type)) {
      toast.error("Formato inválido. Usá JPG, PNG o WebP");
      return;
    }
    if (image.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5 MB");
      return;
    }

    setLogoFile(image);
    setLogoPreview(URL.createObjectURL(image));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  // La imagen se sube recién con la empresa creada: el endpoint la busca por el
  // ownerID del token. Si falla, la empresa ya existe y el logo se puede cargar
  // después desde el panel, así que no se corta el alta.
  const uploadLogo = async (token: string | null) => {
    if (!logoFile) return;
    try {
      const formData = new FormData();
      formData.append("profile_image", logoFile);
      await axiosReq.post("/business/updateimage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      toast.error("La empresa se creó, pero no pudimos subir el logo. Podés cargarlo desde tu perfil.");
    }
  };

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
      await uploadLogo(token);
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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <LuBuilding2 size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-gray-800">Identidad</h2>
          </div>
          <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-5 md:gap-6 items-start">
            {/* Logo (opcional) */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-full md:w-auto">
              <div
                onClick={() => logoInputRef.current?.click()}
                title="Elegir logo de empresa"
                className="relative cursor-pointer group rounded-full overflow-hidden w-20 h-20 border border-dashed border-gray-300 bg-gray-50 hover:border-orange-600 transition-all duration-200 ease-in-out"
              >
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="Logo de la empresa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 group-hover:text-orange-600 transition-colors duration-200">
                    <LuCamera size={20} />
                  </div>
                )}
                {logoPreview && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                    <LuCamera size={20} className="text-white" />
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  onChange={handleLogoInput}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  hidden
                />
              </div>
              {logoPreview ? (
                <button
                  type="button"
                  onClick={removeLogo}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
                >
                  <LuX size={11} />
                  Quitar
                </button>
              ) : (
                <span className="text-xs text-gray-400">Logo (opcional)</span>
              )}
            </div>

            {/* Campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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

            </div>
          </div>
        </div>

        {/* Domicilio */}
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <LuMapPin size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-gray-800">Domicilio del negocio</h2>
            <span className="text-xs font-normal text-gray-400">(opcional)</span>
          </div>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 max-w-2xl">
              <div className="flex flex-col gap-1 sm:col-span-8">
                <label className="text-sm font-medium text-gray-700">Calle</label>
                <input
                  type="text"
                  maxLength={70}
                  placeholder="Av. Corrientes"
                  {...streetField}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\d/g, "");
                    streetField.onChange(e);
                  }}
                  className={inputClass(!!errors.street)}
                />
                {errors.street?.message && (
                  <span className="text-xs text-red-500 leading-tight">{errors.street.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-1 sm:col-span-4">
                <label className="text-sm font-medium text-gray-700">Altura</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="1234"
                  {...numberField}
                  onChange={(e) => {
                    e.target.value = e.target.value.replace(/\D/g, "");
                    numberField.onChange(e);
                  }}
                  className={inputClass(!!errors.number)}
                />
                {errors.number?.message && (
                  <span className="text-xs text-red-500 leading-tight">{errors.number.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-1 sm:col-span-8">
                <label className="text-sm font-medium text-gray-700">Ciudad</label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Buenos Aires"
                  {...register("city")}
                  className={inputClass(!!errors.city)}
                />
                {errors.city?.message && (
                  <span className="text-xs text-red-500 leading-tight">{errors.city.message}</span>
                )}
              </div>
              <div className="flex flex-col gap-1 sm:col-span-4">
                <label className="text-sm font-medium text-gray-700">Provincia</label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="CABA"
                  {...register("province")}
                  className={inputClass(!!errors.province)}
                />
                {errors.province?.message && (
                  <span className="text-xs text-red-500 leading-tight">{errors.province.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contacto y link */}
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <LuMail size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-gray-800">Contacto y link público</h2>
          </div>
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {errors.phone?.message ? (
                <span className="text-xs text-red-500">{errors.phone.message}</span>
              ) : userPhone ? (
                <span className="text-xs text-gray-400">Heredado de tu cuenta. Podés cambiarlo.</span>
              ) : (
                <span className="text-xs text-gray-400">
                  Tu cuenta no tiene teléfono guardado. Ingresá uno de contacto.
                </span>
              )}
            </div>

            <div className="md:col-span-2 mt-1">
              <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/60 p-4 sm:p-5 flex flex-col gap-4">
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
                    {...slugField}
                    onKeyDown={(e) => {
                      if (e.key === " ") e.preventDefault();
                    }}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\s+/g, "");
                      slugField.onChange(e);
                    }}
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

        {/* Política de cancelación */}
        <CancellationPolicyCard
          value={cancellationWindowHours}
          onChange={(hours) =>
            setValue("cancellationWindowHours", hours, { shouldValidate: true })
          }
          error={errors.cancellationWindowHours?.message}
        />

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
                className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none"
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
                className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none"
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
                className="h-9 w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none"
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
        <div className="flex justify-end mb-10 mt-3 sm:mb-16">
          {loading ? (
            <div className="flex items-center justify-center w-32 h-9">
              <div className="loaderSmall" />
            </div>
          ) : (
            <button
              type="submit"
              className="flex items-center w-full justify-center sm:w-fit text-center gap-2 bg-primary hover:bg-orange-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
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
