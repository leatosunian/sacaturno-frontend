"use client";
import styles from "@/app/css-modules/FormMiEmpresa.module.css";
import { timeOptions } from "@/helpers/timeOptions";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosReq from "@/config/axios";
import { FieldValues, useForm } from "react-hook-form";
import { MdOutlineAddBusiness } from "react-icons/md";
import Alert from "@/components/Alert";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import { createBusinessSchema } from "@/app/schemas/createBusinessSchema";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";

interface formInputs {
  name: string;
  businessType: string;
  address: string;
  appointmentDuration: string;
  dayStart: string;
  dayEnd: string;
  email: string;
  phone: number;
  slug: string;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setValue("dayStart", "8");
    setValue("dayEnd", "17");
    setValue("appointmentDuration", "60");
    return () => {
      setLoading(false);
    };
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
    }, 3300);
  };

  const createBusiness = async (data: FieldValues) => {
    setLoading(true);
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
          setLoading(false);
          return;
        }
        setIsCreated(true)
        //setAlert({
        //  msg: "¡Empresa creada! Ahora añade un servicio.",
        //  error: true,
        //  alertType: "OK_ALERT",
        //});
        hideAlert();
        setTimeout(() => {
          router.refresh();
          router.push("/admin/miempresa/settings");
        }, 4000);
      }
    } catch (error) {
      setLoading(false);
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
      {isCreated && (
        <>
          <div
            className="absolute flex items-center justify-center modalCont"
            style={{ top: "64px" }}
          >
            <div className="flex flex-col py-10 bg-white w-80 md:w-96 px-7 h-fit borderShadow">
              <div className="flex flex-col items-center w-full gap-4 h-fit ">
                <BsFillCheckCircleFill
                  className="hidden md:block"
                  size={70}
                  color="#4bc720"
                />
                <BsFillCheckCircleFill
                  className="block md:hidden"
                  size={60}
                  color="#4bc720"
                />
                <h4 className="mb-1 text-xl font-bold text-center uppercase ">
                  ¡Creaste tu empresa!
                </h4>
              </div>

              {/* <span>Hacé click en un turno para ver los detalles</span> */}
              <div className="flex flex-col w-full gap-4 my-2 h-fit">
                <div className="flex flex-col mb-8 text-center w-fit h-fit">
                  <label
                    style={{ fontSize: "14px" }}
                    className="font-medium text-gray-500"
                  >
                    Ahora agregá un servicio antes de comenzar a cargar tus
                    turnos
                  </label>
                </div>

                <div
                  style={{ height: "100%", width: "100%" }}
                  className="flex items-center justify-center w-full"
                >
                  <div className="loaderSmall"></div>
                </div>

                <div className="flex flex-col mx-auto text-center w-fit h-fit">
                  <label
                    style={{ fontSize: "14px" }}
                    className="font-medium text-gray-800"
                  >
                    Aguarde un instante...
                  </label>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
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
                Email de contacto
              </span>
              <input type="text" {...register("email")} maxLength={40} />
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
              <input type="text" {...register("phone")} maxLength={40} />
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
          <button
            onClick={createBusiness}
            type="submit"
            className={"inputSubmitField hidden "}
          />
        </div>
      </form>

      <div className="flex items-center justify-center w-full h-9">
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
            <MdOutlineAddBusiness size={20} />
            Crear empresa
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

export default FormCreateBusiness;
