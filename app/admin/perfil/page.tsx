import styles from "../../css-modules/miempresa.module.css";
import FormMiPerfil from "@/components/FormMiPerfil";
import axiosReq from "@/config/axios";
import { cookies } from "next/headers";

const getUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get("sacaturno_token");
  const userID = cookieStore.get("sacaturno_userID");
  try {
    const res = await axiosReq.get(`/user/get/${userID?.value}`, {
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
      <header className="flex justify-center w-full mt-8 mb-5 md:mt-7 md:mb-7 h-fit">
        <h4 className="text-2xl font-bold  uppercase">Mi Perfil</h4>
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
