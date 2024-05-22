"use client";
import styles from "@/app/css-modules/NoServicesModal.module.css";
import axiosReq from "@/config/axios";
import { IBusiness } from "@/interfaces/business.interface";
import { useRouter } from "next/navigation";
import { IoIosAlert, IoMdClose } from "react-icons/io";

interface Props {
  businessData: IBusiness | undefined;
}

const ExpiredPlanModal: React.FC<Props> = ({businessData}) => {
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
      router.push(preference.data.sandbox_init_point);
    } catch (error) {
      console.log(error);
    }
  };
  
  return (
    <>
      <div className={styles.modalCont}>
        <div className="flex flex-col px-5 py-10 text-black bg-white w-80 md:w-96 h-fit borderShadow">
          <div className="flex flex-col items-center w-full gap-4 h-fit ">
            <IoIosAlert size={100} color="#d7a954" />

            <h4 className="mb-6 text-xl font-bold text-center uppercase ">
              Tu suscripción ha vencido
            </h4>
          </div>
          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col gap-4 mb-7 w-fit h-fit">
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "14px" }}
                className="font-normal text-center"
              >
                Recuerda abonar tu suscripción al plan full para seguir
                utilizando el servicio.
              </label>
            </div>
          </div>

          <button onClick={handleMercadoPagoPreference} className={styles.button}>Renovar suscripción</button>
        </div>
      </div>
    </>
  );
};

export default ExpiredPlanModal;
