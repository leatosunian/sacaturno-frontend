"use client";
import axiosReq from "@/config/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { bookAppointmentSchema } from "@/app/schemas/bookAppointmentSchema";
import { IoMdClose } from "react-icons/io";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import { IBusiness } from "@/interfaces/business.interface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

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
  price: number | undefined;
  description: string | undefined;
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
        businessEmail: businessData.email,
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
        <div className="flex flex-col items-center w-full gap-5 ">
          {spinner && (
            <div className="flex items-center justify-center w-full py-12">
              <div className="z-50 loader"></div>
            </div>
          )}

          {!spinner && (
            <>
              {/* Date & Time Section */}
              <h4
                className="relative inline-block w-full px-2 mx-auto mb-0 text-2xl font-bold text-center uppercase"
                style={{ fontSize: 22 }}
              >
                Reservar turno
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
              <Card className="w-full py-4 border-none shadow-none h-fit bg-muted/50">
                <CardContent className="flex items-start gap-3 px-4 py-0">
                  <div className="flex items-center justify-center rounded-lg bg-orange-100 p-2.5 shrink-0">
                    <FiCalendar className="text-orange-500 size-5" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold tracking-wider text-orange-500 uppercase">
                      Fecha y hora
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {appointmentData?.start}
                      {appointmentData?.end}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Service & Price */}
              <div className="grid w-full grid-cols-2 gap-3">
                <Card className="py-4 border-none shadow-none bg-muted/50">
                  <CardContent className="flex flex-col gap-1 px-4 py-0">
                    <span className="text-xs font-semibold font-bold tracking-wider uppercase">
                      Servicio
                    </span>
                    <span className="text-sm font-semibold truncate text-foreground">
                      {appointmentData?.service}
                    </span>
                  </CardContent>
                </Card>
                <Card className="py-4 border-none shadow-none bg-muted/50">
                  <CardContent className="flex flex-col gap-1 px-4 py-0">
                    <span className="text-xs font-semibold font-bold tracking-wider uppercase">
                      Precio
                    </span>
                    <span className="text-sm font-bold text-orange-500">
                      $ {appointmentData?.price!.toLocaleString()}
                    </span>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              {appointmentData?.description !== "" && (
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-xs font-semibold font-bold tracking-wider uppercase">
                    Descripcion
                  </span>
                  <p className="text-sm leading-relaxed text-foreground">
                    {appointmentData?.description}
                  </p>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={handleSubmit((formData) => {
                  bookAppointment(formData);
                })}
                className="flex flex-col w-full gap-4 mt-1"
              >
                <div className="flex flex-col">
                  <label className="text-xs font-semibold font-bold tracking-wider uppercase">
                    Nombre y apellido
                  </label>
                  <Input
                    type="text"
                    maxLength={30}
                    {...register("name")}
                    className="px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 focus-visible:border-orange-500"
                  />
                  {errors.name?.message && (
                    <span className="text-xs font-semibold text-red-500">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold font-bold tracking-wider uppercase">
                    Telefono
                  </label>
                  <Input
                    type="number"
                    maxLength={20}
                    {...register("phone")}
                    className="px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 focus-visible:border-orange-500"
                  />
                  {errors.phone?.message && (
                    <span className="text-xs font-semibold text-red-500">
                      {errors.phone?.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col">
                  <label className="text-xs font-semibold font-bold tracking-wider uppercase">
                    Email
                  </label>
                  <Input
                    type="email"
                    {...register("email")}
                    maxLength={40}
                    className="px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 focus-visible:border-orange-500"
                  />
                  {errors.email?.message && (
                    <span className="text-xs font-semibold text-red-500">
                      {errors.email?.message}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  className="hidden inputSubmitField"
                />
              </form>

              {/* Submit Button */}
              <Button
                className="w-full h-12 mt-2 text-sm font-semibold text-white transition-colors bg-orange-600 shadow-lg rounded-xl hover:bg-orange-700 duration-400"
                onClick={handleSubmitClick}
              >
                Confirmar Turno
                <FiArrowRight className="ml-1 size-5" />
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Al confirmar, recibiras un mail de recordatorio.
              </p>
            </>
          )}
        </div>
      )}

      {/* turno reservado */}
      {bookedModal && (
        <div className="flex flex-col items-center w-full gap-5 ">
          {/* Success Icon & Title */}
          <div className="flex flex-col items-center gap-2">
            <BsFillCheckCircleFill size={60} color="#4bc720" />
            <h4 className="text-xl font-bold text-center uppercase text-foreground">
              Turno reservado
            </h4>
          </div>

          {/* Date & Time Section */}
          <Card className="w-full py-4 border-none shadow-none h-fit bg-muted/50">
            <CardContent className="flex items-start gap-3 px-4 py-0">
              <div className="flex items-center justify-center rounded-lg bg-orange-100 p-2.5 shrink-0">
                <FiCalendar className="text-orange-500 size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold tracking-wider text-orange-500 uppercase">
                  Fecha y hora
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {appointmentData?.start}
                  {appointmentData?.end}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Service & Price */}
          <div className="grid w-full grid-cols-2 gap-3">
            <Card className="py-4 border-none shadow-none bg-muted/50">
              <CardContent className="flex flex-col gap-1 px-4 py-0">
                <span className="text-xs font-semibold font-bold tracking-wider uppercase">
                  Servicio
                </span>
                <span className="text-sm font-semibold truncate text-foreground">
                  {appointmentData?.service}
                </span>
              </CardContent>
            </Card>
            <Card className="py-4 border-none shadow-none bg-muted/50">
              <CardContent className="flex flex-col gap-1 px-4 py-0">
                <span className="text-xs font-semibold font-bold tracking-wider uppercase">
                  Precio
                </span>
                <span className="text-sm font-bold text-orange-500">
                  $ {appointmentData?.price!.toLocaleString()}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Booked values replacing inputs */}
          <div className="flex flex-col w-full gap-4 mt-1">

            {/* Description */}
            {appointmentData?.description !== "" && (
              <div className="flex flex-col w-full">
                <span className="text-xs font-semibold font-bold tracking-wider uppercase">
                  Descripcion
                </span>
                <p className="text-sm leading-relaxed text-foreground">
                  {appointmentData?.description}
                </p>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-wider uppercase ">
                Nombre y apellido
              </span>
              <p className="text-sm leading-relaxed text-foreground">                  {bookedAppointmentData?.name}
              </p>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold font-bold tracking-wider uppercase">
                Telefono
              </span>
              <p className="text-sm leading-relaxed text-foreground">                  {bookedAppointmentData?.phone}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold font-bold tracking-wider uppercase">
                Email
              </span>
              <p className="text-sm leading-relaxed text-foreground">                  {bookedAppointmentData?.email}
              </p>
            </div>
          </div>

          {/* Cancel Button */}
          <Button
            className="w-full h-12 mt-2 text-sm font-semibold text-white transition-colors bg-red-600 shadow-lg rounded-xl hover:bg-red-700"
            onClick={handleCancelBooking}
          >
            Cancelar turno
          </Button>

        </div>
      )}
    </>
  );
};

export default BookAppointmentModal;
