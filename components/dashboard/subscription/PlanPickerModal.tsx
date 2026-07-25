"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { IBusiness } from "@/interfaces/business.interface";
import PlanPickerCards from "@/components/dashboard/subscription/PlanPickerCards";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessData: IBusiness;
  title?: string;
  description?: string;
}

const PlanPickerModal: React.FC<Props> = ({
  open,
  onOpenChange,
  businessData,
  title = "Elegí tu plan.",
  description = "Todos los planes incluyen cobro de señas con Mercado Pago, servicios y turnos ilimitados.",
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl 2xl:max-w-5xl max-h-[90dvh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full px-4 sm:px-8 2xl:px-8 2xl:py-8">
        <DialogHeader className="items-center text-center gap-2">
          <span className="inline-flex items-center rounded-full bg-orange-50 text-primary px-3 py-1 text-xs font-semibold tracking-wide w-fit">
            Planes
          </span>
          <DialogTitle className="text-2xl 2xl:text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500  mx-auto leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <PlanPickerCards businessData={businessData} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanPickerModal;
