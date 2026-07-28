"use client";
import { IBusiness } from "@/interfaces/business.interface";
import { IoIosAlert } from "react-icons/io";
import PlanPickerCards from "@/components/dashboard/subscription/PlanPickerCards";

interface Props {
  businessData: IBusiness | undefined;
  onCloseModal: () => void;
}

const ExpiredPlanModal: React.FC<Props> = ({ businessData, onCloseModal }) => {
  if (!businessData) return null;

  return (
    <>
      <div className="flex flex-col items-center w-full gap-4 pb-1 h-fit">
        <div className="flex flex-col items-center w-full gap-3 h-fit">
          <IoIosAlert size={64} color="#d7a954" />
          <h4
            className="relative inline-block w-full px-2 mx-auto text-xl font-bold text-center uppercase"
          >
            Tu suscripción ha vencido
            <span
              className="absolute left-0 right-0 mx-auto"
              style={{
                bottom: -2,
                height: 2,
                background: "#dd4924",
                width: "30%",
              }}
            />
          </h4>
          <label style={{ fontSize: "14px" }} className="font-medium text-center text-gray-600">
            Elegí un plan para seguir creando turnos.
          </label>
        </div>

        <PlanPickerCards businessData={businessData} />
      </div>
    </>
  );
};

export default ExpiredPlanModal;
