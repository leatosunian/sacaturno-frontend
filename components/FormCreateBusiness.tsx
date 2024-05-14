"use client";
import styles from "@/app/css-modules/FormMiEmpresa.module.css";
import Image from "next/image";
import { timeOptions } from "@/helpers/timeOptions";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { businessSchema } from "@/app/schemas/businessSchema";
import { MdOutlineAddBusiness } from "react-icons/md";
import Alert from "@/components/Alert";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import { createBusinessSchema } from "@/app/schemas/createBusinessSchema";

interface formInputs {
  name: string;
  businessType: string;
  address: string;
  appointmentDuration: string;
  dayStart: string;
  dayEnd: string;
}

const FormCreateBusiness: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(createBusinessSchema),
  });
  const [alert, setAlert] = useState<AlertInterface>();
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

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3000);
  };

  const createBusiness = async (data: FieldValues) => {
    console.log(data);
    setAlert({
      msg: "",
      error: false,
      alertType: "ERROR_ALERT",
    });
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
            msg: "Solo podes añadir una empresa",
            error: true,
            alertType: "ERROR_ALERT",
          });
          hideAlert();
          return;
        }
        setAlert({
          msg: "Empresa creada con éxito!",
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
      <form
        onSubmit={handleSubmit((data) => {
          createBusiness(data);
        })}
        className={styles.businessForm}
      >
        <div className="flex flex-col items-center justify-center w-full gap-10 md:gap-5 md:justify-around md:flex-row">
          <div className="flex flex-col justify-between w-full gap-5 md:w-1/2 ">
            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Nombre de la empresa
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
                Horario de atención
              </span>
              <div className="flex items-end gap-3">
                <div className="flex items-end gap-2">
                  <span
                    style={{ fontSize: "12px" }}
                    className="font-bold uppercase "
                  >
                    Desde:
                  </span>
                  <select {...register("dayStart")} id="dayStart">
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
                    className="font-bold uppercase "
                  >
                    Hasta:
                  </span>
                  <select {...register("dayEnd")} id="dayEnd">
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

            <div className={styles.formInputAppDuration}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Duración de cada turno
              </span>
              {/* <Select onChange={} options={durationOptions} /> */}
              <select
                className="formInputAppDuration"
                {...register("appointmentDuration")}
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
          </div>
        </div>

        <div className="flex flex-col items-start justify-center w-full gap-5 mt-5 md:items-center md:flex-row">
          <button onClick={createBusiness} type="submit" className={"inputSubmitField hidden "} />
        </div>
      </form>

        <button onClick={handleSubmitClick} className={styles.button}>
          <MdOutlineAddBusiness size={20} />
          Crear empresa
        </button>
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

export default FormCreateBusiness;
