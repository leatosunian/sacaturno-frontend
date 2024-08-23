"use client";
import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import styles from "@/app/css-modules/CreateAppointmentModal.module.css";
import { IoMdClose } from "react-icons/io";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
import { IBusiness } from "@/interfaces/business.interface";
import { timeOptions } from "@/helpers/timeOptions";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "@/components/Alert";

interface IAllDayModalProps {
  date: Date;
  business: IBusiness | undefined;
  services: IService[] | undefined;
  selectedDay: {
    dayStart: number;
    dayEnd: number;
    appointmentDuration: number;
  };
  closeModalF: () => void;
  onNewAppointment: () => void;
}

const AllDayAppointmentsModal: React.FC<IAllDayModalProps> = ({
  date,
  business,
  services,
  closeModalF,
  onNewAppointment,
  selectedDay,
}) => {
  const router = useRouter();
  const [selectedDaySchedule, setSelectedDaySchedule] = useState({
    dayStart: 9,
    dayEnd: 17,
    appointmentDuration: 60,
  });
  const [selectedService, setSelectedService] = useState<{
    name: string | undefined;
    price: number | undefined;
    description: string | undefined;
  }>();
  const [alert, setAlert] = useState<AlertInterface>();

  useEffect(() => {
    if (services && services[0]) {
      setSelectedService({
        name: services[0].name,
        price: services[0].price,
        description: services[0].description,
      });
    }
  }, [services]);

  const hideAlert = () => {
    setTimeout(() => {
      setAlert({ error: false, alertType: "ERROR_ALERT", msg: "" });
    }, 3300);
  };

  const handleSetSelectedService = (name: string) => {
    const serviceSelectedObj = services?.find(
      (service) => service.name === name
    );
    setSelectedService({
      price: serviceSelectedObj?.price,
      name: serviceSelectedObj?.name,
      description: serviceSelectedObj?.description,
    });
  };

  const saveAppointment = async () => {
    if (selectedDaySchedule.dayStart >= selectedDaySchedule.dayEnd) {
      setAlert({
        msg: "Ingresá un horario válido",
        error: true,
        alertType: "ERROR_ALERT",
      });
      hideAlert();
      return;
    }
    closeModal();
    onNewAppointment();
    const dayAppointments: IAppointment[] = [];
    let inicio = dayjs(date)
      .hour(Number(selectedDaySchedule?.dayStart))
      .minute(0)
      .second(0);
    const fin = dayjs(date)
      .hour(Number(selectedDaySchedule?.dayEnd))
      .minute(0)
      .second(0);

    while (inicio.isBefore(fin)) {
      const finalTurno = inicio.add(
        Number(selectedDaySchedule?.appointmentDuration),
        "minute"
      );
      dayAppointments.push({
        businessID: business?._id,
        status: "unbooked",
        phone: 0,
        email: "",
        start: inicio.toDate(),
        end: finalTurno.toDate(),
        service: selectedService?.name,
        price: selectedService?.price,
        description: selectedService?.description,
      });
      inicio = finalTurno;
    }
    // REQUEST
    const token = localStorage.getItem("sacaturno_token");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
    };
    await axiosReq.post("/appointment/create/day", dayAppointments, authHeader);
    
    router.refresh();
  };

  const closeModal = () => {
    closeModalF();
  };

  return (
    <>
      <div className="absolute flex items-center justify-center modalCont">
        <div
          className="flex flex-col text-black bg-white w-80 md:w-96 p-7 h-fit borderShadow"
          style={{ transform: "translateY(-32px)" }}
        >
          <IoMdClose
            className={styles.closeModal}
            onClick={closeModal}
            size={22}
          />
          <h4 className="mb-2 text-xl font-bold text-center uppercase md:text-2xl">
            Crear turnos
          </h4>
          <span className="mb-4 text-sm font-semibold text-center uppercase md:text-md">
            {dayjs(date).format("dddd DD [de] MMMM ")}
          </span>

          <span className="mb-4 text-xs text-left md:text-sm">
            &#128161; Seleccioná el servicio a prestar para crear todos los
            turnos del día
          </span>

          <div className="flex w-full mt-3 md:flex-row h-fit">
            <div className="flex flex-col w-full h-fit gap-7">
              <div className="flex flex-col w-full gap-3 h-fit ">
                <div
                  className={`flex flex-col w-full h-fit ${styles.formInputAppDuration} `}
                >
                  <label
                    style={{ fontSize: "12px" }}
                    className="mb-1 font-bold uppercase "
                  >
                    Servicio a prestar
                  </label>
                  <select
                    value={selectedService?.name}
                    style={{ width: "100%" }}
                    onChange={(e) => handleSetSelectedService(e.target.value)}
                    id="appointmentDuration"
                  >
                    {services?.map((service) => (
                      <option key={service._id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div
                  className={`flex flex-col w-full h-fit ${styles.formInputAppDuration} `}
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
                    style={{ width: "100%" }}
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
                  className={`flex flex-col w-full h-fit ${styles.formInputAppDuration} `}
                >
                  <label
                    style={{ fontSize: "12px" }}
                    className="font-bold uppercase "
                  >
                    Hasta:
                  </label>
                  <select
                    defaultValue={selectedDaySchedule.dayEnd}
                    style={{ width: "100%" }}
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
                  className={`flex flex-col w-full h-fit ${styles.formInputAppDuration} `}
                >
                  <label
                    style={{ fontSize: "12px" }}
                    className="font-bold uppercase "
                  >
                    Duración de cada turno
                  </label>

                  <select
                    className="text-sm"
                    style={{ width: "100%" }}
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
              <button
                className={styles.button}
                onClick={() => {
                  saveAppointment();
                }}
              >
                Crear turnos
              </button>
            </div>
          </div>
        </div>
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

export default AllDayAppointmentsModal;
