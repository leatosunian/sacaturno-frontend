import Link from "next/link"
import { CircleCheck } from "lucide-react"
import HeaderPublicBlack from "@/components/home/HeaderPublicBlack"

export default function DepositSuccessPage() {
  return (
    <>
      <HeaderPublicBlack />
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
        <CircleCheck className="text-green-500" size={72} />
        <h1 className="text-2xl font-bold uppercase">¡Seña pagada!</h1>
        <p className="text-muted-foreground max-w-sm">
          Tu turno fue reservado correctamente. Vas a recibir un email de confirmación en breve.
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
