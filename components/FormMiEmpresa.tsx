"use client";
import styles from "@/app/css-modules/FormMiEmpresa.module.css";
import Image from "next/image";
import { timeOptions } from "@/helpers/timeOptions";
import { IBusiness } from "../interfaces/business.interface";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { businessSchema } from "@/app/schemas/businessSchema";
import { LuSave } from "react-icons/lu";
import Alert from "./Alert";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import { IService } from "@/interfaces/service.interface";

interface props {
  businessData: IBusiness;
  servicesData: IService;
}

interface formInputs {
  name: string;
  businessType: string;
  address: string;
  appointmentDuration: string;
  dayStart: string;
  dayEnd: string;
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(businessSchema),
  });

  const [alert, setAlert] = useState<AlertInterface>();
  const [business, setBusiness] = useState<IBusiness>();
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    setBusiness(businessData);
    setValue("name", businessData.name);
    setValue("address", businessData.address);
    setValue("businessType", businessData.businessType);
    setValue("dayStart", businessData.dayStart);
    setValue("dayEnd", businessData.dayEnd);
    setValue("appointmentDuration", businessData.appointmentDuration);
    setValue("slug", businessData.slug);
    return;
  }, [businessData]);

  useEffect(() => {
    if (business) {
      setValue("name", business.name);
      setValue("address", business.address);
      setValue("businessType", business.businessType);
      setValue("dayStart", business.dayStart);
      setValue("dayEnd", business.dayEnd);
      setValue("appointmentDuration", business.appointmentDuration);
      setValue("phone", business.phone.toString());
      setValue("email", business.email);
    }
    return;
  }, [business, setValue]);

  const handleSubmitClick = () => {
    const fileInput = document.querySelector(
      ".inputSubmitField"
    ) as HTMLElement;
    if (fileInput != null) {
      fileInput.click();
    }
  };

  const handleClick = () => {
    const fileInput = document.querySelector(".inputField") as HTMLElement;
    if (fileInput != null) {
      fileInput.click();
    }
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
        image.type == "image/jpeg" ||
        image.type == "image/png" ||
        image.type == "image/webp" ||
        image.type == "image/jpg"
      ) {
        updateProfileImage(image);
      } else {
        setAlert({
          msg: "Formato de archivo incorrecto",
          error: true,
          alertType: "ERROR_ALERT",
        });
        hideAlert();
      }
    }
  };

  const updateProfileImage = async (image: File) => {
    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };
      let formData = new FormData();
      formData.append("profile_image", image);
      await axiosReq.post("/business/updateimage", formData, authHeader);
      setAlert({
        msg: "Imagen cambiada",
        error: true,
        alertType: "OK_ALERT",
      });
      hideAlert();
      router.refresh();
    } catch (error) {
      setAlert({
        msg: "Error al cambiar imagen",
        error: true,
        alertType: "ERROR_ALERT",
      });
      hideAlert();
    }
  };

  const saveChanges = async (data: FieldValues) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      if (data) {
        data._id = businessData._id;
        const updatedUser = await axiosReq.put(
          "/business/edit",
          data,
          authHeader
        );
        if (updatedUser.data.editedBusiness === "ERROR_EDIT_SLUG_EXISTS") {
          setAlert({
            msg: "El link ya existe, intentá con otro",
            error: true,
            alertType: "ERROR_ALERT",
          });
          hideAlert();
          setLoading(false);

          return;
        }
        if (updatedUser.data.msg === "BUSINESS_EDITED") {
          setAlert({
            msg: "Los cambios han sido guardados",
            error: true,
            alertType: "OK_ALERT",
          });
          hideAlert();
          setLoading(false);
          router.refresh()
          return;
        }
      }
    } catch (error) {
      setLoading(false);
      setAlert({
        msg: "Error al actualizar perfil",
        error: true,
        alertType: "ERROR_ALERT",
      });
    }
  };

  const myLoader = ({ src }: { src: string }) => {
    return `https://sacaturno-server-ereef.ondigitalocean.app/api/user/getprofilepic/${business?.image}`;
  };

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          saveChanges(data);
        })}
        className={styles.businessForm}
      >
        <div className="flex justify-center w-full mb-5 h-fit">
          <h3 className="text-xl font-bold uppercase ">Datos de mi empresa</h3>
        </div>

        <div className="flex flex-col items-center justify-center w-full gap-10 md:gap-5 md:justify-around md:flex-row">
          <div
            onClick={handleClick}
            className="rounded-full inputFileFormProfile"
            title="Cambiar logo de empresa"
          >
            <Image
              loader={myLoader}
              width={64}
              height={64}
              className="w-16 rounded-full"
              src={
                `https://sacaturno-server-ereef.ondigitalocean.app/api/user/getprofilepic/` +
                business?.image
              }
              alt=""
            />
            <input
              onChange={handleFileInput}
              type="file"
              className="inputField"
              accept="image/*"
              hidden
            />
          </div>

          <div className="flex flex-col justify-between w-full gap-4 md:w-1/2 ">
            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Nombre
              </span>
              <input type="text" maxLength={30} {...register("name")} />
              {errors.name?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {errors.name.message}
                </span>
              )}
            </div>
            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Rubro principal
              </span>
              <input type="text" maxLength={20} {...register("businessType")} />
              {errors.businessType?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {errors.businessType.message}
                </span>
              )}
            </div>
            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Domicilio de sucursal
              </span>
              <input type="text" {...register("address")} maxLength={40} />
              {errors.address?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {errors.address.message}
                </span>
              )}
            </div>

            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Email de contacto
              </span>
              <input type="email" {...register("email")} maxLength={40} />
              {errors.email?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {errors.email.message}
                </span>
              )}
            </div>

            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Teléfono de contacto
              </span>
              <input type="number" {...register("phone")} maxLength={40} />
              {errors.phone?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Link
              </span>
              <div className="flex items-center w-full gap-1 h-fit">
                <span style={{ fontSize: "14px" }} className="font-medium ">
                  sacaturno.com.ar/
                </span>
                <input type="text" maxLength={30} {...register("slug")} />
              </div>
              {errors.slug?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {errors.slug.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* <div className="flex justify-start w-full h-fit">
              <h3 className="font-bold uppercase text-md ">
                Configuración de turnos
              </h3>
            </div> */}

        <div className="flex flex-col items-start w-full gap-5 mt-4 lg:justify-center md:items-center lg:flex-row">
          <div className={styles.formInputAppDuration}>
            <span style={{ fontSize: "12px" }} className="font-bold uppercase ">
              Duración de cada turno
            </span>
            {/* <Select onChange={} options={durationOptions} /> */}
            <select
              className="formInputAppDuration"
              {...register("appointmentDuration")}
              defaultValue={business?.appointmentDuration}
              id="appointmentDuration"
            >
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">1 h</option>
              <option value="75">1:15 hs</option>
              <option value="90">1:30 hs</option>
              <option value="105">1:45 hs</option>
              <option value="120">2 hs</option>
            </select>
            {errors.appointmentDuration?.message && (
              <span className="text-xs font-semibold text-red-600">
                {errors.appointmentDuration.message}
              </span>
            )}
          </div>

          <div className={styles.formInputOpening}>
            <span style={{ fontSize: "12px" }} className="font-bold uppercase ">
              Horario de atención
            </span>
            <div className="flex items-end gap-3">
              <div className="flex items-end gap-2">
                <span
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase"
                >
                  Desde:
                </span>
                <select
                  defaultValue={business?.dayStart}
                  {...register("dayStart")}
                  id="dayStart"
                >
                  {timeOptions.map((time) => (
                    <option value={time.value} key={time.label}>
                      {time.label}
                    </option>
                  ))}
                </select>
                {errors.dayStart?.message && (
                  <span className="text-xs font-semibold text-red-600">
                    {errors.dayStart.message}
                  </span>
                )}
              </div>

              <div className="flex items-end gap-2">
                <span
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase"
                >
                  Hasta:
                </span>
                <select
                  defaultValue={business?.dayEnd}
                  {...register("dayEnd")}
                  id="dayEnd"
                >
                  {timeOptions.map((time) => (
                    <option value={time.value} key={time.label}>
                      {time.label}
                    </option>
                  ))}
                </select>
                {errors.dayEnd?.message && (
                  <span className="text-xs font-semibold text-red-600">
                    {errors.dayEnd.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmitClick}
          className={"inputSubmitField hidden "}
        />
      </form>

      <div className="flex items-center justify-center w-full mt-7 md:mt-8 h-9">
        {loading && (
          <>
            <div
              style={{ height: "100%", width: "100%" }}
              className="flex items-center justify-center w-full"
            >
              <div className="loaderSmall"></div>
            </div>
          </>
        )}
        {!loading && (
          <button onClick={handleSubmitClick} className={styles.button}>
            <LuSave size={18} />
            Guardar cambios
          </button>
        )}
      </div>

      {/* ALERT */}
      {alert?.error && (
        <div className="flex justify-center w-full h-fit">
          <Alert
            error={alert?.error}
            msg={alert?.msg}
            alertType={alert?.alertType}
          />
        </div>
      )}
    </>
  );
};

export default FormMiEmpresa;
