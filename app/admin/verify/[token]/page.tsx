import UserVerificationComponent from "@/components/UserVerificationComponent";
import axiosReq from "@/config/axios";
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
    }
  } catch (error) {
    return;
  }
};

const UserVerification: React.FC<propsComponent> = async ({ params }) => {
  const verification = await verifyUser(params.token);
  return (
    <>
      <div
        className="flex items-center justify-center w-full"
        style={{ height: "calc(100vh - 64px);" }}
      >
        <UserVerificationComponent userData={verification} />
      </div>
    </>
  );
};

export default UserVerification;
