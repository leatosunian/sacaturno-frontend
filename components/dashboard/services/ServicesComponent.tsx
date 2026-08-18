"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IService } from "@/interfaces/service.interface";
import { IEmployee } from "@/interfaces/employee.interface";
import { useEffect, useState } from "react";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import { useRouter } from "next/navigation";
import UpgradePlanModal from "./UpgradePlanModal";
import { LuSearchX, LuChevronRight, LuClock, LuUsers, LuPencil, LuTriangleAlert } from "react-icons/lu";
import { TbPlaylistAdd } from "react-icons/tb";
import Link from "next/link";
import CreateServiceModal from "./CreateServiceModal";
import EditServiceModal from "./EditServiceModal";
import Alert from "@/components/Alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LuLock } from "react-icons/lu";
import { getPlanLimits } from "@/lib/planLimits";

const ServicesComponent = ({
  businessData,
  servicesData,
  subscriptionData,
  employeesData = [],
  isEmployee = false,
}: {
  businessData: IBusiness;
  servicesData: IService[];
  subscriptionData: any;
  employeesData?: IEmployee[];
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
    employeeIDs?: string[];
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
        const res = await axiosReq.post(
          "/business/service/create",
          { ...newServiceData, employeeIDs: formData.employeeIDs ?? [] },
          authHeader,
        );
        // Con el registro real ya se puede reemplazar la card provisoria: queda
        // clickeable al instante en vez de esperar a que vuelva el refresh.
        const created: IService | undefined = res.data?.service;
        if (created?._id) {
          setServices((prev) =>
            prev?.map((s) => (s._id === tempID ? created : s)),
          );
        }
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
        const depositTooHigh = error?.response?.data?.msg === "DEPOSIT_EXCEEDS_PRICE";
        setAlert({
          msg: isLimitReached
            ? "Alcanzaste el límite máximo de servicios permitidos"
            : depositTooHigh
              ? "La seña no puede superar el precio del servicio"
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
    // Se saca de la lista en el acto y se repone si el borrado falla: el spinner
    // dejaba la card vieja a la vista hasta que volviera el refresh del servidor.
    const previous = services;
    setServices((prev) => prev?.filter((s) => s._id !== serviceID));
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
    } catch (error) {
      setServices(previous);
      setAlert({
        msg: "Error al eliminar servicio",
        error: true,
        alertType: "ERROR_ALERT",
      });
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
    // Los valores nuevos se pintan en el acto. Antes esto mostraba un spinner y
    // volvía con los datos viejos hasta que llegaba el refresh del servidor.
    const previous = services;
    // Los campos del form son opcionales; sólo se pisan los que vinieron.
    const patch: Partial<IService> = {
      ...(formData.name !== undefined && { name: formData.name }),
      ...(formData.description !== undefined && { description: formData.description }),
      ...(formData.price !== undefined && { price: formData.price }),
      ...(formData.duration !== undefined && { duration: formData.duration }),
      depositAmount: formData.depositAmount ?? 0,
    };
    setServices((prev) =>
      prev?.map((s) => (s._id === formData.id ? { ...s, ...patch } : s)),
    );

    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axiosReq.put(
        `/business/service/edit`,
        { ...formData, depositAmount: formData.depositAmount ?? 0 },
        authHeader,
      );
      // El backend puede normalizar valores, así que su versión pisa a la optimista.
      const edited: IService | undefined = res.data?.editedService;
      if (edited?._id) {
        setServices((prev) =>
          prev?.map((s) => (s._id === edited._id ? edited : s)),
        );
      }
      setAlert({ msg: "Servicio editado", error: true, alertType: "OK_ALERT" });
      hideAlert();
      router.refresh();
    } catch (error: any) {
      setServices(previous);
      setAlert({
        msg:
          error?.response?.data?.msg === "DEPOSIT_EXCEEDS_PRICE"
            ? "La seña no puede superar el precio del servicio"
            : "Error al editar servicio",
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

  useEffect(() => {
    setServices(servicesData);
    setLoading(false);
  }, [servicesData]);

  // Prestadores del negocio. Los inactivos no toman turnos, y el dueño sin
  // publicar queda inactive, así que salen los dos por la misma condición.
  const assignableEmployees = employeesData.filter((e) => e.status !== "inactive");

  const providersOf = (serviceID?: string) =>
    serviceID ? assignableEmployees.filter((e) => (e.services ?? []).includes(serviceID)) : [];

  const providerLabel = (list: IEmployee[]) => {
    const first = list[0].isOwner ? "Vos" : list[0].name;
    return list.length === 1 ? first : `${first} y ${list.length - 1} más`;
  };

  const durationLabel = (minutes?: number) => {
    if (!minutes) return null;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours} hora${hours > 1 ? "s" : ""}`;
  };

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
        {/* p-0 + overflow-hidden: el padding y el scroll los maneja el modal,
            que fija header y botón y scrollea sólo el cuerpo. */}
        <DialogContent className="w-[93vw] sm:w-[560px] max-w-[93vw] max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
          <CreateServiceModal
            mpLinked={businessData.mpLinked}
            isLoading={isCreating}
            employees={employeesData}
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
        <DialogContent className="w-[93vw] sm:w-[560px] max-w-[93vw] max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
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
              {/* Grilla de dos columnas. Las cards de una misma fila se estiran
                  a la altura de la más alta: la descripción crece con flex-1 y
                  deja los chips siempre pegados abajo, alineados entre sí. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services?.map((service) => {
                  const isTemp = !!service._id?.startsWith("temp_");
                  const providers = isTemp ? [] : providersOf(service._id);
                  const duration = durationLabel(service.duration);
                  const hasDeposit = !!service.depositAmount && service.depositAmount > 0;

                  return (
                    <div
                      key={service._id}
                      onClick={() => !isTemp && setEditService(service)}
                      className={`flex flex-col h-full gap-2 p-4 rounded-xl border border-gray-100 transition-all duration-200 ease-in-out ${
                        isTemp
                          ? "opacity-60"
                          : "cursor-pointer group hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-sm 2xl:text-base font-semibold text-gray-800 min-w-0 break-words">
                          {service.name}
                        </span>
                        <span className="text-base 2xl:text-lg font-bold text-gray-800 shrink-0 leading-tight">
                          $ {service.price?.toLocaleString("es-AR")}
                        </span>
                      </div>

                      {/* flex-1 aunque esté vacía: es lo que empuja los chips al
                          piso y empareja las cards sin descripción con el resto. */}
                      <p className="text-xs 2xl:text-sm text-gray-500 leading-relaxed flex-1">
                        {service.description}
                      </p>

                      <div className="flex items-end justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          {duration && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              <LuClock size={11} />
                              {duration}
                            </span>
                          )}
                          {hasDeposit && (
                            <span className="inline-flex items-center text-[11px] font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                              Seña ${service.depositAmount!.toLocaleString("es-AR")}
                            </span>
                          )}
                          {/* Sin prestadores cargados no hay nada que asignar:
                              el aviso sería ruido, no una tarea pendiente. */}
                          {!isTemp && assignableEmployees.length > 0 && (
                            providers.length > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                <LuUsers size={11} />
                                {providerLabel(providers)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                <LuTriangleAlert size={11} />
                                Sin prestador
                              </span>
                            )
                          )}
                        </div>
                        {!isTemp && (
                          <LuPencil
                            size={14}
                            className="shrink-0 text-gray-300 group-hover:text-orange-600 transition-colors duration-200"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
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
