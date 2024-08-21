"use client";
import axiosReq from "@/config/axios";
import styles from "@/app/css-modules/AppointmentModal.module.css";
import { useRouter } from "next/navigation";
import { IAppointmentSchedule } from "@/interfaces/appointmentSchedule.interface";
import dayjs from "dayjs";

interface props {
  appointment: IAppointmentSchedule | undefined;
  closeModalF: () => void;
  onDeleteAppointment: (deletedAppointment: IAppointmentSchedule) => void;
}

const ScheduleAppointmentModal: React.FC<props> = ({
  appointment,
  closeModalF,
  onDeleteAppointment,
}) => {
  const router = useRouter();
  const token = localStorage.getItem("sacaturno_token");
  const authHeader = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-store",
    },
  };

  const closeModal = () => {
    closeModalF();
  };

  const deleteAppointment = async () => {
    try {
      const deletedAppointment = await axiosReq.delete(
        "/schedule/appointment/delete/" + appointment?._id,
        authHeader
      );
      closeModal()
      onDeleteAppointment(deletedAppointment.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div
        className="fixed flex items-center justify-center text-black -translate-y-16 modalCont"
        onClick={closeModal}
      >
        <div className="flex flex-col text-black bg-white w-80 md:w-96 p-7 h-fit borderShadow">
          <h4 className="mb-6 text-xl font-bold text-center uppercase">
            Datos del turno
          </h4>
          {/* <span>Hacé click en un turno para ver los detalles</span> */}
          <div className="flex flex-col gap-4 mb-2 w-fit h-fit">
            {/* <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Día
              </label>
              <span className="text-sm capitalize-first-letter">
                Todos los {appointment?.day}
              </span>
              <span className="text-sm capitalize-first-letter"></span>
            </div> */}
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Hora
              </label>
              <span className="text-sm capitalize-first-letter">
                {dayjs(appointment?.start).format("HH:mm")} hs a{" "}
                {dayjs(appointment?.end).format("HH:mm")} hs
              </span>
              <span className="text-sm capitalize-first-letter"></span>
            </div>
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Servicio a prestar
              </label>
              <span className="text-sm">{appointment?.service}</span>
            </div>
            <div className="flex flex-col w-fit h-fit">
              <label
                style={{ fontSize: "12px" }}
                className="font-bold uppercase "
              >
                Precio
              </label>
              <span className="text-sm">AR$ {appointment?.price}</span>
            </div>
          </div>

          <button
            onClick={() => {
              deleteAppointment();
            }}
            className={`${styles.buttonDelete} mt-5`}
          >
            ELIMINAR TURNO
          </button>
        </div>
      </div>
    </>
  );
};

export default ScheduleAppointmentModal;
