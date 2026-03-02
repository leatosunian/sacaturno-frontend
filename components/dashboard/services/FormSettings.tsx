"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
import styles from "@/app/css-modules/FormMiEmpresa.module.css";
import { useEffect, useState } from "react";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import UpgradePlanModal from "./UpgradePlanModal";
import { LuSearchX } from "react-icons/lu";
import { TbPlaylistAdd } from "react-icons/tb";
import CreateServiceModal from "./CreateServiceModal";
import { IoMdMore } from "react-icons/io";
import EditServiceModal from "./EditServiceModal";
import Alert from "@/components/Alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FormSettings = ({
  businessData,
  servicesData,
  subscriptionData,
}: {
  businessData: IBusiness;
  servicesData: IService[];
  subscriptionData: any;
}) => {
  // STATES
  const [services, setServices] = useState<IService[]>();
  const [newService, setNewService] = useState("");
  const [alert, setAlert] = useState<AlertInterface>();
  const [upgradePlanModal, setUpgradePlanModal] = useState<boolean>(false);
  const [editServiceModal, setEditServiceModal] = useState<boolean>(false);
  const [serviceToEdit, setServiceToEdit] = useState<IService>();
  const [createServiceModal, setCreateServiceModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();



  // FUNCTIONS
  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3000);
  };

  const addService = async (formData: {
    name: string;
    price: number;
    description: string;
    duration?: number;
  }) => {
    if (
      subscriptionData.subscriptionType === "SC_FREE" &&
      servicesData.length > 0
    ) {
      setUpgradePlanModal(true);
      return;
    }

    if (
      subscriptionData.subscriptionType === "SC_FULL" ||
      (subscriptionData.subscriptionType === "SC_FREE" &&
        servicesData.length === 0)
    ) {
      if (formData && services) {
        setLoading(true);
        try {
          const token = localStorage.getItem("sacaturno_token");
          const authHeader = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          };

          let newServiceData: IService = {
            name: formData.name,
            businessID: businessData?._id,
            ownerID: businessData?.ownerID,
            price: formData.price,
            description: formData.description,
            duration: formData.duration,
          };

          await axiosReq.post(
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
          setCreateServiceModal(false);
          setNewService("");
          setLoading(false);
          router.refresh();
        } catch (error) {
          setLoading(false);
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
    setEditServiceModal(false);
    setLoading(true);
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
      setLoading(false);
    } catch (error) {
      setAlert({
        msg: "Error al eliminar servicio",
        error: true,
        alertType: "ERROR_ALERT",
      });
      setLoading(false);
    }
  };

  const editService = async (formData: {
    id: string | undefined;
    name: string | undefined;
    description: string | undefined;
    price: number | undefined;
    duration?: number | undefined;
  }) => {
    setEditServiceModal(false);
    setLoading(true);

    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      await axiosReq.put(`/business/service/edit`, formData, authHeader);
      setAlert({
        msg: "Servicio editado",
        error: true,
        alertType: "OK_ALERT",
      });
      hideAlert();
      router.refresh();
      setLoading(false);
    } catch (error) {
      setAlert({
        msg: "Error al editar servicio",
        error: true,
        alertType: "ERROR_ALERT",
      });
      setLoading(false);
    }
  };

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
      businessID: businessData._id,
      ownerID: businessData.ownerID,
      email: businessData.email,
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
      setAlert({
        msg: "No se pudo generar el pago. Intente luego.",
        error: true,
        alertType: "ERROR_ALERT",
      });
    }
  };

  const setEditService = async (service: IService) => {
    if (service !== undefined) {
      setServiceToEdit(service);
      setEditServiceModal(true);
    }
  };

  // USEFFECTS
  useEffect(() => {
    setServices(servicesData);
    setLoading(false);
  }, [servicesData]);

  return (
    <>
      {/* create new service modal */}
      <Dialog open={createServiceModal} onOpenChange={() => setCreateServiceModal(false)} >
        <DialogContent className="flex flex-col bg-white w-80 md:w-96 p-7 h-fit borderShadow">
          <CreateServiceModal onCreateService={(formData) => addService(formData)} />
        </DialogContent>
      </Dialog>

      {/* upgrade plan modal */}
      <Dialog open={upgradePlanModal} onOpenChange={() => setUpgradePlanModal(false)} >
        <DialogContent className="flex flex-col bg-white w-80 md:w-96 p-7 h-fit borderShadow">
          <UpgradePlanModal
            createPreference={handleMercadoPagoPreference}
          />
        </DialogContent>
      </Dialog>

      {/* edit service modal */}
      <Dialog open={editServiceModal} onOpenChange={() => setEditServiceModal(false)} >
        <DialogContent className=" sm:w-[470px] w-[93vw]">
          <EditServiceModal
            serviceData={serviceToEdit}
            onDeleteService={(serviceID) => deleteService(serviceID)}
            onEditService={(serviceData) => editService(serviceData)}
          />
        </DialogContent>
      </Dialog>

      {/* SERVICES SECTION */}
      <Card className="sm:w-[500px] w-[93vw] mx-auto p-5 h-fit md:p-6">
        <div className="flex flex-col w-full gap-5 h-fit">
          <h4
            className="relative inline-block px-2 mx-auto text-xl font-bold text-center uppercase w-fit"
          >
            Servicios
            {/* linea */}
            <span
              className="absolute left-0 right-0 mx-auto"
              style={{
                bottom: -2,    // gap entre texto y linea (ajustalo)
                height: 2,     // grosor de la linea (ajustalo)
                background: "#dd4924",
                width: "60%",  // ancho opcional de la linea
              }}
            />
          </h4>

          {loading && (
            <>
              <div className="w-full h-64 lg:h-72">
                <div
                  style={{ height: "100%", width: "100%" }}
                  className="flex items-center justify-center w-full"
                >
                  <div className="loader"></div>
                </div>
              </div>
            </>
          )}

          {services?.length === 0 && !loading && (
            <>
              <div className="flex flex-col items-center justify-center gap-5 mt-0 md:mt-3 mb-7 md:px-20">
                <LuSearchX
                  color="#dd4924"
                  className="block md:hidden"
                  size={50}
                />
                <LuSearchX
                  color="#dd4924"
                  className="hidden md:block"
                  size={100}
                />
                <div className="flex flex-col items-center gap-3 w-fit h-fit">
                  <span className="text-lg font-semibold text-center md:text-xl ">
                    Todavía no creaste ningún servicio.
                  </span>
                  <span className="w-full text-xs font-semibold text-center text-gray-500 md:w-5/6">
                    Recordá que debés crear al menos un servicio para comenzar a
                    gestionar tus turnos
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <button
                  onClick={() => {
                    setCreateServiceModal(true);
                  }}
                  className={`${styles.button} mx-auto`}
                  style={{ padding: "6px 12px", gap: "6px" }}
                >
                  <TbPlaylistAdd size={25} />
                  Crear servicio
                </button>
              </div>

              {/* <div className="flex gap-1 mt-0 md:mt-2 w-fit h-fit ">
              <PiSealWarningFill color="rgb(161 98 7)" />
              <span className="text-xs font-semibold text-yellow-700">
                ¡Debés crear al menos un servicio para comenzar a gestionar tus
                turnos!
              </span>
            </div> */}
            </>
          )}

          {servicesData.length > 0 && !loading && (
            <>
              <div className="flex flex-col items-center w-full gap-4 mt-0 mb-1 md:mt-2 h-fit">
                {servicesData.map((service) => (
                  <div
                    key={service._id}
                    className="flex w-full py-4 pl-5 pr-3 rounded-lg shadow-md"
                    style={{ border: "1px solid rgba(0, 0, 0, 0.2)" }}
                  >
                    <div className="flex flex-col w-full gap-2">
                      <div className="flex flex-col items-start gap-1">
                        <span className="mt-0 mb-0 text-lg font-bold md:leading-3 md:mt-1 md:mb-1 w-fit">
                          {service.name}
                        </span>
                        <h5 className="text-sm font-medium text-gray-400 lg:text-md">
                          $ {service.price?.toLocaleString("es-AR")}
                        </h5>
                      </div>

                      <div className="flex flex-col mr-2 md:mr-3 w-fit h-fit">
                        {service.description !== "" && (
                          <p className="text-sm font-normal leading-4 text-gray-500 lg:text-sm">
                            {service.description}
                          </p>
                        )}
                        {service.description === "" && (
                          <p className="text-xs font-normal leading-3 text-gray-500 md:text-sm">
                            No hay descripción.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="my-auto">
                      <IoMdMore
                        className="ml-auto"
                        size={24}
                        onClick={() => setEditService(service)}
                      />
                    </div>
                  </div>
                ))}

              </div>

              {/* add service button -- only in full plan --  */}
              {subscriptionData.subscriptionType === "SC_FULL" && (
                <Button
                  className="w-full mt-2 text-white bg-orange-600 border-none rounded-lg shadow-md outline-none h-11 hover:bg-orange-700 "
                  onClick={() => {
                    setCreateServiceModal(true);
                  }}>
                  <TbPlaylistAdd size={50} />
                  Añadir servicio
                </Button>
              )}

              {(subscriptionData.subscriptionType === "SC_EXPIRED" || subscriptionData.subscriptionType === "SC_FREE") && (
                <>
                  <div className="w-full mx-auto mt-2 mb-1 notifications-container">
                    <div className="alert">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            aria-hidden="true"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 alert-svg"
                          >
                            <path
                              clipRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              fillRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <div className="alert-prompt-wrap flex flex-col items-start gap-2">
                          {subscriptionData.subscriptionType === "SC_EXPIRED" && (
                            <p className="text-sm text-yellow-700">  Para agregar más servicios debes suscribirte al
                              Plan Full.{" "}</p>
                          )}
                          {subscriptionData.subscriptionType === "SC_FREE" && (
                            <p className="text-sm text-yellow-700">Para agregar más de un servicio debes suscribirte al
                              Plan Full.{" "}</p>
                          )}

                          <span
                            className="cursor-pointer alert-prompt-link"
                            onClick={handleMercadoPagoPreference}
                          >
                            Actualizar suscripción
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </Card>

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