"use client";
import Image from "next/image";
import { IBusiness } from "../../../interfaces/business.interface";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { businessSchema } from "@/app/schemas/businessSchema";
import { LuSave, LuCamera, LuCopy, LuCheck } from "react-icons/lu";
import Alert from "../../Alert";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import { IService } from "@/interfaces/service.interface";

interface formInputs {
  name: string;
  businessType: string;
  address: string;
  phone: string;
  email: string;
  slug: string;
}

const FormCreateBusiness = ({
  businessData,
  servicesData,
}: {
  businessData: IBusiness;
  servicesData: IService[];
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(businessSchema),
  });

  const [alert, setAlert] = useState<AlertInterface>();
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const copyPublicLink = () => {
    const slug = businessData?.slug;
    if (!slug) return;
    navigator.clipboard.writeText(`https://sacaturno.com.ar/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const router = useRouter();

  useEffect(() => {
    if (!businessData) return;
    setValue("name", businessData.name);
    setValue("address", businessData.address);
    setValue("businessType", businessData.businessType);
    setValue("phone", businessData.phone.toString());
    setValue("email", businessData.email);
    setValue("slug", businessData.slug);
  }, [businessData, setValue]);

  const handleClick = () => {
    const fileInput = document.querySelector(".inputField") as HTMLElement;
    if (fileInput) fileInput.click();
  };

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3000);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const image = e.target.files[0];
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (validTypes.includes(image.type)) {
      updateProfileImage(image);
    } else {
      setAlert({ msg: "Formato de archivo incorrecto", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
    }
  };

  const updateProfileImage = async (image: File) => {
    try {
      const token = localStorage.getItem("sacaturno_token");
      const formData = new FormData();
      formData.append("profile_image", image);
      await axiosReq.post("/business/updateimage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setAlert({ msg: "Imagen cambiada", error: true, alertType: "OK_ALERT" });
      hideAlert();
      router.refresh();
    } catch (error) {
      setAlert({ msg: "Error al cambiar imagen", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
    }
  };

  const saveChanges = async (data: FieldValues) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sacaturno_token");
      const payload = { ...data, _id: businessData._id };

      const updatedUser = await axiosReq.put("/business/edit", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (updatedUser.data.editedBusiness === "ERROR_EDIT_SLUG_EXISTS") {
        setAlert({ msg: "El link ya existe, intentá con otro", error: true, alertType: "ERROR_ALERT" });
        hideAlert();
        setLoading(false);
        return;
      }

      if (updatedUser.data.msg === "BUSINESS_EDITED") {
        setAlert({ msg: "Los cambios han sido guardados", error: true, alertType: "OK_ALERT" });
        hideAlert();
        setLoading(false);
        router.refresh();
      }
    } catch (error) {
      setLoading(false);
      setAlert({ msg: "Error al actualizar perfil", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
    }
  };

  const myLoader = () => {
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${businessData?.image}`;
  };

  return (
    <>
      <form onSubmit={handleSubmit(saveChanges)} className="flex flex-col gap-4 w-full">
        {/* Identidad */}
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
            <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Identidad</h2>
          </div>
          <div className="p-6 2xl:p-8 flex flex-col md:flex-row gap-6 2xl:gap-8 items-start">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-full md:w-auto">
              <div
                onClick={handleClick}
                className="relative cursor-pointer group rounded-full overflow-hidden w-20 h-20 2xl:w-24 2xl:h-24"
                title="Cambiar logo de empresa"
              >
                <Image
                  loader={myLoader}
                  width={96}
                  height={96}
                  className="w-20 h-20 2xl:w-24 2xl:h-24 rounded-full object-cover"
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${businessData?.image}`}
                  alt="Logo empresa"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                  <LuCamera size={20} className="text-white" />
                </div>
                <input
                  onChange={handleFileInput}
                  type="file"
                  className="inputField"
                  accept="image/*"
                  hidden
                />
              </div>
              <span className="text-xs 2xl:text-sm text-gray-400">Cambiar logo</span>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-5 w-full">
              <div className="flex flex-col gap-1">
                <label className="text-xs 2xl:text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  maxLength={30}
                  {...register("name")}
                  placeholder="Nombre de la empresa"
                  className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${errors.name ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.name?.message && (
                  <span className="text-xs 2xl:text-sm text-red-500">{errors.name.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs 2xl:text-sm font-medium text-gray-700">Rubro principal</label>
                <input
                  type="text"
                  maxLength={20}
                  {...register("businessType")}
                  placeholder="Ej: Peluquería"
                  className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${errors.businessType ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.businessType?.message && (
                  <span className="text-xs 2xl:text-sm text-red-500">{errors.businessType.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs 2xl:text-sm font-medium text-gray-700">Domicilio de sucursal</label>
                <input
                  type="text"
                  maxLength={40}
                  {...register("address")}
                  placeholder="Calle, número, ciudad"
                  className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${errors.address ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.address?.message && (
                  <span className="text-xs 2xl:text-sm text-red-500">{errors.address.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contacto y link */}
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
            <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Contacto y link público</h2>
          </div>
          <div className="p-6 2xl:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-xs 2xl:text-sm font-medium text-gray-700">Email de contacto</label>
              <input
                type="email"
                maxLength={40}
                {...register("email")}
                placeholder="contacto@empresa.com"
                className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${errors.email ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.email?.message && (
                <span className="text-xs 2xl:text-sm text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs 2xl:text-sm font-medium text-gray-700">Teléfono de contacto</label>
              <input
                type="number"
                {...register("phone")}
                placeholder="Ej: 2234567890"
                className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${errors.phone ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.phone?.message && (
                <span className="text-xs 2xl:text-sm text-red-500">{errors.phone.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs 2xl:text-sm font-medium text-gray-700">Link público</label>
              <p className="text-xs 2xl:text-sm text-gray-400">
                Este es el link que podés compartir con tus clientes para que reserven turnos online.
              </p>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
                <div
                  className={`flex items-center w-full md:flex-1 h-8 2xl:h-10 rounded-md border overflow-hidden bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus-within:border-orange-600 ${errors.slug ? "border-red-500" : "border-gray-200"}`}
                >
                  <span className="px-3 text-xs 2xl:text-sm text-gray-500 bg-gray-100 h-full flex items-center border-r border-gray-200 whitespace-nowrap flex-shrink-0">
                    sacaturno.com.ar/
                  </span>
                  <input
                    type="text"
                    maxLength={30}
                    {...register("slug")}
                    placeholder="mi-empresa"
                    className="flex-1 h-full px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={copyPublicLink}
                  title="Copiar link público"
                  className={`flex items-center justify-center gap-1.5 h-8 2xl:h-10 px-4 rounded-lg border text-xs 2xl:text-sm font-semibold transition-all duration-300 ease-in-out whitespace-nowrap flex-shrink-0 cursor-pointer ${copied ? "border-green-700 bg-green-700 text-white" : "border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"}`}
                >
                  {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
                  {copied ? "¡Copiado!" : "Copiar link"}
                </button>
              </div>
              {errors.slug?.message && (
                <span className="text-xs 2xl:text-sm text-red-500">{errors.slug.message}</span>
              )}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          {loading ? (
            <div className="flex items-center justify-center w-32 h-9">
              <div className="loaderSmall"></div>
            </div>
          ) : (
            <button
              type="submit"
              className="flex items-center gap-2 bg-orange-600 hover:bg-[#d92f04] text-white text-xs 2xl:text-sm font-semibold px-5 2xl:px-6 py-2.5 2xl:py-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
            >
              <LuSave size={14} />
              Guardar cambios
            </button>
          )}
        </div>
      </form>

      {alert?.error && (
        <div className="flex justify-center w-full h-fit">
          <Alert error={alert?.error} msg={alert?.msg} alertType={alert?.alertType} />
        </div>
      )}
    </>
  );
};

export default FormCreateBusiness;
