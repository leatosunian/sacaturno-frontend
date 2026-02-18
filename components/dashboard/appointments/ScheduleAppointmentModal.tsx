"use client";
import axiosReq from "@/config/axios";
import styles from "@/app/css-modules/AppointmentModal.module.css";
import { useRouter } from "next/navigation";
import { IAppointmentSchedule } from "@/interfaces/appointmentSchedule.interface";
import dayjs from "dayjs";
import { FaRegClock } from "react-icons/fa";
import { Button } from "@/components/ui/button";

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
      closeModal();
      onDeleteAppointment(deletedAppointment.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center w-full gap-8 pb-1 h-fit">
        <h4
          className="relative inline-block w-full px-2 mx-auto text-2xl font-bold text-center uppercase"
          style={{ fontSize: 22 }}
        >
          Información del turno
          {/* linea */}
          <span
            className="absolute left-0 right-0 mx-auto"
            style={{
              bottom: -2,
              height: 2,
              background: "#dd4924",
              width: "30%",
            }}
          />
        </h4>

        <div className="flex flex-col w-full gap-6 h-fit">
          <div className="flex flex-col gap-2 w-fit h-fit">
            <label className="text-sm font-bold uppercase">Día y horario</label>
            <div className="flex items-center gap-2">
              <FaRegClock color="#9ca3af" size={18} />
              <span className="text-sm font-medium text-gray-800">
                {dayjs(appointment?.start).format("DD [de] MMMM ")}
                {dayjs(appointment?.start).format("HH:mm")} hs a{" "}
                {dayjs(appointment?.end).format("HH:mm")} hs
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-fit h-fit">
            <label className="text-sm font-bold uppercase">
              Servicio a prestar
            </label>
            <span className="text-sm">{appointment?.service}</span>
          </div>

          <div className="flex flex-col gap-2 w-fit h-fit">
            <label className="text-sm font-bold uppercase">Precio</label>
            <span className="text-sm">$ {appointment?.price.toLocaleString()}</span>
          </div>

          <Button
            className="w-full mt-2 text-white bg-red-600 border-none rounded-lg shadow-xl outline-none h-11 hover:bg-red-700"
            onClick={() => {
              deleteAppointment();
            }}
          >
            Eliminar turno
          </Button>
        </div>
      </div>
    </>
  );
};

export default ScheduleAppointmentModal;
