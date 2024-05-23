"use client";
import axiosReq from "@/config/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/css-modules/BookAppointmentModal.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { bookAppointmentSchema } from "@/app/schemas/bookAppointmentSchema";
import { IoMdClose } from "react-icons/io";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { IBusiness } from "@/interfaces/business.interface";

interface eventType2 {
  start: string;
  end: string;
  title: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  service: string | undefined;
  status?: "booked" | "unbooked" | undefined;
  email: string | undefined;
  name: string | undefined;
  phone: number | undefined;
  businessEmail?: string | undefined;
}

interface props {
  appointmentData: eventType2 | undefined;
  businessData: IBusiness;
  closeModalF: (action: string) => void;
}

interface formInputs {
  name: string;
  phone: number;
  email: string;
}

const BookAppointmentModal: React.FC<props> = ({
  appointmentData,
  closeModalF,
  businessData,
}) => {
  const [spinner, setSpinner] = useState(false);
  const [bookedModal, setBookedModal] = useState(false);
  const [bookedAppointmentData, setBookedAppointmentData] =
    useState<eventType2>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(bookAppointmentSchema),
  });
  const router = useRouter();

  const bookAppointment = async (formData: FieldValues) => {
    setSpinner(true);
    const bookingData = {
      _id: appointmentData?._id,
      status: "booked",
      clientID: "",
      email: formData.email,
      phone: formData.phone,
      name: formData.name,
      title: formData.name,
    };
    const bookedAppointment = await axiosReq.put(
      "/appointment/book",
      bookingData
    );
    console.log(bookedAppointment);

    setBookedModal(true);
    setBookedAppointmentData(bookedAppointment.data);
    setSpinner(false);
    /*closeModal();*/
    router.refresh();
  };

  const closeModal = () => {
    setBookedModal(false);
    closeModalF("BOOKED");
  };

  const handleSubmitClick = () => {
    const fileInput = document.querySelector(
      ".inputSubmitField"
    ) as HTMLElement;

    if (fileInput != null) {
      fileInput.click();
    }
  };

  const handleCancelBooking = async () => {
    if (bookedAppointmentData) {
      const data = {
        _id: bookedAppointmentData._id,
        start: bookedAppointmentData.start,
        end: bookedAppointmentData.end,
        name: bookedAppointmentData.name,
        phone: bookedAppointmentData.phone,
        service: bookedAppointmentData.service,
        email: bookedAppointmentData.email,
        status: bookedAppointmentData.status,
        businessEmail: businessData.email
      };

      const canceledBooking = await axiosReq.put(
        "/appointment/book/cancel",
        data
      );
      if (canceledBooking) {
        closeModalF("CANCELLED");
      }
    }
  };

  return (
    <>
      {!bookedModal && (
        <div className="absolute flex items-center justify-center modalCont">
          <div className="flex flex-col bg-white w-80 md:w-96 p-7 h-fit borderShadow">
            {spinner && (
              <div className={styles.spinnerCont}>
                <div className="z-50 loader"></div>
              </div>
            )}

            {!spinner && (
              <>
                <IoMdClose
                  className={styles.closeModal}
                  onClick={closeModal}
                  size={22}
                />
                <h4 className="mb-6 text-xl font-bold text-center uppercase ">
                  Reservar turno
                </h4>

                {/* <span>Hacé click en un turno para ver los detalles</span> */}
                <div className="flex flex-col w-full gap-4 h-fit">
                  <div className="flex flex-col w-fit h-fit">
                    <label
                      style={{ fontSize: "12px" }}
                      className="font-bold uppercase "
                    >
                      Fecha y hora
                    </label>
                    <span className="text-sm">
                      {appointmentData?.start}
                      {appointmentData?.end}
                    </span>
                  </div>

                  <div className="flex flex-col w-fit h-fit">
                    <label
                      style={{ fontSize: "12px" }}
                      className="font-bold uppercase "
                    >
                      Servicio
                    </label>
                    <span className="text-sm">{appointmentData?.service}</span>
                  </div>

                  <form
                    onSubmit={handleSubmit((formData) => {
                      bookAppointment(formData);
                    })}
                    className="flex flex-col justify-between w-full gap-4 "
                  >
                    <div className={styles.formInput}>
                      <span
                        style={{ fontSize: "12px" }}
                        className="font-bold uppercase "
                      >
                        Nombre y apellido
                      </span>
                      <input type="text" maxLength={30} {...register("name")} />
                      {errors.name?.message && (
                        <span className="text-xs font-semibold text-red-600">
                          {" "}
                          {errors.name.message}{" "}
                        </span>
                      )}
                    </div>
                    <div className={styles.formInput}>
                      <span
                        style={{ fontSize: "12px" }}
                        className="font-bold uppercase "
                      >
                        Teléfono
                      </span>
                      <input
                        type="number"
                        maxLength={20}
                        {...register("phone")}
                      />
                      {errors.phone?.message && (
                        <span className="text-xs font-semibold text-red-600">
                          {" "}
                          {errors.phone?.message}{" "}
                        </span>
                      )}
                    </div>
                    <div className={styles.formInput}>
                      <span
                        style={{ fontSize: "12px" }}
                        className="font-bold uppercase "
                      >
                        Email
                      </span>
                      <input
                        type="email"
                        {...register("email")}
                        maxLength={40}
                      />
                      {errors.email?.message && (
                        <span className="text-xs font-semibold text-red-600">
                          {" "}
                          {errors.email?.message}{" "}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSubmitClick}
                      className={"inputSubmitField hidden "}
                    />
                  </form>
                </div>

                <div className="flex justify-center w-full align-middle mt-7 h-fit">
                  <button className={styles.button} onClick={handleSubmitClick}>
                    Reservar turno
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {bookedModal && (
        <div className="absolute flex items-center justify-center modalCont">
          <div className="flex flex-col bg-white w-80 md:w-96 p-7 h-fit borderShadow">
            <IoMdClose
              className={styles.closeModal}
              onClick={closeModal}
              size={22}
            />
            <div className="flex flex-col items-center w-full gap-4 h-fit ">
              <BsFillCheckCircleFill
                className="hidden md:block"
                size={70}
                color="#4bc720"
              />
              <BsFillCheckCircleFill
                className="block md:hidden"
                size={60}
                color="#4bc720"
              />
              <h4 className="mb-6 text-xl font-bold text-center uppercase ">
                Turno reservado
              </h4>
            </div>

            {/* <span>Hacé click en un turno para ver los detalles</span> */}
            <div className="flex flex-col w-full gap-4 my-2 h-fit">
              <div className="flex flex-col w-fit h-fit">
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Fecha y hora
                </label>
                <span className="text-sm">
                  {appointmentData?.start}
                  {appointmentData?.end}
                </span>
              </div>

              <div className="flex flex-col w-fit h-fit">
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Servicio
                </label>
                <span className="text-sm">{appointmentData?.service}</span>
              </div>

              <div className="flex flex-col w-fit h-fit">
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Nombre y apellido
                </label>
                <span className="text-sm">{bookedAppointmentData?.name}</span>
              </div>

              <div className="flex flex-col w-fit h-fit">
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Email
                </label>
                <span className="text-sm">{bookedAppointmentData?.email}</span>
              </div>

              <div className="flex flex-col w-fit h-fit">
                <label
                  style={{ fontSize: "12px" }}
                  className="font-bold uppercase "
                >
                  Teléfono
                </label>
                <span className="text-sm">{bookedAppointmentData?.phone}</span>
              </div>

              {/* <div>
                <p className="text-xs text-justify text-pretty">
                  Recibirás en tu correo los datos de la reserva realizada. En
                  caso de no haber recibido el correo, revisar la carpeta de
                  correo no deseado.
                </p>
              </div> */}
            </div>

            <div className="flex justify-center w-full align-middle mt-7 h-fit">
              <button
                className={styles.buttonRed}
                onClick={handleCancelBooking}
              >
                Cancelar turno
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookAppointmentModal;
