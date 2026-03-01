"use client";
import {
  Calendar,
  EventProps,
  Views,
  dayjsLocalizer,
} from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import dayjs from "dayjs";
import "dayjs/locale/es-mx";
import { useEffect, useState } from "react";
import { IBusiness } from "@/interfaces/business.interface";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import { useRouter } from "next/navigation";
import styles from "@/app/css-modules/CalendarTurnos.module.css";
import buttonStyles from "@/app/css-modules/FormMiEmpresa.module.css";
import { IService } from "@/interfaces/service.interface";
import NoServicesModal from "../services/NoServicesModal";
import ISubscription from "@/interfaces/subscription.interface";
import ExpiredPlanModal from "./ExpiredPlanModal";
import { LuSave } from "react-icons/lu";
import { IoInformationCircle } from "react-icons/io5";
import HelpModal from "./HelpModal";
import { FaArrowLeft, FaCircleInfo } from "react-icons/fa6";
import CreateScheduleAppointmentModal from "./CreateScheduleAppointmentModal";
import ScheduleAppointmentModal from "./ScheduleAppointmentModal";
import axiosReq from "@/config/axios";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "@/components/Alert";
import Link from "next/link";
import { IDaySchedule } from "@/interfaces/daySchedule.interface";
import { IAppointmentSchedule } from "@/interfaces/appointmentSchedule.interface";
import { timeOptions } from "@/helpers/timeOptions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

dayjs.locale("es-mx");

interface Props {
  businessData: IBusiness;
  servicesData: IService[];
  daysAndAppointments: {
    days: IDaySchedule[];
    appointments: IAppointmentSchedule[];
  };
  subscriptionData: ISubscription | undefined;
}

type Keys = keyof typeof Views;

