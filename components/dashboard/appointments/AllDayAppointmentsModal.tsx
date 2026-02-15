"use client";
import axiosReq from "@/config/axios";
import { IAppointment } from "@/interfaces/appointment.interface";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import styles from "@/app/css-modules/CreateAppointmentModal.module.css";
import { IService } from "@/interfaces/service.interface";
import { useEffect, useState } from "react";
import { IBusiness } from "@/interfaces/business.interface";
import { timeOptions } from "@/helpers/timeOptions";
import AlertInterface from "@/interfaces/alert.interface";
import Alert from "@/components/Alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
      <div className="flex flex-col items-center w-full gap-5 h-fit">
        <h4
          className="relative inline-block px-2 mx-auto text-xl font-bold text-center uppercase w-fit"
          style={{ fontSize: 20 }}
        >
          Crear turnos
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

        <span className="text-lg font-semibold text-center uppercase md:text-md">
          &#128197; {"  "}{dayjs(date).format("dddd DD [de] MMMM ")}
        </span>

        <span className="text-xs font-medium text-left md:text-sm">
          &#128161; Seleccioná el servicio a prestar para crear todos los
          turnos del día.
        </span>

        <div className="flex w-full md:flex-row h-fit">
          <div className="flex flex-col w-full h-fit gap-7">
            <div className="flex flex-col w-full gap-4 h-fit ">
              <div
                className={`flex flex-col w-full h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  className="mb-1 text-sm font-bold uppercase"
                >
                  Servicio a prestar
                </label>

                <Select
                  value={selectedService?.name}
                  onValueChange={(value) => { handleSetSelectedService(value) }}
                >
                  <SelectTrigger className="w-full ">
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Servicios</SelectLabel>
                      {services?.map((service) => (
                        <SelectItem key={service._id} value={service.name!}>
                          {service.name}
                        </SelectItem>
                      ))}

                    </SelectGroup>
                  </SelectContent>
                </Select>

              </div>
              <div
                className={`flex flex-col w-full h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  className="mb-1 text-sm font-bold uppercase"
                >
                  Desde:
                </label>

                {/* select day start */}
                <Select
                  value={selectedDaySchedule.dayStart.toString()}
                  onValueChange={(value) => {
                    setSelectedDaySchedule({
                      ...selectedDaySchedule,
                      dayStart: parseInt(value),
                    })
                  }}
                >
                  <SelectTrigger className="w-full ">
                    <SelectValue placeholder="Seleccionar hora de inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {timeOptions?.map((time) => (
                        <SelectItem key={time.value} value={time.value.toString()}>
                          {time.label}
                        </SelectItem>
                      ))}

                    </SelectGroup>
                  </SelectContent>
                </Select>



              </div>
              <div
                className={`flex flex-col w-full h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  className="mb-1 text-sm font-bold uppercase"
                >
                  Hasta:
                </label>

                {/* select day end */}
                <Select
                  value={selectedDaySchedule.dayEnd.toString()}
                  onValueChange={(value) => {
                    setSelectedDaySchedule({
                      ...selectedDaySchedule,
                      dayEnd: parseInt(value),
                    })
                  }}
                >
                  <SelectTrigger className="w-full ">
                    <SelectValue placeholder="Seleccionar hora de fin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {timeOptions?.map((time) => (
                        <SelectItem key={time.value} value={time.value.toString()}>
                          {time.label}
                        </SelectItem>
                      ))}

                    </SelectGroup>
                  </SelectContent>
                </Select>



              </div>
              <div
                className={`flex flex-col w-full h-fit ${styles.formInputAppDuration} `}
              >
                <label
                  className="mb-1 text-sm font-bold uppercase "
                >
                  Duración de cada turno
                </label>


                {/* appointment duration */}
                <Select
                  value={selectedDaySchedule.appointmentDuration.toString()}
                  onValueChange={(value) => {
                    setSelectedDaySchedule({
                      ...selectedDaySchedule,
                      appointmentDuration: parseInt(value),
                    })
                  }}
                >
                  <SelectTrigger className="w-full ">
                    <SelectValue placeholder="Seleccionar duración de turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1 h</SelectItem>
                      <SelectItem value="75">1:15 hs</SelectItem>
                      <SelectItem value="90">1:30 hs</SelectItem>
                      <SelectItem value="105">1:45 hs</SelectItem>
                      <SelectItem value="120">2 hs</SelectItem>
                      <SelectItem value="135">2:15 hs</SelectItem>
                      <SelectItem value="150">2:30 hs</SelectItem>
                      <SelectItem value="165">2:45 hs</SelectItem>
                      <SelectItem value="180">3 hs</SelectItem>
                      <SelectItem value="195">3:15 hs</SelectItem>
                      <SelectItem value="210">3:30 hs</SelectItem>
                      <SelectItem value="225">3:45 hs</SelectItem>
                      <SelectItem value="240">4 hs</SelectItem>
                      <SelectItem value="255">4:15 hs</SelectItem>
                      <SelectItem value="270">4:30 hs</SelectItem>
                      <SelectItem value="285">4:45 hs</SelectItem>
                      <SelectItem value="300">5 hs</SelectItem>

                    </SelectGroup>
                  </SelectContent>
                </Select>



              </div>
            </div>

            <Button
              onClick={() => {
                saveAppointment();
              }}
              className="w-full mt-1 text-white bg-orange-600 border-none rounded-lg shadow-xl shadow-2xl outline-none h-11 hover:bg-orange-700 ">
              Crear turnos del día
            </Button>

          </div>
        </div>
      </div >
      {/* ALERT */}
      {
        alert?.error && (
          <div className="absolute flex justify-center w-full h-fit">
            <Alert
              error={alert?.error}
              msg={alert?.msg}
              alertType={alert?.alertType}
            />
          </div>
        )
      }
    </>
  );
};

export default AllDayAppointmentsModal;
