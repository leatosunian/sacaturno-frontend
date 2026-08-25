"use client";

import { toast } from "@/lib/toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";

export default function ToastLab() {
  const [open, setOpen] = useState(false);

  const flow = () => {
    const id = toast.loading("Guardando asignación...");
    setTimeout(() => toast.success("Asignación actualizada", { id }), 1500);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-10 flex flex-col gap-3 items-start">
      <button className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg" onClick={() => toast.success("Turno cancelado y seña reembolsada")}>success</button>
      <button className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg" onClick={() => toast.error("El empleado ya tiene un turno en ese horario")}>error</button>
      <button className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg" onClick={() => toast.warning("Turno cancelado, pero no se pudo reembolsar la seña. Revisala en tu cuenta de Mercado Pago.")}>warning</button>
      <button className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg" onClick={() => toast.loading("Eliminando turno...")}>loading</button>
      <button className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg" onClick={flow}>loading → success</button>
      <button className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg" onClick={() => toast.error("Con descripción", { description: "Elegí otro horario o asigná otro profesional." })}>con descripción</button>
      <button className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg" onClick={() => setOpen(true)}>abrir modal</button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <button className="bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg" onClick={() => toast.error("Ya existe una sucursal con ese nombre")}>error desde el modal</button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
