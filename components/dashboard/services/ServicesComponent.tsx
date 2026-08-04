"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import UpgradePlanModal from "./UpgradePlanModal";
import { LuSearchX, LuChevronRight } from "react-icons/lu";
import { TbPlaylistAdd } from "react-icons/tb";
import Link from "next/link";
import CreateServiceModal from "./CreateServiceModal";
import { IoMdMore } from "react-icons/io";
import EditServiceModal from "./EditServiceModal";
import Alert from "@/components/Alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LuLock } from "react-icons/lu";
import { getPlanLimits } from "@/lib/planLimits";

const ServicesComponent = ({
  businessData,
  servicesData,
  subscriptionData,
  isEmployee = false,
}: {
  businessData: IBusiness;
  servicesData: IService[];
  subscriptionData: any;
  isEmployee?: boolean;
}) => {
  const [services, setServices] = useState<IService[]>();
  const [alert, setAlert] = useState<AlertInterface>();
  const [upgradePlanModal, setUpgradePlanModal] = useState<boolean>(false);
  const [editServiceModal, setEditServiceModal] = useState<boolean>(false);
  const [serviceToEdit, setServiceToEdit] = useState<IService>();
  const [createServiceModal, setCreateServiceModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);

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
    const canAdd = subscriptionData.subscriptionType !== "SC_EXPIRED";

    if (!canAdd) {
      setUpgradePlanModal(true);
      return;
    }

    if (formData && services) {
      const tempID = `temp_${Date.now()}`;
      const tempService: IService = {
        _id: tempID,
        name: formData.name,
        businessID: businessData?._id!,
        ownerID: businessData?.ownerID,
        price: formData.price,
        description: formData.description,
        duration: formData.duration,
        depositAmount: formData.depositAmount ?? 0,
      };

      setServices((prev) => [...(prev ?? []), tempService]);
      setCreateServiceModal(false);
      setIsCreating(true);

      try {
        const token = localStorage.getItem("sacaturno_token");
        const authHeader = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };
        const newServiceData: IService = {
          name: formData.name,
          businessID: businessData?._id!,
          ownerID: businessData?.ownerID,
          price: formData.price,
          description: formData.description,
          duration: formData.duration,
          depositAmount: formData.depositAmount ?? 0,
        };
        await axiosReq.post(
          "/business/service/create",
          newServiceData,
          authHeader,
        );
        setAlert({
          msg: "Servicio añadido correctamente",
          error: true,
          alertType: "OK_ALERT",
        });
        hideAlert();
        router.refresh();
      } catch (error: any) {
        setServices((prev) => prev?.filter((s) => s._id !== tempID));
        const isLimitReached = error?.response?.data?.msg === "SERVICE_LIMIT_REACHED";
        setAlert({
          msg: isLimitReached
            ? "Alcanzaste el límite máximo de servicios permitidos"
            : "Error al crear servicio",
          error: true,
          alertType: "ERROR_ALERT",
        });
      } finally {
        setIsCreating(false);
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
        authHeader,
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
    depositAmount?: number | undefined;
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
      await axiosReq.put(
        `/business/service/edit`,
        { ...formData, depositAmount: formData.depositAmount ?? 0 },
        authHeader,
      );
      setAlert({ msg: "Servicio editado", error: true, alertType: "OK_ALERT" });
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

  const isExpired = subscriptionData.subscriptionType === "SC_EXPIRED";
  const depositsEnabled = getPlanLimits(subscriptionData.subscriptionType).depositsEnabled;

  const canAddService = !isExpired;

  return (
    <>
      {/* Modals */}
      <Dialog
        open={createServiceModal}
        onOpenChange={() => setCreateServiceModal(false)}
      >
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <CreateServiceModal
            mpLinked={businessData.mpLinked}
            isLoading={isCreating}
            onCreateService={(formData) => addService(formData)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={upgradePlanModal}
        onOpenChange={() => setUpgradePlanModal(false)}
      >
        <DialogContent className="flex flex-col bg-white max-w-3xl max-h-[90dvh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full px-4 sm:px-6">
          <UpgradePlanModal businessData={businessData} />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editServiceModal}
        onOpenChange={() => setEditServiceModal(false)}
      >
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
      <div className="gap-0 bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden  flex flex-col w-full max-w-4xl">
        <div className="flex items-center justify-between px-6 py-4 2xl:px-8 2xl:py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm 2xl:text-base font-semibold text-gray-800">
              Servicios
            </h2>

            {/* {isFull && (
              <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                Plan Full
              </span>
            )}
            {isFree && (
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                Plan Gratis · 1 servicio
              </span>
            )}
            {isExpired && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                Suscripción vencida
              </span>
            )} */}
          </div>
          {canAddService ? (
            <button
              onClick={() => setCreateServiceModal(true)}
              className="flex items-center gap-1.5 bg-primary hover:bg-orange-500 text-white text-[11px] 2xl:text-xs font-semibold px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
            >
              <TbPlaylistAdd size={16} />
              Nuevo servicio
            </button>
          ) : (
            <button
              onClick={() => setUpgradePlanModal(true)}
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-orange-50 text-gray-400 hover:text-orange-600 border border-gray-200 hover:border-orange-300 text-xs 2xl:text-sm font-semibold px-3 2xl:px-4 py-1.5 2xl:py-2 rounded-lg transition-all duration-300 ease-in-out cursor-pointer"
              title="Requiere un plan pago"
            >
              <LuLock size={13} />
              Nuevo servicio
            </button>
          )}
        </div>

        <div className="py-4 px-6">
          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center h-48">
              <div className="loader"></div>
            </div>
          )}

          {/* Empty state */}
          {services?.length === 0 && !loading && (
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 shrink-0">
                <LuSearchX size={22} className="text-accent" />
              </div>

              <div className="flex flex-col items-center gap-2 text-center">
                <span className="text-sm 2xl:text-base font-semibold text-gray-800">
                  Todavía no creaste ningún servicio.
                </span>
                <span className="text-xs 2xl:text-sm text-gray-500 max-w-sm">
                  Debés crear al menos un servicio para comenzar a gestionar tus
                  turnos.
                </span>
              </div>
              <button
                onClick={() => setCreateServiceModal(true)}
                className="mt-1 flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-orange-500 rounded-lg transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {/* <TbPlaylistAdd size={16} /> */}
                Crear servicio
              </button>
            </div>
          )}

          {/* Service list */}
          {(services?.length ?? 0) > 0 && !loading && (
            <>
              {!depositsEnabled && !isEmployee && (
                <div className="flex items-center gap-2 py-2 mb-1">
                  <LuLock size={12} className="text-gray-400 flex-shrink-0" />
                  <p className="text-xs text-gray-400">
                    Para cobrar señas debés tener{" "}
                    <span
                      className="font-semibold text-orange-500 underline cursor-pointer hover:text-orange-700 transition-colors"
                      onClick={() => setUpgradePlanModal(true)}
                    >
                      un plan pago
                    </span>{" "}
                    y tu cuenta de Mercado Pago vinculada.
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                {services?.map((service) => (
                  <div
                    key={service._id}
                    onClick={() => !service._id?.startsWith("temp_") && setEditService(service)}
                    className={`flex items-center justify-between py-3.5 gap-4 group border border-gray-100 hover:border-white hover:bg-orange-50 rounded-lg pl-4 pr-3 -mx-2 transition-all ${service._id?.startsWith("temp_") ? "opacity-60" : "cursor-pointer"}`}
                  >
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm 2xl:text-base font-semibold text-gray-800">
                          {service.name}
                        </span>
                        {service.depositAmount && service.depositAmount > 0 ? (
                          <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full">
                            Seña: $
                            {service.depositAmount.toLocaleString("es-AR")}
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
                        <p className="text-xs 2xl:text-sm text-gray-400 leading-4">
                          {service.description}
                        </p>
                      ) : (
                        <p className="text-xs 2xl:text-sm text-gray-300 italic">
                          Sin descripción.
                        </p>
                      )}
                    </div>
                    {!service._id?.startsWith("temp_") && (
                      <IoMdMore
                        size={20}
                        className="flex-shrink-0 text-gray-300 group-hover:text-orange-600 transition-colors duration-200"
                      />
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Plan limit banner */}
          {isExpired && servicesData.length > 0 && !isEmployee && (
            <div className="mt-3 mb-4 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
              <LuLock
                size={15}
                className="text-orange-500 mt-0.5 flex-shrink-0"
              />
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-xs font-semibold text-orange-700">
                  Tu suscripción venció. No podés agregar más servicios.
                </p>
                <p className="text-xs text-orange-600">
                  Activá{" "}
                  <span
                    className="font-semibold underline cursor-pointer hover:text-orange-800 transition-colors"
                    onClick={() => setUpgradePlanModal(true)}
                  >
                    un plan pago
                  </span>{" "}
                  para agregar servicios ilimitados y cobrar señas online.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {alert?.error && (
        <div className="flex justify-center w-full h-fit">
          <Alert
            error={alert?.error}
            msg={alert?.msg}
            alertType={alert?.alertType}
          />
        </div>
      )}
    </>
  );
};

export default ServicesComponent;
