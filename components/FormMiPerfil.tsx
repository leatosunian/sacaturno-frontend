"use client";
import { NextPage } from "next";
import styles from "../app/css-modules/FormMiPerfil.module.css";
import Image from "next/image";
import defaultImg from "/public/user.png";
import { IUser } from "@/interfaces/user.interface";
import { FormEventHandler, SetStateAction, useEffect, useState } from "react";
import { LuSave } from "react-icons/lu";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userSchema } from "@/app/schemas/userSchema";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "./Alert";
import { useRouter } from "next/navigation";

interface Props {
  profileData: any;
}

interface formInputs {
  name: string;
  surname: string;
  phone: number;
  email: string;
}

const FormMiPerfil: React.FC<Props> = ({ profileData }: Props) => {
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
  const router = useRouter();
  useEffect(() => {
    setValue("name", profileData.response_data.name);
    setValue("surname", profileData.response_data.surname);
    setValue("phone", profileData.response_data.phone);
    setValue("email", profileData.response_data.email);
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
    const token = localStorage.getItem("sacaturno_token");
    const userID = localStorage.getItem("sacaturno_userID");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
        
    if (data) {
      data._id = userID
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
    }
  };

  const myLoader = ({ src }: { src: string }) => {
    return `https://sacaturno-server-production.up.railway.app/api/user/getprofilepic/${profile?.profileImage}`;
  };

  const updateProfileImage = async (image: File) => {
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
      "/user/updateimage/",
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
  };

  return (
    <>
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
        <div className="flex flex-col justify-between w-full gap-5 md:w-1/2 md:gap-3">
          <div className={styles.formInput}>
            <span className="text-sm font-semibold">Nombre</span>
            <input type="text" {...register("name")} maxLength={30} />
            {/* {
                  errors.name?.message && <span className='text-xs font-semibold text-red-600'> {errors.name.message} </span>
                } */}
          </div>
          <div className={styles.formInput}>
            <span className="text-sm font-semibold">Apellido</span>
            <input type="text" {...register("surname")} maxLength={30} />
            {/* {
                  errors.surname?.message && <span className='text-xs font-semibold text-red-600'> {errors.surname.message} </span>
                }    */}
          </div>
          <div className={styles.formInput}>
            <span className="text-sm font-semibold">Email</span>
            <input type="email" {...register("email")} maxLength={40} />
            {/* {
                  errors.email?.message && <span className='text-xs font-semibold text-red-600'> {errors.email.message} </span>
                }    */}
          </div>
          <div className={styles.formInput}>
            <span className="text-sm font-semibold">Número de teléfono</span>
            <input
              type="number"
              {...register("phone")}
              maxLength={20}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            {/* {
                  errors.phone?.message && <span className='text-xs font-semibold text-red-600'> {errors.phone.message} </span>
                }                 */}
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

export default FormMiPerfil;
