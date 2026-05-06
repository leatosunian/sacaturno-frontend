import Link from "next/link"
import { Clock } from "lucide-react"
import HeaderPublicBlack from "@/components/home/HeaderPublic"

export default function DepositPendingPage() {
  return (
    <>
      <HeaderPublicBlack />
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
        <Clock className="text-yellow-500" size={72} />
        <h1 className="text-2xl font-bold uppercase">Pago pendiente</h1>
        <p className="text-muted-foreground max-w-sm">
          Tu pago está siendo procesado. Una vez confirmado, tu turno quedará reservado automáticamente y recibirás un email.
        </p>
        <Link
          href="/"
          className="text-sm font-semibold text-orange-600 hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    </>
  )
}
