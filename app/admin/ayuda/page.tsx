import type { Metadata } from "next";
import HelpCenter from "@/components/dashboard/help/HelpCenter";

export const metadata: Metadata = {
  title: "Centro de ayuda | SacaTurno",
  description:
    "Guía de uso de SacaTurno: cómo configurar tu empresa, cargar turnos, cobrar señas y gestionar tu equipo.",
  robots: { index: false, follow: false },
};

// El manual es el mismo para dueños y empleados: no se filtra por rol.
const AyudaPage: React.FC = () => <HelpCenter />;

export default AyudaPage;
