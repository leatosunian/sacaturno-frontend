"use client";
import styles from "@/app/css-modules/FormMiPerfil.module.css";
import Image from "next/image";
import { IUser } from "@/interfaces/user.interface";
import { useEffect, useState } from "react";
import { LuSave, LuCamera } from "react-icons/lu";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/app/schemas/userSchema";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "@/components/Alert";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaMedal } from "react-icons/fa6";
import { IoMdAlert } from "react-icons/io";
import { IBusiness } from "@/interfaces/business.interface";
import dayjs from "dayjs";
import { IPlanPayment } from "@/interfaces/planPayment.interface";

interface Props {
  profileData: any;
  subscriptionData: any;
  businessData: IBusiness;
  paymentsData: IPlanPayment[];
}

interface formInputs {
  name: string;
  phone: number;
  email: string;
  birthdate: string | Date;
}

const FormProfileConfig: React.FC<Props> = ({
  profileData,
  subscriptionData,
  businessData,
  paymentsData,
}: Props) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(userSchema),
  });

  const [alert, setAlert] = useState<AlertInterface>();
  const [profile, setProfile] = useState<IUser>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setValue("name", profileData.response_data.name);
    setValue("phone", profileData.response_data.phone);
    setValue("email", profileData.response_data.email);
    setValue("birthdate", dayjs(profileData.response_data.birthdate).format("YYYY/MM/DD"));
    setProfile(profileData.response_data);
  }, [profileData]);

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
    let image;
    if (e.target.files?.length != undefined) {
      image = e.target.files[0];
      if (
        image.type === "image/jpeg" ||
        image.type === "image/png" ||
        image.type === "image/webp" ||
        image.type === "image/jpg"
      ) {
        updateProfileImage(image);
      } else {
        setAlert({ msg: "Formato de archivo incorrecto", error: true, alertType: "ERROR_ALERT" });
      }
    }
  };

  const saveChanges = async (data: FieldValues) => {
    setLoading(true);
    const token = localStorage.getItem("sacaturno_token");
    const userID = localStorage.getItem("sacaturno_userID");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (data) {
      data._id = userID;
      try {
        await axiosReq.put("/user/editprofile", data, authHeader);
        setAlert({ msg: "Los cambios han sido guardados", error: true, alertType: "OK_ALERT" });
        hideAlert();
      } catch (error) {
        setAlert({ msg: "No se pudo guardar los cambios", error: true, alertType: "ERROR_ALERT" });
        hideAlert();
      }
    }
    setLoading(false);
  };

  const handleMercadoPagoPreference = async () => {
    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    const data = {
      title: "Plan Full",
      businessID: businessData._id,
      ownerID: businessData.ownerID,
      email: businessData.email,
      quantity: 1,
      currency_id: "ARS",
    };
    try {
      const preference = await axiosReq.post("/subscription/pay/full", data, authHeader);
      router.push(preference.data.init_point);
    } catch (error) {
      console.log(error);
    }
  };

  const myLoader = ({ src }: { src: string }) => {
    return `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${profile?.profileImage}`;
  };

  const updateProfileImage = async (image: File) => {
    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      };
      let formData = new FormData();
      formData.append("profile_image", image);
      await axiosReq.post("/user/updateimage", formData, authHeader);
      setAlert({ msg: "Imagen cambiada", error: true, alertType: "OK_ALERT" });
      hideAlert();
      router.refresh();
    } catch (error) {
      setAlert({ msg: "Error al cambiar imagen", error: true, alertType: "ERROR_ALERT" });
      hideAlert();
    }
  };

  return (
    <>
      {/* Información personal */}
      <form onSubmit={handleSubmit(saveChanges)} className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
          <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Información personal</h2>
        </div>

        <div className="p-6 2xl:p-8 flex flex-col md:flex-row gap-6 2xl:gap-8 items-start">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div
              onClick={handleClick}
              className="relative cursor-pointer group rounded-full overflow-hidden w-20 h-20 2xl:w-24 2xl:h-24"
              title="Cambiar foto de perfil"
            >
              <Image
                loader={myLoader}
                width={96}
                height={96}
                className="w-20 h-20 2xl:w-24 2xl:h-24 rounded-full object-cover"
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/getprofilepic/${profile?.profileImage}`}
                alt="Foto de perfil"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out">
                <LuCamera size={20} className="text-white" />
              </div>
              <input onChange={handleFileInput} type="file" className="inputField" accept="image/*" hidden />
            </div>
            <span className="text-xs 2xl:text-sm text-gray-400">Cambiar foto</span>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-5 w-full">
            <div className="flex flex-col gap-1">
              <label className="text-xs 2xl:text-sm font-medium text-gray-700">Nombre completo</label>
              <input
                type="text"
                {...register("name")}
                maxLength={30}
                placeholder="Tu nombre"
                className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${errors.name ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.name?.message && (
                <span className="text-xs 2xl:text-sm text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs 2xl:text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                {...register("email")}
                disabled
                maxLength={40}
                title="El email no se puede modificar"
                className="h-8 2xl:h-10 w-full rounded-md border border-gray-200 px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] text-gray-400 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs 2xl:text-sm font-medium text-gray-700">Número de teléfono</label>
              <input
                type="number"
                {...register("phone")}
                maxLength={20}
                pattern="[0-9]*"
                inputMode="numeric"
                placeholder="Ej: 2234567890"
                className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${errors.phone ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.phone?.message && (
                <span className="text-xs 2xl:text-sm text-red-500">{errors.phone.message}</span>
              )}
            </div>

            <div className="flex items-end pb-0.5">
              <span className="text-xs 2xl:text-sm font-light text-gray-600">
                ¿Olvidaste tu contraseña?{" "}
                <Link className="font-semibold cursor-pointer blackOrangeHover" href="/login/recovery">
                  Cambiar contraseña
                </Link>
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 2xl:px-8 py-4 2xl:py-5 border-t border-gray-100">
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

      {/* Planes y facturación */}
      {typeof businessData === "object" && (
        <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          <div className="px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
            <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Planes y facturación</h2>
          </div>

          <div className="p-6 2xl:p-8 flex flex-col gap-6 2xl:gap-8">
            {/* Plan info grid */}
            {subscriptionData.subscriptionType !== "SC_EXPIRED" && (
              <div className="grid grid-cols-2 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 md:grid-cols-4 gap-4 2xl:gap-6">
                <div className="flex flex-col gap-1">
                  <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase tracking-wide">Plan actual</span>
                  <span className="text-xs 2xl:text-sm font-semibold flex items-center gap-1">
                    {subscriptionData.subscriptionType === "SC_FULL" && <FaMedal color="#dd4924" />}
                    {subscriptionData.subscriptionType === "SC_FREE" ? "Plan Free" : "Plan Full"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase tracking-wide">Estado</span>
                  <span className="text-xs 2xl:text-sm font-semibold text-green-600">● Activo</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    {subscriptionData.subscriptionType === "SC_FULL" ? "Fecha de pago" : "Activación"}
                  </span>
                  <span className="text-xs 2xl:text-sm font-semibold">{subscriptionData.paymentDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase tracking-wide">Vencimiento</span>
                  <span className="text-xs 2xl:text-sm font-semibold">{subscriptionData.expiracyDate}</span>
                </div>
              </div>
            )}

            {/* Expired */}
            {subscriptionData.subscriptionType === "SC_EXPIRED" && (
              <div className="flex flex-col items-center gap-3 py-6">
                <IoMdAlert color="#dd4924" size={40} />
                <span className="text-xs 2xl:text-sm font-semibold text-center max-w-sm">
                  Tu suscripción ha caducado. Hacé click en el botón debajo para renovar tu plan.
                </span>
                <button
                  onClick={handleMercadoPagoPreference}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-[#d92f04] text-white text-xs 2xl:text-sm font-semibold px-5 2xl:px-6 py-2.5 2xl:py-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
                >
                  Actualizar plan
                </button>
              </div>
            )}

            {/* Free plan alert */}
            {subscriptionData.subscriptionType === "SC_FREE" && (
              <div className="w-full notifications-container">
                <div className="alert">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 alert-svg">
                        <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd"></path>
                      </svg>
                    </div>
                    <div className="alert-prompt-wrap">
                      <p className="text-sm text-yellow-700">
                        Estás utilizando una prueba gratuita.{" "}
                        <span className="cursor-pointer alert-prompt-link" onClick={handleMercadoPagoPreference}>
                          Actualizar suscripción
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing history */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm 2xl:text-base font-semibold text-gray-700 border-b border-gray-100 pb-3">
                Historial de facturación
              </h3>

              {paymentsData.length === 0 && (
                <p className="text-xs 2xl:text-sm text-gray-400 text-center py-6">No hay pagos registrados.</p>
              )}

              {paymentsData.length > 0 && (
                <>
                  <div className="hidden lg:grid grid-cols-4 px-1 pb-2 border-b border-gray-100">
                    <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase">Suscripción</span>
                    <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase">Precio</span>
                    <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase">Fecha de pago</span>
                    <span className="text-xs 2xl:text-sm font-semibold text-gray-400 uppercase">Estado</span>
                  </div>
                  <div className={`${styles.paymentsCont} flex flex-col gap-2 max-h-72 overflow-y-auto`}>
                    {paymentsData.map((payment) => (
                      <div
                        key={payment._id}
                        className="grid grid-cols-2 lg:grid-cols-4 items-center py-3 border-b border-gray-50 last:border-0 gap-2 lg:gap-0"
                      >
                        <span className="flex items-center gap-1.5 text-xs 2xl:text-sm font-medium">
                          <FaMedal color="#dd4924" />
                          {payment.subscriptionType === "SC_FREE" ? "Plan Free" : "Plan Full"}
                        </span>
                        <span className="text-xs 2xl:text-sm font-semibold">
                          {payment.price > 0 ? `AR$ ${payment.price.toLocaleString("es-AR")}` : "Gratis"}
                        </span>
                        <span className="text-xs 2xl:text-sm text-gray-500">
                          {dayjs(payment.paymentDate).format("DD/MM/YYYY")}
                        </span>
                        <span className="text-xs 2xl:text-sm font-semibold text-green-600">● Aprobado</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {alert?.error && (
        <div className="flex justify-center w-full h-fit">
          <Alert error={alert?.error} msg={alert?.msg} alertType={alert?.alertType} />
        </div>
      )}
    </>
  );
};

export default FormProfileConfig;
