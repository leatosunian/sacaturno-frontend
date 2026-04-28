import Link from "next/link"
import { XCircle } from "lucide-react"
import HeaderPublicBlack from "@/components/home/HeaderPublicBlack"

export default function DepositFailurePage() {
  return (
    <>
      <HeaderPublicBlack />
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
        <XCircle className="text-red-500" size={72} />
        <h1 className="text-2xl font-bold uppercase">Pago rechazado</h1>
        <p className="text-muted-foreground max-w-sm">
          No se pudo procesar el pago de la seña. El turno no fue reservado. Podés intentarlo de nuevo.
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
