"use client";
import styles from "@/app/css-modules/NoServicesModal.module.css";
import { Button } from "@/components/ui/button";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IoIosAlert } from "react-icons/io";

interface Props {
  businessData: IBusiness | undefined;
  onCloseModal: () => void;
}

const ExpiredPlanModal: React.FC<Props> = ({ businessData, onCloseModal }) => {
  const router = useRouter();
  console.log(businessData);

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
      businessID: businessData?._id,
      ownerID: businessData?.ownerID,
      email: businessData?.email,
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

  return (
    <>
      <div className="flex flex-col items-center w-full gap-8 pb-1 h-fit">

        <div className="flex flex-col items-center w-full gap-4 h-fit ">
          <IoIosAlert size={100} color="#d7a954" />
          <h4
            className="relative inline-block w-full px-2 mx-auto text-2xl font-bold text-center uppercase"
            style={{ fontSize: 22 }}
          >
            Tu suscripción ha vencido
            <span
              className="absolute left-0 right-0 mx-auto"
              style={{
                bottom: -2,
                height: 2,
                background: "#dd4924",
                width: "30%",
              }}
            />
          </h4>
        </div>
        {/* <span>Hacé click en un turno para ver los detalles</span> */}
        <div className="flex flex-col gap-4 w-fit h-fit">
          <div className="flex flex-col w-fit h-fit">
            <label
              style={{ fontSize: "15px" }}
              className="font-medium text-center"
            >
              Recuerda abonar tu suscripción al Plan Full para continuar
              creando nuevos turnos.
            </label>
          </div>
        </div>

        <Button
          onClick={handleMercadoPagoPreference}
          className="w-full mt-2 text-white bg-orange-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-orange-700"            >
          Renovar suscripción
        </Button>
      </div>
    </>
  );
};

export default ExpiredPlanModal;
