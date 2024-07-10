"use client";
import styles from "../app/css-modules/FormMiPerfil.module.css";
import Image from "next/image";
import { IUser } from "@/interfaces/user.interface";
import { useEffect, useState } from "react";
import { LuSave } from "react-icons/lu";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/app/schemas/userSchema";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "./Alert";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaMedal } from "react-icons/fa6";
import { MdMoneyOff } from "react-icons/md";
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

const FormMiPerfil: React.FC<Props> = ({
  profileData,
  subscriptionData,
  businessData,
  paymentsData,
}: Props) => {
  const {
    register,
    handleSubmit,
    watch,
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
    setValue(
      "birthdate",
      dayjs(profileData.response_data.birthdate).format("YYYY/MM/DD")
    );

    return setProfile(profileData.response_data);
  }, [profileData]);

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
      }
    }
  };

  const handleSubmitClick = () => {
    const fileInput = document.querySelector(
      ".inputSubmitField"
    ) as HTMLElement;
    if (fileInput != null) {
      fileInput.click();
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
        const updatedUser = await axiosReq.put(
          "/user/editprofile",
          data,
          authHeader
        );
        console.log(updatedUser);
        setAlert({
          msg: "Los cambios han sido guardados",
          error: true,
          alertType: "OK_ALERT",
        });
        hideAlert();
      } catch (error) {
        setAlert({
          msg: "No se pudo guardar los cambios",
          error: true,
          alertType: "ERROR_ALERT",
        });
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
      const preference = await axiosReq.post(
        "/subscription/pay/full",
        data,
        authHeader
      );
      router.push(preference.data.init_point);
    } catch (error) {
      console.log(error);
    }
  };

  const myLoader = ({ src }: { src: string }) => {
    return `https://sacaturno-server-production.up.railway.app/api/user/getprofilepic/${profile?.profileImage}`;
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
        "/user/updateimage",
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

  return (
    <>
      <div className="flex justify-center w-full mb-9 h-fit">
        <h3 className="text-xl font-bold uppercase ">Información personal</h3>
      </div>
      <form
        className={styles.form}
        onSubmit={handleSubmit((data) => saveChanges(data))}
      >
        <div
          onClick={handleClick}
          className="rounded-full inputFileFormProfile"
          title="Cambiar foto de perfil"
        >
          <Image
            loader={myLoader}
            width={64}
            height={64}
            className="w-16 rounded-full"
            src={
              `https://sacaturno-server-production.up.railway.app/api/user/getprofilepic/` +
              profile?.profileImage
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
        <div className="flex flex-col justify-center w-full gap-5 md:w-1/2 md:gap-5">
          <div className={styles.formInput}>
            <span style={{ fontSize: "12px" }} className="font-bold uppercase ">
              Nombre completo
            </span>
            <input type="text" {...register("name")} maxLength={30} />
            {errors.name?.message && (
              <span className="text-xs font-semibold text-red-600">
                {errors.name.message}
              </span>
            )}
          </div>
          <div className={styles.formInput}>
            <span style={{ fontSize: "12px" }} className="font-bold uppercase ">
              Email
            </span>
            <input
              className="text-gray-400"
              type="email"
              {...register("email")}
              disabled
              maxLength={40}
              title="El email no se puede modificar"
            />
            {errors.email?.message && (
              <span className="text-xs font-semibold text-red-600">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className={styles.formInput}>
            <span style={{ fontSize: "12px" }} className="font-bold uppercase ">
              Número de teléfono
            </span>
            <input
              type="number"
              {...register("phone")}
              maxLength={20}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            {errors.phone?.message && (
              <span className="text-xs font-semibold text-red-600">
                {errors.phone.message}
              </span>
            )}
          </div>

          <span className="text-xs font-light">
            ¿Olvidaste tu contraseña?
            {"  "}
            <Link
              className="font-semibold cursor-pointer blackOrangeHover"
              href="/login/recovery"
            >
              Cambiar contraseña
            </Link>
          </span>
        </div>
        <button
          onClick={handleSubmitClick}
          className={"inputSubmitField hidden "}
        />
      </form>

          <div className="flex flex-col gap-2 my-2 md:gap-0 w-fit h-fit"></div>

          <div className="flex items-center justify-center w-full mt-6 h-9">
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
      {typeof businessData === "object" && (
        <>

          {/* DIVIDER */}
          <div className="flex justify-center w-full my-7 md:my-12 h-fit ">
            <div
              style={{
                width: "80%",
                height: "1px",
                background: "rgba(0, 0, 0, 0.2)",
              }}
            ></div>
          </div>
          {/* DIVIDER */}

          <div className="flex flex-col w-full h-fit">
            <h3 className="mb-8 text-xl font-bold text-center uppercase md:mb-10 ">
              Planes y facturación
            </h3>

            <div className="w-full mb-5 md:px-20 ">
              <h5 className="mb-4 text-xl font-semibold">&#128188; Mi plan</h5>
            </div>

            {subscriptionData.subscriptionType !== "SC_EXPIRED" && (
              <>
                <div className="flex flex-col justify-between w-full gap-4 px-0 mb-5 md:px-20 md:gap-0 h-fit md:flex-row">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      {subscriptionData.subscriptionType === "SC_FREE" && (
                        <>
                          <b className="text-xs uppercase">Plan actual</b>
                          <span className="text-xs font-semibold uppercase">
                            Plan Free
                          </span>
                        </>
                      )}
                      {subscriptionData.subscriptionType === "SC_FULL" && (
                        <>
                          <b className="text-xs uppercase">Plan actual</b>
                          <span className="flex items-center gap-1 text-xs font-semibold uppercase">
                            <FaMedal color="#dd4924" />
                            Plan Full
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-col">
                      {subscriptionData.subscriptionType === "SC_FREE" && (
                        <>
                          <b className="text-xs uppercase">Estado del plan</b>
                          <span className="text-xs font-semibold text-green-600 uppercase">
                            ● Activo
                          </span>
                        </>
                      )}
                      {subscriptionData.subscriptionType === "SC_FULL" && (
                        <>
                          <b className="text-xs uppercase">Estado del plan</b>
                          <span className="text-xs font-semibold text-green-600 uppercase">
                            ● Activo
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {subscriptionData.subscriptionType === "SC_FREE" && (
                      <>
                        <div className="flex flex-col">
                          <b className="text-xs uppercase">
                            Fecha de activación
                          </b>
                          <span className="text-xs font-semibold uppercase">
                            {subscriptionData.paymentDate}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <b className="text-xs uppercase">
                            Fecha de vencimiento
                          </b>
                          <span className="text-xs font-semibold uppercase">
                            {subscriptionData.expiracyDate}
                          </span>
                        </div>
                      </>
                    )}

                    {subscriptionData.subscriptionType === "SC_FULL" && (
                      <>
                        <div className="flex flex-col">
                          <b className="text-xs uppercase">Fecha de pago</b>
                          <span className="text-xs font-semibold uppercase">
                            {subscriptionData.paymentDate}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <b className="text-xs uppercase">
                            Fecha de vencimiento
                          </b>
                          <span className="text-xs font-semibold uppercase">
                            {subscriptionData.expiracyDate}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {subscriptionData.subscriptionType === "SC_EXPIRED" && (
              <>
                <div className="flex flex-col items-center justify-center gap-2 px-5 mt-3 mb-5 md:px-20">
                  <IoMdAlert color="#dd4924" size={40} />
                  <span className="text-xs font-semibold text-center md:text-sm">
                    Tu suscripción ha caducado. Hacé click en el boton debajo
                    para renovar tu plan.
                  </span>
                </div>

                <div className="mt-0 mb-6 md:mt-4">
                  <button
                    onClick={handleMercadoPagoPreference}
                    className={`${styles.button} mx-auto`}
                  >
                    Actualizar plan
                  </button>
                </div>
              </>
            )}

            {subscriptionData.subscriptionType === "SC_FREE" && (
              <>
                {/* <div className="flex flex-col items-center justify-center gap-2 px-5 mt-5 md:mt-7 md:flex-row">
                  <IoMdAlert
                    className="hidden md:block"
                    color="#dd4924"
                    size={25}
                  />
                  <IoMdAlert
                    className="block md:hidden"
                    color="#dd4924"
                    size={40}
                  />
                  <span className="text-xs font-semibold md:text-sm">
                    Estás utilizando una prueba gratuita.
                  </span>
                </div>

                <div className="mt-4 mb-6">
                  <button
                    onClick={handleMercadoPagoPreference}
                    className={`${styles.button} mx-auto`}
                  >
                    Actualizar plan
                  </button>
                </div> */}
                <div className="px-0 mt-5 mb-7 notifications-container md:px-20">
                  <div className="alert">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5 alert-svg"
                        >
                          <path
                            clipRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            fillRule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <div className="alert-prompt-wrap">
                        <p className="text-sm text-yellow-700">
                          Estás utilizando una prueba gratuita.{" "}
                          <span
                            className="cursor-pointer alert-prompt-link"
                            onClick={handleMercadoPagoPreference}
                          >
                            Actualizar suscripción
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* DIVIDER */}
            <div className="flex justify-center w-full my-7 md:my-6 h-fit ">
              <div
                style={{
                  width: "35%",
                  height: "1px",
                  background: "rgba(0, 0, 0, 0.2)",
                }}
              ></div>
            </div>
            {/* DIVIDER */}

            <div className="flex flex-col justify-between w-full gap-4 px-0 mt-6 mb-5 md:mb-10 md:px-20 md:gap-5 h-fit ">
              <h5 className="mb-4 text-xl font-semibold">
                &#128179; Historial de facturación
              </h5>
              <div className="flex flex-col w-full h-full gap-2 ">
                <div
                  className="items-center justify-between hidden w-full pb-1 mb-2 h-fit lg:flex"
                  style={{
                    borderBottom: "1px solid rgba(0, 0, 0, 0.2)",
                    paddingRight: "7px",
                  }}
                >
                  <span className="w-4/12 text-xs font-bold uppercase">
                    Suscripción
                  </span>
                  <span className="w-1/5 text-xs font-bold uppercase ">
                    Precio
                  </span>
                  <span className="w-2/6 text-xs font-bold uppercase ">
                    Fecha de pago
                  </span>
                  <span className="w-1/5 text-xs font-bold uppercase">
                    Estado
                  </span>
                </div>

                <div
                  className={`${styles.paymentsCont} flex flex-col gap-4 w-full h-full max-h-96 overflow-y-scroll`}
                >
                  {/* <div className="flex items-center justify-between w-full h-fit">
                    <span className="flex items-center w-4/12 gap-1 text-sm font-medium">
                      <FaMedal color="#dd4924" />
                      Plan Prueba
                    </span>
                    <span className="w-1/5 text-sm font-semibold">$10200</span>
                    <span className="w-2/6 text-sm">18/6/2024</span>
                    <span className="w-1/5 text-xs font-semibold text-green-600 uppercase">
                      ● Aprobado
                    </span>
                  </div> */}

                  {paymentsData.length > 0 && paymentsData.map((payment) => (
                    <>
                      <div
                        key={payment._id}
                        className={`${styles.paymentCard} w-full h-fit flex  items-center justify-around  md:justify-between  rounded-xl`}
                      >
                        {payment.subscriptionType === "SC_FREE" && (
                          <span className="flex items-center gap-1 text-sm font-medium w-fit lg:w-4/12 ">
                            <FaMedal color="#dd4924" />
                            Plan Free
                          </span>
                        )}
                        {payment.subscriptionType === "SC_FULL" && (
                          <span className="flex items-center gap-1 text-sm font-medium w-fit lg:w-4/12 ">
                            <FaMedal color="#dd4924" />
                            Plan Full
                          </span>
                        )}

                        <div className="flex flex-col w-fit h-fit md:hidden">
                          {payment.price > 0 && (
                            <span className="text-sm font-semibold w-fit md:w-1/5">
                              AR$ {payment.price}
                            </span>
                          )}
                          {payment.price === 0 && (
                            <span className="text-sm font-semibold w-fit md:w-1/5">
                              Gratis
                            </span>
                          )}

                          <span className="text-xs md:text-sm w-fit md:w-2/6">
                            {dayjs(payment.paymentDate).format("DD/MM/YYYY")}
                          </span>
                        </div>

                        {payment.price > 0 && (
                          <span className="hidden w-1/5 text-sm font-semibold md:w-fit lg:w-1/5 md:block">
                            AR$ {payment.price}
                          </span>
                        )}
                        {payment.price === 0 && (
                          <span className="hidden w-1/5 text-sm font-semibold md:w-fit lg:w-1/5 md:block">
                            Gratis
                          </span>
                        )}
                        <span className="hidden w-2/6 text-sm lg:w-2/6 md:w-fit md:block">
                          {dayjs(payment.paymentDate).format("DD/MM/YYYY")}
                        </span>
                        <span className="block text-xs font-semibold text-green-600 uppercase sm:hidden w-fit md:w-1/5">
                          Aprobado
                        </span>
                        <span className="hidden text-xs font-semibold text-green-600 uppercase sm:block w-fit md:w-1/5">
                          ● Aprobado
                        </span>
                      </div>
                    </>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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

export default FormMiPerfil;
