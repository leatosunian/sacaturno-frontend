"use client";
import { useState } from "react";
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
  businessData: IBusiness;
  onCreated: (branch: IBranch) => void;
}

const EMPTY: BranchFormData = { name: "", street: "", number: "", city: "", province: "", phone: "", email: "" };

const CreateBranchModal: React.FC<Props> = ({ open, onClose, businessData, onCreated }) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    mode: "onChange",
  });

  const handleClose = () => {
    reset(EMPTY);
    onClose();
  };

  const onSubmit = handleSubmit(async (data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sacaturno_token");
      const res = await axiosReq.post(
        "/branch/create",
        {
          businessID: businessData._id,
          ownerID: businessData.ownerID,
          name: data.name.trim(),
          street: data.street.trim(),
          number: data.number.trim(),
          city: data.city?.trim() || undefined,
          province: data.province?.trim() || undefined,
          phone: Number(data.phone),
          email: data.email?.trim() || undefined,
        },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      onCreated(res.data);
      handleClose();
      toast.success("Sucursal creada correctamente", { position: "top-center" });
    } catch (error: any) {
      if (error?.response?.status === 402) {
        toast.error("Necesitás el plan completo para crear sucursales", { position: "top-center" });
      } else if (error?.response?.status === 400) {
        toast.error("Alcanzaste el límite máximo de 10 sucursales", { position: "top-center" });
      } else if (error?.response?.status === 409) {
        toast.error("Ya existe una sucursal con ese nombre", { position: "top-center" });
      } else {
        toast.error("No se pudo crear la sucursal", { position: "top-center" });
      }
    } finally {
      setLoading(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="sm:w-[440px] w-[93vw]">
        <div className="flex flex-col w-full gap-4">
          <div className="pb-4 border-b border-gray-100 flex flex-col gap-1">
            <h4 className="text-lg leading-none font-semibold text-gray-800">Nueva sucursal</h4>
          </div>
          <BranchFormFields register={register} errors={errors} />
          <Button
            disabled={!isValid || loading}
            onClick={onSubmit}
            className="w-full h-10 text-white bg-primary hover:bg-orange-500 border-none rounded-lg shadow-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Creando...
              </span>
            ) : "Crear sucursal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBranchModal;
