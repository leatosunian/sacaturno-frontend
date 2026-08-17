"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { branchSchema, BranchFormData } from "@/app/schemas/branchSchema";
import { IBranch } from "@/interfaces/branch.interface";
import { IBusiness } from "@/interfaces/business.interface";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosReq from "@/config/axios";
import BranchFormFields from "./BranchFormFields";

interface Props {
  open: boolean;
  onClose: () => void;
  branch: IBranch | null;
  businessData: IBusiness;
  onEdited: (branch: IBranch) => void;
  onDeleted: (branchId: string) => void;
}

const EditBranchModal: React.FC<Props> = ({ open, onClose, branch, businessData, onEdited, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (branch) {
      reset({
        name: branch.name,
        street: branch.street,
        number: branch.number,
        city: branch.city ?? "",
        province: branch.province ?? "",
        phone: branch.phone ? String(branch.phone) : "",
        email: branch.email ?? "",
      });
    }
    setConfirmDelete(false);
  }, [branch, reset]);

  useEffect(() => {
    if (!open) setConfirmDelete(false);
  }, [open]);

  const onSubmit = handleSubmit(async (data) => {
    if (!branch) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      const res = await axiosReq.put(
        `/branch/edit/${branch._id}`,
        {
          businessID: businessData._id,
          name: data.name.trim(),
          street: data.street.trim(),
          number: data.number.trim(),
          city: data.city?.trim() || undefined,
          province: data.province?.trim() || undefined,
          phone: data.phone?.trim() ? Number(data.phone) : null,
          email: data.email?.trim() || undefined,
        },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      onEdited(res.data);
      onClose();
      toast.success("Sucursal actualizada", { position: "top-center" });
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("Ya existe una sucursal con ese nombre", { position: "top-center" });
      } else {
        toast.error("No se pudo actualizar la sucursal", { position: "top-center" });
      }
    } finally {
      setLoading(false);
    }
  });

  const handleDelete = async () => {
    if (!branch) return;
    setDeleting(true);
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
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:w-[440px] w-[93vw] max-h-[85vh] overflow-y-auto">
        <div className="flex flex-col w-full gap-4">
          <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
            <h4 className="text-lg leading-none font-semibold text-gray-800">Editar sucursal</h4>
          </div>
          <BranchFormFields register={register} errors={errors} />
          <Button
            disabled={!isValid || !isDirty || loading}
            onClick={onSubmit}
            className="w-full h-10 text-white bg-primary hover:bg-orange-500 border-none rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Guardando...
              </span>
            ) : "Guardar cambios"}
          </Button>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2 transition-colors mx-auto"
            >
              Eliminar sucursal
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-xs text-red-600 text-center font-medium">
                ¿Eliminar <strong>{branch?.name}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-8 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 border-none rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  disabled={deleting}
                  onClick={handleDelete}
                  className="flex-1 h-8 text-xs text-white bg-red-600 hover:bg-red-700 border-none rounded-lg"
                >
                  {deleting ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Eliminando...
                    </span>
                  ) : "Confirmar eliminación"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditBranchModal;
