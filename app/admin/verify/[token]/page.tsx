import UserVerificationComponent from "@/components/home/register/UserVerificationComponent";
import axiosReq from "@/config/axios";
import styles from "@/app/css-modules/AuthCentered.module.css";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Confirmar correo | SacaTurno",
  description: "Aplicación de turnos online",
};
interface propsComponent {
  params: {
    token: string;
  };
}

const verifyUser = async (token: string) => {
  try {
    const verification = await axiosReq.post(`/user/verify/${token}`);
    if (verification.data._id) {
      return verification.data;
    } else {
      return undefined;
    }
  } catch (error) {
    return;
  }
};

const UserVerification: React.FC<propsComponent> = async ({ params }) => {
  const verification = await verifyUser(params.token);
  return (
    <main className={styles.authBgScreen}>
      <UserVerificationComponent userData={verification} />
    </main>
  );
};

export default UserVerification;
