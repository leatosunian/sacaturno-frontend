"use client";
import styles from "@/app/css-modules/FormMiEmpresa.module.css";
import Image from "next/image";
import { IBusiness } from "../../../interfaces/business.interface";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { businessSchema } from "@/app/schemas/businessSchema";
import { LuSave } from "react-icons/lu";
import Alert from "../../Alert";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import { IService } from "@/interfaces/service.interface";
import { Card } from "@/components/ui/card";

interface formInputs {
  name: string;
  businessType: string;
  address: string;
  phone: string;
  email: string;
  slug: string;
}

const FormMiEmpresa = ({
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

  const router = useRouter();

  // Un solo useEffect — carga los datos cuando llega businessData
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
    return `https://sacaturno-server-production.up.railway.app/api/user/getprofilepic/${businessData?.image}`;
  };

  return (
    <>
      <Card className="flex flex-col mx-auto gap-7 w-fit p-7">
        <h4 className="relative inline-block w-full px-2 mx-auto text-xl font-bold text-center uppercase">
          Datos de mi empresa
          <span
            className="absolute left-0 right-0 mx-auto"
            style={{ bottom: -2, height: 2, background: "#dd4924", width: "20%" }}
          />
        </h4>

        <form
          onSubmit={handleSubmit(saveChanges)}
          className="flex flex-col items-center justify-center gap-6 mx-auto w-fit"
        >
          <div className="flex flex-col items-center justify-center gap-6 mx-auto w-fit md:justify-around md:flex-row">
            {/* Avatar */}
            <div
              onClick={handleClick}
              className="rounded-full cursor-pointer inputFileFormProfile"
              title="Cambiar logo de empresa"
            >
              <Image
                loader={myLoader}
                width={64}
                height={64}
                className="w-16 rounded-full"
                src={`https://sacaturno-server-production.up.railway.app/api/user/getprofilepic/${businessData?.image}`}
                alt="Logo empresa"
              />
              <input
                onChange={handleFileInput}
                type="file"
                className="inputField"
                accept="image/*"
                hidden
              />
            </div>

            {/* Campos */}
            <div className="flex flex-col justify-between w-full gap-4 md:w-1/2">
              <div className={styles.formInput}>
                <span style={{ fontSize: "12px" }} className="font-bold uppercase">Nombre</span>
                <input type="text" maxLength={30} {...register("name")} />
                {errors.name?.message && (
                  <span className="text-xs font-semibold text-red-600">{errors.name.message}</span>
                )}
              </div>

              <div className={styles.formInput}>
                <span style={{ fontSize: "12px" }} className="font-bold uppercase">Rubro principal</span>
                <input type="text" maxLength={20} {...register("businessType")} />
                {errors.businessType?.message && (
                  <span className="text-xs font-semibold text-red-600">{errors.businessType.message}</span>
                )}
              </div>

              <div className={styles.formInput}>
                <span style={{ fontSize: "12px" }} className="font-bold uppercase">Domicilio de sucursal</span>
                <input type="text" maxLength={40} {...register("address")} />
                {errors.address?.message && (
                  <span className="text-xs font-semibold text-red-600">{errors.address.message}</span>
                )}
              </div>

              <div className={styles.formInput}>
                <span style={{ fontSize: "12px" }} className="font-bold uppercase">Email de contacto</span>
                <input type="email" maxLength={40} {...register("email")} />
                {errors.email?.message && (
                  <span className="text-xs font-semibold text-red-600">{errors.email.message}</span>
                )}
              </div>

              <div className={styles.formInput}>
                <span style={{ fontSize: "12px" }} className="font-bold uppercase">Teléfono de contacto</span>
                <input type="number" {...register("phone")} />
                {errors.phone?.message && (
                  <span className="text-xs font-semibold text-red-600">{errors.phone.message}</span>
                )}
              </div>

              <div className={styles.formInput}>
                <span style={{ fontSize: "12px" }} className="font-bold uppercase">Link</span>
                <div className="flex items-center w-full gap-1 h-fit">
                  <span style={{ fontSize: "14px" }} className="font-medium">sacaturno.com.ar/</span>
                  <input type="text" maxLength={30} {...register("slug")} />
                </div>
                {errors.slug?.message && (
                  <span className="text-xs font-semibold text-red-600">{errors.slug.message}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center w-full mt-2 h-9">
            {loading ? (
              <div className="flex items-center justify-center w-full h-full">
                <div className="loaderSmall"></div>
              </div>
            ) : (
              <button
                type="submit"
                className="flex items-center justify-center w-full gap-2 px-0 text-white bg-orange-600 border-none rounded-lg shadow-xl outline-none cursor-pointer sm:px-10 sm:w-fit h-11 hover:bg-orange-700"
              >
                <LuSave size={18} />
                Guardar cambios
              </button>
            )}
          </div>
        </form>
      </Card>

      {alert?.error && (
        <div className="flex justify-center w-full h-fit">
          <Alert error={alert?.error} msg={alert?.msg} alertType={alert?.alertType} />
        </div>
      )}
    </>
  );
};

export default FormMiEmpresa;