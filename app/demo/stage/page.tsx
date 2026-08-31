import type { Metadata } from "next";
import DemoStage from "@/components/demo/DemoStage";
import { decodeConfig } from "@/components/demo/demoSync";

/*
  El interior de los dispositivos de /demo.

  Vive en su propia ruta porque cada dispositivo es un iframe: así el teléfono
  tiene un viewport de teléfono y el wizard elige su layout mobile de verdad, en
  vez de dibujar el de escritorio apretado en 380 px. No se indexa: la página
  que se muestra y se comparte es /demo.
*/

export const metadata: Metadata = {
  title: "Escenario de la demo",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: { cfg?: string };
}

export default function DemoStagePage({ searchParams }: Props) {
  return <DemoStage initialConfig={decodeConfig(searchParams.cfg)} />;
}
