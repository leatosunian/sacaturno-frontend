"use client";
import Image from "next/image";
import Link from "next/link";
import { IBusiness } from "../../../interfaces/business.interface";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { businessSchema } from "@/app/schemas/businessSchema";
import { LuSave, LuCamera, LuCopy, LuCheck, LuLink, LuExternalLink, LuBuilding2 } from "react-icons/lu";
import Alert from "../../Alert";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import { IService } from "@/interfaces/service.interface";
import RubroPicker from "./RubroPicker";
import { inferCategoryCode } from "@/lib/businessCategories";

interface formInputs {
  name: string;
  businessCategory: string;
  businessType: string;
  address: string;
  phone: string;
  email: string;
  slug: string;
}

const FormCreateBusiness = ({
  businessData,
  servicesData,
  branchesEnabled = false,
}: {
  businessData: IBusiness;
  servicesData: IService[];
  branchesEnabled?: boolean;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<formInputs>({
    resolver: zodResolver(businessSchema),
  });

  register("businessCategory");
  register("businessType");
  const businessCategory = watch("businessCategory");
  const businessType = watch("businessType");

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
    reset({
      name: businessData.name,
      address: businessData.address,
      businessCategory: businessData.businessCategory || inferCategoryCode(businessData.businessType) || "",
      businessType: businessData.businessType,
      phone: businessData.phone?.toString() ?? "",
      email: businessData.email,
      slug: businessData.slug,
    });
  }, [businessData, reset]);

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
        reset({
          name: data.name,
          address: data.address,
          businessCategory: data.businessCategory,
          businessType: data.businessType,
          phone: data.phone,
          email: data.email,
          slug: data.slug,
        });
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
      <form onSubmit={handleSubmit(saveChanges)} className="flex flex-col gap-6 sm:gap-4 w-full max-w-4xl">
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

              <div className="flex flex-col gap-1 md:col-span-2">
                <RubroPicker
                  category={businessCategory}
                  type={businessType}
                  onChange={(cat, type) => {
                    setValue("businessCategory", cat, { shouldValidate: !!errors.businessCategory, shouldDirty: true });
                    setValue("businessType", type, { shouldValidate: !!errors.businessType, shouldDirty: true });
                  }}
                  categoryError={errors.businessCategory?.message}
                  typeError={errors.businessType?.message}
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs 2xl:text-sm font-medium text-gray-700">Domicilio del negocio</label>
                {branchesEnabled ? (
                  <Link
                    href="/admin/business/branches"
                    className="flex items-center justify-center gap-1.5 h-8 2xl:h-10 w-full sm:w-fit sm:px-5 rounded-md bg-primary hover:bg-[#d92f04] text-white text-xs 2xl:text-sm font-semibold transition-all duration-300 ease-in-out cursor-pointer"
                  >
                    <LuBuilding2 size={14} />
                    Mis sucursales
                  </Link>
                ) : (
                  <>
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
                  </>
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

            <div className="md:col-span-2 mt-1">
              <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/60 p-5 2xl:p-6 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-9 h-9 2xl:w-10 2xl:h-10 rounded-lg bg-primary text-white flex-shrink-0 shadow-sm">
                    <LuLink size={16} />
                  </div>
                  <div>
                    <p className="text-xs 2xl:text-sm font-semibold text-gray-800">Tu link público de reservas</p>
                    <p className="text-xs text-gray-500">Compartí este link para que tus clientes reserven turnos online</p>
                  </div>
                </div>

                {/* URL input + actions */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div
                    className={`flex items-center min-w-0 flex-1 min-h-8 h-12 sm:h-11  rounded-lg border overflow-hidden bg-white shadow-sm transition-all duration-200 ease-in-out focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100 ${errors.slug ? "border-red-400" : "border-orange-200"}`}
                  >
                    <span className="px-2.5 sm:px-3 text-xs 2xl:text-sm min-h-8 text-orange-600 font-medium bg-orange-50 h-full flex items-center border-r border-orange-200 whitespace-nowrap flex-shrink-0">
                      sacaturno.com.ar/
                    </span>
                    <input
                      type="text"
                      maxLength={30}
                      {...register("slug")}
                      placeholder="mi-empresa"
                      className="min-w-0 flex-1 h-full px-3 text-xs 2xl:text-sm bg-white focus:outline-none text-gray-700 font-medium"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={copyPublicLink}
                      title="Copiar link público"
                      className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 h-12 sm:h-11 px-4 sm:px-5 rounded-lg text-xs 2xl:text-sm font-semibold transition-all duration-300 ease-in-out whitespace-nowrap cursor-pointer shadow-sm ${
                        copied
                          ? "bg-green-600 text-white"
                          : "bg-primary text-white hover:bg-orange-500"
                      }`}
                    >
                      {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
                      {copied ? "¡Copiado!" : "Copiar link"}
                    </button>
                    <a
                      href={`https://sacaturno.com.ar/${businessData?.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver página pública"
                      aria-label="Ver página pública"
                      className="flex items-center justify-center w-12 sm:w-11 h-12 sm:h-11 rounded-lg border border-orange-200 bg-white text-orange-600 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 ease-in-out flex-shrink-0 shadow-sm"
                    >
                      <LuExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {errors.slug?.message && (
                  <span className="text-xs text-red-500">{errors.slug.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end my-5">
          {loading ? (
            <div className="flex items-center justify-center w-32 h-9">
              <div className="loaderSmall"></div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={!isDirty}
              className="flex items-center gap-2 bg-primary hover:bg-orange-500 text-white text-xs 2xl:text-sm font-semibold px-5 2xl:px-6 py-2.5 2xl:py-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
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
