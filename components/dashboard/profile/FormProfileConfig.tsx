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
import dayjs from "dayjs";

interface Props {
  profileData: any;
}

interface formInputs {
  name: string;
  surname: string;
  phone: number;
  email: string;
  birthdate: string | Date;
}

const FormProfileConfig: React.FC<Props> = ({ profileData }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<formInputs>({
    resolver: zodResolver(userSchema),
  });

  const [alert, setAlert] = useState<AlertInterface>();
  const [profile, setProfile] = useState<IUser>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    reset({
      name: profileData.response_data.name,
      surname: profileData.response_data.surname,
      phone: profileData.response_data.phone,
      email: profileData.response_data.email,
      birthdate: dayjs(profileData.response_data.birthdate).format("YYYY/MM/DD"),
    });
    setProfile(profileData.response_data);
  }, [profileData, reset]);

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
        reset({
          name: data.name,
          surname: data.surname,
          phone: data.phone,
          email: data.email,
          birthdate: data.birthdate,
        });
        setAlert({ msg: "Los cambios han sido guardados", error: true, alertType: "OK_ALERT" });
        hideAlert();
      } catch (error) {
        setAlert({ msg: "No se pudo guardar los cambios", error: true, alertType: "ERROR_ALERT" });
        hideAlert();
      }
    }
    setLoading(false);
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
      <form onSubmit={handleSubmit(saveChanges)} className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden w-full max-w-4xl">
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
              <label className="text-xs 2xl:text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                {...register("name")}
                maxLength={35}
                placeholder="Tu nombre"
                className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${errors.name ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.name?.message && (
                <span className="text-xs 2xl:text-sm text-red-500">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs 2xl:text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                {...register("surname")}
                maxLength={35}
                placeholder="Tu apellido"
                className={`h-8 2xl:h-10 w-full rounded-md border px-3 text-xs 2xl:text-sm bg-[rgb(235,235,235)] transition-all duration-200 ease-in-out hover:border-orange-600 focus:border-orange-600 focus:outline-none ${errors.surname ? "border-red-500" : "border-gray-200"}`}
              />
              {errors.surname?.message && (
                <span className="text-xs 2xl:text-sm text-red-500">{errors.surname.message}</span>
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

export default FormProfileConfig;