const CreateScheduleCalendar: React.FC<Props> = ({
  businessData,
  servicesData,
  subscriptionData,
  daysAndAppointments,
}) => {
  const localizer = dayjsLocalizer(dayjs);
  const [alert, setAlert] = useState<AlertInterface>();
  const [business, setBusiness] = useState<IBusiness>();
  const [services, setServices] = useState<IService[]>();
  const [eventModal, setEventModal] = useState(false);
  const [eventData, setEventData] = useState<
    IAppointmentSchedule | undefined
  >();
  const [createAppointmentModal, setCreateAppointmentModal] = useState(false);
  const [createAppointmentData, setCreateAppointmentData] =
    useState<IAppointmentSchedule>();
  const [helpModal, setHelpModal] = useState(false);
  const [view, setView] = useState<(typeof Views)[Keys]>(Views.DAY);
  const [expiredModal, setExpiredModal] = useState(false);
  const [loadingNewAppointments, setLoadingNewAppointments] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{
    dayName: string;
    dayNumber: number;
  }>({ dayName: "LUN", dayNumber: 1 });
  const [selectedDayStart, setSelectedDayStart] = useState<number>(0);
  const [selectedDayEnd, setSelectedDayEnd] = useState<number>(0);
  const [selectedAnticipation, setSelectedAnticipation] = useState<number>(0);
  const [selectedDaysToCreate, setSelectedDaysToCreate] = useState<number>(0);
  const [selectedAutomaticSchedule, setSelectedAutomaticSchedule] =
    useState<boolean>(false);

  const [daysSchedule, setDaysSchedule] = useState<IDaySchedule[]>([]);
  const [appointmentsSchedule, setAppointmentsSchedule] =
    useState<IAppointmentSchedule[]>();
  const router = useRouter();
  const [selectedAppointmentDuration, setSelectedAppointmentDuration] =
    useState<number>(30);
  // ARRAY DE DIAS CON CAMBIOS PARA GUARDAR
  const [daysChanged, setDaysChanged] = useState<IDaySchedule[]>([]);
  // ARRAY DE TURNOS DEL DIA SELECCIONADO
  const [selectedDayAppointments, setSelectedDayAppointments] = useState<
    IAppointmentSchedule[] | undefined
  >();
  //const daysOfWeek = ["LUN", "MAR", "MIE", "JUE", "VIE", "SAB", "DOM"];
  const daysOfWeek = [
    { dayName: "LUN", dayNumber: 1 },
    { dayName: "MAR", dayNumber: 2 },
    { dayName: "MIE", dayNumber: 3 },
    { dayName: "JUE", dayNumber: 4 },
    { dayName: "VIE", dayNumber: 5 },
    { dayName: "SAB", dayNumber: 6 },
    { dayName: "DOM", dayNumber: 0 },
  ];

  const [selectedDayID, setSelectedDayID] = useState<string>("");

  const [loadingButton, setLoadingButton] = useState(false);

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3300);
  };

  const handleSelectDay = ({
    dayName,
    dayNumber,
  }: {
    dayName: string;
    dayNumber: number;
  }) => {
    setSelectedDay({ dayName, dayNumber });
  };


  const onSelectDay = ({ dayName }: { dayName: string }) => {
    const dayObj = daysSchedule?.find(
      (daySchedule) => daySchedule.day === dayName
    );
    if (dayObj) {
      setSelectedAppointmentDuration(dayObj?.appointmentDuration);
      console.log(dayObj);
      //setSelectedDay({ dayName: dayObj.day, dayNumber: dayObj.dayNumber });
      setSelectedDayEnd(dayObj?.dayEnd);
      setSelectedDayStart(dayObj?.dayStart);
      setSelectedDayID(dayObj?._id!);
    }
    const dayAppointments = appointmentsSchedule?.filter(
      (appointment) => appointment.day === dayName
    );
    setSelectedDayAppointments(dayAppointments);
  };

  useEffect(() => {
    onSelectDay(selectedDay);
  }, [selectedDay]);

  useEffect(() => {
    onSelectDay(selectedDay);
  }, [selectedDayStart, selectedDayEnd]);

  // seteo de los datos obtenidos de la base de datos al estado del componente
  useEffect(() => {
    setDaysSchedule(daysAndAppointments.days);
    setAppointmentsSchedule(daysAndAppointments.appointments);
    setSelectedAppointmentDuration(
      daysAndAppointments.days[0].appointmentDuration
    );
    setSelectedDayEnd(daysAndAppointments.days[0].dayEnd);
    setSelectedDayStart(daysAndAppointments.days[0].dayStart);
    setBusiness(businessData);
    setServices(servicesData);
    setSelectedAnticipation(businessData.scheduleAnticipation);
    setSelectedDaysToCreate(businessData.scheduleDaysToCreate);
    setSelectedAutomaticSchedule(businessData.automaticSchedule);
    return;
  }, [
    businessData,
    services,
    servicesData,
    subscriptionData,
    daysAndAppointments,
  ]);

  // PARSEO DE LOS TURNOS PARA MOSTRAR EN EL CALENDARIO, SE USA CUANDO SE OBTIENEN LOS TURNOS DE LA BASE DE DATOS Y CUANDO SE SELECCIONA UN DIA
  const parseAppointments = (
    appointments: IAppointmentSchedule[] | undefined
  ) => {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    dayjs.extend(advanced);

    let appointmentsList: IAppointmentSchedule[] = [];

    if (appointments && appointments[0]) {
      appointments?.map(
        ({
          start,
          end,
          ownerID,
          businessID,
          _id,
          service,
          price,
          day,
          description,
          dayScheduleID,
          dayNumber,
        }) => {
          const startTime = dayjs(start).format("HH:mm");
          const endTime = dayjs(end).format("HH:mm");
          const todayDate = dayjs().format("YYYY-MM-DD");
          const updatedStartDate = `${todayDate} ${startTime}`;
          const updatedEndDate = `${todayDate} ${endTime}`;
          let appointmentObj: IAppointmentSchedule;

          appointmentObj = {
            start: dayjs(updatedStartDate)
              .tz("America/Argentina/Buenos_Aires")
              .toDate(),
            end: dayjs(updatedEndDate)
              .tz("America/Argentina/Buenos_Aires")
              .toDate(),
            ownerID,
            businessID,
            _id,
            service,
            price,
            day,
            description,
            dayNumber,
            dayScheduleID,
            title: service,
          };
          appointmentsList.push(appointmentObj);
        }
      );
      return appointmentsList;
    }

    return appointmentsList;
  };

  
  useEffect(() => {
    setLoadingNewAppointments(false);
    return;
  }, [appointmentsSchedule]);

  // PARSEO DE LOS TURNOS PARA MOSTRAR EN EL CALENDARIO, SE USA CUANDO SE OBTIENEN LOS TURNOS DE LA BASE DE DATOS Y CUANDO SE SELECCIONA UN DIA
  useEffect(() => {
    setSelectedDay({ dayName: "LUN", dayNumber: 1 });
    onSelectDay({ dayName: "LUN" });
    setSelectedDayEnd(daysSchedule[0]?.dayEnd);
    setSelectedDayStart(daysSchedule[0]?.dayStart);
  }, []);

  // FUNCION PARA CREAR UN NUEVO TURNO, SE USA EN EL CALENDARIO CUANDO SE HACE CLICK EN UN HORARIO DISPONIBLE
  const createNewAppointment = async ({
    start,
    end,
  }: {
    start: Date;
    end: Date;
  }) => {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    dayjs.extend(advanced);
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      setExpiredModal(true);
      return;
    }
    const startDate = dayjs(start)
      .tz("America/Argentina/Buenos_Aires")
      .toDate();
    const endDate = dayjs(end).tz("America/Argentina/Buenos_Aires").toDate();
    const userID = localStorage.getItem("sacaturno_userID");

    const appointmentData: IAppointmentSchedule = {
      businessID: business?._id!,
      start: startDate,
      end: endDate,
      service: "",
      day: selectedDay.dayName,
      dayScheduleID: selectedDayID,
      description: "",
      ownerID: userID!,
      price: 0,
      dayNumber: selectedDay.dayNumber,
    };

    setCreateAppointmentModal(true);
    setCreateAppointmentData(appointmentData);
  };

  const handleSelectEvent = (event: IAppointmentSchedule) => {
    setEventData(event);
    setEventModal(true);
  };

  // componente para renderizar cada turno en el calendario, se usa en el componente de calendario
  const components: any = {
    event: ({ event }: EventProps<IAppointmentSchedule>) => {
      return (
        <>
          <div
            className="flex flex-col h-full gap-1 px-2 py-1 w-fit"
            style={{ backgroundColor: "#dd4924" }}
          >
            <span className="text-xs font-medium ">{event.service} </span>
            <span style={{ fontSize: "10px" }}>
              {dayjs(event.start).format("HH:mm")} -{" "}
              {dayjs(event.end).format("HH:mm")}{" "}
            </span>
          </div>
        </>
      );
    },
  };

  // FUNCION PARA SELECCIONAR LA DURACION DE LOS TURNOS, SE USA EN EL SELECT DE DURACION DE TURNOS
  const handleSelectAppointmentDuration: React.ChangeEventHandler<
    HTMLSelectElement
  > = (e) => {
    setSelectedAppointmentDuration(Number(e.target.value));
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: selectedDayStart,
      dayEnd: selectedDayEnd,
      appointmentDuration: Number(e.target.value),
    });
  };

  // VALIDACION PARA QUE EL HORARIO DE INICIO NO SEA POSTERIOR O IGUAL AL HORARIO DE FIN
  const handleSelectDayStart: React.ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    if (Number(e.target.value) >= selectedDayEnd) {
      return;
    }
    setSelectedDayStart(Number(e.target.value));
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: Number(e.target.value),
      dayEnd: selectedDayEnd,
      appointmentDuration: selectedAppointmentDuration,
    });
  };

  // VALIDACION PARA QUE EL HORARIO DE FIN NO SEA ANTERIOR O IGUAL AL HORARIO DE INICIO
  const handleSelectDayEnd: React.ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    if (Number(e.target.value) <= selectedDayStart) {
      return;
    }
    setSelectedDayEnd(Number(e.target.value));
    editDaySchedule({
      day: selectedDay.dayName,
      dayStart: selectedDayStart,
      dayEnd: Number(e.target.value),
      appointmentDuration: selectedAppointmentDuration,
    });
  };

  // FUNCION PARA EDITAR LOS DIAS DE LA AGENDA, SE USA EN LOS SELECT DE HORARIO DE INICIO, HORARIO DE FIN Y DURACION DE TURNOS
  const editDaySchedule = ({
    day,
    dayStart,
    dayEnd,
    appointmentDuration,
  }: {
    day: string;
    dayStart: number;
    dayEnd: number;
    appointmentDuration: number;
  }) => {
    const dayToEdit = daysSchedule?.find(
      (daySchedule) => daySchedule.day === day
    );
    if (!dayToEdit) return;
    const dayEdited: IDaySchedule = {
      ...dayToEdit,
      dayStart,
      dayEnd,
      appointmentDuration,
    };

    setDaysChanged((days) => {
      const index = days.findIndex((day) => day.day === selectedDay.dayName);
      if (index !== -1) {
        const newEditedDays = [...days];
        newEditedDays[index].dayEnd = dayEnd;
        newEditedDays[index].dayStart = dayStart;
        newEditedDays[index].appointmentDuration = appointmentDuration;
        return newEditedDays;
      }
      return [...days, dayEdited];
    });

    setDaysSchedule((days) => {
      const index = days.findIndex((day) => day.day === selectedDay.dayName);
      const newEditedDays = [...days];
      newEditedDays[index].dayEnd = dayEnd;
      newEditedDays[index].dayStart = dayStart;
      newEditedDays[index].appointmentDuration = appointmentDuration;
      return newEditedDays;
    });
  };

  // FUNCION PARA GUARDAR LOS CAMBIOS DE LA AGENDA AUTOMATICA Y LOS DIAS DE LA AGENDA
  const saveChanges = async () => {
    setLoadingButton(true);
    if (selectedAnticipation >= selectedDaysToCreate) {
      setAlert({
        msg: "Elige una anticipación menor a los dias a crear",
        error: true,
        alertType: "ERROR_ALERT",
      });
      hideAlert();
      return;
    }
    //setLoadingNewAppointments(true);
    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
    };
    // guardar los datos de parametros de agenda automatica
    try {
      await axiosReq.put(
        "/business/schedule/parameters/" + business?._id,
        {
          scheduleAnticipation: selectedAnticipation,
          scheduleDaysToCreate: selectedDaysToCreate,
          automaticSchedule: selectedAutomaticSchedule,
        },
        authHeader
      );

      if (daysChanged.length > 0) saveModifiedScheduleDays();
      setAlert({
        msg: "Cambios guardados con éxito",
        error: true,
        alertType: "OK_ALERT",
      });
      hideAlert();
      setLoadingButton(false);
      window.location.reload();
      //setLoadingNewAppointments(false);



    } catch (error) {
      setAlert({
        msg: "Error al guardar cambios",
        error: true,
        alertType: "ERROR_ALERT",
      });
      hideAlert();
      setLoadingButton(false);

      setLoadingNewAppointments(false);
    }
  };

  // FUNCION PARA GUARDAR LOS DIAS DE LA AGENDA QUE FUERON MODIFICADOS, SE USA EN LA FUNCION DE GUARDAR CAMBIOS
  const saveModifiedScheduleDays = async () => {
    try {
      const token = localStorage.getItem("sacaturno_token");
      const authHeader = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-store",
        },
      };
      await axiosReq.put(
        "/schedule/appointment/editmany",
        daysChanged,
        authHeader
      );
    } catch (error) { }
  };

  return (
    <>
      {loadingNewAppointments && (
        <div
          style={{ height: "calc(100vh - 64px)" }}
          className="absolute z-50 flex items-center justify-center w-full bg-white"
        >
          <div className="loader"></div>
        </div>
      )}

      {/* APPOINTMENT INFO */}
      <Dialog open={eventModal} onOpenChange={() => { setEventModal(false) }} >
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <ScheduleAppointmentModal
            onDeleteAppointment={(deletedAppointment) => {
              setSelectedDayAppointments((dayAppointments) => {
                const updatedAppointments = dayAppointments?.filter(
                  (app) => app._id !== deletedAppointment._id
                );
                return updatedAppointments;
              });
              setLoadingNewAppointments(true);
              setAppointmentsSchedule((dayAppointments) => {
                const updatedAppointments = dayAppointments?.filter(
                  (app) => app._id !== deletedAppointment._id
                );
                return updatedAppointments;
              });
            }}
            appointment={eventData}
            closeModalF={() => setEventModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* CREATE SINGLE APPOINTMENT */}
      <Dialog open={createAppointmentModal} onOpenChange={() => { setCreateAppointmentModal(false) }} >
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <CreateScheduleAppointmentModal
            onNewAppointment={(newAppointment) => {
              setSelectedDayAppointments([
                ...selectedDayAppointments!,
                newAppointment,
              ]);
              setAppointmentsSchedule([...appointmentsSchedule!, newAppointment]);
              //setLoadingNewAppointments(true);
            }}
            appointmentData={createAppointmentData}
            servicesData={services}
            closeModalF={() => setCreateAppointmentModal(false)}
          />
        </DialogContent>
      </Dialog>


      {/* NO SERVICES MODAL */}
      <Dialog open={servicesData.length === 0}>
        <DialogContent className="sm:w-[460px] w-[93vw]">
          <NoServicesModal />
        </DialogContent>
      </Dialog>

      <Dialog open={expiredModal}>
        <DialogTitle></DialogTitle>
        <DialogContent className="sm:w-[400px] w-[93vw]">
          <ExpiredPlanModal
            onCloseModal={() => setExpiredModal(false)}
            businessData={business}
          />
        </DialogContent>
      </Dialog>

      {/* HELP MODAL */}
      <Dialog open={helpModal} onOpenChange={() => { setHelpModal(false) }} >
        <DialogContent className="sm:w-[1000px] w-[93vw] px-0 pb-0" >
          <HelpModal onClose={() => setHelpModal(false)} />
        </DialogContent>
      </Dialog>

      <div
        style={{ position: "absolute", top: "87px", left: "20px" }}
        className="flex flex-col overflow-hidden md:hidden"
      >
        <IoInformationCircle
          onClick={() => setHelpModal(!helpModal)}
          size={25}
          className="block ml-auto text-gray-300 md:hidden"
          style={{ marginRight: "6px" }}
        />
      </div>

      <div className="flex flex-col items-center w-full h-fit ">
        <header className="flex flex-col items-center justify-center w-full mt-4 mb-4 md:mt-5 md:mb-6 h-fit">
          <h4
            className="relative inline-block px-2 font-bold text-center uppercase"
            style={{ fontSize: 20 }}
          >
            Automatizar agenda

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
        </header>

        <Card className="flex w-full p-5 mt-3 mb-10 md:p-6 md:mt-0 md:mb-5">
          <div className="flex flex-col">
            <div className="flex flex-col gap-4 ">
              <h4 className="text-lg font-semibold md:text-xl">
                Frecuencia y cantidad de días{" "}
              </h4>

              <div className="mr-auto notifications-container-Info">
                <div className="alertInfo">
                  <div className="flex">
                    <div className="flex-shrink-0 my-auto">
                      <FaCircleInfo color="lightblue" />
                    </div>
                    <div className="alertInfo-prompt-wrap">
                      <p className="text-xs font-normal text-blue-400 md:text-sm">
                        Activando esta función, los turnos se generan
                        automáticamente. Ingresá la cantidad de días que quieras
                        crear turnos y cuántos dias antes del último turno querés
                        volver a crear los turnos programados.
                        {/* <span className="cursor-pointer alertInfo-prompt-link">
                    Actualizar suscripción
                  </span> */}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="flex flex-col">
                  <div className="flex flex-col gap-5 md:flex-row">
                    <div
                      className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
                    >
                      <label
                        style={{ fontSize: "13px" }}
                        className="mb-1 font-semibold "
                      >
                        Crear turnos automáticamente{" "}
                      </label>
                      <div className="flex items-center gap-3">
                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={selectedAutomaticSchedule}
                            onChange={() =>
                              setSelectedAutomaticSchedule(
                                !selectedAutomaticSchedule
                              )
                            }
                          />
                          <span className={styles.slider}></span>
                        </label>
                        {selectedAutomaticSchedule && (
                          <span className="text-sm font-semibold">
                            Activado
                          </span>
                        )}
                        {!selectedAutomaticSchedule && (
                          <span className="text-sm font-semibold text-gray-400">
                            Desactivado
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
                    >
                      <label
                        style={{ fontSize: "13px" }}
                        className="mb-1 font-semibold "
                      >
                        Días con turnos disponibles:
                      </label>
                      <select
                        defaultValue={selectedDaysToCreate}
                        value={selectedDaysToCreate}
                        onChange={(e) =>
                          setSelectedDaysToCreate(Number(e.target.value))
                        }
                        id="appointmentDuration"
                      >
                        <option value="7">Crear 7 días</option>
                        <option value="15">Crear 15 días</option>
                        <option value="30">Crear 30 días</option>
                      </select>
                    </div>

                    <div
                      className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
                    >
                      <label
                        style={{ fontSize: "13px" }}
                        className="mb-1 font-semibold "
                      >
                        ¿Con qué anticipación crear turnos?
                      </label>
                      <select
                        defaultValue={selectedAnticipation}
                        onChange={(e) =>
                          setSelectedAnticipation(Number(e.target.value))
                        }
                        value={selectedAnticipation}
                        id="appointmentDuration"
                      >
                        <option value="0">0 días antes</option>
                        <option value="1">1 día antes</option>
                        <option value="2">2 días antes</option>
                        <option value="3">3 días antes</option>
                        <option value="4">4 días antes</option>
                        <option value="5">5 días antes</option>
                        <option value="6">6 días antes</option>
                        <option value="7">7 días antes</option>
                        <option value="8">8 días antes</option>
                        <option value="9">9 días antes</option>
                        <option value="10">10 días antes</option>
                        <option value="11">11 días antes</option>
                        <option value="12">12 días antes</option>
                        <option value="13">13 días antes</option>
                        <option value="14">14 días antes</option>
                        <option value="15">15 días antes</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              {selectedAutomaticSchedule && businessData.automaticSchedule && (
                <>
                  <div className="flex items-center gap-2">
                    <FaCircleInfo color="#dd4924" />

                    <span className="text-xs font-semibold">
                      Tus próximos turnos se crearán el{" "}
                      {dayjs(businessData.scheduleEnd)
                        .subtract(businessData.scheduleAnticipation, "day")
                        .format("dddd DD/MM")}
                      .
                    </span>
                  </div>
                </>
              )}
              {selectedAutomaticSchedule && !businessData.automaticSchedule && (
                <>
                  <div className="flex items-center gap-3">
                    <FaCircleInfo color="#dd4924" size={20} />

                    <span className="w-full text-xs font-semibold">
                      A partir de hoy se crearán turnos durante{" "}
                      {selectedDaysToCreate} días. {selectedAnticipation} días
                      antes del ultimo turno, se volverá a generar tu agenda.
                    </span>
                  </div>
                </>
              )}
            </div>



          </div>
        </Card>

        {/* horario de atencion mobile */}
        <div className="block w-full p-0 h-hit md:hidden">
          <div className="flex flex-col w-full gap-2">
            <h4 className="text-lg font-semibold md:text-xl">
              Horario de atención{" "}
            </h4>
            {/* <span className="flex px-0 text-xs font-normal text-gray-600 md:text-sm md:px-7">
            Por cada día de la semana, ingresá el horario de trabajo, la
            duración de cada turno y creá los turnos del dia con el servicio que
            ofrezcan.
          </span> */}

            <div className="mr-auto notifications-container-Info">
              <div className="alertInfo">
                <div className="flex">
                  <div className="flex-shrink-0 my-auto">
                    <FaCircleInfo color="lightblue" />
                  </div>
                  <div className="alertInfo-prompt-wrap">
                    <p className="text-xs font-normal text-blue-400 md:text-sm">
                      Por cada día de la semana, ingresá el horario de trabajo, la
                      duración de cada turno y agregá los turnos y servicios que
                      ofrezcas.
                      {/* <span className="cursor-pointer alertInfo-prompt-link">
                    Actualizar suscripción
                  </span> */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between w-full mt-4 mb-4 md:flex-row h-fit">
            {/* <button
            className={`${styles.btnAddAll} hidden md:flex gap-2 items-center`}
            onClick={() => setHelpModal(!helpModal)}
          >
            <IoInformationCircle size={20} /> ¿Cómo agrego turnos?
          </button> */}

            <div className={styles.daysOfWeekCont}>
              {daysOfWeek.map((day) => (
                <button
                  key={day.dayName}
                  className={`${styles.dayOfWeek} ${selectedDay.dayName === day.dayName
                    ? `${styles.dayOfWeekSelected}`
                    : ``
                    }`}
                  onClick={() => handleSelectDay(day)}
                >
                  {day.dayName}
                </button>
              ))}
            </div>

            <div className="flex justify-between gap-0 md:justify-normal md:gap-6">
              <div
                className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Desde:
                </label>
                <select
                  defaultValue={selectedDayStart}
                  value={selectedDayStart}
                  onChange={handleSelectDayStart}
                  id="appointmentDuration"
                >
                  {timeOptions.map((time) => (
                    <option value={time.value} key={time.label}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Hasta:
                </label>
                <select
                  defaultValue={selectedDayEnd}
                  onChange={handleSelectDayEnd}
                  value={selectedDayEnd}
                  id="appointmentDuration"
                >
                  {timeOptions.map((time) => (
                    <option value={time.value} key={time.label}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Duración
                </label>

                <select
                  className="text-sm"
                  defaultValue={selectedAppointmentDuration}
                  value={selectedAppointmentDuration}
                  onChange={handleSelectAppointmentDuration}
                  id="appointmentDuration"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 h</option>
                  <option value="75">1:15 hs</option>
                  <option value="90">1:30 hs</option>
                  <option value="105">1:45 hs</option>
                  <option value="120">2 hs</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.scheduleCalendarContainer}>
            {selectedDayAppointments && (
              <>
                <Calendar
                  components={components}
                  localizer={localizer}
                  className={styles.scheduleCalendarComponent}
                  events={parseAppointments(selectedDayAppointments)}
                  startAccessor="start"
                  endAccessor="end"
                  onView={() => { }}
                  onNavigate={() => { }}
                  showAllEvents={false}
                  view={view}
                  views={["week", "day"]}
                  min={new Date(0, 0, 0, Number(selectedDayStart), 0, 0)}
                  max={new Date(0, 0, 0, Number(selectedDayEnd), 0, 0)}
                  timeslots={1}
                  step={Number(selectedAppointmentDuration)}
                  onSelectSlot={({ action, start, end }) => {
                    if (action === "select" || action === "click") {
                      createNewAppointment({ start, end });
                    }
                  }}
                  toolbar={false}
                  selectable
                  defaultView="day"
                  onSelectEvent={(event) => {
                    handleSelectEvent(event);
                  }}
                  longPressThreshold={250}
                />
              </>
            )}
          </div>
        </div>

        {/* horario de atencion desktop */}
        <Card className="hidden w-full p-6 md:block h-hit">
          <div className="flex flex-col w-full gap-4">
            <h4 className="text-lg font-semibold md:text-xl">
              Horario de atención{" "}
            </h4>
            {/* <span className="flex px-0 text-xs font-normal text-gray-600 md:text-sm md:px-7">
            Por cada día de la semana, ingresá el horario de trabajo, la
            duración de cada turno y creá los turnos del dia con el servicio que
            ofrezcan.
          </span> */}

            <div className="mr-auto notifications-container-Info">
              <div className="alertInfo">
                <div className="flex">
                  <div className="flex-shrink-0 my-auto">
                    <FaCircleInfo color="lightblue" />
                  </div>
                  <div className="alertInfo-prompt-wrap">
                    <p className="text-xs font-normal text-blue-400 md:text-sm">
                      Por cada día de la semana, ingresá el horario de trabajo, la
                      duración de cada turno y agregá los turnos y servicios que
                      ofrezcas.
                      {/* <span className="cursor-pointer alertInfo-prompt-link">
                    Actualizar suscripción
                  </span> */}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between w-full mt-4 mb-4 md:flex-row h-fit">
            {/* <button
            className={`${styles.btnAddAll} hidden md:flex gap-2 items-center`}
            onClick={() => setHelpModal(!helpModal)}
          >
            <IoInformationCircle size={20} /> ¿Cómo agrego turnos?
          </button> */}

            <div className={styles.daysOfWeekCont}>
              {daysOfWeek.map((day) => (
                <button
                  key={day.dayName}
                  className={`${styles.dayOfWeek} ${selectedDay.dayName === day.dayName
                    ? `${styles.dayOfWeekSelected}`
                    : ``
                    }`}
                  onClick={() => handleSelectDay(day)}
                >
                  {day.dayName}
                </button>
              ))}
            </div>

            <div className="flex justify-between gap-0 md:justify-normal md:gap-6">
              <div
                className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Desde:
                </label>
                <select
                  defaultValue={selectedDayStart}
                  value={selectedDayStart}
                  onChange={handleSelectDayStart}
                  id="appointmentDuration"
                >
                  {timeOptions.map((time) => (
                    <option value={time.value} key={time.label}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Hasta:
                </label>
                <select
                  defaultValue={selectedDayEnd}
                  onChange={handleSelectDayEnd}
                  value={selectedDayEnd}
                  id="appointmentDuration"
                >
                  {timeOptions.map((time) => (
                    <option value={time.value} key={time.label}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className={`flex flex-col w-fit h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Duración
                </label>

                <select
                  className="text-sm"
                  defaultValue={selectedAppointmentDuration}
                  value={selectedAppointmentDuration}
                  onChange={handleSelectAppointmentDuration}
                  id="appointmentDuration"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 h</option>
                  <option value="75">1:15 hs</option>
                  <option value="90">1:30 hs</option>
                  <option value="105">1:45 hs</option>
                  <option value="120">2 hs</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.scheduleCalendarContainer}>
            {selectedDayAppointments && (
              <>
                <Calendar
                  components={components}
                  localizer={localizer}
                  className={styles.scheduleCalendarComponent}
                  events={parseAppointments(selectedDayAppointments)}
                  startAccessor="start"
                  endAccessor="end"
                  onView={() => { }}
                  onNavigate={() => { }}
                  showAllEvents={false}
                  view={view}
                  views={["week", "day"]}
                  min={new Date(0, 0, 0, Number(selectedDayStart), 0, 0)}
                  max={new Date(0, 0, 0, Number(selectedDayEnd), 0, 0)}
                  timeslots={1}
                  step={Number(selectedAppointmentDuration)}
                  onSelectSlot={({ action, start, end }) => {
                    if (action === "select" || action === "click") {
                      createNewAppointment({ start, end });
                    }
                  }}
                  toolbar={false}
                  selectable
                  defaultView="day"
                  onSelectEvent={(event) => {
                    handleSelectEvent(event);
                  }}
                  longPressThreshold={250}
                />
              </>
            )}
          </div>
        </Card>

        {/* save changes button */}
        <div className="flex flex-col gap-4 mx-auto h-fit w-fit mt-7 md:flex-row">
          {!loadingButton && (
            <Button
              className="px-10 my-10 text-white bg-orange-600 border-none rounded-lg shadow-xl outline-none w-fit h-11 hover:bg-orange-700 "
              onClick={saveChanges}>
              <LuSave size={18} />
              Guardar cambios
            </Button>
          )}
          {loadingButton && (
            <>
              <div
                style={{
                  height: "100%",
                  width: "100%",
                }}
                className="flex items-center justify-center w-full px-10 mb-11 mt-14 h-11"
              >
                <div className="loaderSmall"></div>
              </div>
            </>
          )}
        </div>

        {/* left button -- go to schedule -- */}
        <Link
          className="flex items-center gap-2 mr-auto text-xs font-semibold uppercase"
          style={{ color: "#dd4924" }}
          href="/admin/schedule"
        >
          <FaArrowLeft />
          Calendario de turnos
        </Link>
        {/* divider */}
        <div className="my-5 md:my-10"></div>
      </div>

      {/* ALERT */}
      {alert?.error && (
        <div className="absolute flex justify-center w-full h-fit">
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

export default CreateScheduleCalendar;
