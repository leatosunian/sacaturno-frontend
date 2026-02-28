"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type FieldValues } from "react-hook-form"
import { CalendarDays, ArrowRight, CircleCheck, Loader2 } from "lucide-react"
import axiosReq from "@/config/axios"
import { bookAppointmentSchema } from "@/app/schemas/bookAppointmentSchema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { FormattedAppointment } from "./ListBookAppointment"
import { IBusiness } from "@/interfaces/business.interface"
import { FiCalendar, FiArrowRight } from "react-icons/fi";

interface FormInputs {
  name: string
  phone: string
  email: string
}

interface Props {
  appointmentData: FormattedAppointment
  businessData: IBusiness
  modalDateStr: string
  closeModalF: (action: string) => void
}

export default function BookAppointmentModal({
  appointmentData,
  businessData,
  modalDateStr,
  closeModalF,
}: Props) {
  const [spinner, setSpinner] = useState(false)
  const [bookedModal, setBookedModal] = useState(false)
  const [bookedAppointmentData, setBookedAppointmentData] =
    useState<FormattedAppointment | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: zodResolver(bookAppointmentSchema),
  })

  const router = useRouter()

  const dateTimeDisplay = `${modalDateStr} | ${appointmentData.timeLabel} - ${appointmentData.endTimeLabel} hs`

  const bookAppointment = async (formData: FieldValues) => {
    setSpinner(true)
    try {
      const bookingData = {
        _id: appointmentData._id,
        status: "booked",
        clientID: "",
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
        title: formData.name,
      }
      const bookedAppointment = await axiosReq.put(
        "/appointment/book",
        bookingData
      )

      setBookedModal(true)
      setBookedAppointmentData({
        ...appointmentData,
        ...bookedAppointment.data,
      })
      router.refresh()
    } catch (error) {
      console.error("Error booking appointment:", error)
    } finally {
      setSpinner(false)
    }
  }

  const handleCancelBooking = async () => {
    if (!bookedAppointmentData) return
    try {
      const data = {
        _id: bookedAppointmentData._id,
        start: bookedAppointmentData.startISO,
        end: bookedAppointmentData.endISO,
        name: bookedAppointmentData.name,
        phone: bookedAppointmentData.phone,
        service: bookedAppointmentData.service,
        email: bookedAppointmentData.email,
        status: bookedAppointmentData.status,
        businessEmail: businessData.email,
      }
      const canceledBooking = await axiosReq.put(
        "/appointment/book/cancel",
        data
      )
      if (canceledBooking) {
        closeModalF("CANCELLED")
      }
    } catch (error) {
      console.error("Error cancelling booking:", error)
    }
  }

  const handleSubmitClick = () => {
    const btn = document.querySelector(".inputSubmitField") as HTMLElement
    if (btn) btn.click()
  }

  // ── Success Screen ──
  if (bookedModal) {
    return (
      <div className="flex flex-col items-center gap-5">
        {/* Success Icon */}
        <div className="flex flex-col items-center gap-2">
          <CircleCheck className="text-green-500 size-14" />
          <h4 className="text-xl font-bold uppercase text-foreground">
            Turno reservado
          </h4>
        </div>

        {/* Date & Time */}
        <Card className="w-full py-4 border-none shadow-none bg-muted/50">
          <CardContent className="flex items-start gap-3 px-4 py-0">
            <div className="flex items-center justify-center rounded-lg bg-orange-100 p-2.5 shrink-0">
              <FiCalendar className="text-orange-500 size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold tracking-wider uppercase text-primary">
                Fecha y hora
              </span>
              <span className="text-sm font-semibold capitalize-first text-foreground">
                {dateTimeDisplay}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Service & Price */}
        <div className="grid w-full grid-cols-2 gap-3">
          <Card className="py-4 border-none shadow-none bg-muted/50">
            <CardContent className="flex flex-col gap-1 px-4 py-0">
              <span className="text-xs font-bold tracking-wider uppercase">
                Servicio
              </span>
              <span className="text-sm font-semibold truncate text-foreground">
                {appointmentData.service}
              </span>
            </CardContent>
          </Card>
          <Card className="py-4 border-none shadow-none bg-muted/50">
            <CardContent className="flex flex-col gap-1 px-4 py-0">
              <span className="text-xs font-bold tracking-wider uppercase">
                Precio
              </span>
              <span className="text-sm font-bold text-primary">
                $ {appointmentData.price?.toLocaleString("es-AR")}
              </span>
            </CardContent>
          </Card>
        </div>

        {/* Booked Details */}
        <div className="flex flex-col w-full gap-4 mt-1">
          {appointmentData.description && (
            <div className="flex flex-col w-full">
              <span className="text-xs font-bold tracking-wider uppercase">
                Descripcion
              </span>
              <p className="text-sm leading-relaxed text-foreground">
                {appointmentData.description}
              </p>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider uppercase">
              Nombre y apellido
            </span>
            <p className="text-sm leading-relaxed text-foreground">
              {bookedAppointmentData?.name}
            </p>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wider uppercase">
              Telefono
            </span>
            <p className="text-sm leading-relaxed text-foreground">
              {bookedAppointmentData?.phone}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold tracking-wider uppercase">
              Email
            </span>
            <p className="text-sm leading-relaxed text-foreground">
              {bookedAppointmentData?.email}
            </p>
          </div>
        </div>

        {/* Cancel Button */}
        <Button
          className="w-full h-12 mt-2 text-sm font-semibold text-white transition-colors shadow-lg rounded-xl bg-destructive hover:bg-destructive/90"
          onClick={handleCancelBooking}
        >
          Cancelar turno
        </Button>
      </div>
    )
  }

  // ── Booking Form Screen ──
  return (
    <div className="flex flex-col items-center w-full gap-5">
      {spinner && (
        <div className="flex items-center justify-center w-full py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {!spinner && (
        <>
          {/* Title */}
          <h4
            className="relative inline-block w-full px-2 mx-auto text-2xl font-bold text-center uppercase"
            style={{ fontSize: 22 }}
          >
            Reservar turno
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

          {/* Date & Time */}
          <Card className="w-full py-4 border-none shadow-none bg-muted/50">
            <CardContent className="flex items-start gap-3 px-4 py-0">
              <div className="flex items-center justify-center rounded-lg bg-orange-100 p-2.5 shrink-0">
                <FiCalendar className="text-orange-500 size-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold tracking-wider text-orange-500 uppercase">
                  Fecha y hora
                </span>
                <span className="text-sm font-semibold capitalize text-foreground">
                  {dateTimeDisplay}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Service & Price */}
          <div className="grid w-full grid-cols-2 gap-3">
            <Card className="py-4 border-none shadow-none bg-muted/50">
              <CardContent className="flex flex-col gap-1 px-4">
                <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                  Servicio
                </span>
                <span className="text-sm font-semibold truncate text-foreground">
                  {appointmentData.service}
                </span>
              </CardContent>
            </Card>
            <Card className="py-4 border-none shadow-none bg-muted/50">
              <CardContent className="flex flex-col gap-1 px-4">
                <span className="font-bold tracking-wider uppercase ext-xs">
                  Precio
                </span>
                <span className="text-sm font-bold text-orange-500">
                  $ {appointmentData.price?.toLocaleString("es-AR")}
                </span>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {appointmentData.description && (
            <div className="flex flex-col gap-1.5 w-full">
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                Descripcion
              </span>
              <p className="text-sm leading-relaxed text-foreground">
                {appointmentData.description}
              </p>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit((formData) => bookAppointment(formData))}
            className="flex flex-col w-full gap-4 mt-1"
          >
            <div className="flex flex-col">
              <label className="text-xs font-bold tracking-wider uppercase">
                Nombre y apellido
              </label>
              <Input
                type="text"
                maxLength={30}
                {...register("name")}
                className="px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 focus-visible:border-orange-500"
              />
              {errors.name?.message && (
                <span className="text-xs font-semibold text-destructive">
                  {errors.name.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold tracking-wider uppercase">
                Telefono
              </label>
              <Input
                type="number"
                maxLength={20}
                {...register("phone")}
                className="px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 focus-visible:border-orange-500"
              />
              {errors.phone?.message && (
                <span className="text-xs font-semibold text-destructive">
                  {errors.phone.message}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold tracking-wider uppercase">
                Email
              </label>
              <Input
                type="email"
                maxLength={40}
                {...register("email")}
                className="px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 focus-visible:border-orange-500"
              />
              {errors.email?.message && (
                <span className="text-xs font-semibold text-destructive">
                  {errors.email.message}
                </span>
              )}
            </div>

            <button type="submit" className="hidden inputSubmitField" />
          </form>

          {/* Submit Button */}
          <Button
            className="w-full h-12 mt-2 text-base font-bold text-white transition-colors bg-orange-600 shadow-lg rounded-xl hover:bg-orange-700"
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
  )
}
