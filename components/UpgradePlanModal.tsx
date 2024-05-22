"use client";
import styles from "@/app/css-modules/NoServicesModal.module.css";
import Link from "next/link";
import warningIcon from "@/public/warning.png";
import Image from "next/image";
import { IoIosAlert, IoMdClose } from "react-icons/io";

interface props {
  closeModalF: () => void;
  createPreference: () => void;
}

const UpgradePlanModal: React.FC<props> = ({
  closeModalF,
  createPreference,
}) => {
  const closeModal = () => {
    closeModalF();
  };

  return (
    <>
      <div className={styles.modalCont}>
        <div className="flex flex-col px-5 py-10 text-black bg-white w-80 md:w-96 h-fit borderShadow">
          <IoMdClose
            className={styles.closeModal}
            onClick={closeModal}
            size={22}
          />
          <div className="flex flex-col items-center w-full gap-4 h-fit ">
            <IoIosAlert size={100} color="#d7a954" />
            <h4 className="mb-6 text-xl font-bold text-center uppercase ">
              Actualiza tu plan
            </h4>
          </div>
          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col gap-4 mb-7 w-fit h-fit">
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "14px" }}
                className="font-normal text-center"
              >
                Para crear más de un servicio debes suscribirte al Plan Full
              </label>
            </div>
          </div>

          <button onClick={createPreference} className={styles.button}>
            Comprar plan
          </button>
        </div>
      </div>
    </>
  );
};

export default UpgradePlanModal;
