"use client";
import axiosReq from "@/config/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/app/css-modules/BookAppointmentModal.module.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { bookAppointmentSchema } from "@/app/schemas/bookAppointmentSchema";
import { IoMdClose } from "react-icons/io";

interface eventType2 {
  start: string;
  end: string;
  title: string | undefined;
  clientID: string | "" | undefined;
  _id?: string | undefined;
  status?: "booked" | "unbooked" | undefined;
}

interface props {
  appointmentData: eventType2 | undefined;
  closeModalF: () => void;
  onBooked: () => void;
}

interface formInputs {
  name: string;
  phone: number;
  email: string;
}

const BookAppointmentModal: React.FC<props> = ({
  appointmentData,
  closeModalF,
  onBooked,
}) => {

  const [spinner, setSpinner] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<formInputs>({
    resolver: zodResolver(bookAppointmentSchema),
  });
  const router = useRouter();

  const bookAppointment = async (formData: FieldValues) => {
    setSpinner(true)
    /*const token = localStorage.getItem("sacaturno_token");
    const userID = localStorage.getItem("sacaturno_userID");
    const authHeader = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-store",
      },
    };
    const getClientData = await axiosReq.get("/user/get/" + userID, authHeader);
    const clientData = getClientData.data.response_data;*/

    const bookingData = {
      _id: appointmentData?._id,
      status: "booked",
      clientID: '',
      email: formData.email,
      phone: formData.phone,
      name: formData.name,
      title: `${formData.surname}, ${formData.name}`,
    };
    const bookedAppointment = await axiosReq.put(
      "/appointment/book",
      bookingData
    );
    onBooked();
    setSpinner(false)
    closeModal();
    router.refresh();
  };

  const closeModal = () => {
    closeModalF();
  };

  const handleSubmitClick = () => {
    
    const fileInput = document.querySelector(
      ".inputSubmitField"
    ) as HTMLElement;

    if (fileInput != null) {
      fileInput.click();
    }
  };

  return (
    <>
      <div className="absolute flex items-center justify-center modalCont">
        <div className="flex flex-col bg-white w-80 md:w-96 p-7 h-fit borderShadow">
          {spinner && (
            <div style={{width:'328px', height:'343px'}} className="flex items-center justify-center w-full h-full bg-white">
              <div className="loader z-50"></div>
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
                    <input type="email" {...register("email")} maxLength={40} />
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
    </>
  );
};

export default BookAppointmentModal;
