"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
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

const FormServices = ({
  businessData,
  servicesData,
  subscriptionData,
}: {
  businessData: IBusiness;
  servicesData: IService[];
  subscriptionData: any;
}) => {
  const [services, setServices] = useState<IService[]>();
  const [alert, setAlert] = useState<AlertInterface>();
  const [upgradePlanModal, setUpgradePlanModal] = useState<boolean>(false);
  const [editServiceModal, setEditServiceModal] = useState<boolean>(false);
  const [serviceToEdit, setServiceToEdit] = useState<IService>();
  const [createServiceModal, setCreateServiceModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const router = useRouter();

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
    depositAmount?: number;
  }) => {
    if (subscriptionData.subscriptionType === "SC_FREE" && servicesData.length > 0) {
      setUpgradePlanModal(true);
      return;
    }

    if (
      subscriptionData.subscriptionType === "SC_FULL" ||
      (subscriptionData.subscriptionType === "SC_FREE" && servicesData.length === 0)
    ) {
      if (formData && services) {
        setLoading(true);
        try {
          const token = localStorage.getItem("sacaturno_token");
          const authHeader = {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          };
          let newServiceData: IService = {
            name: formData.name,
            businessID: businessData?._id!,
            ownerID: businessData?.ownerID,
            price: formData.price,
            description: formData.description,
            duration: formData.duration,
            depositAmount: formData.depositAmount ?? 0,
          };
          await axiosReq.post("/business/service/create", newServiceData, authHeader);
          setAlert({ msg: "Servicio añadido correctamente", error: true, alertType: "OK_ALERT" });
          hideAlert();
          setCreateServiceModal(false);
          setLoading(false);
          router.refresh();
        } catch (error) {
          setLoading(false);
          setAlert({ msg: "Error al crear servicio", error: true, alertType: "ERROR_ALERT" });
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      };
      await axiosReq.delete(`/business/service/delete/${serviceID}`, authHeader);
      setAlert({ msg: "Servicio eliminado", error: true, alertType: "OK_ALERT" });
      hideAlert();
      router.refresh();
      setLoading(false);
    } catch (error) {
      setAlert({ msg: "Error al eliminar servicio", error: true, alertType: "ERROR_ALERT" });
      setLoading(false);
    }
  };

  const editService = async (formData: {
    id: string | undefined;
    name: string | undefined;
    description: string | undefined;
    price: number | undefined;
    duration?: number | undefined;
    depositAmount?: number | undefined;
  }) => {
    setEditServiceModal(false);
    setLoading(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      };
      await axiosReq.put(
        `/business/service/edit`,
        { ...formData, depositAmount: formData.depositAmount ?? 0 },
        authHeader
      );
      setAlert({ msg: "Servicio editado", error: true, alertType: "OK_ALERT" });
      hideAlert();
      router.refresh();
      setLoading(false);
    } catch (error) {
      setAlert({ msg: "Error al editar servicio", error: true, alertType: "ERROR_ALERT" });
      setLoading(false);
    }
  };

  const handleMercadoPagoPreference = async () => {
    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      const preference = await axiosReq.post("/subscription/pay/full", data, authHeader);
      router.push(preference.data.init_point);
    } catch (error) {
      setAlert({ msg: "No se pudo generar el pago. Intente luego.", error: true, alertType: "ERROR_ALERT" });
    }
  };

  const setEditService = async (service: IService) => {
    if (service !== undefined) {
      setServiceToEdit(service);
      setEditServiceModal(true);
    }
  };

  useEffect(() => {
    setServices(servicesData);
    setLoading(false);
  }, [servicesData]);

  const canAddService =
    subscriptionData.subscriptionType === "SC_FULL" ||
    (subscriptionData.subscriptionType === "SC_FREE" && servicesData.length === 0);

  return (
    <>
      {/* Modals */}
      <Dialog open={createServiceModal} onOpenChange={() => setCreateServiceModal(false)}>
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <CreateServiceModal mpLinked={businessData.mpLinked} onCreateService={(formData) => addService(formData)} />
        </DialogContent>
      </Dialog>

      <Dialog open={upgradePlanModal} onOpenChange={() => setUpgradePlanModal(false)}>
        <DialogContent className="flex flex-col bg-white w-80 md:w-96 p-7 h-fit borderShadow">
          <UpgradePlanModal createPreference={handleMercadoPagoPreference} />
        </DialogContent>
      </Dialog>

      <Dialog open={editServiceModal} onOpenChange={() => setEditServiceModal(false)}>
        <DialogContent className="sm:w-[470px] w-[93vw]">
          <EditServiceModal
            mpLinked={businessData.mpLinked}
            serviceData={serviceToEdit}
            onDeleteService={(serviceID) => deleteService(serviceID)}
            onEditService={(serviceData) => editService(serviceData)}
          />
        </DialogContent>
      </Dialog>

      {/* Services card */}
      <div className="flex flex-col gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
          <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">Servicios</h2>
          {canAddService && (
            <button
              onClick={() => setCreateServiceModal(true)}
              className="flex items-center gap-1.5 bg-orange-600 hover:bg-[#d92f04] text-white text-xs 2xl:text-sm font-semibold px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
            >
              <TbPlaylistAdd size={16} />
              Nuevo servicio
            </button>
          )}
        </div>

        <div className="px-6 py-2 2xl:px-8 2xl:py-3">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="loader"></div>
            </div>
          )}

          {/* Empty state */}
          {services?.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-4 py-10">
              <LuSearchX color="#dd4924" size={60} />
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-sm 2xl:text-base font-semibold">Todavía no creaste ningún servicio.</span>
                <span className="text-xs 2xl:text-sm text-gray-500 max-w-sm">
                  Debés crear al menos un servicio para comenzar a gestionar tus turnos.
                </span>
              </div>
              <button
                onClick={() => setCreateServiceModal(true)}
                className="flex items-center gap-2 bg-orange-600 hover:bg-[#d92f04] text-white text-xs 2xl:text-sm font-semibold px-5 2xl:px-6 py-2.5 2xl:py-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
              >
                <TbPlaylistAdd size={16} />
                Crear servicio
              </button>
            </div>
          )}

          {/* Service list */}
          {servicesData.length > 0 && !loading && (
            <div className="flex flex-col divide-y divide-gray-100">
              {servicesData.map((service) => (
                <div
                  key={service._id}
                  className="flex items-center justify-between py-3.5 gap-4 group hover:bg-gray-50 rounded-lg pl-4 pr-2 -mx-2 transition-colors duration-150"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm 2xl:text-base font-semibold text-gray-800">{service.name}</span>
                      {service.depositAmount && service.depositAmount > 0 ? (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                          Seña: ${service.depositAmount.toLocaleString("es-AR")}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm 2xl:text-base font-semibold text-gray-700">
                        $ {service.price?.toLocaleString("es-AR")}
                      </span>
                      {service.duration ? (
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {service.duration} min
                        </span>
                      ) : null}
                    </div>
                    {service.description && service.description !== "" ? (
                      <p className="text-xs 2xl:text-sm text-gray-400 leading-4">{service.description}</p>
                    ) : (
                      <p className="text-xs 2xl:text-sm text-gray-300 italic">Sin descripción.</p>
                    )}
                  </div>
                  <button
                    onClick={() => setEditService(service)}
                    className="flex-shrink-0 p-1.5 text-gray-300 group-hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Editar servicio"
                  >
                    <IoMdMore size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Plan limit alert */}
          {(subscriptionData.subscriptionType === "SC_EXPIRED" ||
            subscriptionData.subscriptionType === "SC_FREE") &&
            servicesData.length > 0 && (
              <div className="mt-4 w-full notifications-container">
                <div className="alert">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 alert-svg">
                        <path clipRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" fillRule="evenodd"></path>
                      </svg>
                    </div>
                    <div className="alert-prompt-wrap flex flex-col items-start gap-2">
                      {subscriptionData.subscriptionType === "SC_EXPIRED" && (
                        <p className="text-sm text-yellow-700">Para agregar más servicios debés suscribirte al Plan Full.</p>
                      )}
                      {subscriptionData.subscriptionType === "SC_FREE" && (
                        <p className="text-sm text-yellow-700">Para agregar más de un servicio debés suscribirte al Plan Full.</p>
                      )}
                      <span className="cursor-pointer alert-prompt-link" onClick={handleMercadoPagoPreference}>
                        Actualizar suscripción
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {alert?.error && (
        <div className="flex justify-center w-full h-fit">
          <Alert error={alert?.error} msg={alert?.msg} alertType={alert?.alertType} />
        </div>
      )}
    </>
  );
};

export default FormServices;
