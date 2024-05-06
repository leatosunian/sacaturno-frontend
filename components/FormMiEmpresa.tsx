"use client";
import { NextPage } from "next";
import styles from "../app/css-modules/FormMiEmpresa.module.css";
import Image from "next/image";
import { durationOptions, timeOptions } from "@/helpers/timeOptions";
import { IBusiness } from "../interfaces/business.interface";
import { AxiosResponse } from "axios";
import { ChangeEvent, ChangeEventHandler, MouseEventHandler, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { businessSchema } from "@/app/schemas/businessSchema";
import { LuSave } from "react-icons/lu";
import { AiOutlineSchedule } from "react-icons/ai";
import Alert from "./Alert";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import { IoMdAdd } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
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
  phone: number;
  email: string;
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
  const [isBusiness, setIsBusiness] = useState(false);
  const [newService, setNewService] = useState("");
  const [services, setServices] = useState<IService[]>();

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
    setServices(servicesData);
  }, [servicesData]);

  useEffect(() => {
    if (business) {
      setValue("name", business.name);
      setValue("address", business.address);
      setValue("businessType", business.businessType);
      setValue("dayStart", business.dayStart);
      setValue("dayEnd", business.dayEnd);
      setValue("appointmentDuration", business.appointmentDuration);
      setValue("phone", parseInt(business.phone));
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
      const updatedImage = await axiosReq.post(
        "/business/updateimage",
        formData,
        authHeader
      );
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
        alertType: "ERROR_ALERT",
      });
    }
  };

  const addService = async () => {
    if (newService !== "") {
      try {
        const token = localStorage.getItem("sacaturno_token");
        const authHeader = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        let newServiceData: IService = {
          name: "",
          businessID: "",
          ownerID: "",
        };
        newServiceData.name = newService;
        newServiceData.businessID = business?._id;
        newServiceData.ownerID = business?.ownerID;

        const createService = await axiosReq.post(
          "/business/service/create",
          newServiceData,
          authHeader
        );
        setAlert({
          msg: "Servicio añadido correctamente",
          error: true,
          alertType: "OK_ALERT",
        });
        hideAlert();
        setNewService("");
        router.refresh();
      } catch (error) {
        setAlert({
          msg: "Error al crear servicio",
          error: true,
          alertType: "ERROR_ALERT",
        });
      }
    }
  };

  const deleteService = async (serviceID:string | undefined) => {
    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      await axiosReq.delete(
        `/business/service/delete/${serviceID}`,
        authHeader
      );
      setAlert({
        msg: "Servicio eliminado",
        error: true,
        alertType: "OK_ALERT",
      });
      hideAlert();
      router.refresh();
    } catch (error) {
      setAlert({
        msg: "Error al eliminar servicio",
        error: true,
        alertType: "ERROR_ALERT",
      });
    }
  }

  const handleEditService = async () => {};

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
        <div className="flex justify-center w-full mb-5 h-fit">
          <h3 className="text-xl font-bold uppercase ">Datos de la empresa</h3>
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

          </div>
        </div>

        <div className="flex justify-center w-full h-fit lg:my-7 my-11">
          <div
            style={{
              width: "80%",
              height: "1px",
              background: "rgba(0, 0, 0, 0.2)",
            }}
          ></div>
        </div>

        <div className="flex justify-center w-full h-fit">
          <h3 className="text-xl font-bold uppercase ">
            Configuración de turnos
          </h3>
        </div>

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

        <div className="flex justify-center w-full h-fit lg:my-7 my-11">
          <div
            style={{
              width: "80%",
              height: "1px",
              background: "rgba(0, 0, 0, 0.2)",
            }}
          ></div>
        </div>

        <div className="flex justify-center w-full h-fit">
          <h3 className="text-xl font-bold uppercase ">Servicios</h3>
        </div>

        <div className="flex flex-col items-center justify-center w-full gap-10 mt-6 lg:flex-row lg:mt-4 md:gap-16 ">
          <div className={`${styles.formInputAppDuration} mb-auto`}>
            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                añadir servicio
              </span>
              <div className="flex items-center gap-3 w-fit h-fit">
                <input
                  placeholder="Nombre del servicio"
                  type="text"
                  value={newService}
                  maxLength={30}
                  onChange={(e) => {
                    setNewService(e.target.value);
                  }}
                />
                <button onClick={addService} className={styles.button}>
                  <IoMdAdd size={17} />
                </button>
              </div>
            </div>
          </div>

          {services?.length === 0 && (
            <div className="flex items-center justify-center h-16 w-fit">
              <span className="text-sm font-semibold uppercase">
                Aún no tenés servicios creados.
              </span>
            </div>
          )}

          {services?.length !== 0 && (
            <div className="flex flex-col gap-2 w-fit h-fit">
              {services?.map((service) => (
                  <div key={service._id} className={styles.formInputAppDuration}>
                    <div
                      style={{
                        padding: "22px 16px",
                        border: "1px solid rgba(95, 95, 95, 0.267)",
                        borderRadius: "8px",
                      }}
                      className="flex items-center h-8 gap-1 w-fit"
                    >
                      <span className="mr-4 text-xs font-semibold uppercase">
                        {service.name}
                      </span>
                      <button
                        onClick={handleEditService}
                        className={styles.button}
                      >
                        <FaEdit size={12} />
                      </button>
                      <button
                        className={styles.button}
                        key={service._id}
                        onClick={() => deleteService(service._id)}
                      >
                        <RxCross2 size={12} />
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSubmitClick}
          className={"inputSubmitField hidden "}
        />
      </form>

      <div className="flex gap-4 mt-9 ">
        <button onClick={handleSubmitClick} className={styles.button}>
          <LuSave size={18} />
          Guardar cambios
        </button>
        <button className={styles.btn2}>
          <AiOutlineSchedule size={18} />
          Turnos
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
