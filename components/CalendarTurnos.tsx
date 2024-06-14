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
import { IAppointment } from "@/interfaces/appointment.interface";
import { useCallback, useEffect, useMemo, useState } from "react";
import AppointmentModal from "./AppointmentModal";
import { IBusiness } from "@/interfaces/business.interface";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import { useRouter } from "next/navigation";
import styles from "@/app/css-modules/CalendarTurnos.module.css";
import CreateAppointmentModal from "./CreateAppointmentModal";
import { IService } from "@/interfaces/service.interface";
import NoServicesModal from "./NoServicesModal";
import ISubscription from "@/interfaces/subscription.interface";
import ExpiredPlanModal from "./ExpiredPlanModal";
import AllDayAppointmentsModal from "./AllDayAppointmentsModal";
import { LuCalendarPlus } from "react-icons/lu";

dayjs.locale("es-mx");

interface Props {
  appointments: IAppointment[];
  businessData: IBusiness;
  servicesData: IService[];
  subscriptionData: ISubscription | undefined;
}

interface eventType {
  start: Date;
  end: Date;
  title: string | undefined;
  businessID?: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked" | undefined;
}

interface eventType2 {
  start: string;
  end: string;
  title: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked" | undefined;
}

interface IAllDayModalProps {
  date: Date;
  business: IBusiness;
  services: IService[];
  closeModalF: () => void;
}

type Keys = keyof typeof Views;

const messages = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  date: "Fecha",
  time: "Hora",
};

