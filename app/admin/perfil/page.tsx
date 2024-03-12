import { NextPage } from "next";
import styles from "../../css-modules/miempresa.module.css";
import Image from "next/image";
import defaultImg from "/public/user.png";
import { LuSave } from "react-icons/lu";
import FormMiPerfil from "@/components/FormMiPerfil";
import { IUser } from "@/interfaces/user.interface";
import axiosReq from "@/config/axios";
import { cookies } from "next/headers";

const getUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  /** almacenar userID en cookie o hacer un context de autenticación para completar el ID en la request */
  try {
    const res = await axiosReq.get("/user/get/65c468cd4c3337eb8a44976f", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token?.value}`,
      },
    });
    return res.data;
  } catch (error: any) {
    const response_data = {
      name: "",
      surname: "",
      phone: "",
      email: "",
    };
    return { response_data };
  }
};

const MiPerifl = async () => {
  const data = await getUser();
  return (
    <>
      <header className="flex justify-center w-full mt-5 mb-5 md:mt-7 md:mb-7 h-fit">
        <h4 className="text-2xl font-bold md:text-3xl">Mi Perfil</h4>
      </header>

      <div className="flex justify-center w-screen mt-5 h-fit">
        <div className={styles.cont}>
          <FormMiPerfil profileData={data} />
        </div>
      </div>
    </>
  );
};

export default MiPerifl;
