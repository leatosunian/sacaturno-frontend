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
import { IBusiness } from "@/interfaces/business.interface";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advanced from "dayjs/plugin/advancedFormat";
import { useRouter } from "next/navigation";
import styles from "@/app/css-modules/CalendarBookAppointment.module.css";
import BookAppointmentModal from "./BookAppointmentModal";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "@/components/Alert";
import { IDaySchedule } from "@/interfaces/daySchedule.interface";
import { Dialog, DialogContent } from "@/components/ui/dialog";

dayjs.locale("es-mx");
const localizer = dayjsLocalizer(dayjs);

interface Props {
  appointments: IAppointment[];
  businessData: IBusiness;
  scheduleDays: IDaySchedule[];
}

interface eventType {
  start: Date;
  end: Date;
  title: string | undefined;
  businessID?: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked" | undefined;
  email: string | undefined;
  phone: number | undefined;
  name: string | undefined;
  price: number | undefined;
  description: string | undefined;
}

interface eventType2 {
  start: string;
  end: string;
  title: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  service: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  name: string | undefined;
  status?: "booked" | "unbooked" | undefined;
  price: number | undefined;
  description: string | undefined;
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
  scheduleDays,
}) => {
  var now = dayjs();
  const localizer = dayjsLocalizer(dayjs);
  const [appointmentsData, setAppointmentsData] = useState<IAppointment[]>();
  const [business, setBusiness] = useState<IBusiness>();
  const [eventModal, setEventModal] = useState(false);
  const [eventData, setEventData] = useState<eventType2 | undefined>();
  const [bookAppointmentModal, setBookAppointmentModal] = useState(false);
  useState<eventType2>();
  const [view, setView] = useState<(typeof Views)[Keys]>(Views.DAY);
  const [date, setDate] = useState<Date>(now.toDate());
  const [alert, setAlert] = useState<AlertInterface>();
  const [selectedDaySchedule, setSelectedDaySchedule] = useState({
    dayStart: 8,
    dayEnd: 19,
    appointmentDuration: 60,
  });

  const router = useRouter();
  useEffect(() => {
    setAppointmentsData(appointments);
    console.log(appointments);
    setBusiness(businessData);
    parseAppointments(appointments);
    return;
  }, [appointments, businessData]);

  useEffect(() => {
    parseAppointments(appointmentsData);
    return;
  }, [appointmentsData]);

  useEffect(() => {
    const day = dayjs(date)
      .format("ddd")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const dayNormalized = day.substring(0, day.length - 1);
    const selectedDayDayData = scheduleDays.find(
      (dayObj) => dayObj.day === dayNormalized
    );
    setSelectedDaySchedule({
      dayStart: selectedDayDayData?.dayStart!,
      dayEnd: selectedDayDayData?.dayEnd!,
      appointmentDuration: selectedDayDayData?.appointmentDuration!,
    });
    return;
  }, [date]);

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
        service,
        email,
        phone,
        name,
        price,
        description,
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
          service,
          email,
          name,
          phone,
          price,
          description,
        };
        if (appointmentObj.status === "unbooked") {
          appointmentsList.push(appointmentObj);
        }
      }
    );
    return appointmentsList;
  };

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3000);
  };

  const handleSelectEvent = (event: eventType) => {
    const eventDataObj: eventType2 = {
      service: event.service,
      _id: event._id,
      start: dayjs(event.start).format("D [de] MMMM [|] HH:mm [hs] "),
      end: dayjs(event.end).format("[-] HH:mm [hs]"),
      clientID: event.clientID,
      title: event.title,
      email: event.email,
      phone: event.phone,
      name: event.name,
      price: event.price,
      description: event.description,
    };
    setEventData(eventDataObj);
    setBookAppointmentModal(true);
  };

  const components: any = {
    event: ({ event }: EventProps<eventType>) => {
      if (event.status === "booked") {
        return (
          <>
            <div
              className="h-full px-2 py-1 w-fit "
              style={{ backgroundColor: "rgb(203 137 121)" }}
            >
              <span className="text-sm">Reservado </span>
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
              <span className="text-xs font-semibold md:text-sm">
                {event.title}{" "}
              </span>
              <span style={{ fontSize: "10px" }}>{event.service} </span>
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
    const day = Number(dayjs(date).format("D"));
    const month = Number(dayjs(date).format("M"));
    const actualMonth = dayjs().month() + 1;
    const actualDay = dayjs().date();
    if (view === Views.DAY) {
      if (month >= actualMonth && day > actualDay) {
        setDate(dayjs(date).subtract(1, "day").toDate());
      }
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

  const handleCancelBooking = (action: string) => {
    setBookAppointmentModal(false);
    if (action === "CANCELLED") {
      setAlert({
        error: true,
        alertType: "OK_ALERT",
        msg: "Cancelaste tu reserva",
      });
      router.refresh();
      hideAlert();
    }
  };

  return (
    <>

      {/* <Dialog open={bookAppointmentModal} onOpenChange={() => setBookAppointmentModal(false)} >
        <DialogContent className="sm:w-[460px]  w-[93vw]">
          <BookAppointmentModal
            businessData={businessData}
            appointmentData={eventData}
            closeModalF={(action) => handleCancelBooking(action)}
          />
        </DialogContent>
      </Dialog> */}

      <div className="flex flex-col w-full h-fit ">
        <header className="flex flex-col items-center justify-center w-full mt-3 mb-3 md:mt-7 md:mb-7 h-fit">
          <h4 className="text-xl font-bold uppercase md:text-2xl">
            {business?.name}
          </h4>
          <span className="text-xs uppercase">Reservar turno</span>
        </header>
        <div className="flex-col hidden w-full mb-5 md:flex md:flex-row h-fit">
          <div className="flex w-1/3 h-fit">
            <button
              className={
                view !== Views.WEEK
                  ? styles.btnWeek
                  : `${styles.btnSelected} ${styles.btnWeek}  uppercase`
              }
              onClick={() => setView(Views.WEEK)}
            >
              Semana
            </button>
            <button
              className={
                view !== Views.DAY
                  ? styles.btnDay
                  : `${styles.btnSelected} ${styles.btnDay} uppercase `
              }
              onClick={() => setView(Views.DAY)}
            >
              Dia
            </button>
          </div>
          <h4 className="flex justify-center w-1/3 text-xl font-bold text-center uppercase">
            {calendarDate}{" "}
          </h4>
          <div className="flex justify-end md:w-1/3 h-fit ">
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
        </div>

        {/* mobile */}
        <div className="flex flex-col mb-2 md:hidden">
          <h4 className="w-full font-bold text-center uppercase text-md">
            {calendarDate}
          </h4>
        </div>

        <div className="fixed bottom-0 z-10 flex justify-center w-full ml-auto mr-auto -translate-y-5 md:hidden">
          <button className={styles.btnWeekBlue} onClick={() => onPrevClick()}>
            Anterior
          </button>
          <button className={styles.btnDayBlue} onClick={() => onNextClick()}>
            Siguiente
          </button>
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
            onView={() => { }}
            onNavigate={() => { }}
            showAllEvents={false}
            view={view}
            date={date}
            views={["week", "day"]}
            min={new Date(0, 0, 0, selectedDaySchedule.dayStart, 0, 0)}
            max={new Date(0, 0, 0, selectedDaySchedule.dayEnd, 0, 0)}
            timeslots={1}
            step={selectedDaySchedule.appointmentDuration}
            onSelectSlot={() => { }}
            toolbar={false}
            selectable
            defaultView="day"
            onSelectEvent={(event) => {
              handleSelectEvent(event);
            }}
            longPressThreshold={9999}
          />
        </div>
      </div>
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
    </>
  );
};

export default CalendarTurnos;
