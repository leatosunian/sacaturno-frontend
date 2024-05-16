"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
import styles from "@/app/css-modules/FormMiEmpresa.module.css";
import { useEffect, useState } from "react";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import { FaEdit } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoMdAdd } from "react-icons/io";
import { useRouter } from "next/navigation";
import Alert from "./Alert";
import UpgradePlanModal from "./UpgradePlanModal";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

const FormSettings = ({
  businessData,
  servicesData,
}: {
  businessData: IBusiness;
  servicesData: IService[];
}) => {
  // STATES
  const [services, setServices] = useState<IService[]>();
  const [newService, setNewService] = useState("");
  const [alert, setAlert] = useState<AlertInterface>();
  const [upgradePlanModal, setUpgradePlanModal] = useState(false);

  const router = useRouter();
  // USEFFECTS
  useEffect(() => {
    setServices(servicesData);
  }, [servicesData]);

  // FUNCTIONS
  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3000);
  };

  const addService = async () => {
    if (businessData.subscription === "SC_FREE" && servicesData.length > 0) {
      setUpgradePlanModal(true);
      return;
    }

    if (
      businessData.subscription === "SC_FULL" ||
      (businessData.subscription === "SC_FREE" && servicesData.length === 0)
    ) {
      if (newService !== "" && services) {
        try {
          const token = localStorage.getItem("sacaturno_token");
          const authHeader = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          };

          let newServiceData: IService = {
            name: "",
            businessID: "",
            ownerID: "",
          };
          newServiceData.name = newService;
          newServiceData.businessID = businessData?._id;
          newServiceData.ownerID = businessData?.ownerID;

          const createService = await axiosReq.post(
            "/business/service/create",
            newServiceData,
            authHeader
          );
          setAlert({
            msg: "Servicio añadido correctamente",
            error: true,
            alertType: "OK_ALERT",
          });
          hideAlert();
          setNewService("");
          router.refresh();
        } catch (error) {
          setAlert({
            msg: "Error al crear servicio",
            error: true,
            alertType: "ERROR_ALERT",
          });
        }
      }
    }
  };

  const deleteService = async (serviceID: string | undefined) => {
    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      await axiosReq.delete(
        `/business/service/delete/${serviceID}`,
        authHeader
      );
      setAlert({
        msg: "Servicio eliminado",
        error: true,
        alertType: "OK_ALERT",
      });
      hideAlert();
      router.refresh();
    } catch (error) {
      setAlert({
        msg: "Error al eliminar servicio",
        error: true,
        alertType: "ERROR_ALERT",
      });
    }
  };

  const handleEditService = async () => {};
  return (
    <>
      {upgradePlanModal && (
        <UpgradePlanModal closeModalF={() => setUpgradePlanModal(false)} />
      )}

      {/* SERVICES SECTION */}
      <div className="flex flex-col w-fit h-fit">
        <h3 className="mb-8 text-xl font-bold text-center uppercase md:mb-4 ">
          Servicios
        </h3>

        <div className="flex flex-col items-center justify-center w-full gap-6 my-0 lg:flex-row lg:mt-4 md:gap-5 lg:gap-16 ">
          <div className={`${styles.formInputAppDuration} mb-auto`}>
            <div className={styles.formInput}>
              <span
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                añadir servicio
              </span>
              <div className="flex items-center gap-3 w-fit h-fit">
                <input
                  placeholder="Nombre del servicio"
                  type="text"
                  value={newService}
                  maxLength={30}
                  onChange={(e) => {
                    setNewService(e.target.value);
                  }}
                />
                <button onClick={addService} className={styles.button}>
                  <IoMdAdd size={17} />
                </button>
              </div>
            </div>
          </div>

          {servicesData?.length === 0 && (
            <div className="flex items-center justify-center h-fit lg:h-16 w-fit">
              <span className="text-sm font-semibold uppercase">
                Aún no tenés servicios creados.
              </span>
            </div>
          )}

          {servicesData?.length !== 0 && (
            <div className="flex flex-col gap-2 w-fit h-fit">
              {servicesData?.map((service) => (
                <div key={service._id} className={styles.formInputAppDuration}>
                  <div
                    style={{
                      padding: "22px 16px",
                      border: "1px solid rgba(95, 95, 95, 0.267)",
                      borderRadius: "8px",
                    }}
                    className="flex items-center h-8 gap-1 w-fit"
                  >
                    <span className="mr-4 text-xs font-semibold uppercase">
                      {service.name}
                    </span>
                    <button
                      onClick={handleEditService}
                      className={styles.button}
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      className={styles.button}
                      key={service._id}
                      onClick={() => deleteService(service._id)}
                    >
                      <RxCross2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* SERVICES SECTION */}

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

      <div className="flex flex-col w-full mb-7 md:mb-12 h-fit">
        <h3 className="mb-8 text-xl font-bold text-center uppercase md:mb-4 ">
          Mi Plan
        </h3>

        <div className="flex flex-col justify-between w-full gap-4 px-4 md:px-16 md:gap-0 h-fit md:flex-row">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <b className="text-xs uppercase">Plan actual</b>
              <span className="text-xs font-semibold uppercase">Plan Free</span>
            </div>

            <div className="flex flex-col">
              <b className="text-xs uppercase">Estado del plan</b>
              <span className="text-xs font-semibold text-green-600 uppercase">● Activo</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <b className="text-xs uppercase">Fecha de pago</b>
              <span className="text-xs font-semibold uppercase">18/04/2024</span>
            </div>
            <div className="flex flex-col">
              <b className="text-xs uppercase">Fecha de vencimiento</b>
              <span className="text-xs font-semibold uppercase">18/04/2024</span>
            </div>
          </div>
        </div>

      </div>
      {/* <div className="flex justify-start w-full px-4 my-3 h-fit lg:my-0">
        <Link className="flex items-center gap-2 text-xs font-semibold uppercase" style={{color:'#dd4924'}} href="/admin/miempresa">
          <FaArrowLeft />
          Modificar datos de mi empresa
        </Link>
      </div> */}
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
      {/* ALERT */}
    </>
  );
};

export default FormSettings;
