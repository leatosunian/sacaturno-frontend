"use client";
import styles from "@/app/css-modules/NoServicesModal.module.css";
import Link from "next/link";
import warningIcon from "@/public/warning.png";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";

interface props {
  closeModalF: () => void;
}

const UpgradePlanModal: React.FC<props> = ({closeModalF}) => {
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
            <Image
              src={warningIcon}
              style={{ width: "60px", height: "60px" }}
              alt="Correct"
            />
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
          <Link href={"/admin/miempresa"}>
            <button className={styles.button}>Comprar plan</button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default UpgradePlanModal;
