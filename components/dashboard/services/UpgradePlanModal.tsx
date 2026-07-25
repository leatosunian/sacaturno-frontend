"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IoIosAlert } from "react-icons/io";
import PlanPickerCards from "@/components/dashboard/subscription/PlanPickerCards";

interface Props {
  businessData: IBusiness;
}

const UpgradePlanModal: React.FC<Props> = ({ businessData }) => {
  return (
    <div className="flex flex-col gap-4 w-full h-fit">
      <div className="flex flex-col items-center w-full gap-3 h-fit">
        <IoIosAlert size={64} color="#dc4925" />
        <h4 className="text-xl font-bold text-center uppercase">Actualizá tu plan</h4>
        <label style={{ fontSize: "14px" }} className="font-normal text-center text-gray-600">
          Elegí un plan para agregar más de un servicio.
        </label>
      </div>

      <PlanPickerCards businessData={businessData} />
    </div>
  );
};

export default UpgradePlanModal;
