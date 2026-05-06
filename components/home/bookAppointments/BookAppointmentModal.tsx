"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type FieldValues } from "react-hook-form"
import { CircleCheck, Loader2, CreditCard, ExternalLink } from "lucide-react"
import axiosReq from "@/config/axios"
import { bookAppointmentSchema } from "@/app/schemas/bookAppointmentSchema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { FormattedAppointment } from "./ListBookAppointment"
import { IBusiness } from "@/interfaces/business.interface"
import { FiCalendar } from "react-icons/fi"

interface FormInputs {
  name: string
  phone: string
  email: string
}

interface Props {
  appointmentData: FormattedAppointment
  businessData: IBusiness
  modalDateStr: string
  depositAmount?: number
  closeModalF: (action: string) => void
}

export default function BookAppointmentModal({
  appointmentData,
  businessData,
  modalDateStr,
  depositAmount = 0, // 0 = sin seña
  closeModalF,
}: Props) {
  const [spinner, setSpinner] = useState(false)
  const [bookedModal, setBookedModal] = useState(false)
  const [bookedAppointmentData, setBookedAppointmentData] =
    useState<FormattedAppointment | null>(null)

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setSpinner(false)
    }
    window.addEventListener("pageshow", handlePageShow)
    return () => window.removeEventListener("pageshow", handlePageShow)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({ resolver: zodResolver(bookAppointmentSchema) })

  const router = useRouter()
  const requiresDeposit = depositAmount > 0
  const dateTimeDisplay = `${modalDateStr} | ${appointmentData.timeLabel} - ${appointmentData.endTimeLabel} hs`

  // flujo sin seña
  const bookWithoutDeposit = async (formData: FieldValues) => {
    setSpinner(true)
    try {
      const bookedAppointment = await axiosReq.put("/appointment/book", {
        _id: appointmentData._id,
        status: "booked",
        clientID: "",
        email: formData.email,
        phone: formData.phone,
        name: formData.name,
        title: formData.name,
      })
      setBookedModal(true)
      setBookedAppointmentData({ ...appointmentData, ...bookedAppointment.data })
      router.refresh()
    } catch (error) {
      console.error("Error booking appointment:", error)
    } finally {
      setSpinner(false)
    }
  }

  // flujo con seña -> crea preferencia y redirige a MP
  const bookWithDeposit = async (formData: FieldValues) => {
    setSpinner(true)
    try {
      const res = await axiosReq.post("/mp/deposit/create-preference", {
        appointmentID: appointmentData._id,
        clientName:    formData.name,
        clientEmail:   formData.email,
        clientPhone:   formData.phone,
      })
      // redirigir a mp checkout pro del negocio
      window.location.href = res.data.initPoint
    } catch (error: any) {
      const msg = error?.response?.data?.msg
      if (msg === "BUSINESS_NOT_LINKED") {
        alert("Este negocio aún no configuró el cobro de señas. Contactalo directamente.")
      } else {
        alert("No se pudo generar el pago. Intentá de nuevo.")
      }
      setSpinner(false)
    }
  }

  const onSubmit = (formData: FieldValues) => {
    if (requiresDeposit) {
      bookWithDeposit(formData)
    } else {
      bookWithoutDeposit(formData)
    }
  }

  const handleCancelBooking = async () => {
    if (!bookedAppointmentData) return
    try {
      await axiosReq.put("/appointment/book/cancel", {
        _id:           bookedAppointmentData._id,
        start:         bookedAppointmentData.startISO,
        end:           bookedAppointmentData.endISO,
        name:          bookedAppointmentData.name,
        phone:         bookedAppointmentData.phone,
        service:       bookedAppointmentData.service,
        email:         bookedAppointmentData.email,
        status:        bookedAppointmentData.status,
        businessEmail: businessData.email,
      })
      closeModalF("CANCELLED")
    } catch (error) {
      console.error("Error cancelling booking:", error)
    }
  }

  const handleSubmitClick = () => {
    (document.querySelector(".inputSubmitField") as HTMLElement)?.click()
  }

  // pantalla de éxito (flujo sin seña) 
  if (bookedModal) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-2">
          <CircleCheck className="text-green-500 size-14" />
          <h4 className="text-xl font-bold uppercase text-foreground">Turno reservado</h4>
        </div>

        <Card className="w-full py-4 border-none shadow-none bg-muted/50">
          <CardContent className="flex items-start gap-3 px-4 py-0">
            <div className="flex items-center justify-center rounded-lg bg-orange-100 p-2.5 shrink-0">
              <FiCalendar className="text-orange-500 size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold tracking-wider uppercase text-primary">
                Fecha y hora
              </span>
              <span className="text-sm font-semibold capitalize text-foreground">
                {dateTimeDisplay}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex w-full gap-3">
          <Button
            variant="outline"
            className="flex-1 h-10 text-xs"
            onClick={handleCancelBooking}
          >
            Cancelar turno
          </Button>
          <Button
            className="flex-1 h-10 text-xs text-white bg-orange-600 hover:bg-orange-700"
            onClick={() => closeModalF("BOOKED")}
          >
            Listo
          </Button>
        </div>
      </div>
    )
  }

  // form de reserva (flujo con o sin seña)
  return (
    <div className="flex flex-col gap-5">

      {/* Título — full width */}
      <h4 className="relative inline-block px-2 mx-auto text-xl font-bold text-center uppercase w-fit">
        Reservar turno
        <span className="absolute left-0 right-0 mx-auto" style={{ bottom: -2, height: 2, background: "#dd4924", width: "60%" }} />
      </h4>

      {/* Fecha y hora — full width */}
      <Card className="w-full py-4 border-none shadow-none bg-muted/50">
        <CardContent className="flex items-center gap-3 px-4 py-0">
          <div className="flex items-center justify-center rounded-lg bg-orange-100 p-2.5 shrink-0">
            <FiCalendar className="text-orange-500 size-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-primary">Fecha y hora</span>
            <span className="text-sm font-semibold capitalize-first-letter text-foreground">{dateTimeDisplay}</span>
          </div>
        </CardContent>
      </Card>

      {/* Descripción — right below date/time */}
      {appointmentData.description && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Descripción</span>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
            {appointmentData.description}
          </p>
        </div>
      )}

      {/* Two-column grid (single column on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

        {/* ── Left: appointment details ── */}
        <div className="flex flex-col gap-4">

          {/* Servicio / Precio / Seña — separate cards */}
          <div className="flex flex-col gap-2">
            <Card className="py-3 border-none shadow-none bg-muted/50">
              <CardContent className="flex flex-col gap-0.5 px-4 py-0">
                <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Servicio</span>
                <span className="text-sm font-semibold text-foreground leading-snug break-words">
                  {appointmentData.service}
                </span>
              </CardContent>
            </Card>
            <div className={`grid gap-2 ${requiresDeposit ? "grid-cols-2" : "grid-cols-1"}`}>
              <Card className="py-3 border-none shadow-none bg-muted/50">
                <CardContent className="flex flex-col gap-0.5 px-4 py-0">
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Precio</span>
                  <span className="text-sm font-bold text-orange-500">
                    $ {appointmentData.price?.toLocaleString("es-AR")}
                  </span>
                </CardContent>
              </Card>
              {requiresDeposit && (
                <Card className="py-3 border-none shadow-none bg-muted/50">
                  <CardContent className="flex flex-col gap-0.5 px-4 py-0">
                    <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Seña</span>
                    <span className="text-sm font-bold text-blue-500">
                      $ {depositAmount.toLocaleString("es-AR")}
                    </span>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Banner de seña */}
          {requiresDeposit && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200">
              <CreditCard className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase text-blue-700">Requiere seña</span>
                <span className="text-sm text-blue-700">
                  Para confirmar la reserva se cobra una seña de{" "}
                  <b>$ {depositAmount.toLocaleString("es-AR")}</b> a través de Mercado Pago.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: form ── */}
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold tracking-wider uppercase">Nombre y apellido</label>
              <Input
                type="text"
                maxLength={30}
                {...register("name")}
                className="px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 hover:border-orange-500 focus:border-orange-500 transition-colors"
                placeholder="Juan Pérez"
              />
              {errors.name?.message && (
                <span className="text-xs text-red-500 mt-1">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold tracking-wider uppercase">Email</label>
              <Input
                type="email"
                {...register("email")}
                className="px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 hover:border-orange-500 focus:border-orange-500 transition-colors"
                placeholder="juan@email.com"
              />
              {errors.email?.message && (
                <span className="text-xs text-red-500 mt-1">{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold tracking-wider uppercase">Teléfono</label>
              <Input
                type="number"
                {...register("phone")}
                className="px-0 bg-transparent border-0 border-b rounded-none shadow-none border-border focus-visible:ring-0 hover:border-orange-500 focus:border-orange-500 transition-colors"
                placeholder="11 1234 5678"
              />
              {errors.phone?.message && (
                <span className="text-xs text-red-500 mt-1">{errors.phone.message}</span>
              )}
            </div>

            <button type="submit" className="inputSubmitField hidden" />
          </form>

          <div className="mt-auto pt-2">
            <Button
              className="w-full h-11 text-white bg-orange-600 hover:bg-orange-700"
              onClick={handleSubmitClick}
              disabled={spinner}
            >
              {spinner ? (
                <Loader2 className="animate-spin" size={18} />
              ) : requiresDeposit ? (
                <><ExternalLink size={16} /> Pagar seña y reservar</>
              ) : (
                "Confirmar reserva"
              )}
            </Button>
          </div>
        </div>

      </div>

      {/* MP redirect note — full width, pinned to bottom */}
      {requiresDeposit && (
        <>
          <div style={{ height: "1px", backgroundColor: "rgb(178 178 178 / 40%)" }} />
          <p className="text-xs text-center text-muted-foreground pb-1">
            Serás redirigido a Mercado Pago para completar el pago.
          </p>
        </>
      )}

    </div>
  )
}