const CalendarTurnos: React.FC<Props> = ({
  appointments,
  businessData,
  servicesData,
  subscriptionData,
}) => {
  var now = dayjs();
  const localizer = dayjsLocalizer(dayjs);
  const [appointmentsData, setAppointmentsData] = useState<IAppointment[]>();
  const [business, setBusiness] = useState<IBusiness>();
  const [services, setServices] = useState<IService[]>();
  const [eventModal, setEventModal] = useState(false);
  const [eventData, setEventData] = useState<eventType2 | undefined>();
  const [createAppointmentModal, setCreateAppointmentModal] = useState(false);
  const [createAppointmentData, setCreateAppointmentData] =
    useState<IAppointment>();
  const [allDayAppointmentsModal, setAllDayAppointmentsModal] = useState(false);
  const [allDayAppointmentsData, setAllDayAppointmentsData] =
    useState<IAllDayModalProps>();
  const [view, setView] = useState<(typeof Views)[Keys]>(Views.DAY);
  const [date, setDate] = useState<Date>(now.toDate());
  const [expiredModal, setExpiredModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setAppointmentsData(appointments);
    setBusiness(businessData);
    setServices(servicesData);
    parseAppointments(appointments);
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      setExpiredModal(true);
    }
    return;
  }, [appointments, businessData, services, servicesData, subscriptionData]);

  useEffect(() => {
    parseAppointments(appointmentsData);
    return;
  }, [appointmentsData]);

  const saveNewAppointment = async ({
    start,
    end,
  }: {
    start: Date;
    end: Date;
  }) => {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    dayjs.extend(advanced);

    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
    };
    const startDate = dayjs(start)
      .tz("America/Argentina/Buenos_Aires")
      .toDate();
    const endDate = dayjs(end).tz("America/Argentina/Buenos_Aires").toDate();

    const appointmentData: IAppointment = {
      businessID: business?._id,
      start: startDate,
      end: endDate,
      service: "",
    };
    console.log("clicked");

    setCreateAppointmentModal(true);
    setCreateAppointmentData(appointmentData);
  };

  const parseAppointments = (appointments: IAppointment[] | undefined) => {
    dayjs.extend(timezone);
    dayjs.extend(utc);
    dayjs.extend(advanced);

    let appointmentsList: eventType[] = [];

    appointments?.map(
      ({
        start,
        end,
        title,
        clientID,
        businessID,
        _id,
        status,
        name,
        email,
        phone,
        service,
      }) => {
        let appointmentObj: eventType;
        appointmentObj = {
          start: dayjs(start).tz("America/Argentina/Buenos_Aires").toDate(),
          end: dayjs(end).tz("America/Argentina/Buenos_Aires").toDate(),
          title,
          clientID,
          status,
          businessID,
          _id,
          name,
          email,
          phone,
          service,
        };
        appointmentsList.push(appointmentObj);
      }
    );
    return appointmentsList;
  };

  const handleSelectEvent = (event: eventType) => {
    const eventDataObj: eventType2 = {
      _id: event._id,
      start: dayjs(event.start).format("D [de] MMMM [|] HH:mm [hs]"),
      end: dayjs(event.end).format("[-] HH:mm [hs]"),
      clientID: event.clientID,
      title: event.title,
      status: event.status,
      name: event.name,
      phone: event.phone,
      email: event.email,
      service: event.service,
    };
    setEventData(eventDataObj);
    setEventModal(true);
  };

  const components: any = {
    event: ({ event }: EventProps<eventType>) => {
      if (event.status === "booked") {
        return (
          <>
            <div
              className="flex flex-col h-full gap-1 px-2 py-1 w-fit"
              style={{ backgroundColor: "rgb(203 137 121)" }}
            >
              <span className="text-sm">{event.name} </span>
              <span style={{ fontSize: "11px" }}>{event.service} </span>
            </div>
          </>
        );
      }
      if (event.status === "unbooked") {
        return (
          <>
            <div
              className="flex flex-col w-full h-full gap-1 px-2 py-1"
              style={{ backgroundColor: "#dd4924" }}
            >
              <span className="text-sm font-semibold ">{event.title} </span>
              <span style={{ fontSize: "11px" }}>{event.service} </span>
            </div>
          </>
        );
      }
    },
  };

  const onNextClick = useCallback(() => {
    if (view === Views.DAY) {
      setDate(dayjs(date).add(1, "day").toDate());
    }
    if (view === Views.WEEK) {
      setDate(dayjs(date).add(1, "week").toDate());
    }
  }, [view, date]);

  const onPrevClick = useCallback(() => {
    if (view === Views.DAY) {
      setDate(dayjs(date).subtract(1, "day").toDate());
    }
    if (view === Views.WEEK) {
      setDate(dayjs(date).subtract(1, "week").toDate());
    }
  }, [view, date]);

  const calendarDate = useMemo(() => {
    if (view === Views.DAY) return dayjs(date).format("dddd D [de] MMMM ");
    if (view === Views.WEEK) {
      const weekStart = dayjs(date).startOf("week");
      const weekEnd = dayjs(date).endOf("week");
      return `${weekStart.format("D")} a ${weekEnd.format("D [de] MMMM ")}`;
    }
  }, [view, date]);

  return (
    <>
      {allDayAppointmentsModal && (
        <AllDayAppointmentsModal
          business={business}
          services={services}
          date={date}
          closeModalF={() => setAllDayAppointmentsModal(false)}
        />
      )}
      {eventModal && (
        <AppointmentModal
          appointment={eventData}
          closeModalF={() => setEventModal(false)}
        />
      )}
      {createAppointmentModal && (
        <CreateAppointmentModal
          appointmentData={createAppointmentData}
          servicesData={services}
          closeModalF={() => setCreateAppointmentModal(false)}
        />
      )}
      {servicesData.length === 0 && <NoServicesModal />}
      {expiredModal && <ExpiredPlanModal businessData={business} />}

      <div className="flex flex-col w-full h-fit ">
        <header className="flex justify-center w-full mt-5 mb-3 md:mt-7 md:mb-7 h-fit">
          <h4 style={{ fontSize: "22px" }} className="font-bold uppercase ">
            Mis Turnos
          </h4>
        </header>

        <div className="flex-col hidden w-full mb-5 md:flex md:flex-row h-fit">
          <div className="flex w-1/3 h-fit">
            <button
              className={styles.btnWeekBlue}
              onClick={() => onPrevClick()}
            >
              Anterior
            </button>
            <button className={styles.btnDayBlue} onClick={() => onNextClick()}>
              Siguiente
            </button>
          </div>
          <h4 className="flex justify-center w-1/3 text-xl font-bold text-center uppercase">
            {calendarDate}{" "}
          </h4>
          <div className="flex justify-end md:w-1/3 h-fit ">
            <button
              className={
                view !== Views.WEEK
                  ? styles.btnWeek
                  : `${styles.btnSelected} ${styles.btnWeek} `
              }
              onClick={() => setView(Views.WEEK)}
            >
              Semana
            </button>
            <button
              className={
                view !== Views.DAY
                  ? styles.btnDay
                  : `${styles.btnSelected} ${styles.btnDay} `
              }
              onClick={() => setView(Views.DAY)}
            >
              Dia
            </button>
            {/* <button
              className={`${styles.btnAddAll} ml-1`}
              onClick={() => setAllDayAppointmentsModal(true)}
            >
              <LuCalendarPlus size={21} />
            </button> */}
          </div>
        </div>

        <div className="flex flex-col mb-2 md:hidden">
          <h4 className="w-full font-bold text-center uppercase text-md">
            {calendarDate}
          </h4>
        </div>

        <div className="fixed bottom-0 z-50 flex flex-col items-center w-full ml-auto mr-auto -translate-y-8 md:hidden">
          <div className="w-fit flex flex-col gap-1">
            <div className="">
              <button
                className={styles.btnWeekBlue}
                onClick={() => onPrevClick()}
              >
                Anterior
              </button>
              <button
                className={styles.btnDayBlue}
                onClick={() => onNextClick()}
              >
                Siguiente
              </button>
            </div>
            <button
              className={`${styles.btnAddAll} w-full`}
              onClick={() => setAllDayAppointmentsModal(true)}
            >
              Crear turnos del día
            </button>
          </div>
        </div>

        <div className={styles.calendarContainer}>
          <Calendar
            components={components}
            localizer={localizer}
            className={styles.calendarComponent}
            events={parseAppointments(appointments)}
            startAccessor="start"
            endAccessor="end"
            messages={messages}
            onView={() => {}}
            onNavigate={() => {}}
            showAllEvents={false}
            view={view}
            date={date}
            views={["week", "day"]}
            min={new Date(0, 0, 0, Number(businessData.dayStart), 0, 0)}
            max={new Date(0, 0, 0, Number(businessData.dayEnd), 0, 0)}
            timeslots={1}
            step={Number(businessData.appointmentDuration)}
            onSelectSlot={({ action, start, end }) => {
              if (action === "select" || "click") {
                saveNewAppointment({ start, end });
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
        </div>
        {view === "day" && (
          <button
            className={`${styles.btnAddAll} hidden md:flex gap-2 items-center ml-auto mb-10 mt-3`}
            onClick={() => setAllDayAppointmentsModal(true)}
          >
            <LuCalendarPlus size={18} /> Crear turnos del día
          </button>
        )}
      </div>
    </>
  );
};

export default CalendarTurnos;
