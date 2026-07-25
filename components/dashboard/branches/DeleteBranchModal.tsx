"use client";
import { useState } from "react";
import { IBranch } from "@/interfaces/branch.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosReq from "@/config/axios";

interface Props {
  open: boolean;
  onClose: () => void;
  branch: IBranch | null;
  businessData: IBusiness;
  onDeleted: (branchId: string) => void;
}

const DeleteBranchModal: React.FC<Props> = ({ open, onClose, branch, businessData, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!branch) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      await axiosReq.delete(`/branch/delete/${branch._id}`, {
        data: { businessID: businessData._id },
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      onDeleted(branch._id!);
      onClose();
      toast.success("Sucursal eliminada", { position: "top-center" });
    } catch {
      toast.error("No se pudo eliminar la sucursal", { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:w-[400px] w-[93vw]">
        <div className="flex flex-col gap-5 pb-1">
          <h4 className="relative inline-block w-fit mx-auto text-xl font-bold text-center uppercase">
            Eliminar sucursal
            <span className="absolute left-0 right-0 mx-auto" style={{ bottom: -2, height: 2, background: "#dd4924", width: "40%" }} />
          </h4>
          <p className="text-sm text-gray-600 text-center">
            ¿Eliminar <strong>{branch?.name}</strong>?
          </p>
          <p className="text-xs text-gray-400 text-center -mt-2">
            Los turnos futuros asignados a esta sucursal quedarán sin sucursal. El historial no se modifica.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              className="flex-1 h-10 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-lg"
            >
              Cancelar
            </Button>
            <Button
              disabled={loading}
              onClick={handleDelete}
              className="flex-1 h-10 text-white bg-red-600 hover:bg-red-700 border-none rounded-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Eliminando...
                </span>
              ) : "Eliminar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBranchModal;
