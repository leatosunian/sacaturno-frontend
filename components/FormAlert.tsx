import AlertInterface from "../interfaces/alert.interface";
import { AiOutlineExclamationCircle } from "react-icons/ai";
import { FaRegCircleCheck } from "react-icons/fa6";

type Props = AlertInterface;

const FormAlert: React.FC<Props> = ({ alertType, msg, error }) => {
  return (
    <>
      <div className="flex items-center justify-center gap-2 w-fit h-fit">
        {error && (
          <>
            {alertType === "OK_ALERT" && (
              <FaRegCircleCheck color="green" size={18} />
            )}

            {alertType === "ERROR_ALERT" && (
              <AiOutlineExclamationCircle color="red" size={18} />
            )}
          </>
        )}

        {error && <span className="text-xs "> {msg} </span>}
      </div>
    </>
  );
};

export default FormAlert;

/** `notificationContainer ${error ? "actived" : ""}` */
