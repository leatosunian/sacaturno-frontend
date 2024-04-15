"use client";
import { NextPage } from "next";
import styles from "../app/css-modules/FormMiEmpresa.module.css";
import Image from "next/image";
import { durationOptions, timeOptions } from "@/helpers/timeOptions";
import { IBusiness } from "../interfaces/business.interface";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { businessSchema } from "@/app/schemas/businessSchema";
import { LuSave } from "react-icons/lu";
import { AiOutlineSchedule } from "react-icons/ai";
import Alert from "./Alert";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";

interface props {
  businessData: IBusiness;
}

interface formInputs {
  name: string;
  businessType: string;
  address: string;
  appointmentDuration: string;
  dayStart: string;
  dayEnd: string;
}

const FormMiEmpresa = ({ businessData }: { businessData: IBusiness }) => {
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
  const [isBusiness, setIsBusiness] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (
      typeof businessData === "string" &&
      businessData === "BUSINESS_NOT_FOUND"
    ) {
      setIsBusiness(false);
    } else {
      setIsBusiness(true);
    }

    setBusiness(businessData);
    setValue("name", businessData.name);
    setValue("address", businessData.address);
    setValue("businessType", businessData.businessType);
    setValue("dayStart", businessData.dayStart);
    setValue("dayEnd", businessData.dayEnd);
    setValue("appointmentDuration", businessData.appointmentDuration);
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
    }
    return;
  }, [business]);

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
      const updatedImage = await axiosReq.post(
        "/business/updateimage",
        formData,
        authHeader
      );
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
        setAlert({
          msg: "Los cambios han sido guardados",
          error: true,
          alertType: "OK_ALERT",
        });
        hideAlert();
      }
    } catch (error) {
      setAlert({
        msg: "Error al actualizar perfil",
        error: true,
        alertType: "OK_ALERT",
      });
    }
  };

  const myLoader = ({ src }: { src: string }) => {
    return `https://sacaturno-server-production.up.railway.app/api/user/getprofilepic/${business?.image}`;
  };

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          saveChanges(data);
        })}
        className={styles.businessForm}
      >
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
                `https://sacaturno-server-production.up.railway.app/api/user/getprofilepic/` +
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
              <span className="text-sm font-semibold ">
                Nombre de la empresa
              </span>
              <input type="text" maxLength={30} {...register("name")} />
              {errors.name?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {" "}
                  {errors.name.message}{" "}
                </span>
              )}
            </div>
            <div className={styles.formInput}>
              <span className="text-sm font-semibold ">Rubro principal</span>
              <input type="text" maxLength={20} {...register("businessType")} />
              {errors.businessType?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {" "}
                  {errors.businessType.message}{" "}
                </span>
              )}
            </div>
            <div className={styles.formInput}>
              <span className="text-sm font-semibold ">
                Domicilio de sucursal
              </span>
              <input type="text" {...register("address")} maxLength={40} />
              {errors.address?.message && (
                <span className="text-xs font-semibold text-red-600">
                  {" "}
                  {errors.address.message}{" "}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start w-full gap-5 mt-4 lg:justify-center md:items-center md:flex-row">
          <div className={styles.formInputAppDuration}>
            <span className="text-sm font-semibold ">
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
                {" "}
                {errors.appointmentDuration.message}{" "}
              </span>
            )}
          </div>

          <div className={styles.formInputOpening}>
            <span className="text-sm font-semibold ">Horario de atención</span>
            <div className="flex items-end gap-3">
              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold md:text-sm">Desde:</span>
                <select
                  defaultValue={business?.dayStart}
                  {...register("dayStart")}
                  id="dayStart"
                >
                  {timeOptions.map((time) => (
                    <option value={time.value} key={time.label}>
                      {" "}
                      {time.label}{" "}
                    </option>
                  ))}
                </select>
                {errors.dayStart?.message && (
                  <span className="text-xs font-semibold text-red-600">
                    {" "}
                    {errors.dayStart.message}{" "}
                  </span>
                )}
              </div>

              <div className="flex items-end gap-2">
                <span className="text-xs font-semibold md:text-sm">Hasta:</span>
                <select
                  defaultValue={business?.dayEnd}
                  {...register("dayEnd")}
                  id="dayEnd"
                >
                  {timeOptions.map((time) => (
                    <option value={time.value} key={time.label}>
                      {" "}
                      {time.label}{" "}
                    </option>
                  ))}
                </select>
                {errors.dayEnd?.message && (
                  <span className="text-xs font-semibold text-red-600">
                    {" "}
                    {errors.dayEnd.message}{" "}
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

      <div className="flex flex-col gap-4 mt-9 md:flex-row">
        <button onClick={handleSubmitClick} className={styles.button}>
          <LuSave size={18} />
          Guardar cambios
        </button>
        <button className={styles.btn2}>
          <AiOutlineSchedule size={18} />
          Ir a mis turnos
        </button>
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
