import AlertInterface from "../interfaces/alert.interface";
import { MdCancel } from "react-icons/md";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { cn } from "@/lib/utils";

type Props = AlertInterface;

const Alert: React.FC<Props> = ({ alertType, msg, error }) => {
  const isSuccess = alertType === "OK_ALERT";

  return (
    <div
      className={cn(
        "fixed left-1/2 z-[99999] -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border-l-4 transition-all duration-300 ease-in-out w-max max-w-[90vw]",
        error ? "bottom-16" : "-bottom-40",
        isSuccess
          ? "bg-green-50 border-l-green-500 shadow-green-100"
          : "bg-red-50 border-l-red-500 shadow-red-100"
      )}
    >
      {isSuccess ? (
        <BsFillCheckCircleFill size={18} className="text-green-500 shrink-0" />
      ) : (
        <MdCancel size={20} className="text-red-500 shrink-0" />
      )}
      <span
        className={cn(
          "text-sm font-semibold whitespace-nowrap",
          isSuccess ? "text-green-800" : "text-red-800"
        )}
      >
        {msg}
      </span>
    </div>
  );
};

export default Alert;
