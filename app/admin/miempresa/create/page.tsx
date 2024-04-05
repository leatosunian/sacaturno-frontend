"use client";
import { NextPage } from "next";
import styles from "@/app/css-modules/miempresa.module.css";
import Image from "next/image";
import { durationOptions, timeOptions } from "@/helpers/timeOptions";
import { IBusiness } from "@/interfaces/business.interface";
import { AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { businessSchema } from "@/app/schemas/businessSchema";
import { LuSave } from "react-icons/lu";
import { MdOutlineAddBusiness } from "react-icons/md";
import Alert from "@/components/Alert";
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

const customStyles = {
  container: (provided: any) => ({
    ...provided,
    display: "inline-block",
    width: "100px",
    minWidth: "100px",
    height: "40px",
    minHeight: "40px",
    textAlign: "left",
    border: "none",
  }),
  control: (provided: any) => ({
    ...provided,
    border: "1px solid #757575",
    borderRadius: "5px",
    minHeight: "1px",
    height: "42px",
  }),
  input: (provided: any) => ({
    ...provided,
    minHeight: "1px",
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    minHeight: "1px",
    paddingTop: "0",
    paddingBottom: "0",
    width: "26px",
    fontSize: "14px",
    color: "#757575",
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    minHeight: "1px",
    height: "24px",
  }),
  clearIndicator: (provided: any) => ({
    ...provided,
    minHeight: "1px",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    minHeight: "1px",
    height: "40px",
    paddingTop: "0",
    paddingBottom: "0",
    fontSize: "13px",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    minHeight: "1px",
    paddingBottom: "2px",
  }),
};

const CreateBusiness: React.FC = () => {
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
    setValue("dayStart", "8");
    setValue("dayEnd", "17");
    setValue("appointmentDuration", "60");
  }, []);

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

  const createBusiness = async (data: FieldValues) => {
    try {
      const token = localStorage.getItem("sacaturno_token");
      const userID = localStorage.getItem("sacaturno_userID");
      const authHeader = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      if (data) {
        data.ownerID = userID;
        const updatedUser = await axiosReq.post(
          "/business/create",
          data,
          authHeader
        );
        if (updatedUser.data.businessData === "BUSINESS_EXISTS") {
          setAlert({
            msg: "Ya existe una empresa con ese nombre",
            error: true,
            alertType: "ERROR_ALERT",
          });
          hideAlert();
          return;
        }
        setAlert({
          msg: "Empresa creada con éxito",
          error: true,
          alertType: "OK_ALERT",
        });
        hideAlert();
        setTimeout(() => {
          router.push("/admin/miempresa");
        }, 3000);
      }
    } catch (error) {
      setAlert({
        msg: "Error al crear empresa",
        error: true,
        alertType: "ERROR_ALERT",
      });
      hideAlert();
    }
  };

  return (
    <>
        <header className="flex justify-center w-full mt-5 mb-5 md:mt-7 md:mb-7 h-fit">
          <h4 className="text-2xl font-bold md:text-3xl">Crear Empresa</h4>
        </header>

      <div className="flex justify-center w-screen mt-7 h-fit">
        <div className={styles.cont}>
          <form
            onSubmit={handleSubmit((data) => {
              createBusiness(data);
            })}
            className={styles.businessForm}
          >
            <div className="flex flex-col items-center justify-center w-full gap-10 md:gap-5 md:justify-around md:flex-row">
              <div className="flex flex-col justify-between w-full gap-5 md:w-1/2 ">
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
                  <span className="text-sm font-semibold ">
                    Rubro principal
                  </span>
                  <input
                    type="text"
                    maxLength={20}
                    {...register("businessType")}
                  />
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

                <div className={styles.formInput}>
                  <span className="text-sm font-semibold ">
                    Horario de atención
                  </span>
                  <div className="flex items-end gap-3">
                    <div className="flex items-end gap-2">
                      <span className="text-xs font-semibold md:text-sm">
                        Desde:
                      </span>
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
                      <span className="text-xs font-semibold md:text-sm">
                        Hasta:
                      </span>
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
              </div>
            </div>

            <div className="flex flex-col items-start justify-center w-full gap-5 mt-5 md:items-center md:flex-row"></div>
            <button
              onClick={handleSubmitClick}
              className={"inputSubmitField hidden "}
            />
          </form>

          <button onClick={handleSubmitClick} className={styles.button}>
            <MdOutlineAddBusiness size={20} />
            Crear empresa
          </button>
        </div>
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

export default CreateBusiness;
