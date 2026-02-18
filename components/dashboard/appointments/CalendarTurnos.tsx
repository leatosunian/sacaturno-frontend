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
import NoServicesModal from "../services/NoServicesModal";
import ISubscription from "@/interfaces/subscription.interface";
import ExpiredPlanModal from "./ExpiredPlanModal";
import AllDayAppointmentsModal from "./AllDayAppointmentsModal";
import { LuCalendarPlus } from "react-icons/lu";
import { IoMdMore } from "react-icons/io";
import { IoInformationCircle } from "react-icons/io5";
import HelpModal from "./HelpModal";
import { MdEditCalendar } from "react-icons/md";
import { IDaySchedule } from "@/interfaces/daySchedule.interface";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { timeOptions } from "@/helpers/timeOptions";
import { Dialog, DialogContent } from '@/components/ui/dialog';

dayjs.locale("es-mx");

interface Props {
  appointments: IAppointment[];
  businessData: IBusiness;
  servicesData: IService[];
  scheduleDays: IDaySchedule[];
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
  price: number | undefined;
}

interface eventType2 {
  start: Date;
  end: Date;
  title: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  name: string | undefined;
  email: string | undefined;
  phone: number | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked" | undefined;
  price: number | undefined;
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
  scheduleDays,
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
  const [helpModal, setHelpModal] = useState(false);
  const [view, setView] = useState<(typeof Views)[Keys]>(Views.DAY);
  const [date, setDate] = useState<Date>(now.toDate());
  const [expiredModal, setExpiredModal] = useState(false);
  const [dropdownActive, setDropdownActive] = useState(false);
  const [loadingNewAppointments, setLoadingNewAppointments] = useState(true);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState({
    dayStart: 8,
    dayEnd: 22,
    appointmentDuration: 30,
  });
  const router = useRouter();

  useEffect(() => {
    setAppointmentsData(appointments);
    setBusiness(businessData);
    setServices(servicesData);
    parseAppointments(appointments);
    return;
  }, [appointments, businessData, services, servicesData, subscriptionData]);

  useEffect(() => {
    parseAppointments(appointmentsData);
    setLoadingNewAppointments(false);
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
    //setSelectedDaySchedule({
    //  dayStart: selectedDayDayData?.dayStart!,
    //  dayEnd: selectedDayDayData?.dayEnd!,
    //  appointmentDuration: selectedDayDayData?.appointmentDuration!,
    //});
    return;
  }, [date]);

  // save new appointment
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
    setDropdownActive(false);
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      setExpiredModal(true);
      return
    }
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

    setCreateAppointmentModal(true);
    setCreateAppointmentData(appointmentData);
  };

  // parse appointments' values to show in calendar
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
        price,
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
          price,
        };
        appointmentsList.push(appointmentObj);
      }
    );
    return appointmentsList;
  };

  // handle select event (show appointment info)
  const handleSelectEvent = (event: eventType) => {
    setDropdownActive(false);
    const eventDataObj: eventType2 = {
      _id: event._id,
      //start: dayjs(event.start).format("dddd d [de] MMMM [|] HH:mm [hs]"),
      start: event.start,
      end: event.end,
      clientID: event.clientID,
      title: event.title,
      status: event.status,
      name: event.name,
      phone: event.phone,
      email: event.email,
      service: event.service,
      price: event.price,
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
              <span className="text-xs md:text-sm ">{event.name} </span>
              <span style={{ fontSize: "10px" }}>{event.service} </span>
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
              <span className="text-xs font-semibold md:text-sm ">
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

  const handleSetAllDayAppointmentsModal = () => {
    if (subscriptionData?.subscriptionType === "SC_EXPIRED") {
      return setExpiredModal(true);
    }
    setAllDayAppointmentsModal(true);
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

      {/* CREATE ALL DAY'S APPOINTMENTS */}
      <Dialog open={allDayAppointmentsModal} onOpenChange={() => { setAllDayAppointmentsModal(false) }} >
        <DialogContent className="sm:w-fit w-[93vw] ">
          <AllDayAppointmentsModal
            business={business}
            services={services}
            date={date}
            selectedDay={selectedDaySchedule}
            onNewAppointment={() => setLoadingNewAppointments(true)}
            closeModalF={() => setAllDayAppointmentsModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* APPOINTMENT INFO */}
      <Dialog open={eventModal} onOpenChange={() => { setEventModal(false) }} >
        <DialogContent className="sm:w-[470px] w-[93vw] ">
          <AppointmentModal
            onDeleteAppointment={() => setLoadingNewAppointments(true)}
            appointment={eventData}
            closeModalF={() => setEventModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* CREATE SINGLE APPOINTMENT */}
      <Dialog open={createAppointmentModal} onOpenChange={() => { setCreateAppointmentModal(false) }} >
        <DialogContent className="sm:w-[350px] w-[93vw]">
          <CreateAppointmentModal
            onNewAppointment={() => setLoadingNewAppointments(true)}
            closeModalF={() => setCreateAppointmentModal(false)}
            appointmentData={createAppointmentData}
            servicesData={services}
          />
        </DialogContent>
      </Dialog>

      {/* NO SERVICES MODAL */}
      {servicesData.length === 0 && <NoServicesModal />}

      {/* EXPIRED PLAN MODAL ----- TEST ------ */}
      {expiredModal && <ExpiredPlanModal onCloseModal={() => setExpiredModal(false)} businessData={business} />}

      {/* HELP MODAL */}
      <Dialog open={helpModal} onOpenChange={() => { setHelpModal(false) }} >
        <DialogContent className="sm:w-[1000px] w-[93vw] px-0 pb-0" >
          <HelpModal onClose={() => setHelpModal(false)} />
        </DialogContent>
      </Dialog>

      <div
        style={{ position: "absolute", top: "80px", left: "20px" }}
        className="flex flex-col overflow-hidden md:hidden"
      >
        <IoInformationCircle
          onClick={() => setHelpModal(!helpModal)}
          size={25}
          className="block ml-auto text-gray-300 md:hidden"
          style={{ marginRight: "6px" }}
        />
      </div>

      {/* mobile dropdown */}
      <div
        style={{ position: "absolute", top: "80px", right: "20px" }}
        className="flex flex-col md:hidden"
      >
        <IoMdMore
          onClick={() => setDropdownActive(!dropdownActive)}
          size={25}
          className="block ml-auto md:hidden"
          style={{ marginRight: "6px" }}
        />
        {dropdownActive && (
          <>
            <div className={styles.dropmenuCont}>
              <div className={styles.dropmenu}>
                <MdEditCalendar size={18} />
                <Link href={"/admin/schedule/settings"}>Configurar agenda</Link>
              </div>
              {/* <div style={{width: '100%'}}></div> */}
              <div className={styles.dropmenu}>
                <LuCalendarPlus size={18} />
                <span
                  onClick={() => {
                    setAllDayAppointmentsModal(true);
                    setDropdownActive(false);
                  }}
                  className="font-medium"
                >
                  Crear turnos del día
                </span>
              </div>
              <div className={styles.dropmenu}>
                <IoInformationCircle size={18} />
                <span
                  onClick={() => setHelpModal(!helpModal)}
                  className="font-medium"
                >
                  Tutorial de uso
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      {/* mobile dropdown */}

      <div className="flex flex-col w-full h-fit ">
        <header className="flex flex-col items-center justify-center w-full mt-4 mb-3 md:mt-5 md:mb-6 h-fit">
          <h4
            className="relative inline-block px-2 font-bold text-center uppercase"
            style={{ fontSize: 20 }}
          >
            Mis turnos

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

        <div className="flex-col items-end hidden w-full mb-2 md:flex md:flex-row h-fit">
          <div className="flex flex-col w-1/3 md:flex-row h-fit">
            <div className="flex w-full gap-4 ">
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
                  defaultValue={selectedDaySchedule.dayStart}
                  value={selectedDaySchedule.dayStart}
                  onChange={(e) =>
                    setSelectedDaySchedule({
                      ...selectedDaySchedule,
                      dayStart: Number(e.target.value),
                    })
                  }
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
                  defaultValue={selectedDaySchedule.dayEnd}
                  onChange={(e) =>
                    setSelectedDaySchedule({
                      ...selectedDaySchedule,
                      dayEnd: Number(e.target.value),
                    })
                  }
                  value={selectedDaySchedule.dayEnd}
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
                  defaultValue={selectedDaySchedule.appointmentDuration}
                  value={selectedDaySchedule.appointmentDuration}
                  onChange={(e) =>
                    setSelectedDaySchedule({
                      ...selectedDaySchedule,
                      appointmentDuration: Number(e.target.value),
                    })
                  }
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

          <h4 className="flex justify-center w-1/3 font-bold text-center uppercase text-md">
            {calendarDate}
          </h4>

          <div className="flex justify-end w-1/3 h-fit ">
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
            <div className="flex ml-4 w-fit h-fit">
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
          </div>
        </div>

        <div className="flex w-full mt-3 mb-3 md:hidden md:flex-row h-fit">
          <div className="flex w-full justify-evenly ">
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
                defaultValue={selectedDaySchedule.dayStart}
                value={selectedDaySchedule.dayStart}
                onChange={(e) =>
                  setSelectedDaySchedule({
                    ...selectedDaySchedule,
                    dayStart: Number(e.target.value),
                  })
                }
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
                defaultValue={selectedDaySchedule.dayEnd}
                onChange={(e) =>
                  setSelectedDaySchedule({
                    ...selectedDaySchedule,
                    dayEnd: Number(e.target.value),
                  })
                }
                value={selectedDaySchedule.dayEnd}
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
                defaultValue={selectedDaySchedule.appointmentDuration}
                value={selectedDaySchedule.appointmentDuration}
                onChange={(e) =>
                  setSelectedDaySchedule({
                    ...selectedDaySchedule,
                    appointmentDuration: Number(e.target.value),
                  })
                }
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

        <div className="flex flex-col mb-2 md:hidden">
          <h4 className="w-full text-sm font-bold text-center uppercase md:text-md">
            {calendarDate}
          </h4>
        </div>

        <div className="fixed bottom-0 z-50 flex flex-col items-center w-full ml-auto mr-auto -translate-y-5 md:hidden">
          <div className="flex flex-col gap-1 w-fit">
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
          </div>
        </div>

        <div className={styles.calendarContainer}>
          <Calendar
            components={components}
            localizer={localizer}
            className={styles.calendarComponentSchedule}
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
            onSelectSlot={({ action, start, end }) => {
              if (action === "select" || action === "click") {
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

        <div className="flex justify-between w-full mt-6 mb-12 h-fit">
          <div className="flex gap-2">
            <button
              className={`${styles.btnAddAll} hidden md:flex gap-2 items-center`}
              onClick={() => handleSetAllDayAppointmentsModal()}
            >
              <LuCalendarPlus size={20} /> Crear turnos del día
            </button>

            <button
              className={` hidden md:flex gap-2 items-center text-blue-400 border rounded-lg text-sm px-2 font-medium`}
              onClick={() => setHelpModal(!helpModal)}
            >
              <IoInformationCircle color="lightblue" size={20} /> ¿Cómo agrego turnos?
            </button>
          </div>

          <Link
            className="items-center hidden gap-2 text-xs font-semibold uppercase md:flex"
            style={{ color: "#dd4924" }}
            href="/admin/schedule/settings"
          >
            configuración de agenda
            <FaArrowRight />
          </Link>
        </div>
      </div>
    </>
  );
};

export default CalendarTurnos;
